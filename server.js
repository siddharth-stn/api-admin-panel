const express = require("express");
const app = express();
const PORT = 8000;
const mongoose = require("mongoose");
const cors = require("cors");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use("/uploads", express.static("uploads"));

// Website Routes

// Backend Routes
require("./src/routes/backend/default.routes")(app);
require("./src/routes/backend/category.routes")(app);
require("./src/routes/backend/colour.routes")(app);
require("./src/routes/backend/material.routes")(app);
require("./src/routes/backend/subCategory.routes")(app);
require("./src/routes/backend/subSubCategory.routes")(app);

// Application Routes

app.listen(PORT, () => {
  mongoose
    .connect("mongodb://127.0.0.1:27017/mongoOnline")
    .then(() => console.log("Connected to mongodb"));
});
