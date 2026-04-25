const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required!"],
    match: [
      /^[a-zA-Z 0-9]{2,10}$/,
      "Name must be an Alphanumeric value of 2 to 10 characters",
    ],
  },
  slug: {
    type: String,
    required: [true, "Slug is required!"],
  },
  product_type: {
    type: Number, // 1 - Featured, 2 - On Sale, 3 - New Arrivals
    required: [true, "Product Type is required!"],
  },
  best_selling: {
    type: Number, // 1 - Yes, 2 - No
    required: [true, "Best Selling is required!"],
  },
  image: {
    type: String,
    default: "",
  },
  images: {
    type: Array,
    default: "",
  },
  actual_price: {
    type: Number,
    required: [true, "Actual Price is required!"],
  },
  sale_price: {
    type: Number,
    required: [true, "Sale Price is required!"],
  },
  parent_category_id: {
    type: String,
    required: [true, "Parent Category is required!"],
    ref: "categories",
  },
  sub_category_id: {
    type: String,
    required: [true, "Sub Category is required!"],
    ref: "sub_categories",
  },
  sub_sub_category_id: {
    type: String,
    required: [true, "Sub Sub Category is required!"],
    ref: "sub_sub_categories",
  },
  short_description: {
    type: String,
    required: [true, "Short Description is required!"],
  },
  long_description: {
    type: String,
    required: [true, "Long Description is required!"],
  },
  code: {
    type: String,
    required: [true, "Code is required!"],
  },
  dimension: {
    type: String,
    required: [true, "Dimension is required!"],
  },
  estimated_delivery: {
    type: String,
    required: [true, "Estimated Delivery is required!"],
  },
  color_ids: {
    type: Array,
    required: [true, "Color is required!"],
    ref: "colours",
  },
  material_ids: {
    type: Array,
    required: [true, "Material is required!"],
    ref: "materials",
  },
  status: {
    type: Boolean,
    default: true,
  },
  order: {
    type: Number,
    default: 2,
    min: [0, "Can't be less than zero"],
    max: [1000, "Maximum 1000 quantity allowed"],
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: null },
  deleted_at: { type: Date, default: null },
});

const productModel = mongoose.model("products", schema);

module.exports = productModel;
