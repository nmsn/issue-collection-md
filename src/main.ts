import { request } from '@octokit/request';
import { md, createMd } from '@nmsn/md-maker';
import { now, baseColumns } from './utils';

type AsyncReturnType<T extends (...args: any) => any> = T extends (...args: any) => Promise<infer R>
  ? R
  : any;

const formatMd = (data: AsyncReturnType<typeof requestGithubIssues>, title: string) =>
  md([
    {
      type: 'h1',
      params: title,
    },
    {
      type: 'blockquote',
      params: `更新时间：${now()}`,
    },
    {
      type: 'table',
      params: {
        header: baseColumns.map((item) => item.label),
        content: data.map((item) => {
          return baseColumns?.map((column) => {
            if (column.render) {
              return column.render(item[column.dataIndex], item);
            }

            return item[column.dataIndex];
          });
        }),
      },
    },
  ]);

// https://docs.github.com/zh/rest/issues/issues
type RequestParamsType = {
  owner: string;
  repo: string;
  state?: 'open' | 'closed' | 'all';
  sort?: 'created' | 'updated' | 'comments';
  direction?: 'asc' | 'desc';
  per_page?: number;
  page?: number;
};

const requestGithubIssues = async ({
  owner,
  repo,
  state = 'open',
  sort = 'created',
  direction = 'desc',
  per_page = 100,
  page = 1,
}: RequestParamsType) => {
  const { data = [] } = await request('GET /repos/{owner}/{repo}/issues', {
    owner,
    repo,
    state,
    sort,
    direction,
    per_page,
    page,
  });

  return data;
};

const script = async ({
  repo,
  user,
  fileName = 'README',
  title = 'Collection',
}: {
  repo: string;
  user: string;
  title?: string;
  fileName?: string;
}) => {
  const data = await requestGithubIssues({
    owner: user,
    repo,
  });

  createMd(`./${fileName}.md`, formatMd(data, title));
};

export default script;
