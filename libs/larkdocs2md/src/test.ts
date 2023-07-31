import LarkDocs2Md from './main';


const client = new LarkDocs2Md({
	appId: 'cli_xxx',
	appSecret: 'xxxx',
});


client.generateMarkdown("test_url");
