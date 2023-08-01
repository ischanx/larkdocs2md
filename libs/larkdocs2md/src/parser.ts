import path from "path";
import { TransformContext } from "./main";
import { BlockType, DocBlock, TextElement, TextElementStyle, TextElementStyleKey } from "./types";
import { CodeLanguage } from "./types/code";
import { computeMarkdownTagText, findSequenceElements, getBlockData, isEquationElement, isInlineCodeElement, isLinkElement } from "./utils";

/** 
 * 输出 Markdown 格式的文本
 */
export const transformText = (block: DocBlock, context: TransformContext) => {
  let content = "";
  const blockData = getBlockData(block);
  const elements = blockData.elements;

  const tagState: TextElementStyle = {
    bold: false,
    italic: false,
    strikethrough: false,
    underline: false,
    inline_code: false,
  }

  for(let i = 0;i < elements.length; i++){
    const item = elements[i];
    let currentText = '';
    let prefix = '';
    let postfix = '';

    if(isInlineCodeElement(item)){
      // 结束原有标记，inline code不支持内部BIUS
      prefix = computeMarkdownTagText(tagState);
      // 同一个行内代码
      const targets = findSequenceElements(i, isInlineCodeElement, elements);
      targets.forEach(element => {
        currentText += element.text_run.content;
      })
      i += targets.length - 1;
      prefix += '`';
      postfix += '`';
    }else if(isLinkElement(item)){
      // 结束原有标记
      prefix = computeMarkdownTagText(tagState);
      const link = item.text_run.text_element_style.link.url;
      const targets = findSequenceElements(i, isLinkElement, elements);
      targets.forEach(element => {
        // 链接文本内出现的新标记
        currentText += computeMarkdownTagText(tagState, element.text_run.text_element_style);
        currentText += element.text_run.content;
      });
      // 结束链接文本内出现的新标记
      currentText += computeMarkdownTagText(tagState);
      i += targets.length - 1;
      prefix += '[';
      postfix += `](${decodeURIComponent(link)})`;
    }else if(isEquationElement(item)){
      // 结束原有标记
      prefix = computeMarkdownTagText(tagState);
      prefix += '$$';
      postfix += '$$';
      currentText = item.equation.content;
    }else {
      prefix = computeMarkdownTagText(tagState, item.text_run.text_element_style);
      currentText = item.text_run.content;
    }


    content += prefix + currentText + postfix;
  }

  // closing tag
  const postfix = computeMarkdownTagText(tagState);

  return content + postfix;
}

/** 
 * 输出 Markdown 格式的多级标题
 */
export const transformHeading = (block: DocBlock, context: TransformContext) => {
  const levels = [
    BlockType.Heading1,
    BlockType.Heading2,
    BlockType.Heading3,
    BlockType.Heading4,
    BlockType.Heading5,
    BlockType.Heading6,
    BlockType.Heading7,
    BlockType.Heading8,
    BlockType.Heading9,
  ];
  // @todo: markdown只支持六级标题
  const level = levels.indexOf(block.block_type) + 1;
  const prefix = '#'.repeat(level);
  const content = transformText(block, context);
  return `${prefix} ${content}`;
}

/** 
 * 输出 Markdown 格式的无序列表
 */
export const transformBullet = (block: DocBlock, context: TransformContext) => {
  const content = transformText(block, context);
  return `- ${content}`;
}

/** 
 * 输出 Markdown 格式的有序列表
 */
export const transformOrdered = (block: DocBlock, context: TransformContext) => {
  let order = 1;
  const { blocksMap, blocksList } = context;
  const index = blocksList.indexOf(block.block_id);
  const content = transformText(block, context);

  if(index >= 0){
    // 识别连续的编号
    for(let i = index - 1;i >= 0; i--){
      const lastBlock = blocksMap.get(blocksList[i]);
      if(lastBlock.block_type === BlockType.Ordered){
        order++;
      }else{
        break;
      }
    }
  }

  return `${order}. ${content}`;
}

/** 
 * 输出 Markdown 格式的待办列表
 */
export const transformTodo = (block: DocBlock, context: TransformContext) => {
  const blockData = getBlockData(block);
  const isDone = !!blockData.style.done;
  const prefix = `- [${isDone ? 'x' : ' '}]`;
  const content = transformText(block, context);
  return `${prefix} ${content}`;
}

/** 
 * 输出 Markdown 格式的分割线
 */
export const transformDivider = (block: DocBlock, context: TransformContext) => {
  return `---`;
}

/** 
 * 输出 Markdown 格式的引用
 */
export const transformQuoteContainer = (block: DocBlock, context: TransformContext) => {
  const { blocksMap } = context;
  let quotes = "";
  if(block.children.length){
    block.children.forEach((token: string) => {
      const child = blocksMap.get(token);
      const content = transformText(child, context);
      quotes += `> ${content}\n`;
    })
  }

  return quotes;
}

export const transformQuote = (block: DocBlock, context: TransformContext) => {
  const content = transformText(block, context);
  return `> ${content}`;
}

/** 
 * 输出 Markdown 格式的代码块
 */
export const transformCode = (block: DocBlock, context: TransformContext) => {
  let content = '';
  const blockData = getBlockData(block);
  const elements = blockData.elements;
  const language = CodeLanguage[blockData.style.language].toLocaleLowerCase();
  elements.forEach((item: TextElement) => content += item.text_run.content);

  return `\`\`\`${language}\n${content}\n\`\`\`\``;
}

/** 
 * 输出 Markdown 格式的图片（临时链接或者本地文件）
 */
export const transformImage = async (block: DocBlock, context: TransformContext) => {
  const { config, larkClient } = context;
  const { staticAsUrl, staticPath, isTextMode, basePath } = config;
  const blockData = getBlockData(block);
  const { token } = blockData;

  if(isTextMode || staticAsUrl){
    const response = await larkClient.drive.media.batchGetTmpDownloadUrl({
      params: {
        file_tokens: token,
      }
    });
    const url = response?.data?.tmp_download_urls?.[0]?.tmp_download_url;
    return `![${token}](${url})`;
  }else{
    if(!staticPath){
      throw new Error('no static path');
    }

    const response = await larkClient.drive.media.download({
      path: {
        file_token: token,
      }
    });

    const filePath = path.resolve(staticPath, `${token}.jpg`);
    const relativePath = filePath.replace(basePath, '');
    await response.writeFile(filePath);
    console.log("[larkdocs2md] 生成文件"+ filePath);
    return `![${token}](${relativePath})`;
  }

}
