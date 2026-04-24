const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required!"],
    match: [
      /^[a-zA-Z 0-9]{2,10}$/,
      "Name must be an Alphanumeric value of 2 to 10 characters",
    ],
    validate: {
      validator: async function (v) {
        const user = await mongoose.model("sub_categories").findOne({
          name: v,
          parent_category_id: this.parent_category_id,
          deleted_at: null,
        });
        return !user;
      },
      message: (props) =>
        `${props.value} is already in use for ${props.path} field.`,
    },
  },
  image: {
    type: String,
    default: "",
  },
  parent_category_id: {
    type: String,
    required: [true, "Parent Category is required!"],
    ref: "categories",
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

const subCategoryModel = mongoose.model("sub_categories", schema);

module.exports = subCategoryModel;
