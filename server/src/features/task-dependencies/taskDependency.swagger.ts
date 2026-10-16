const taskDependencyPaths = {
  "/task-dependencies/task/{taskId}": {
    get: {
      tags: ["Task Dependencies"],
      summary: "Dependencies for task",
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: "taskId",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      responses: { 200: { description: "Dependencies" } },
    },
  },
  "/task-dependencies": {
    post: {
      tags: ["Task Dependencies"],
      summary: "Create dependency",
      security: [{ BearerAuth: [] }],
      responses: { 201: { description: "Created" } },
    },
  },
  "/task-dependencies/{taskId}/{dependsOnTaskId}": {
    delete: {
      tags: ["Task Dependencies"],
      summary: "Remove dependency",
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: "taskId",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
        {
          name: "dependsOnTaskId",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      responses: { 200: { description: "Removed" } },
    },
  },
};
const taskDependencySchemas = {
  TaskDependency: {
    type: "object",
    properties: {
      id: { type: "string" },
      taskId: { type: "string" },
      dependsOnTaskId: { type: "string" },
    },
  },
};
export { taskDependencyPaths, taskDependencySchemas };
