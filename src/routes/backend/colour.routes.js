const express = require("express");
const {
  create,
  view,
  details,
  update,
  toggleStatus,
  destroy,
} = require("../../controllers/backend/colour.controller.js");
const multer = require("multer");

const upload = multer();

const router = express.Router();

module.exports = (app) => {
  router.post("/create", upload.none(), create);

  router.post("/view", upload.none(), view);

  router.post("/details/:id", upload.none(), details);

  router.put("/update/:id", upload.none(), update);

  router.put("/toggle-status", upload.none(), toggleStatus);

  router.post("/delete", upload.none(), destroy);

  return app.use("/api/backend/colours", router);
};
