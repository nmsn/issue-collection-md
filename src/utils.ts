import { descriptor } from '@nmsn/md-maker';

export type LabelType = {
  name: string;
  color: string;
};

const createLabel = (text: string, color: string) => {
  const baseUrl = `https://img.shields.io/badge/-${text}-${color}`;
  return `![${text}](${baseUrl})`;
};

const displayLabels = (tags: LabelType[]) => {
  return tags?.map((item) => createLabel(item.name, item.color)).join(' ');
};

const time = (timeStr: string) => {
  return new Date(timeStr).toLocaleDateString('zh-CN');
};

export const now = () => {
  return `${new Date().toLocaleDateString()}`;
};

export const baseColumns = [
  {
    label: '标题',
    dataIndex: 'title',
    render: (title: string, { html_url }: { html_url: string }) =>
      descriptor.link({ title, url: html_url }),
  },
  {
    label: '类型',
    dataIndex: 'labels',
    render: (tags: { name: string; color: string }[]) => displayLabels(tags),
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
