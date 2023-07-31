import { TransformContext } from "./main";
import { BlockType, DocBlock } from "./types";
import { getBlockData } from "./utils";

/** 
 * 输出 Markdown 格式的文本
 */
export const transformText = (block: DocBlock, context: TransformContext) => {
  const blockData = getBlockData(block);
  return blockData.elements[0].text_run.content;
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