const userPaths = {
  "/users/stats": {
    get: {
      tags: ["Users"],
      summary: "User stats",
      security: [{ BearerAuth: [] }],
      responses: { 200: { description: "Stats" } },
    },
  },
  "/users/search": {
    get: {
      tags: ["Users"],
      summary: "Search users",
      security: [{ BearerAuth: [] }],
      responses: { 200: { description: "Users" } },
    },
  },
  "/users": {
    get: {
      tags: ["Users"],
      summary: "List users",
      security: [{ BearerAuth: [] }],
      responses: { 200: { description: "Users" } },
    },
    post: {
      tags: ["Users"],
      summary: "Create user",
      security: [{ BearerAuth: [] }],
      responses: { 201: { description: "Created" } },
    },
  },
  "/users/profile": {
    patch: {
      tags: ["Users"],
      summary: "Update own profile",
      security: [{ BearerAuth: [] }],
      responses: { 200: { description: "Updated" } },
    },
  },
  "/users/{id}": {
    get: {
      tags: ["Users"],
      summary: "Get user",
      security: [{ BearerAuth: [] }],
      parameters: [{ $ref: "#/components/parameters/IdParam" }],
      responses: { 200: { description: "User" } },
    },
    patch: {
      tags: ["Users"],
      summary: "Update user",
      security: [{ BearerAuth: [] }],
      parameters: [{ $ref: "#/components/parameters/IdParam" }],
      responses: { 200: { description: "Updated" } },
    },
    delete: {
      tags: ["Users"],
      summary: "Delete user",
      security: [{ BearerAuth: [] }],
      parameters: [{ $ref: "#/components/parameters/IdParam" }],
      responses: { 200: { description: "Deleted" } },
    },
  },
  "/users/{id}/role": {
    patch: {
      tags: ["Users"],
      summary: "Change role",
      security: [{ BearerAuth: [] }],
      parameters: [{ $ref: "#/components/parameters/IdParam" }],
      responses: { 200: { description: "Changed" } },
    },
  },
  "/users/{id}/status": {
    patch: {
      tags: ["Users"],
      summary: "Update status",
      security: [{ BearerAuth: [] }],
      parameters: [{ $ref: "#/components/parameters/IdParam" }],
      responses: { 200: { description: "Updated" } },
    },
  },
  "/users/{id}/deactivate": {
    patch: {
      tags: ["Users"],
      summary: "Deactivate user",
      security: [{ BearerAuth: [] }],
      parameters: [{ $ref: "#/components/parameters/IdParam" }],
      responses: { 200: { description: "Deactivated" } },
    },
  },
  "/users/{id}/activate": {
    patch: {
      tags: ["Users"],
      summary: "Activate user",
      security: [{ BearerAuth: [] }],
      parameters: [{ $ref: "#/components/parameters/IdParam" }],
      responses: { 200: { description: "Activated" } },
    },
  },
  "/users/{id}/restore": {
    patch: {
      tags: ["Users"],
      summary: "Restore user",
      security: [{ BearerAuth: [] }],
      parameters: [{ $ref: "#/components/parameters/IdParam" }],
      responses: { 200: { description: "Restored" } },
    },
  },
};
const userSchemas = {
  User: {
    type: "object",
    properties: {
      id: { type: "string" },
      email: { type: "string" },
      role: { type: "string" },
    },
  },
};
export { userPaths, userSchemas };
