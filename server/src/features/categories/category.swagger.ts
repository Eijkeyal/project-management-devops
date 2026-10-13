const categoryPaths = {
  "/categories": {
    get: {
      tags: ["Categories"],
      summary: "List categories",
      security: [{ BearerAuth: [] }],
      responses: { 200: { description: "Categories" } },
    },
    post: {
      tags: ["Categories"],
      summary: "Create category",
      security: [{ BearerAuth: [] }],
      responses: { 201: { description: "Created" } },
    },
  },
  "/categories/contents/{contentId}": {
    get: {
      tags: ["Categories"],
      summary: "Categories for content",
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: "contentId",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      responses: { 200: { description: "Categories" } },
    },
  },
  "/categories/{id}": {
    get: {
      tags: ["Categories"],
      summary: "Get category",
      security: [{ BearerAuth: [] }],
      parameters: [{ $ref: "#/components/parameters/IdParam" }],
      responses: { 200: { description: "Category" } },
    },
    patch: {
      tags: ["Categories"],
      summary: "Update category",
      security: [{ BearerAuth: [] }],
      parameters: [{ $ref: "#/components/parameters/IdParam" }],
      responses: { 200: { description: "Updated" } },
    },
    delete: {
      tags: ["Categories"],
      summary: "Delete category",
      security: [{ BearerAuth: [] }],
      parameters: [{ $ref: "#/components/parameters/IdParam" }],
      responses: { 200: { description: "Deleted" } },
    },
  },
  "/categories/{categoryId}/contents/{contentId}": {
    post: {
      tags: ["Categories"],
      summary: "Attach",
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: "categoryId",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
        {
          name: "contentId",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      responses: { 200: { description: "Attached" } },
    },
    delete: {
      tags: ["Categories"],
      summary: "Detach",
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: "categoryId",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
        {
          name: "contentId",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      responses: { 200: { description: "Detached" } },
    },
  },
};
const categorySchemas = {
  Category: {
    type: "object",
    properties: { id: { type: "string" }, name: { type: "string" } },
  },
};
export { categoryPaths, categorySchemas };
