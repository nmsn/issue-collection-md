import axios from 'axios';
import path from 'path';
import fs from 'fs';

type LabelType = {
  name: string;
  color: string;
};

type IssueOriginType = {
  html_url: string;
  title: string;
  labels: LabelType[];
  updated_at: string;
  comments: string;
};

type IssueType = Omit<IssueOriginType, 'html_url' | 'labels'> & {
  url: string;
  tags: LabelType[];
};

const LF = '\n';
const ParagraphDividingLine = `${LF}${LF}`;

const paragraph = (content: string[]) => {
  return content.join(ParagraphDividingLine);
};

const heading = ({ title, level }: Pick<IssueType, 'title'> & { level: number }) => {
  return `${'#'.repeat(level)} ${title}`;
};

const blockquote = (text: string) => {
  return `> ${text}`;
};

const link = (title: IssueType['title'], url: IssueType['url']) => {
  return `[${title}](${url})`;
};

const getColorTag = (text: string, color: string) => {
  const baseUrl = `https://img.shields.io/badge/-${text}-${color}`;

  return `![${text}](${baseUrl})`;
};

const tagsSplit = (tags: LabelType[]) => {
  return tags?.map((item) => getColorTag(item.name, item.color)).join(' ');
};

const time = (timeStr: string) => {
  return new Date(timeStr).toLocaleDateString('zh-CN');
};

const now = () => {
  return `${new Date().toLocaleDateString()}`;
};

const baseColumns = [
  {
    label: '标题',
    dataIndex: 'title',
    render: (text: string, { url }: { url: string }) => link(text, url),
  },
  {
    label: '类型',
    dataIndex: 'tags',
    render: (tags: { name: string; color: string }[]) => tagsSplit(tags),
  },
  {
    label: '更新时间',
    dataIndex: 'updated_at',
    render: (updated_at: string) => time(updated_at),
  },
  {
    label: '评论数',
    dataIndex: 'comments',
  },
];

const arr2TableRow = (data: string[]) => {
  return `|${data.join('|')}|`;
};

const getTable = <T>(
  data: T[],
  columns: {
    label: string;
    dataIndex: string;
    render?: (text: any, data: T) => any;
  }[]
) => {
  const header = arr2TableRow(columns?.map((item) => item.label));
  const divider = arr2TableRow(Array(columns?.length).fill('---'));

  const renderData = data?.map((item) =>
    arr2TableRow(
      columns?.map((column) => {
        if (column.render) {
          return column.render(item[column.dataIndex], item);
        }

        return item[column.dataIndex];
      })
    )
  );

  return [header, divider, ...renderData].join(LF);
};

const script = ({
  repo,
  user,
  fileName = 'README',
  title: inputTitle = 'Collection',
}: {
  repo: string;
  user: string;
  title?: string;
  fileName?: string;
}) => {
  const issuesUrl = `https://api.github.com/repos/${user}/${repo}/issues?per_page=100`;

  axios(issuesUrl)
    .then((res) => {
      const { data = [] } = res || {};
      console.log(data);

      const origin = (data as IssueOriginType[]).map((item) => {
        const { title, html_url, labels, updated_at, comments } = item;

        const tags = labels?.map((item) => ({ name: item.name, color: item.color })) || [];
        return { title, url: html_url, tags, updated_at, comments };
      });

      const content = getTable(origin, baseColumns);

      const md = paragraph([
        heading({
          title: inputTitle,
          level: 1,
        }),
        blockquote(`更新时间：${now()}`),
        content,
      ]);

      fs.writeFile(`./${fileName}.md`, md, (err) => {
        if (err) {
          //sd
          console.error(err);
          return;
        }
        //文件写入成功。
        console.log(path.join(__dirname, `${fileName}.md`));
      });
    })
    .catch((e) => console.log(e));
};

export default script;
