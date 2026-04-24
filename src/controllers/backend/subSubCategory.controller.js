const subSubCategory = require("../../model/subSubCategory");
const category = require("../../model/category");
const subCategory = require("../../model/subCategory");

// Helper function to get parent categories for dropdown
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

// Helper function to get sub categories based on parent category
exports.subCategory = async (request, response) => {
  const filter = { deleted_at: null, status: true };

  if (request.body.parent_category_id != undefined && request.body.parent_category_id != "") {
    filter.parent_category_id = request.body.parent_category_id;
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

// ============================================================
// CREATE — Save a new record to the database
// ============================================================
exports.create = async (request, response) => {
  const dataSave = request.body;
  if (request.file) {
    dataSave.image = request.file.filename;
  }
  try {
    const result = await new subSubCategory(dataSave).save();
    const data = {
      _status: true,
      _message: "Record Inserted Successfully",
      _data: result,
    };
    return response.send(data);
  } catch (error) {
    // Handle validation errors
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

// ============================================================
// VIEW — Get records with pagination, filtering, and sorting
// ============================================================
exports.view = async (request, response) => {
  const condition = {
    deleted_at: null,
  };

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
      page = request.body.page;
    }

    if (request.body.name != undefined && request.body.name != "") {
      condition.name = request.body.name;
    }

    if (
      request.body.parent_category_id != undefined &&
      request.body.parent_category_id != ""
    ) {
      condition.parent_category_id = request.body.parent_category_id;
    }

    if (
      request.body.sub_category_id != undefined &&
      request.body.sub_category_id != ""
    ) {
      condition.sub_category_id = request.body.sub_category_id;
    }
  }

  try {
    const totalRecords = await subSubCategory.find(condition).countDocuments();

    const result = await subSubCategory
      .find(condition)
      .populate("parent_category_id", "name")
      .populate("sub_category_id", "name")
      .select("name parent_category_id sub_category_id image order status")
      .sort({ _id: "desc" })
      .limit(limit)
      .skip(skip);

    if (result.length > 0) {
      const data = {
        _status: true,
        _message: "Record fetched.",
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

// ============================================================
// DETAILS — Get ONE specific record by its ID
// ============================================================
exports.details = async (request, response) => {
  try {
    const result = await subSubCategory
      .findOne({ _id: request.params.id })
      .populate("parent_category_id", "name")
      .populate("sub_category_id", "name");

    if (result) {
      const data = {
        _status: true,
        _message: "Record Fetched",
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

// ============================================================
// UPDATE — Change an existing record
// ============================================================
exports.update = async (request, response) => {
  const dataSave = request.body;
  if (request.file) {
    dataSave.image = request.file.filename;
  }
  dataSave.updated_at = new Date();

  try {
    const result = await subSubCategory.updateOne(
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
    for (let e in error.errors) {
      errorMessages[e] = error.errors[e].message;
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

// ============================================================
// TOGGLE STATUS — Flip status between true ↔ false
// ============================================================
exports.toggleStatus = async (request, response) => {
  try {
    const result = await subSubCategory.updateMany(
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

// ============================================================
// DESTROY — Soft delete a record
// ============================================================
exports.destroy = async (request, response) => {
  try {
    const result = await subSubCategory.updateMany(
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
