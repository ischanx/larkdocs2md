import { TransformContext } from "./main";
import { BlockType, DocBlock } from "./types";
import { getBlockData } from "./utils";

/** 
 * 输出 Markdown 格式的文本
 */
export const transformText = (block: DocBlock, context?: TransformContext) => {
  const blockData = getBlockData(block);
  return blockData.elements[0].text_run.content;
}

/** 
 * 输出 Markdown 格式的多级标题
 */
export const transformHeading = (block: DocBlock, context?: TransformContext) => {
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