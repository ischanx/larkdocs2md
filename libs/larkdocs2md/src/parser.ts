import { TransformContext } from "./main";
import { BlockType, DocBlock, TextElement } from "./types";
import { CodeLanguage } from "./types/code";
import { getBlockData, isInlineCodeElement } from "./utils";

/** 
 * 输出 Markdown 格式的文本
 */
export const transformText = (block: DocBlock, context: TransformContext) => {
  let content = "";
  const blockData = getBlockData(block);
  const elements = blockData.elements;

  for(let i = 0;i < elements.length; i++){
    const item = elements[i];
    let currentText = item.text_run.content;

    if(isInlineCodeElement(item)){
      // inline code
      let j = i + 1;
      while(j < elements.length){
        if(isInlineCodeElement(elements[j])){
          currentText += elements[j].text_run.content;
          i++;
        } else {
          break;
        }
        j++;
      }
      currentText = `\`${currentText}\``;
    }

    content += currentText;
  }

  return content;
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