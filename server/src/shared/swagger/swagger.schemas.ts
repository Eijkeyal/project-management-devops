export const sharedSchemas = {
  ErrorResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: false },
      message: { type: 'string', example: 'Something went wrong' },
      errors: {
        type: 'array',
        nullable: true,
        items: {
          type: 'object',
          properties: {
            field: { type: 'string', example: 'email' },
            message: { type: 'string', example: 'Invalid email format' },
          },
        },
      },
    },
  },

  PaginationMeta: {
    type: 'object',
    properties: {
      page: { type: 'integer', example: 1 },
      limit: { type: 'integer', example: 10 },
      total: { type: 'integer', example: 100 },
      totalPages: { type: 'integer', example: 10 },
      hasNext: { type: 'boolean', example: true },
      hasPrev: { type: 'boolean', example: false },
    },
  },

  SuccessMessage: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      message: { type: 'string', example: 'Operation successful.' },
    },
  },
};