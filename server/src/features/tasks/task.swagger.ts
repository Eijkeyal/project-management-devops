const taskPaths = {
  "/tasks/project/{projectId}": {
    get: {
      tags: ["Tasks"],
      summary: "Tasks for project",
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: "projectId",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      responses: { 200: { description: "Tasks" } },
    },
  },
  "/tasks": {
    post: {
      tags: ["Tasks"],
      summary: "Create task",
      security: [{ BearerAuth: [] }],
      responses: { 201: { description: "Created" } },
    },
  },
  "/tasks/{id}": {
    get: {
      tags: ["Tasks"],
      summary: "Get task",
      security: [{ BearerAuth: [] }],
      parameters: [{ $ref: "#/components/parameters/IdParam" }],
      responses: { 200: { description: "Task" } },
    },
    patch: {
      tags: ["Tasks"],
      summary: "Update task",
      security: [{ BearerAuth: [] }],
      parameters: [{ $ref: "#/components/parameters/IdParam" }],
      responses: { 200: { description: "Updated" } },
    },
    delete: {
      tags: ["Tasks"],
      summary: "Delete task",
      security: [{ BearerAuth: [] }],
      parameters: [{ $ref: "#/components/parameters/IdParam" }],
      responses: { 200: { description: "Deleted" } },
    },
  },
  "/tasks/{id}/subtasks": {
    get: {
      tags: ["Tasks"],
      summary: "Subtasks",
      security: [{ BearerAuth: [] }],
      parameters: [{ $ref: "#/components/parameters/IdParam" }],
      responses: { 200: { description: "Subtasks" } },
    },
  },
  "/tasks/{id}/assign": {
    patch: {
      tags: ["Tasks"],
      summary: "Assign task",
      security: [{ BearerAuth: [] }],
      parameters: [{ $ref: "#/components/parameters/IdParam" }],
      responses: { 200: { description: "Assigned" } },
    },
  },
  "/tasks/{id}/status": {
    patch: {
      tags: ["Tasks"],
      summary: "Update status",
      security: [{ BearerAuth: [] }],
      parameters: [{ $ref: "#/components/parameters/IdParam" }],
      responses: { 200: { description: "Status updated" } },
    },
  },
};
const taskSchemas = {
  Task: {
    type: "object",
    properties: {
      id: { type: "string" },
      title: { type: "string" },
      status: { type: "string" },
    },
  },
};
export { taskPaths, taskSchemas };
