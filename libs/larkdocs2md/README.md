# larkdocs2md

将飞书文档转成 Markdown 格式并生成文件

Convert Lark documents to Markdown files

## 安装/Install
```
npm i larkdocs2md
```

## 使用/Usage
```js
const LarkDocs2Md = require('larkdocs2md').default;

try{
  const client = new LarkDocs2Md({
    appId: 'cli_xxxx',
    appSecret: 'xxxxxxxxx',
    basePath: __dirname,
  });
  client.generateMarkdown('https://xxxxxxx/docx/xxxxxx');

} catch(err) {
  console.error(err);
}
```

