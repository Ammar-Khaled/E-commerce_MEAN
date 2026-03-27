const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const path = require("path");

// Collect YAML files
const docsGlob = path.join(__dirname, "../swagger/**/*.{js,yaml,yml}").replace(/\\/g, "/");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Blog API",
      version: "1.0.0",
      description: "A full-featured Blog REST API with authentication, posts, comments, likes, follows, bookmarks, notifications, and donations.",
    },
    servers: [{ url: "http://localhost:5000", description: "Local development" }],
    tags: [
      { name: "Auth", description: "Authentication & account verification" },
      { name: "Posts", description: "Blog posts CRUD, publishing & media" },
      { name: "Users", description: "User profiles & admin management" },
      { name: "Comments", description: "Comments & replies" },
      { name: "Likes", description: "Like / unlike posts & comments" },
      { name: "Follows", description: "Follow / unfollow users" },
      { name: "Bookmarks", description: "Bookmark posts" },
      { name: "Notifications", description: "User notifications" },
      { name: "Donations", description: "Stripe-powered donations" },
    ],
    components: {},
  },
  apis: [docsGlob],
};

const swaggerSpec = swaggerJsDoc(options);

const setupSwagger = (app) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));
};

module.exports = setupSwagger;
