# gemini-pro

> 这是 [Bob](https://ripperhe.gitee.io/bob/#/) 的一个插件

## 特性

- 支持缓存查询结果(默认缓存过期时间为一周);
- 可以跟Gemini-pro连续对话
- 通过 *SCN!!!* 进行历史会话清除 (清除成功将会提示:"History conversation deleted! Start a new conversation now~~")

## 安装

1. 安装 [Bob](https://ripperhe.gitee.io/bob/#/general/quickstart/install) (version >= 0.10.0)
2. 下载插件: [gemini-pro](https://github.com/sihaochen01/gemini-pro)
3. 插件安装: [Bob 插件安装文档说明](https://ripperhe.gitee.io/bob/#/general/quickstart/plugin?id=%e5%ae%89%e8%a3%85%e6%8f%92%e4%bb%b6)

## 配置
插件需要配置两个设置
1. **baseurl**
此配置为Gemini-pro API的调用地址 (https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent), 但可以使用代理地址覆盖
2. **apikey**
此为Gemini-pro API调用的API Key, 可从 https://aistudio.google.com/app/apikey 自行获取

### 使用Netlify反向代理Google PaLM(Gemini) API
* [教程](https://simonmy.com/posts/%E4%BD%BF%E7%94%A8netlify%E5%8F%8D%E5%90%91%E4%BB%A3%E7%90%86google-palm-api.html)
* [开源地址](https://github.com/antergone/palm-netlify-proxy)