import * as Bob from '@bob-plug/core';
import {userAgent} from './util';

interface QueryOption {
  to?: Bob.Language;
  from?: Bob.Language;
  cache?: string;
}

var resultCache = new Bob.CacheResult('translate-result');
// 历史对话文件名称
const historyFileName = "history.dat";
const chatGPTUserRole = "user";
const chatGPTAssistantRole = "model";
const newConversationTriggerWord = "SNC!!!";
const startNewConversation = "History conversation deleted! Start a new conversation now~~";

/**
 * @description 翻译
 * @param {string} text 需要翻译的文字内容
 * @param {object} [options={}]
 * @return {object} 一个符合 bob 识别的翻译结果对象
 */
async function _translate(text: string, options: QueryOption = {}): Promise<Bob.TranslateResult> {
  const {from = 'auto', to = 'auto', cache = 'enable'} = options;
  const cacheKey = `${text}${from}${to}`;
  if (cache === 'enable') {
    const _cacheData = resultCache.get(cacheKey);
    if (_cacheData) return _cacheData;
  } else {
    resultCache.clear();
  }

  const result: Bob.TranslateResult = {from, to, toParagraphs: []};


  try {



      //Exam input parameters
      //result.toParagraphs = [JSON.stringify(requestContents)];
      var connectionMode = $option.connectionMode;
      const timeoutConfig = 1000;
      const requestHeader = {"Content-Type": "application/json"};

      if (connectionMode === 'genimiurl') {
        if (text.toUpperCase() === newConversationTriggerWord) {
          deleteFile(historyFileName);
          result.toParagraphs = [startNewConversation];
        } else {
          var baseURL = $option.baseurl;
          var apiKey = '?key=' + $option.apiKey;
          var requestUrl = baseURL + apiKey;
          var requestText = {'text': text}
          var parts = [requestText]
          var requestContent = {parts, 'role': chatGPTUserRole}
          var historyMessage = readFile(historyFileName).concat([requestContent]);
          var requestContents = {'contents': historyMessage}

          const [err, res] = await Bob.util.asyncTo<Bob.HttpResponse>(
            Bob.api.$http.post({
              url: requestUrl,
              timeout: timeoutConfig,
              header: requestHeader,
              body: requestContents,
            }),
          );

          if (res?.response.statusCode == 400) throw Bob.util.error('api', 'Something really wrong', err);
          if (res?.response.statusCode !== 200) throw Bob.util.error('api', '接口响应状态错误', err);
          if (err) throw Bob.util.error('api', '接口网络错误', err);

          /* Sample request JSon object content
           '{
                 "contents": [
                   {"role":"user",
                    "parts":[{
                      "text": "Write the first line of a story about a magic backpack."}]},
                   {"role": "model",
                    "parts":[{
                      "text": "In the bustling city of Meadow brook, lived a young girl named Sophie. She was a bright and curious soul with an imaginative mind."}]},
                   {"role": "user",
                    "parts":[{
                      "text": "Can you set it in a quiet village in 1600s France?"}]},
                 ]
               }'
         */
          const chatResult = res?.data.candidates[0].content.parts[0].text;
          result.toParagraphs = [chatResult];


          var resultText = {'text': chatResult}
          var parts = [resultText]
          var resultContent = {parts, 'role': chatGPTAssistantRole}
          historyMessage.push(
            resultContent,
          );

          writeFile({
            value: historyMessage,
            fileName: historyFileName,
          });

        }
      } else {
        //这里使用的是在docker上自己搭建一个服务,把所有的请求处理都交给这个服务,所以可以用很简单的http请求获取到Gemini的回复
        // http://localhost:8082/gemini?prompt=tell me a joke
        var nasDockerUrl = $option.nasConfig;
        var nasDockerServiceProfile = $option.nasProfile;
        var nasModeRequest = nasDockerUrl + '?identifier='+nasDockerServiceProfile+'&prompt=' +encodeURI(text);
        const [err, res] = await Bob.util.asyncTo<Bob.HttpResponse>(
          Bob.api.$http.post({
            url: nasModeRequest,
            timeout: timeoutConfig,
          }),
        );

        if (res?.response.statusCode == 400) throw Bob.util.error('api', 'Something really wrong', err);
        if (res?.response.statusCode !== 200) throw Bob.util.error('api', '接口响应状态错误', err);
        if (err) throw Bob.util.error('api', '接口网络错误', err);
        const chatResult =res?.data;
        result.toParagraphs = [chatResult];
      }

    result.fromParagraphs = [text];


  } catch (error) {
    throw Bob.util.error('api', '数据解析错误出错!!', error);
  }

  if (cache === 'enable') {
    resultCache.set(cacheKey, result);
  }
  return result;
}

function readFile(fileName) {
  const filePath = getFilePath(fileName);

  const exists = $file.exists(filePath);

  if (!exists) {
    var requestText = {'text': 'hello'}
    var parts = [requestText]
    var requestContent = {parts, 'role': chatGPTUserRole}
    var responseText = {'text': 'hello, how can I assist you today'}
    var parts = [responseText]
    var responseContent = {parts, 'role': chatGPTAssistantRole}
    return [requestContent, responseContent];
  }

  return JSON.parse($file.read(filePath).toUTF8());
}

function writeFile({value, fileName}) {
  $file.write({
    data: $data.fromUTF8(JSON.stringify(value)),
    path: getFilePath(fileName),
  });
}

function deleteFile(fileName) {
  $file.delete(getFilePath(fileName));
}

function getFilePath(fileName) {
  return `$sandbox/${fileName}`;
}

export {_translate};
