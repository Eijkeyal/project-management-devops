const authPaths = {
  "/auth/register": {
    post: {
      tags: ["Authentication"],
      summary: "Register",
      security: [],
      responses: { 201: { description: "Registered" } },
    },
  },
  "/auth/login": {
    post: {
      tags: ["Authentication"],
      summary: "Login",
      security: [],
      responses: { 200: { description: "Login successful" } },
    },
  },
  "/auth/me": {
    get: {
      tags: ["Authentication"],
      summary: "Current user",
      security: [{ BearerAuth: [] }],
      responses: { 200: { description: "User" } },
    },
  },
  "/auth/refresh": {
    post: {
      tags: ["Authentication"],
      summary: "Refresh token",
      security: [],
      responses: { 200: { description: "Refreshed" } },
    },
  },
  "/auth/logout": {
    post: {
      tags: ["Authentication"],
      summary: "Logout",
      security: [],
      responses: { 200: { description: "Logged out" } },
    },
  },
  "/auth/verify-email": {
    post: {
      tags: ["Authentication"],
      summary: "Verify email",
      security: [],
      responses: { 200: { description: "Verified" } },
    },
  },
  "/auth/forgot-password": {
    post: {
      tags: ["Authentication"],
      summary: "Forgot password",
      security: [],
      responses: { 200: { description: "Sent" } },
    },
  },
  "/auth/reset-password": {
    post: {
      tags: ["Authentication"],
      summary: "Reset password",
      security: [],
      responses: { 200: { description: "Reset" } },
    },
  },
  "/auth/change-password": {
    post: {
      tags: ["Authentication"],
      summary: "Change password",
      security: [{ BearerAuth: [] }],
      responses: { 200: { description: "Changed" } },
    },
  },
};
const authSchemas = {
  AuthUser: {
    type: "object",
    properties: {
      id: { type: "string" },
      email: { type: "string" },
      role: { type: "string" },
    },
  },
};
export { authPaths, authSchemas };
