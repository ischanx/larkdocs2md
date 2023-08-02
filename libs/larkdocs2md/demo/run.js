const LarkDocs2Md = require('../dist/main').default;

try{
  const client = new LarkDocs2Md({
    appId: '此处填写appId => cli_....',
    appSecret: '此处填写appSecret => ...',
    basePath: __dirname,
  });
  client.generateMarkdown('此处填写目标文档链接 => https://.../docx/...');

} catch(err) {
  console.error(err);
}




