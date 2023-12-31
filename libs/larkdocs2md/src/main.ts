import type { Client } from '@larksuiteoapi/node-sdk';
import { Client as LarkClient } from '@larksuiteoapi/node-sdk';
import { getBlockData, getDocumentTokenFromUrl, sanitizeFilename } from './utils';
import { BlockType, DocBlock } from './types';
import { transformBlock } from './parser';
import path from 'path';
import { createWriteStream, existsSync } from 'fs';
import { mkdir } from 'fs/promises';
export interface OutputConfig {
  /** 输出的方式，默认为false生成本地文件 */
  isTextMode: boolean;
  /** 输出Markdown文件，基于basePath的相对路径 */
  outputDir: string;
  /** 输出Markdown文件，基于basePath的相对路径 */
  staticDir: string;
  /** 输出文件用文档标题作为文件名，默认为false用token做文件名 */
  titleAsFileName: boolean;
  /**
   * 图片插入的方式：
   * true则使用临时URL，24小时（isTextMode为真时必定为true）
   * 
   * false则下载到staticDir指定的路径
   * 
   * https://open.feishu.cn/document/server-docs/docs/drive-v1/media/batch_get_tmp_download_url
   */
  staticAsUrl: boolean;
}



export type GlobalConfig = {
  appId: string;
  appSecret: string;
  basePath: string;
} & Partial<OutputConfig>;

export type TransformContextConfig = OutputConfig & {
  staticPath: string;
  outputPath: string;
  basePath: string;
};

export interface TransformContext {
  blocksMap: Map<string, DocBlock>;
  blocksList: string[];
  larkClient: Client;
  config: TransformContextConfig;
}

export class LarkDocs2Md {
  private larkClient: Client;

  private globalConfig: TransformContextConfig;

  constructor(config: GlobalConfig){
    this.preCheck(config);
    const defaultOutputConfig: OutputConfig = {
      isTextMode: false,
      outputDir: './',
      staticDir: './static',
      titleAsFileName: false,
      staticAsUrl: false,
    };
    this.globalConfig = {
      ...defaultOutputConfig,
      ...config,
      staticPath: '',
      outputPath: '',
    };

    this.larkClient = new LarkClient({
      appId: config.appId,
      appSecret: config.appSecret,
      disableTokenCache: false, // SDK会自动管理租户token
    });
  }

  preCheck(config: GlobalConfig){
    const requireKeys = ['appId', 'appSecret', 'basePath'] as (keyof GlobalConfig)[];
    for(let i = 0;i < requireKeys.length; i++){
      const key = requireKeys[i];
      if(!config[key]){
        throw new Error(`[larkdocs2md] 传入配置缺少字段 ${key}`);
      }
    }
  }

  async fetchAllBlocks(docToken: string){
    const blocks: DocBlock[] = [];
    const fetchBlocks = async (docToken: string, pageToken?: string) => {
      const response = await this.larkClient.docx.documentBlock.list({
        path: {
          document_id: docToken,
        },
        params: {
          page_size: 500,
          document_revision_id: -1,
          page_token: pageToken,
        },
      });
      if(!response?.data?.items?.[0]){
        throw new Error('get blocks list error');
      }
      blocks.push(...response.data.items);
      if(response.data.has_more){
        await fetchBlocks(docToken, response.data.page_token);
      }
    }
    await fetchBlocks(docToken);
    return blocks;
  }

  buildBlocksMap(blocks: DocBlock[]){
    const blocksMap = new Map();
    blocks.forEach(block => {
      blocksMap.set(block.block_id, block);
    });
    return blocksMap;
  }

  async generateMarkdown(url: string, config?: Partial<OutputConfig>){
    const mergedConfig = {
      ...this.globalConfig,
      ...config,
    };
    console.log(`[larkdocs2md] ${mergedConfig}`);

    const docToken = getDocumentTokenFromUrl(url);
    console.log(`[larkdocs2md] 获取文档数据中...`);
    const blocks: DocBlock[] = await this.fetchAllBlocks(docToken);
    console.log(`[larkdocs2md] 开始解析文档数据...`);
    const pageBlock = blocks[0];
    const pageBlockData = getBlockData(pageBlock);
    if(pageBlock.block_type !== BlockType.Page){
      throw new Error('no page block');
    }

    const blocksList = pageBlock.children;
    const blocksMap = this.buildBlocksMap(blocks);
    const docTitle = pageBlockData.elements[0].text_run.content;
    if(!blocksList?.length){
      return;
    }
    const context: TransformContext = { 
      blocksMap,
      blocksList,
      larkClient: this.larkClient,
      config: mergedConfig,
    };
    if(mergedConfig.isTextMode){
      // 输出纯文本
      let markdownString = '';
      markdownString += `# ${docTitle}\n\n`;
      for(let blockToken of blocksList){
        const block = blocksMap.get(blockToken);
        if(!block){
          console.log(`[larkdocs2md] ${blockToken} 为空`)
        }
        const text = await transformBlock(block, context);
        if(text){
          markdownString += text + '\n\n';
        }
      }
      return markdownString;
    }else{
      // 生成本地文件
      const staticPath =  path.resolve(mergedConfig.basePath, mergedConfig.staticDir);
      const outputPath = path.resolve(mergedConfig.basePath, mergedConfig.outputDir);
      context.config.staticPath = staticPath;
      context.config.outputPath = outputPath;
      
      if(!existsSync(staticPath)){
        await mkdir(staticPath);
      }

      const fileName = `${mergedConfig.titleAsFileName && docTitle ? sanitizeFilename(docTitle) : docToken}.md`;
      const markdownFilePath = path.resolve(outputPath, fileName);
      const writeStream = createWriteStream(markdownFilePath, {
        encoding: 'utf-8',
      });
      console.log("[larkdocs2md] 生成文件"+ markdownFilePath);

      writeStream.write(`# ${docTitle}\n\n`);
      for(let blockToken of blocksList){
        const block = blocksMap.get(blockToken);
        if(!block){
          console.log(`[larkdocs2md] ${blockToken} 为空`)
        }
        const text = await transformBlock(block, context);
        if(text){
          writeStream.write(text + '\n\n')
        }
      }
      writeStream.close();
      return '';
    }
  }
}


export default LarkDocs2Md;