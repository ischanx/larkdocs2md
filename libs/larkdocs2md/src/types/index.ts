export type DocBlock = any;

/** 
 * 文档块类型
 * https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/data-structure/block#4a6e200e
 */
export enum BlockType{
  /** 页面（根） */
  Page = 1,
  /** 文本 */
  Text = 2,
  /** 标题 1 */
  Heading1 = 3,
  /** 标题 2 */
  Heading2 = 4,
  /** 标题 3 */
  Heading3 = 5,
  /** 标题 4 */
  Heading4 = 6,
  /** 标题 5 */
  Heading5 = 7,
  /** 标题 6 */
  Heading6 = 8,
  /** 标题 7 */
  Heading7 = 9,
  /** 标题 8 */
  Heading8 = 10,
  /** 标题 9 */
  Heading9 = 11,
  /** 无序列表 */
  Bullet = 12,
  /** 有序列表 */
  Ordered = 13,
  /** 代码块 */
  Code = 14,
  /** 引用 */
  Quote = 15,
  /** 待办 */
  Todo = 17,
  /** 多维表格 */
  Bitable = 18,
  /** 高亮块 */
  Callout = 19,
  /** 会话卡片 */
  ChatCard = 20,
  /** 流程图 & UML */
  Diagram = 21,
  /** 分割线 */
  Divider = 22,
  /** 文件 */
  File = 23,
  /** 分栏 */
  Grid = 24,
  /** 分栏列 */
  GridColumn = 25,
  /** 内嵌网页 */
  Iframe = 26,
  /** 图片 */
  Image = 27,
  /** 开放平台小组件 */
  ISV = 28,
  /** 思维笔记 */
  Mindnote = 29,
  /** 电子表格 */
  Sheet = 30,
  /** 表格 */
  Table = 31,
  /** 表格单元格 */
  TableCell = 32,
  /** 视图 */
  View = 33,
  /** 引用容器 */
  QuoteContainer = 34,
  /** 任务 */
  Task = 35,
  /** OKR */
  OKR = 36,
  /** OKR Objective */
  OKR_Objective = 37,
  /** OKR Key Result */
  OKRKeyResult = 38,
  /** OKR Progress */
  OKRProgress = 39,
  /** 新版文档小组件 */
  Addons = 40,
  /** Jira 问题 */
  Jira = 41,
  /** Wiki 子目录 */
  WikiCatalog = 42,
  /** 未支持的，只支持读，不支持写 */
  Unknown = 99,
}

export interface TextElementStyle {
  bold: boolean;
  inline_code: boolean;
  italic: boolean;
  strikethrough: boolean;
  underline: boolean;
  link?: {
    url: string;
  }
}

export type TextElementStyleKey = keyof TextElementStyle;

export interface TextRun {
  content: string;
  text_element_style: TextElementStyle;
}

export interface Equation {
  content: string;
  text_element_style: TextElementStyle;
}

export interface TextElement {
  text_run: TextRun;
  equation?: Equation;
}

export const TEXT_MARK = {
  /** 粗体 */
  bold: ['**', '**'],
  /** 斜体 */
  italic: ['*', '*'],
  /** 删除线 */
  strikethrough: ['~~', '~~'],
  /** 下划线 */
  underline: ['<u>', '</u>'],
  /** 行内代码 */
  inline_code: ['`', '`'],
}