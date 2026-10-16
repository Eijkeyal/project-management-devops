export const sharedParameters = {
  IdParam: {
    name: 'id',
    in: 'path',
    required: true,
    schema: { type: 'string' },
    description: 'Resource ID',
    example: '64f1a2b3c4d5e6f7g8h9i0j1',
  },

  PageParam: {
    name: 'page',
    in: 'query',
    schema: { type: 'integer', minimum: 1, default: 1 },
    description: 'Page number (1-indexed)',
  },

  LimitParam: {
    name: 'limit',
    in: 'query',
    schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
    description: 'Items per page',
  },

  SearchParam: {
    name: 'search',
    in: 'query',
    schema: { type: 'string' },
    description: 'Free-text search query',
  },

  SortParam: {
    name: 'sort',
    in: 'query',
    schema: { type: 'string' },
    description: 'Sort field; prefix with `-` for descending',
    example: '-createdAt',
  },
};