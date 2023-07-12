import { request } from '@octokit/request';
import { md, createMd } from '@nmsn/md-maker';
import { now, baseColumns } from './utils';

type AsyncReturnType<T extends (...args: any) => any> = T extends (...args: any) => Promise<infer R>
  ? R
  : any;

const getRepoUrl = ({ owner, repo }: { owner: string; repo: string }) =>
  `https://github.com/${owner}/${repo}/issues`;

const formatMd = ({
  data,
  title,
  hasMoreInfo,
}: {
  data: AsyncReturnType<typeof requestGithubIssues>['data'];
  title: string;
  hasMoreInfo?: { owner: string; repo: string };
}) => {
  const content: Parameters<typeof md>[0] = [
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
  ];

  hasMoreInfo &&
    content.push({
      type: 'link',
      params: {
        title: '查看更多...',
        url: getRepoUrl({ owner: hasMoreInfo?.owner, repo: hasMoreInfo.repo }),
      },
    });

  return md(content);
};

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

  if (data?.length >= per_page) {
    return { data, hasMoreInfo: { owner, repo } };
  }

  return { data };
};

const script = async ({
  fileName = 'README',
  title = 'Collection',
  repoOptions,
}: {
  title?: string;
  fileName?: string;
  repoOptions: RequestParamsType;
}) => {
  const { data, hasMoreInfo } = await requestGithubIssues(repoOptions);

  createMd(`./${fileName}.md`, formatMd({ data, title, hasMoreInfo }));
};

export default script;
