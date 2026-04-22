const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required!"],
    match: /^[a-zA-Z 0-9]{2,10}$/,
    validate: {
      validator: async function (v) {
        const user = await mongoose.model("defaults").findOne({
          name: v,
          deleted_at: null,
        });
        return !user;
      },
      message: (props) => `The specified name is already in use.`,
    },
  },
  status: {
    type: Boolean,
    default: true,
  },
  order: {
    type: Number,
    default: 2,
    min: [1, "Atleast one quantity is to be ordered"],
    max: [1000, "Maximum 1000 quantity allowed"],
  },
  type: {
    type: String,
    enum: ["User", "Admin"],
    required: [true, "Either User or Admin is allowed!"],
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: null },
  deleted_at: { type: Date, default: null },
});

const DefaultModel = mongoose.model("defaults", schema);

module.exports = DefaultModel;
