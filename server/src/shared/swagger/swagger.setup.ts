import swaggerJsdoc from 'swagger-jsdoc';

import { swaggerConfig } from './swagger.config.js';
import { sharedSchemas } from './swagger.schemas.js';
import { sharedResponses } from './swagger.responses.js';
import { sharedParameters } from './swagger.parameters.js';

import { adminPaths } from '../../features/admin/admin.swagger.js';
import { approvalPaths, approvalSchemas } from '../../features/approvals/approval.swagger.js';
import { auditLogPaths, auditLogSchemas } from '../../features/audit-logs/auditLog.swagger.js';
import { authPaths, authSchemas } from '../../features/authentication/auth.swagger.js';
import { categoryPaths, categorySchemas } from '../../features/categories/category.swagger.js';
import { contentPaths, contentSchemas } from '../../features/contents/content.swagger.js';
import { filePaths, fileSchemas } from '../../features/files/file.swagger.js';
import { notificationPaths, notificationSchemas } from '../../features/notifications/notification.swagger.js';
import { projectPaths, projectSchemas } from '../../features/projects/project.swagger.js';
import { rolePaths, roleSchemas } from '../../features/roles/role.swagger.js';
import { tagPaths, tagSchemas } from '../../features/tags/tag.swagger.js';
import { taskCommentPaths, taskCommentSchemas } from '../../features/task-comments/taskComment.swagger.js';
import { taskDependencyPaths, taskDependencySchemas } from '../../features/task-dependencies/taskDependency.swagger.js';
import { taskPaths, taskSchemas } from '../../features/tasks/task.swagger.js';
import { userPaths, userSchemas } from '../../features/users/user.swagger.js';

const paths = {
  ...adminPaths,
  ...approvalPaths,
  ...auditLogPaths,
  ...authPaths,
  ...categoryPaths,
  ...contentPaths,
  ...filePaths,
  ...notificationPaths,
  ...projectPaths,
  ...rolePaths,
  ...tagPaths,
  ...taskCommentPaths,
  ...taskDependencyPaths,
  ...taskPaths,
  ...userPaths,
};

const schemas = {
  ...sharedSchemas,
  ...approvalSchemas,
  ...auditLogSchemas,
  ...authSchemas,
  ...categorySchemas,
  ...contentSchemas,
  ...fileSchemas,
  ...notificationSchemas,
  ...projectSchemas,
  ...roleSchemas,
  ...tagSchemas,
  ...taskCommentSchemas,
  ...taskDependencySchemas,
  ...taskSchemas,
  ...userSchemas,
};

const options: swaggerJsdoc.Options = {
  definition: {
    ...swaggerConfig,
    paths,
    components: {
      ...swaggerConfig.components,
      schemas,
      responses: sharedResponses,
      parameters: sharedParameters,
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);  