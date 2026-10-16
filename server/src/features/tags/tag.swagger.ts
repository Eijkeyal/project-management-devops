const tagPaths = {
  "/tags": {
    get: {
      tags: ["Tags"],
      summary: "List tags",
      security: [{ BearerAuth: [] }],
      responses: { 200: { description: "Tags" } },
    },
    post: {
      tags: ["Tags"],
      summary: "Create tag",
      security: [{ BearerAuth: [] }],
      responses: { 201: { description: "Created" } },
    },
  },
  "/tags/contents/{contentId}": {
    get: {
      tags: ["Tags"],
      summary: "Tags for content",
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: "contentId",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      responses: { 200: { description: "Tags" } },
    },
  },
  "/tags/{id}": {
    get: {
      tags: ["Tags"],
      summary: "Get tag",
      security: [{ BearerAuth: [] }],
      parameters: [{ $ref: "#/components/parameters/IdParam" }],
      responses: { 200: { description: "Tag" } },
    },
    patch: {
      tags: ["Tags"],
      summary: "Update tag",
      security: [{ BearerAuth: [] }],
      parameters: [{ $ref: "#/components/parameters/IdParam" }],
      responses: { 200: { description: "Updated" } },
    },
    delete: {
      tags: ["Tags"],
      summary: "Delete tag",
      security: [{ BearerAuth: [] }],
      parameters: [{ $ref: "#/components/parameters/IdParam" }],
      responses: { 200: { description: "Deleted" } },
    },
  },
  "/tags/{tagId}/contents/{contentId}": {
    post: {
      tags: ["Tags"],
      summary: "Attach",
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: "tagId",
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
      tags: ["Tags"],
      summary: "Detach",
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: "tagId",
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
const tagSchemas = {
  Tag: {
    type: "object",
    properties: { id: { type: "string" }, name: { type: "string" } },
  },
};
export { tagPaths, tagSchemas };
