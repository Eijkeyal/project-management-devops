const projectPaths = {
  "/projects": {
    get: {
      tags: ["Projects"],
      summary: "List projects",
      security: [{ BearerAuth: [] }],
      responses: { 200: { description: "Projects" } },
    },
    post: {
      tags: ["Projects"],
      summary: "Create project",
      security: [{ BearerAuth: [] }],
      responses: { 201: { description: "Created" } },
    },
  },
  "/projects/{projectId}": {
    get: {
      tags: ["Projects"],
      summary: "Get project",
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: "projectId",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      responses: { 200: { description: "Project" } },
    },
    patch: {
      tags: ["Projects"],
      summary: "Update project",
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: "projectId",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      responses: { 200: { description: "Updated" } },
    },
  },
  "/projects/{projectId}/archive": {
    patch: {
      tags: ["Projects"],
      summary: "Archive project",
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: "projectId",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      responses: { 200: { description: "Archived" } },
    },
  },
  "/projects/{projectId}/members": {
    post: {
      tags: ["Projects"],
      summary: "Add member",
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: "projectId",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      responses: { 200: { description: "Added" } },
    },
  },
  "/projects/{projectId}/members/{userId}": {
    delete: {
      tags: ["Projects"],
      summary: "Remove member",
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: "projectId",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
        {
          name: "userId",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      responses: { 200: { description: "Removed" } },
    },
  },
  "/projects/{projectId}/dashboard": {
    get: {
      tags: ["Projects"],
      summary: "Dashboard",
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: "projectId",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      responses: { 200: { description: "Dashboard" } },
    },
  },
};
const projectSchemas = {
  Project: {
    type: "object",
    properties: { id: { type: "string" }, name: { type: "string" } },
  },
};
export { projectPaths, projectSchemas };
