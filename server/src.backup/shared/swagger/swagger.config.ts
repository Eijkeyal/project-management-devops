
export const swaggerConfig = {
  openapi: '3.0.0',
  info: {
    title: 'Project Management System API',
    version: '1.0.0',
    description:
      'REST API documentation for the Project Management System. ' +
      'All endpoints (unless noted otherwise) require a valid JWT in the ' +
      '`Authorization: Bearer <token>` header.',
    contact: {
      name: 'API Support',
      email: 'support@pms.local',
    },
    license: {
      name: 'MIT',
    },
  },
  servers: [
    
    {
      url: '/api/v1',
      description: 'Current server',
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description:
          'Paste the `accessToken` returned by `/auth/login` here. ' +
          'Do not include the "Bearer " prefix — Swagger UI adds it.',
      },
    },
  },
  security: [{ BearerAuth: [] }],
  tags: [
    { name: 'Authentication', description: 'Register, login, tokens, password reset' },
    { name: 'Users', description: 'User management (admin-oriented)' },
    { name: 'Roles', description: 'Available roles in the system' },
    { name: 'Projects', description: 'Projects, members, dashboards' },
    { name: 'Tasks', description: 'Tasks, subtasks, assignment, status' },
    { name: 'Task Comments', description: 'Comments on tasks' },
    { name: 'Task Dependencies', description: 'Blocking relations between tasks' },
    { name: 'Categories', description: 'Shared category tree' },
    { name: 'Tags', description: 'Free-form tags and their content links' },
    { name: 'Contents', description: 'Content items and approval workflow' },
    { name: 'Approvals', description: 'Approval history and decisions' },
    { name: 'Files', description: 'Uploads, avatars, and file streaming' },
    { name: 'Notifications', description: 'User notifications' },
    { name: 'Audit Logs', description: 'System activity log' },
    { name: 'Admin', description: 'Admin-only endpoints' },
  ],
};