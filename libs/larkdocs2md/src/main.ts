import type { Client } from '@larksuiteoapi/node-sdk';
import { Client as LarkClient } from '@larksuiteoapi/node-sdk';
import { getDocumentTokenFromUrl } from './utils';
import getBlockList from './mock/getBlockList2';
import { BlockType, DocBlock } from './types';
import { transformHeading, transformText } from './parser';

export interface OutputConfig {
  outputDir?: string;
  staticDir?: string;
  titleAsFileName?: boolean;
  staticAsUrl?: boolean;
}

export interface GlobalConfig extends OutputConfig {
  appId: string;
  appSecret: string;

} 

export class LarkDocs2Md {
  private larkClient: Client | undefined;

  private globalConfig: GlobalConfig;

  constructor(config: GlobalConfig){
    this.globalConfig = config;
    // this.larkClient = new LarkClient({
    //   appId: this.globalConfig.appId,
    //   appSecret: this.globalConfig.appSecret,
    //   disableTokenCache: false, // SDK会自动管理租户token
    // });
  }

  generateMarkdown(url: string, config?: Partial<OutputConfig>){
    console.log(url, config)
    // const pageToken = getDocumentTokenFromUrl(url);

    // this.larkClient.docx.documentBlock.list({
    //   path: {
    //     document_id: pageToken,
    //   },
    //   params: {
    //     page_size: 500,
    //     document_revision_id: -1,
    //   },
    // });
    let t = '';
    const blockList = getBlockList.data.items;
    blockList.forEach(block => {
      const text = this.transform(block);
      if(text){
        t += text + '\n'
      }

    });
    console.log(t);

  }


  transform(block: DocBlock){
    const { block_type: blockType } = block;
    switch(blockType){
      case BlockType.Text:
        return transformText(block);
      case BlockType.Heading1:
      case BlockType.Heading2:
      case BlockType.Heading3:
      case BlockType.Heading4:
      case BlockType.Heading5:
      case BlockType.Heading6:
      case BlockType.Heading7:
      case BlockType.Heading8:
      case BlockType.Heading9:
        return transformHeading(block);
      default:
        return '';
    }
  }


}


export default LarkDocs2Md;