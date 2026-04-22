const express = require("express");
const {
  create,
  view,
  details,
  update,
  toggleStatus,
  destroy,
} = require("../../controllers/backend/category.controller.js");
const multer = require("multer");
const path = require("path");

const uploadDir = path.join(process.cwd(), "uploads/category");
const upload = multer({ dest: uploadDir });

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname),
    );
  },
});

const uploads = multer({ storage: storage });

module.exports = (app) => {
  router.post("/create", uploads.single("image"), create);

  router.post("/view", upload.none(), view);

  router.post("/details/:id", upload.none(), details);

  router.put("/update/:id", uploads.single("image"), update);

  router.put("/toggle-status", upload.none(), toggleStatus);

  router.delete("/delete", upload.none(), destroy);

  return app.use("/api/backend/categories", router);
};
