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
        const user = await mongoose.model("materials").findOne({
          name: v,
          deleted_at: null,
        });
        return !user;
      },
      message: (props) =>
        `${props.value} is already in use for ${props.path} field.`,
    },
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

const MaterialModel = mongoose.model("materials", schema);

module.exports = MaterialModel;
