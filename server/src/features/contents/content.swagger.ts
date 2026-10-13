const contentPaths = {
  "/contents": {
    get: {
      tags: ["Contents"],
      summary: "List contents",
      security: [{ BearerAuth: [] }],
      responses: { 200: { description: "Contents" } },
    },
    post: {
      tags: ["Contents"],
      summary: "Create content",
      security: [{ BearerAuth: [] }],
      responses: { 201: { description: "Created" } },
    },
  },
  "/contents/{id}": {
    get: {
      tags: ["Contents"],
      summary: "Get content",
      security: [{ BearerAuth: [] }],
      parameters: [{ $ref: "#/components/parameters/IdParam" }],
      responses: { 200: { description: "Content" } },
    },
    patch: {
      tags: ["Contents"],
      summary: "Update content",
      security: [{ BearerAuth: [] }],
      parameters: [{ $ref: "#/components/parameters/IdParam" }],
      responses: { 200: { description: "Updated" } },
    },
    delete: {
      tags: ["Contents"],
      summary: "Delete content",
      security: [{ BearerAuth: [] }],
      parameters: [{ $ref: "#/components/parameters/IdParam" }],
      responses: { 200: { description: "Deleted" } },
    },
  },
  "/contents/{id}/submit": {
    post: {
      tags: ["Contents"],
      summary: "Submit for approval",
      security: [{ BearerAuth: [] }],
      parameters: [{ $ref: "#/components/parameters/IdParam" }],
      responses: { 200: { description: "Submitted" } },
    },
  },
  "/contents/{id}/decide": {
    post: {
      tags: ["Contents"],
      summary: "Decide",
      security: [{ BearerAuth: [] }],
      parameters: [{ $ref: "#/components/parameters/IdParam" }],
      responses: { 200: { description: "Decided" } },
    },
  },
  "/contents/{id}/publish": {
    post: {
      tags: ["Contents"],
      summary: "Publish",
      security: [{ BearerAuth: [] }],
      parameters: [{ $ref: "#/components/parameters/IdParam" }],
      responses: { 200: { description: "Published" } },
    },
  },
};
const contentSchemas = {
  Content: {
    type: "object",
    properties: {
      id: { type: "string" },
      title: { type: "string" },
      status: { type: "string" },
    },
  },
};
export { contentPaths, contentSchemas };
