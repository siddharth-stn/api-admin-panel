const ColourModel = require("../../model/colour");

exports.create = async (request, response) => {
  const dataSave = request.body;
  try {
    const result = await new ColourModel(dataSave).save();
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

    if (request.body.color_code != undefined && request.body.color_code != "") {
      const color_code = new RegExp(request.body.color_code, "i");
      andCondition.push({ color_code: color_code });
    }

    if (request.body.order != undefined && request.body.order != "") {
      andCondition.push({ order: request.body.order });
    }
  }

  let filter = { $and: andCondition };

  try {
    const totalRecords = await ColourModel.find(filter).countDocuments();
    const result = await ColourModel.find(filter)
      .select("name color_code order status")
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

exports.details = async (request, response) => {
  try {
    const result = await ColourModel.findOne({ _id: request.params.id });
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

exports.update = async (request, response) => {
  const dataSave = request.body;
  dataSave.updated_at = new Date();

  try {
    const result = await ColourModel.updateOne(
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
    const result = await ColourModel.updateMany(
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
    const result = await ColourModel.updateMany(
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
