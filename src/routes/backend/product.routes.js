const express = require("express");
const {
  parentCategory,
  subCategory,
  subSubCategory,
  material,
  color,
  create,
  view,
  details,
  update,
  toggleStatus,
  destroy,
} = require("../../controllers/backend/product.controller.js");
const multer = require("multer");
const path = require("path");

const uploadDir = path.join(process.cwd(), "uploads/product");
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
  const uploadMiddleware = uploads.fields([
    { name: "image", maxCount: 1 },
    { name: "images", maxCount: 12 },
  ]);

  router.post("/parent-category", upload.none(), parentCategory);

  router.post("/sub-category", upload.none(), subCategory);

  router.post("/sub-sub-category", upload.none(), subSubCategory);

  router.post("/material", upload.none(), material);

  router.post("/color", upload.none(), color);

  router.post("/create", uploadMiddleware, create);

  router.post("/view", upload.none(), view);

  router.post("/details/:id", uploadMiddleware, details);

  router.put("/update/:id", uploads.single("image"), update);

  router.put("/toggle-status", upload.none(), toggleStatus);

  router.post("/delete", upload.none(), destroy);

  return app.use("/api/backend/products", router);
};
