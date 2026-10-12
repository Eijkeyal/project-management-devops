import swaggerJsdoc from 'swagger-jsdoc';

import { swaggerConfig } from './swagger.config';
import { sharedSchemas } from './swagger.schemas';
import { sharedResponses } from './swagger.responses';
import { sharedParameters } from './swagger.parameters';

import { adminPaths } from '../../features/admin/admin.swagger';
import { approvalPaths, approvalSchemas } from '../../features/approvals/approval.swagger';
import { auditLogPaths, auditLogSchemas } from '../../features/audit-logs/auditLog.swagger';
import { authPaths, authSchemas } from '../../features/authentication/auth.swagger';
import { categoryPaths, categorySchemas } from '../../features/categories/category.swagger';
import { contentPaths, contentSchemas } from '../../features/contents/content.swagger';
import { filePaths, fileSchemas } from '../../features/files/file.swagger';
import { notificationPaths, notificationSchemas } from '../../features/notifications/notification.swagger';
import { projectPaths, projectSchemas } from '../../features/projects/project.swagger';
import { rolePaths, roleSchemas } from '../../features/roles/role.swagger';
import { tagPaths, tagSchemas } from '../../features/tags/tag.swagger';
import { taskCommentPaths, taskCommentSchemas } from '../../features/task-comments/taskComment.swagger';
import { taskDependencyPaths, taskDependencySchemas } from '../../features/task-dependencies/taskDependency.swagger';
import { taskPaths, taskSchemas } from '../../features/tasks/task.swagger';
import { userPaths, userSchemas } from '../../features/users/user.swagger';

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