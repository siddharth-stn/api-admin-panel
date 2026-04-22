const express = require("express");
const {
  create,
  view,
  details,
  update,
  toggleStatus,
  destroy,
} = require("../../controllers/backend/default.controller.js");

const router = express.Router();

module.exports = (app) => {
  router.post("/create", create);

  router.post("/view", view);

  router.post("/details/:id", details);

  router.put("/update/:id", update);

  router.put("/toggle-status", toggleStatus);

  router.put("/delete", destroy);

  return app.use("/api/backend/default", router);
};
