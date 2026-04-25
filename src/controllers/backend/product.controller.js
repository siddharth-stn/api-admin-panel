const category = require("../../model/category");
const subCategory = require("../../model/subCategory");
const subSubCategory = require("../../model/subSubCategory");
const material = require("../../model/material");
const color = require("../../model/color");
const product = require("../../model/product");
const slugify = require("slugify");
require("dotenv").config();

const generateUniqueSlug = async (model, baseSlug) => {
  let slug = baseSlug;
  let count = 0;

  //Loop to find unique slug
  while (await model.findOne({ slug })) {
    count++;
    slug = `${baseSlug}-${count}`;
  }
  return slug;
};

exports.parentCategory = async (request, response) => {
  const filter = { deleted_at: null, status: true };
  try {
    const result = await category
      .find(filter)
      .select("name")
      .sort({ _id: "desc" });

    if (result.length > 0) {
      const data = {
        _status: true,
        _message: "Record fetched.",
        _data: result,
      };
      return response.send(data);
    } else {
      const data = {
        _status: false,
        _message: "No Record Found",
        _data: [],
      };
      return response.send(data);
    }
  } catch (error) {
    const data = {
      _status: false,
      _message: "Something went wrong",
      _data: [],
    };
    return response.send(data);
  }
};

exports.subCategory = async (request, response) => {
  const filter = { deleted_at: null, status: true };

  if (request.body) {
    if (
      request.body.parent_category_id != undefined &&
      request.body.parent_category_id != ""
    ) {
      filter.parent_category_id = request.body.parent_category_id;
    }
  }

  try {
    const result = await subCategory
      .find(filter)
      .select("name")
      .sort({ _id: "desc" });

    if (result.length > 0) {
      const data = {
        _status: true,
        _message: "Record fetched.",
        _data: result,
      };
      return response.send(data);
    } else {
      const data = {
        _status: false,
        _message: "No Record Found",
        _data: [],
      };
      return response.send(data);
    }
  } catch (error) {
    const data = {
      _status: false,
      _message: "Something went wrong",
      _data: [],
    };
    return response.send(data);
  }
};

exports.subSubCategory = async (request, response) => {
  const filter = { deleted_at: null, status: true };
  if (request.body) {
    if (
      request.body.sub_category_id != undefined &&
      request.body.sub_category_id != ""
    ) {
      filter.sub_category_id = request.body.sub_category_id;
    }
  }
  try {
    const result = await subSubCategory
      .find(filter)
      .select("name")
      .sort({ _id: "desc" });

    if (result.length > 0) {
      const data = {
        _status: true,
        _message: "Record fetched.",
        _data: result,
      };
      return response.send(data);
    } else {
      const data = {
        _status: false,
        _message: "No Record Found",
        _data: [],
      };
      return response.send(data);
    }
  } catch (error) {
    const data = {
      _status: false,
      _message: "Something went wrong",
      _data: [],
    };
    return response.send(data);
  }
};

exports.material = async (request, response) => {
  const filter = { deleted_at: null, status: true };
  try {
    const result = await material
      .find(filter)
      .select("name")
      .sort({ _id: "desc" });

    if (result.length > 0) {
      const data = {
        _status: true,
        _message: "Record fetched.",
        _data: result,
      };
      return response.send(data);
    } else {
      const data = {
        _status: false,
        _message: "No Record Found",
        _data: [],
      };
      return response.send(data);
    }
  } catch (error) {
    const data = {
      _status: false,
      _message: "Something went wrong",
      _data: [],
    };
    return response.send(data);
  }
};

exports.color = async (request, response) => {
  const filter = { deleted_at: null, status: true };
  try {
    const result = await color
      .find(filter)
      .select("name")
      .sort({ _id: "desc" });

    if (result.length > 0) {
      const data = {
        _status: true,
        _message: "Record fetched.",
        _data: result,
      };
      return response.send(data);
    } else {
      const data = {
        _status: false,
        _message: "No Record Found",
        _data: [],
      };
      return response.send(data);
    }
  } catch (error) {
    const data = {
      _status: false,
      _message: "Something went wrong",
      _data: [],
    };
    return response.send(data);
  }
};

exports.create = async (request, response) => {
  const dataSave = request.body;

  if (request.body && request.body.name) {
    let slug = slugify(request.body.name, {
      lower: true,
      strict: true,
    });
    dataSave.slug = await generateUniqueSlug(product, slug);
  }

  if (request.files.image != undefined) {
    dataSave.image = request.files.image.filename;
  }

  let images = [];

  if (request.files.images != undefined) {
    request.files.images.forEach((image) => {
      images.push(image.filename);
    });
  }
  dataSave.images = images;

  try {
    const result = await new product(dataSave).save();
    const data = {
      _status: true,
      _message: "Record Inserted Successfully",
      _data: result,
    };
    return response.send(data);
  } catch (error) {
    const errorMessages = {};
    if (error.errors) {
      for (const e in error.errors) {
        errorMessages[e] = error.errors[e].message;
      }
    } else if (error.message) {
      errorMessages.general = error.message;
    }
    const data = {
      _status: false,
      _message: "Something went wrong",
      _data: null,
      _error: errorMessages,
    };
    return response.send(data);
  }
};

exports.view = async (request, response) => {
  let limit = 10;
  let skip = 0;
  let page = 1;

  if (request.body != undefined) {
    if (request.body.limit != undefined && request.body.limit != "") {
      limit = request.body.limit;
    }

    if (request.body.skip != undefined && request.body.skip != "") {
      skip = request.body.skip;
    }

    if (request.body.page != undefined && request.body.page != "") {
      skip = (request.body.page - 1) * limit;
    }
  }

  const andCondition = [{ deleted_at: null }];

  if (request.body != undefined) {
    if (request.body.name != undefined && request.body.name != "") {
      const name = new RegExp(request.body.name, "i");
      andCondition.push({ name: name });
    }

    if (
      request.body.parent_category_id != undefined &&
      request.body.parent_category_id != ""
    ) {
      andCondition.push({
        parent_category_id: request.body.parent_category_id,
      });
    }

    if (request.body.order != undefined && request.body.order != "") {
      andCondition.push({ order: request.body.order });
    }
  }

  let filter = { $and: andCondition };

  try {
    const totalRecords = await product.find(filter).countDocuments();
    const result = await product
      .find(filter)
      .populate("parent_category_id", "name")
      .populate("sub_category_id", "name")
      .populate("sub_sub_category_id", "name")
      .populate("material_ids", "name")
      .populate("color_ids", "name")
      .sort({ _id: "desc" })
      .limit(limit)
      .skip(skip);

    if (result.length > 0) {
      const data = {
        _status: true,
        _message: "Record fetched.",
        _image_path: process.env.PRODUCT_IMAGE,
        _paginate: {
          total_records: totalRecords,
          current_page: page,
          total_pages: Math.ceil(totalRecords / limit),
        },
        _data: result,
      };
      return response.send(data);
    } else {
      const data = {
        _status: false,
        _message: "No Record Found",
        _data: [],
      };
      return response.send(data);
    }
  } catch (error) {
    const data = {
      _status: false,
      _message: "Something went wrong",
      _data: [],
    };
    return response.send(data);
  }
};

exports.details = async (request, response) => {
  try {
    const result = await product
      .findOne({ _id: request.params.id })
      .populate("parent_category_id", "name")
      .populate("sub_category_id", "name")
      .populate("sub_sub_category_id", "name")
      .populate("material_ids", "name")
      .populate("color_ids", "name");
    if (result) {
      const data = {
        _status: true,
        _message: "Record Fetched",
        _image_path: process.env.PRODUCT_IMAGE,
        _data: result,
      };
      return response.send(data);
    } else {
      const data = {
        _status: false,
        _message: "No record found",
        _data: null,
      };
      return response.send(data);
    }
  } catch (error) {
    const data = {
      _status: false,
      _message: "Something went wrong",
      _data: null,
    };
    return response.send(data);
  }
};

exports.update = async (request, response) => {
  const dataSave = request.body;
  dataSave.updated_at = new Date();

  let checkName = await product.findById(request.params.id);

  if (
    request.body &&
    request.body.name &&
    request.body.name !== checkName.name
  ) {
    let slug = slugify(request.body.name, {
      lower: true,
      strict: true,
    });
    dataSave.slug = await generateUniqueSlug(product, slug);
  }

  if (request.files.image != undefined) {
    dataSave.image = request.files.image.filename;
  }

  let images = [];

  if (request.files.images != undefined) {
    request.files.images.forEach((image) => {
      images.push(image.filename);
    });
  }
  dataSave.images = images;

  try {
    const result = await product.updateOne(
      { _id: request.params.id },
      { $set: dataSave },
      { runValidators: true },
    );
    const data = {
      _status: true,
      _message: "Record Updated",
      _data: result,
    };
    return response.send(data);
  } catch (error) {
    const errorMessages = {};
    if (error.errors) {
      for (const e in error.errors) {
        errorMessages[e] = error.errors[e].message;
      }
    } else if (error.message) {
      errorMessages.general = error.message;
    }
    const data = {
      _status: false,
      _message: "Something went wrong",
      _data: null,
      _error: errorMessages,
    };
    return response.send(data);
  }
};

exports.toggleStatus = async (request, response) => {
  try {
    const result = await product.updateMany(
      { _id: request.body.id },
      [{ $set: { status: { $not: ["$status"] }, updated_at: new Date() } }],
      { updatePipeline: true },
    );

    const data = {
      _status: true,
      _message: "Status Changed Successfully",
      _data: result,
    };
    return response.send(data);
  } catch (error) {
    const data = {
      _status: false,
      _message: "Something went wrong",
      _data: null,
    };
    return response.send(data);
  }
};

exports.destroy = async (request, response) => {
  try {
    const result = await product.updateMany(
      { _id: request.body.id },
      { $set: { deleted_at: new Date() } },
    );
    const data = {
      _status: true,
      _message: "Deleted Successfully",
      _data: result,
    };
    return response.send(data);
  } catch (error) {
    const data = {
      _status: false,
      _message: "Something went wrong",
      _data: null,
    };
    return response.send(data);
  }
};
