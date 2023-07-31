import { BlockType, DocBlock, TextElement } from "./types";

export const getDocumentTokenFromUrl = (url: string) => {
  const match = /\/docx\/([^?]+)/.exec(url);
  if(match && match[1]){
    return match[1];
  }else{
    throw new Error('invalid url')
  }
}


export const getBlockData = (block: DocBlock) => {
  const key = BlockType[block.block_type].toLowerCase();
  return block[key];
}


export const isInlineCodeElement = (element: TextElement) => {
  return element.text_run.text_element_style.inline_code;
}