// https://www.markdownguide.org/cheat-sheet/
/** basic syntax */

const LF = "\n";
// const ParagraphDividingLine = `${LF}${LF}`;

export const heading = (text: string, level: number) => {
  return `${"#".repeat(level)} ${text}`;
};

export const bold = (text: string) => {
  return `**${text}**`;
};

export const italic = (text: string) => {
  return `*${text}*`;
};

export const blockquote = (text: string) => {
  return `> ${text}`;
};

export const orderList = (text: string[]) => {
  return text.map((item, index) => `${index + 1}. ${item}`);
};

export const unorderedList = (text: string[]) => {
  return text.map((item) => `- ${item}`);
};

export const code = (text: string) => {
  return `\`${text}\``;
};

export const horizontalRule = () => "---";

export const link = (text: string, url: string) => {
  return `[${text}](${url})`;
};

export const image = (altText: string, url: string) => {
  return `![${altText}](${url})`;
};

/** extended syntax */
export const table = (header: string[], data: string[][]) => {
  const len = header.length;
  if (len !== data.length) {
    throw new Error("The header and data do not match.");
  }

  const arr2Line = (arr: string[]) => {
    return `|${arr.join("|")}|`;
  };

  const headerLine = arr2Line(header);
  const divider = arr2Line(Array(len).fill("---"));
  const render = data?.map((item) => arr2Line(item));
  return [headerLine, divider, ...render].join(LF);
};

export const strikethrough = (text: string) => {
  return `~~${text}~~`;
};

export const taskList = (content: { text: string; checked: boolean }[]) => {
  return content.map((item) => `- [${item.checked ? "x" : " "}] ${item.text}`);
};
