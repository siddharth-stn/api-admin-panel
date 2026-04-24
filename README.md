# Express + MongoDB + Mongoose — Step-by-Step Guide

A complete walkthrough to build a REST API from scratch. Follow these steps in order and you'll have a working API by the end.

Think of this like a recipe — you don't need to memorize it. Just follow along, and over time the steps will become natural.

---

## Table of Contents

1. [Project Setup](#1-project-setup)
2. [Install Packages](#2-install-packages)
3. [Create the Entry Point — server.js](#3-create-the-entry-point--serverjs)
4. [Create the Folder Structure](#4-create-the-folder-structure)
5. [Create the Model](#5-create-the-model)
6. [Create the Controller](#6-create-the-controller)
7. [Create the Routes](#7-create-the-routes)
8. [Connect Routes to server.js](#8-connect-routes-to-serverjs)
9. [Adding a Second Module — Category](#9-adding-a-second-module--category)
10. [Test the API](#10-test-the-api)
11. [How Dynamic Filtering Works — Category View](#11-how-dynamic-filtering-works--category-view)
12. [Quick Reference — Common Gotchas](#12-quick-reference--common-gotchas)

---

## 1. Project Setup

Open your terminal, create a new folder, and initialize the project:

```bash
mkdir my-project
cd my-project
npm init -y
```

**What just happened?**

- `mkdir my-project` — Created a new folder called `my-project`.
- `cd my-project` — Moved inside that folder.
- `npm init -y` — Created a file called `package.json`. This file is like a nameplate for your project — it stores the project name, version, and a list of all the packages (libraries) your project uses. The `-y` flag means "yes to all default values" so you don't have to answer questions.

Now open `package.json` in your editor and make sure these two things are set:

```json
{
  "main": "server.js",
  "scripts": {
    "start": "npx nodemon server.js"
  }
}
```

- `"main": "server.js"` — Tells Node.js: "When this project runs, start from `server.js`."
- `"scripts" > "start"` — Lets you type `npm start` in the terminal to run your project, instead of typing `npx nodemon server.js` every time.
- We use `nodemon` instead of `node` because nodemon **automatically restarts** the server whenever you save a file. Without it, you'd have to manually stop and restart the server after every code change.

---

## 2. Install Packages

Packages are pre-written code that other developers made so you don't have to write everything from scratch. Run this:

```bash
npm install express mongoose cors multer
```

This downloads four packages and saves them in a `node_modules` folder. It also adds them to `package.json` under `"dependencies"` so anyone who clones your project can install the same packages.

**What does each package do?**

| Package    | What it does                                                                                                                                    | Simple analogy                                                                                     |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `express`  | A web framework. It listens for requests (like "give me all users") and sends back responses.                                                   | Like a waiter in a restaurant — takes orders and brings food.                                      |
| `mongoose` | Connects your app to MongoDB and lets you define rules for your data (called schemas).                                                          | Like a form builder — you define what fields exist and what's allowed.                             |
| `cors`     | Allows your API to accept requests from different URLs. Without it, a React app on `localhost:3000` can't talk to your API on `localhost:8000`. | Like a security guard who checks if someone is allowed to enter.                                   |
| `multer`   | Handles file uploads. It processes `multipart/form-data` (the format browsers use to send files) and saves files to disk.                       | Like a mailroom clerk — receives packages (files), labels them, and stores them in the right room. |

> **Note:** You do NOT need a package called `body-parser`. Express already has that ability built-in since version 4.16. Some old tutorials still install it — you can skip it.

---

## 3. Create the Entry Point — server.js

This is the first file that runs when you start your project. It does 3 jobs:

1. Sets up Express (the waiter)
2. Tells Express how to understand incoming data
3. Connects to MongoDB (the database)

Create a file called `server.js` in the root of your project (not inside any folder):

```js
const express = require("express");
const app = express();
const PORT = 8000;
const mongoose = require("mongoose");
const cors = require("cors");

// ---------- Middleware ----------
// Middleware = functions that run on EVERY request BEFORE it reaches your route.
// Think of them as checkpoints at the entrance of a building.

app.use(express.json());
// "If someone sends JSON data in their request, please understand it."
// Without this, request.body will be undefined when receiving JSON.

app.use(express.urlencoded({ extended: true }));
// "If someone sends form data (like from an HTML form), please understand it."
// The { extended: true } part means it can handle nested objects in form data.

app.use(cors());
// "Allow requests from other URLs/origins."
// Needed later when your React frontend (on port 3000) talks to this API (on port 8000).

app.use("/uploads", express.static("uploads"));
// Serve uploaded files as static assets.
// When a browser requests http://localhost:8000/uploads/category/image-123.jpg,
// Express looks for the file at ./uploads/category/image-123.jpg on disk and sends it.
// Without this line, uploaded images would exist on disk but have no URL to access them.

// ---------- Routes ----------
// Routes will be added here in Step 8.
// They tell Express: "When someone visits THIS url, do THIS thing."

// Website Routes

// Backend Routes
require("./src/routes/backend/default.routes")(app);
require("./src/routes/backend/category.routes")(app);
require("./src/routes/backend/colour.routes")(app);
require("./src/routes/backend/material.routes")(app);

// Application Routes

// ---------- Start the Server ----------
app.listen(PORT, () => {
  // app.listen starts the server. It means: "Start listening for requests on port 8000."
  // The callback function (the arrow function) runs AFTER the server starts.

  mongoose
    .connect("mongodb://127.0.0.1:27017/mongoOnline")
    .then(() => console.log("Connected to mongodb"));
  // mongoose.connect talks to MongoDB running on your computer.
  // 127.0.0.1 = your own computer (localhost)
  // 27017 = the default port MongoDB runs on
  // mongoOnline = whatever you want to name your database
  //   (MongoDB creates it automatically if it doesn't exist)
});
```

### Try it out:

Make sure MongoDB is running on your computer, then type:

```bash
npm start
```

You should see `Connected to mongodb` in the terminal. If you do, everything is working. Press `Ctrl + C` to stop the server.

---

## 4. Create the Folder Structure

Right now you only have `server.js` and `package.json`. But as your project grows, you'll have dozens of files. Without a clear folder structure, things get messy fast.

Create this structure inside your project:

```
src/
├── config/              (settings — database URL, constants, etc.)
├── model/               (data rules — what your data looks like)
├── controllers/
│   ├── website/         (logic for the public-facing site)
│   ├── backend/         (logic for the admin panel)
│   └── application/     (logic for the API — used by React/mobile)
├── routes/
│   ├── website/
│   ├── backend/
│   └── application/
├── middleware/
│   ├── website/
│   ├── backend/
│   └── application/
```

You can create all folders at once with this single command:

```bash
mkdir -p src/{config,model,controllers/{website,backend,application},routes/{website,backend,application},middleware/{website,backend,application}}
```

### What does each folder do?

| Folder         | Job                                                                                          | Analogy                                                           |
| -------------- | -------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `model/`       | Defines the shape of your data — fields, types, rules.                                       | A form template — "Name must be text, age must be a number."      |
| `controllers/` | Contains the actual logic — what happens when someone hits a route.                          | The chef in a restaurant — receives the order and cooks the food. |
| `routes/`      | Maps URLs to controller functions — "When someone visits /create, call the create function." | The menu — lists what's available and points to the right chef.   |
| `middleware/`  | Functions that run BEFORE the controller — like checking if someone is logged in.            | A security check before you enter a room.                         |
| `config/`      | Stores settings like the database URL, API keys, etc.                                        | A settings page.                                                  |

### Why 3 subfolders (website, backend, application)?

Because one project can serve multiple audiences:

- **website** — The public-facing site that anyone can see.
- **backend** — The admin panel (only for admins to manage data).
- **application** — The API endpoints that a React or mobile app talks to.

Each audience has different routes, controllers, and middleware, so we keep them separated. But **models are shared** — the data is the same regardless of who's accessing it. That's why `model/` has no subfolders.

### File naming conventions

| Type             | Naming             | Example                                       |
| ---------------- | ------------------ | --------------------------------------------- |
| Model files      | PascalCase         | `Default.js`, `User.js`, `Product.js`         |
| Controller files | lowercase with dot | `default.controller.js`, `user.controller.js` |
| Route files      | lowercase with dot | `default.routes.js`, `user.routes.js`         |

---

## 5. Create the Model

The model is where you define **what your data looks like**. Think of it as creating a form — you decide what fields exist, what type of data each field accepts, and what rules it must follow.

Create a file: `src/model/Default.js`

```js
const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  // ---------- A text field with validation ----------
  name: {
    type: String,
    // The data must be text.

    required: [true, "Name is required!"],
    // This field CANNOT be empty.
    // If someone tries to save without a name, they'll see "Name is required!"

    match: /^[a-zA-Z 0-9]{2,10}$/,
    // The name must match this pattern:
    //   - Only letters (a-z, A-Z), spaces, and numbers (0-9)
    //   - Must be between 2 and 10 characters long
    // If it doesn't match, Mongoose rejects it.

    validate: {
      // A CUSTOM validator — you write your own rule.
      validator: async function (v) {
        // "v" is the value someone is trying to save (e.g., "Sid")
        // mongoose.model("defaults") gives you the Model, so you can search the database.
        //
        // WHY NOT this.constructor.findOne()?
        //   this.constructor works during .save() (where "this" is the document).
        //   But during updateOne(..., { runValidators: true }), "this" is a Query object,
        //   NOT the document — so this.constructor.findOne is not a function.
        //   mongoose.model("defaults") works in BOTH contexts.
        const user = await mongoose.model("defaults").findOne({
          name: v,
          deleted_at: null,
        });
        // Look for a record with the same name that hasn't been deleted.
        return !user;
        // If we found one (user is NOT null), return false = INVALID.
        // If we didn't find one (user IS null), return true = VALID.
      },
      message: (props) => `The specified name is already in use.`,
      // This message shows up when the validator returns false.
    },
  },

  // ---------- A true/false field ----------
  status: {
    type: Boolean,
    // Only true or false.
    default: true,
    // If not provided, it will be true.
  },

  // ---------- A number field with min/max ----------
  order: {
    type: Number,
    default: 2,
    min: [1, "Atleast one quantity is to be ordered"],
    // Can't be less than 1. If it is, show this message.
    max: [1000, "Maximum 1000 quantity allowed"],
    // Can't be more than 1000.
  },

  // ---------- A field that only allows specific values ----------
  type: {
    type: String,
    // IMPORTANT: "type" here means the DATA TYPE, which is String.
    // There is no "type: Enum" in Mongoose. enum is a VALIDATOR, not a type.
    enum: ["User", "Admin"],
    // Only "User" or "Admin" are allowed. Anything else gets rejected.
    // NOTE: If this field is not "required" and no value is sent,
    //   it saves as undefined — enum check is SKIPPED for undefined values.
    required: [true, "Either User or Admin is allowed!"],
  },

  // ---------- Timestamps ----------
  created_at: { type: Date, default: Date.now },
  // Date.now (WITHOUT parentheses) is a function REFERENCE.
  // We're telling Mongoose: "Here's a function. Call it whenever you create a new document."
  // So each document gets its own fresh timestamp.
  //
  // WHY NOT Date.now() or Date()?
  //   Date.now()  — WITH parentheses — runs IMMEDIATELY when the file loads.
  //                 Every document would get the same timestamp (the time the server started).
  //   Date()      — Returns a STRING, not a Date object. Also runs immediately. Bad for same reason.
  //   Date.now    — WITHOUT parentheses — just a reference. Mongoose calls it later. This is correct.

  updated_at: { type: Date, default: null },
  // null because when a record is first created, it hasn't been updated yet.
  // We set this manually in the update controller using: new Date()

  deleted_at: { type: Date, default: null },
  // null = record is active (not deleted).
  // When we "delete" a record, we set this to the current date instead of actually removing it.
  // This is called "soft delete" — the record still exists, but we treat it as deleted.
  // To get only active records, filter with: { deleted_at: null }
});

const DefaultModel = mongoose.model("defaults", schema);
// This creates a Model.
// "defaults" = the name of the collection in MongoDB
//   (like a table name in SQL databases)
// The Model is a special class that can:
//   - Create new documents: new DefaultModel(data).save()
//   - Find documents: DefaultModel.find(), DefaultModel.findOne()
//   - Update documents: DefaultModel.updateOne()
//   - And more...

module.exports = DefaultModel;
// Export it so other files (like the controller) can use it.
```

### All available validators at a glance

| Validator   | Works on  | What it does                        | Example                                 |
| ----------- | --------- | ----------------------------------- | --------------------------------------- |
| `required`  | All types | Field cannot be empty               | `required: [true, "Name is required!"]` |
| `default`   | All types | Value used if nothing is provided   | `default: true`                         |
| `match`     | String    | Must match a regex pattern          | `match: /^[a-z]+$/`                     |
| `enum`      | String    | Must be one of the listed values    | `enum: ["User", "Admin"]`               |
| `minlength` | String    | Minimum number of characters        | `minlength: [2, "Too short"]`           |
| `maxlength` | String    | Maximum number of characters        | `maxlength: [50, "Too long"]`           |
| `min`       | Number    | Minimum allowed number              | `min: [1, "Too small"]`                 |
| `max`       | Number    | Maximum allowed number              | `max: [1000, "Too big"]`                |
| `validate`  | All types | Your own custom rule (can be async) | See example above                       |

### When does the model file actually run?

When Node.js starts your server, it follows the `require()` chain:

```
server.js starts
  → requires the routes file
    → which requires the controller file
      → which requires the model file
        → the schema is built and the model is created RIGHT HERE
```

This all happens BEFORE the server starts listening for requests. That's why `Date.now` (function reference) matters — if you used `Date()` or `Date.now()` (with parentheses), they would run at this moment and give every future document the same timestamp.

---

## 6. Create the Controller

The controller is where the **actual work happens**. When someone sends a request to your API, the controller decides what to do — save data, fetch data, update data, etc.

Create a file: `src/controllers/backend/default.controller.js`

```js
const DefaultModel = require("../../model/Default");
// Load the model so we can use it to talk to the database.
// "../../" means: go up two folders (from controllers/backend/ to src/)

// ============================================================
// CREATE — Save a new record to the database
// ============================================================
exports.create = async (request, response) => {
  // "request" = what the user sent (the incoming data)
  // "response" = what we send back to the user
  // "async" = this function does things that take time (like talking to a database)

  const dataSave = request.body;
  // request.body contains the JSON data the user sent.
  // Example: { "name": "Sid", "type": "Admin" }
  // This works because of the express.json() middleware we set up in server.js.

  try {
    const result = await new DefaultModel(dataSave).save();
    // Step 1: new DefaultModel(dataSave) — Creates a new document (like filling out a form).
    //         At this point, default values are applied (status: true, created_at: Date.now, etc.)
    // Step 2: .save() — Validates the data AND saves it to MongoDB.
    //         If validation fails, it throws an error and we jump to the catch block.
    // "await" — Wait for the database to finish saving before moving on.
    //           WITHOUT await, "result" would be a Promise object, not the actual saved data.

    const data = {
      _status: true,
      _message: "Record Inserted Successfully",
      _data: result,
    };
    return response.send(data);
    // Send the success response back to the user.
  } catch (error) {
    // If ANYTHING goes wrong (validation fails, database error, etc.), we end up here.

    const errorMessages = {};
    // We'll build a clean object of just the error messages.

    for (const e in error.errors) {
      errorMessages[e] = error.errors[e].message;
    }
    // When Mongoose validation fails, error.errors looks like:
    //   {
    //     name: { message: "Name is required!", ... other stuff ... },
    //     type: { message: "Type is required!", ... other stuff ... }
    //   }
    //
    // "for...in" loops over the KEYS of an object (e.g., "name", "type").
    // We grab just the .message from each one and build a cleaner object:
    //   { name: "Name is required!", type: "Type is required!" }

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
  // Only show records that haven't been soft-deleted.
  const condition = {
    deleted_at: null,
    // For a website controller, you'd also add: status: true
    // But in the backend (admin panel), admins should see disabled records too.
  };

  let limit = 10; // How many records per page (default: 10)
  let skip = 0; // How many records to skip (for pagination)
  let page = 1; // Current page number

  if (request.body != undefined) {
    if (request.body.limit != undefined && request.body.limit != "") {
      limit = request.body.limit;
    }

    if (request.body.skip != undefined && request.body.skip != "") {
      skip = request.body.skip;
    }

    if (request.body.page != undefined && request.body.page != "") {
      skip = (request.body.page - 1) * limit;
      // Page 1 → skip 0, Page 2 → skip 10, Page 3 → skip 20, etc.
    }

    if (request.body.name != undefined && request.body.name != "") {
      condition.name = request.body.name;
      // Filter by exact name match
    }
  }

  try {
    const totalRecords = await DefaultModel.find(condition).countDocuments();
    // Count ALL matching records (ignoring limit/skip) — needed for pagination info.

    const result = await DefaultModel.find(condition)
      .select("name order status")
      // .select("name order status") — Only return these fields (plus _id which is always included).
      // This is like SELECT name, order, status FROM ... in SQL.
      // Useful for list pages where you don't need every single field.
      .sort({ _id: "desc" })
      // Sort by _id descending — newest records first.
      .limit(limit)
      // Only return this many records.
      .skip(skip);
    // Skip this many records (for pagination).

    if (result.length > 0) {
      const data = {
        _status: true,
        _message: "Record fetched.",
        _paginate: {
          total_records: totalRecords,
          current_page: page,
          total_pages: Math.ceil(totalRecords / limit),
          // Math.ceil rounds UP: 25 records / 10 per page = 2.5 → 3 pages
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
    const result = await DefaultModel.findOne({ _id: request.params.id });
    // .findOne({ _id: ... }) finds one document matching the given ID.
    // request.params.id comes from the URL: /details/:id
    //   If someone hits /details/abc123, then request.params.id = "abc123"
    // Returns the document if found, or null if not.
    //
    // IMPORTANT: You MUST use "await" here.
    // Without it, result would be a Query object (which is always truthy),
    // so the "if (result)" check would ALWAYS pass — even when nothing was found.

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
  // The new data the user wants to save.

  dataSave.updated_at = new Date();
  // Set the updated_at timestamp to RIGHT NOW.
  // We use "new Date()" here (not Date.now) because:
  //   - We need the value IMMEDIATELY, right now, as a Date object.
  //   - Date.now is a function reference (used in schemas where Mongoose calls it later).
  //   - new Date() gives us the actual value right here, right now.

  try {
    const result = await DefaultModel.updateOne(
      { _id: request.params.id },
      // First argument: WHICH record to update (find by ID).

      { $set: dataSave },
      // Second argument: WHAT to change.
      // $set means: "Only update the fields I'm giving you, leave everything else untouched."
      // Without $set, it would REPLACE the entire document with just dataSave.

      { runValidators: true },
      // Third argument: OPTIONS.
      // By default, updateOne does NOT run your schema validators.
      // That means someone could update a name to "!!!" and it would save, even though
      // your match regex says only letters and numbers are allowed.
      // { runValidators: true } tells Mongoose: "Please check the rules before updating."
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
    // IMPORTANT: Don't forget "return response.send(data)" in the catch block!
    // If you skip it, the request will hang forever — the user's app will just keep waiting
    // and eventually timeout. Always send a response, even when there's an error.
  }
};

// ============================================================
// TOGGLE STATUS — Flip status between true ↔ false
// ============================================================
exports.toggleStatus = async (request, response) => {
  // This uses an AGGREGATION PIPELINE update (notice the array [] as the second argument).
  // A normal update uses an object: { $set: { status: false } }
  // A pipeline update uses an array: [{ $set: { status: ... } }]
  // The pipeline lets us READ a field's current value and change it in ONE operation.

  try {
    const result = await DefaultModel.updateMany(
      { _id: request.body.id },
      [{ $set: { status: { $not: ["$status"] }, updated_at: new Date() } }],
      { updatePipeline: true },
    );
    // Breaking this down:
    //
    // { updatePipeline: true }
    //   REQUIRED in Mongoose 9+. Tells Mongoose that the second argument is an
    //   aggregation pipeline (an array), not a regular update object.
    //   Without it, Mongoose throws:
    //     "Cannot pass an array to query updates unless the 'updatePipeline' option is set."
    //
    // { _id: request.body.id }
    //   WHICH records to update. request.body.id can be a single ID or an ARRAY of IDs.
    //   If it's an array like ["id1", "id2"], Mongoose automatically converts this to
    //   { _id: { $in: ["id1", "id2"] } } — so you don't need to write $in yourself.
    //   That's why we use updateMany — it can update multiple records at once.
    //
    // [{ $set: { status: { $not: ["$status"] } } }]
    //   This is the aggregation pipeline (the array [] makes it a pipeline).
    //   "$status" — The "$" prefix means "the current value of the status field in THIS document".
    //   $not: ["$status"] — Flips the boolean: true becomes false, false becomes true.
    //   NOTE: In aggregation pipelines, $not requires ARRAY syntax: $not: ["$status"]
    //         This is different from the query $not which uses: $not: { ... }
    //
    // Why not just use a normal update?
    //   With a normal update, you can only SET a value: { $set: { status: true } }
    //   You can't say "set it to the OPPOSITE of what it currently is."
    //   To do that without a pipeline, you'd need TWO operations:
    //     1. Find the record and read its current status
    //     2. Update it with the opposite value
    //   The pipeline does both in ONE atomic operation — no race conditions, no extra queries.

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
  // "Soft delete" — instead of actually removing the record from the database,
  // we set deleted_at to the current date. The record still exists,
  // but we can filter it out by checking { deleted_at: null } in other queries.

  try {
    const result = await DefaultModel.updateMany(
      { _id: request.body.id },
      { $set: { deleted_at: new Date() } },
    );
    // request.body.id can be a single ID or an array of IDs.
    // updateMany handles both — just like toggleStatus.

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
```

### The response format — keep it consistent

Every response from every controller follows the same shape:

```js
// When things go well:
{
  _status: true,           // Success!
  _message: "Some message", // What happened
  _data: result            // The actual data
}

// When things go well AND the endpoint returns a list:
{
  _status: true,
  _message: "Record fetched.",
  _paginate: {               // Only present in list/view endpoints
    total_records: 25,
    current_page: 1,
    total_pages: 3
  },
  _data: result
}

// When things go wrong:
{
  _status: false,            // Something failed
  _message: "Error message", // What went wrong
  _data: null,               // No data to return
  _error: { ... }            // Field-specific errors (for validation failures)
}
```

Why? Because the frontend developer (or future you) can always rely on the same structure. Just check `_status` to know if it worked, and read `_error` for details when it didn't.

### Key Mongoose methods

| Method                                                        | What it does                                                                                               | Returns                         |
| ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------- |
| `new Model(data).save()`                                      | Creates a new document and saves it                                                                        | The saved document              |
| `Model.find()`                                                | Gets ALL documents                                                                                         | An array (can be empty)         |
| `Model.find().select("field1 field2")`                        | Gets documents but only specific fields                                                                    | An array with partial documents |
| `Model.find().countDocuments()`                               | Counts matching documents                                                                                  | A number                        |
| `Model.find().sort({ field: "desc" })`                        | Sorts results                                                                                              | An array (sorted)               |
| `Model.find().limit(n).skip(n)`                               | Pagination — limit how many, skip how many                                                                 | An array (paginated)            |
| `Model.findOne(query)`                                        | Gets ONE document matching the query                                                                       | The document, or null           |
| `Model.updateOne(query, update, options)`                     | Updates ONE document                                                                                       | Update result info              |
| `Model.updateMany(query, pipeline, { updatePipeline: true })` | Updates MANY documents (pipeline = array for aggregation, requires `updatePipeline` option in Mongoose 9+) | Update result info              |

### The golden rule: ALWAYS use `await`

Every Mongoose method that talks to the database returns a Promise. If you forget `await`:

- `result` will be a Query/Promise object instead of the actual data.
- A Query object is always truthy, so `if (result)` will ALWAYS be true.
- Your code will "work" but give wrong results — the hardest kind of bug to find.

---

## 7. Create the Routes

The routes file is like a **map** — it connects URLs to controller functions.

"When someone visits THIS URL using THIS method, call THIS function."

Create a file: `src/routes/backend/default.routes.js`

```js
const express = require("express");
const {
  create,
  view,
  details,
  update,
  toggleStatus,
  destroy,
} = require("../../controllers/backend/default.controller.js");
// Load the controller functions using destructuring.
// Instead of: const controller = require("..."); controller.create, controller.view, etc.
// We directly grab: { create, view, details, update, toggleStatus, destroy } from the file.

const router = express.Router();
// express.Router() creates a "mini app" — a group of related routes.
// Think of it as a chapter in a book. The book is your app, each chapter handles one topic.

module.exports = (app) => {
  // We export a FUNCTION that takes "app" as a parameter.
  // server.js will call this function and pass the Express app to it.

  router.post("/create", create);
  // When someone sends a POST request to /create → run the "create" controller function.

  router.post("/view", view);
  // POST to /view → run the "view" controller function.

  router.post("/details/:id", details);
  // POST to /details/SOME_ID → run the "details" controller function.
  // The ":id" part is a PLACEHOLDER.
  //   URL: /details/abc123 → request.params.id = "abc123"
  //   URL: /details/xyz789 → request.params.id = "xyz789"

  router.put("/update/:id", update);
  // PUT to /update/SOME_ID → run the "update" controller function.

  router.put("/toggle-status", toggleStatus);
  // PUT to /toggle-status → run the "toggleStatus" controller function.
  // The IDs to toggle come from request.body.id (can be one ID or an array of IDs).

  router.put("/delete", destroy);
  // PUT to /delete → run the "destroy" controller function.
  // Uses PUT (not DELETE) because we're updating the record (setting deleted_at),
  // not actually removing it from the database.
  // The IDs to delete come from request.body.id (can be one ID or an array of IDs).

  return app.use("/api/backend/default", router);
  // Register this router on the app with a BASE PATH.
  // This means ALL routes in this file get this prefix:
  //   /create      becomes → /api/backend/default/create
  //   /view        becomes → /api/backend/default/view
  //   /details/:id becomes → /api/backend/default/details/:id
  //   /update/:id  becomes → /api/backend/default/update/:id
  //   /toggle-status becomes → /api/backend/default/toggle-status
  //   /delete      becomes → /api/backend/default/delete
};
```

### HTTP Methods — which one to use when

| Method   | Purpose                      | Example                     |
| -------- | ---------------------------- | --------------------------- |
| `GET`    | Read/fetch data (no body)    | Get a list of users         |
| `POST`   | Send data / create something | Create a new user           |
| `PUT`    | Update an entire record      | Update all fields of a user |
| `PATCH`  | Update part of a record      | Change only the user's name |
| `DELETE` | Delete something             | Remove a user               |

---

## 8. Connect Routes to server.js

Now go back to `server.js` and add ONE line to connect your routes:

```js
// Backend Routes
require("./src/routes/backend/default.routes")(app);
```

**What this single line does:**

1. `require("./src/routes/backend/default.routes")` — Loads the routes file. This also triggers a chain reaction:
   - The routes file loads the controller file.
   - The controller file loads the model file.
   - The model file builds the schema and creates the Model.
     All of this happens RIGHT NOW, at server startup.

2. `(app)` — Calls the exported function and passes your Express app to it. This registers all the routes on your app.

**The full chain visualized:**

```
npm start
  → server.js runs
    → require("routes file")(app)
      → routes file loads
        → require("controller file")
          → controller file loads
            → require("model file")
              → model file loads
              → schema is defined (Date.now is stored as a reference, NOT called)
              → Model is created
            ← controller gets the Model
          ← routes get the controller functions
        → routes are registered on the app
      ← server.js continues
    → app.listen starts → server is live
    → mongoose.connect connects to MongoDB

Everything above happens ONCE when the server starts.
Then the server sits and waits for requests.

When a request comes in (e.g., POST /api/backend/default/create):
  → Express matches the URL to the right route
  → The route calls the controller function
  → The controller uses the Model to talk to MongoDB
  → A response is sent back
```

### Adding more modules later

For every new feature, just add another line:

```js
// Backend Routes
require("./src/routes/backend/default.routes")(app);
require("./src/routes/backend/category.routes")(app);
require("./src/routes/backend/colour.routes")(app);
require("./src/routes/backend/material.routes")(app);

// Website Routes
require("./src/routes/website/home.routes")(app);

// Application (API) Routes
require("./src/routes/application/auth.routes")(app);
```

---

## 9. Adding a Second Module — Category (with File Uploads)

Now that you've built the Default module, let's add a second one — **Category**. This module introduces two new concepts:

1. **File uploads** using `multer` — categories can have an image.
2. **Improved validators** — better error messages using `match` array syntax and the `props` object.

Every new module follows the same 5 steps, but this one has extra sauce.

### Step 1: Create the Model — `src/model/category.js`

```js
const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  // ---------- Name with IMPROVED validators ----------
  name: {
    type: String,
    required: [true, "Name is required!"],

    match: [
      /^[a-zA-Z 0-9]{2,10}$/,
      "Name must be an Alphanumeric value of 2 to 10 characters",
    ],
    // IMPROVEMENT over Default model:
    // In Default, we used: match: /^[a-zA-Z 0-9]{2,10}$/  (bare regex)
    // When the bare regex fails, Mongoose gives a generic error:
    //   'Path "name" is invalid (value).'
    // Here we use the ARRAY syntax: match: [regex, "custom message"]
    // Now when it fails, we get our clear message instead.

    validate: {
      validator: async function (v) {
        const user = await mongoose.model("categories").findOne({
          name: v,
          deleted_at: null,
        });
        return !user;
      },
      message: (props) =>
        `${props.value} is already in use for ${props.path} field.`,
      // IMPROVEMENT over Default model:
      // In Default, we had: message: (props) => `The specified name is already in use.`
      // The "props" parameter was accepted but never used — a hardcoded message.
      //
      // Now we actually USE props:
      //   props.value — the value that failed validation (e.g., "Sofa")
      //   props.path  — the field name (e.g., "name")
      //   props.type  — the validator type (e.g., "user defined")
      //
      // So if "Sofa" already exists, the error message is:
      //   "Sofa is already in use for name field."
      // Much more helpful than "The specified name is already in use."
    },
  },

  // ---------- Image field (NEW — not in Default) ----------
  image: {
    type: String,
    default: "",
    // Stores the FILENAME of the uploaded image (not the file itself).
    // Example: "image-1713098765432-483726195.jpg"
    // The actual file lives in the uploads/category/ folder on disk.
    // Default is an empty string — the image is optional.
  },

  // ---------- Same fields as Default (minus "type") ----------
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
  // NOTE: The "type" field (enum: ["User", "Admin"]) from Default is NOT here.
  // Category doesn't need it — not every module needs the same fields.
  // This is how models start to diverge as the project grows.

  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: null },
  deleted_at: { type: Date, default: null },
});

const CategoryModel = mongoose.model("categories", schema);
// "categories" = the name of the collection in MongoDB.
//
// IMPORTANT — Model naming:
// Each model MUST have a unique name. If you use "defaults" here (same as Default.js),
// Mongoose will throw: OverwriteModelError: Cannot overwrite 'defaults' model once compiled.
//
// Mongoose and collection names — auto-pluralization:
//   mongoose.model("category", schema)  → creates collection "categories" (auto-pluralized)
//   mongoose.model("categories", schema) → creates collection "categories" (used as-is)
//   Both result in the same collection. The convention is to use SINGULAR names
//   and let Mongoose pluralize, but using the plural directly also works.
//
// BE AWARE: Mongoose's pluralization is basic — it just adds "s" or handles simple
// rules like "y" → "ies". It does NOT handle irregular English plurals:
//   mongoose.model("child", schema)     → collection "childs" (NOT "children")
//   mongoose.model("man", schema)       → collection "mans" (NOT "men")
//   mongoose.model("foot", schema)      → collection "foots" (NOT "feet")
//   mongoose.model("bacterium", schema) → collection "bacteriums" (NOT "bacteria")
//
// For irregular words, override with the third argument:
//   mongoose.model("child", schema, "children")
//
// Or set it in the schema options:
//   new mongoose.Schema({ ... }, { collection: "children" })
//
// Or disable auto-pluralization entirely:
//   mongoose.pluralize(null);
//
// WHERE is the model name used?
//   1. Collection name in MongoDB (auto-pluralized or as-is)
//   2. Retrieving the model later: mongoose.model("categories") — no schema needed
//   3. The .modelName property: CategoryModel.modelName → "categories"
//   4. The "ref" field when linking models (most important — see below)
//
// The "ref" connection — linking models together:
//   When another model (like Product) has a field that references a category,
//   you use "ref" and the model name must match EXACTLY:
//
//   // In product schema:
//   category: {
//     type: mongoose.Schema.Types.ObjectId,  // stores just the _id
//     ref: "categories",  // ← must match mongoose.model("categories", ...)
//   }
//
//   // Without populate:
//   product.category → "665a3f..." (just the ID)
//
//   // With populate:
//   await ProductModel.findOne({ name: "Chair" }).populate("category");
//   product.category → { _id: "665a3f...", name: "Furniture", status: true, ... }
//
//   populate() uses the "ref" string to know WHICH model/collection to fetch from.
//   That's why the ref value must match the model name exactly.

module.exports = CategoryModel;
```

**What's different from Default?**

|                    | Default Model                | Category Model                      |
| ------------------ | ---------------------------- | ----------------------------------- |
| Extra fields       | `type` (enum)                | `image` (String)                    |
| `match` format     | Bare regex (generic error)   | Array syntax (custom error message) |
| `validate.message` | `props` accepted but ignored | `props.value` and `props.path` used |
| `order.min`        | 1                            | 0                                   |
| Model name         | `"defaults"`                 | `"categories"`                      |

### Step 2: Create the Controller — `src/controllers/backend/category.controller.js`

The Category controller introduces **file upload handling** — the `create` and `update` methods now check for `request.file`.

```js
const CategoryModel = require("../../model/category");
// Each controller works with its OWN model.

// ============================================================
// CREATE — with file upload support
// ============================================================
exports.create = async (request, response) => {
  const dataSave = request.body;

  if (request.file) {
    dataSave.image = request.file.filename;
  }
  // NEW: Check if a file was uploaded.
  // When multer processes the request, it puts the file info in request.file.
  // request.file.filename is the name multer gave the file on disk
  //   (e.g., "image-1713098765432-483726195.jpg")
  // We save this filename in the database, not the actual file.
  // The file itself lives in uploads/category/ on disk.
  //
  // If no file was uploaded, request.file is undefined — we skip this,
  // and the image field gets its default value ("") from the schema.

  try {
    const result = await new CategoryModel(dataSave).save();
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
    // IMPROVEMENT over Default controller:
    // Not all errors are Mongoose ValidationErrors. If the error is something else
    // (e.g., a network error or cast error), error.errors will be undefined.
    // Without this check, the for...in loop would silently produce an empty {} object,
    // and the frontend would get _error: {} with no useful messages.
    // The fallback to error.message catches these non-validation errors.

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
// VIEW — With dynamic filtering using $and and RegExp
// ============================================================
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

  // ---------- Building the filter dynamically ----------
  // Unlike the Default controller (which uses a simple condition object),
  // Category uses MongoDB's $and operator to build filters dynamically.
  //
  // WHY $and instead of a simple object?
  //   A simple object like { deleted_at: null, name: "Sofa" } works for exact matches.
  //   But when you need RegExp values, conditional fields, or complex queries,
  //   $and gives you more flexibility — you push conditions into an array
  //   only when they exist, so the query adapts to what the user searched for.

  const andCondition = [{ deleted_at: null }];
  // Start with the base condition: only show non-deleted records.
  // This condition is ALWAYS present, regardless of filters.

  if (request.body != undefined) {
    if (request.body.name != undefined && request.body.name != "") {
      const name = new RegExp(request.body.name, "i");
      andCondition.push({ name: name });
    }
    // If the user typed a name in the search box:
    //   1. new RegExp(request.body.name, "i") creates a case-insensitive regex.
    //      Example: if user types "elec", this becomes /elec/i
    //      This matches "Electronics", "Electrical", "ELECTRIC", etc.
    //      The "i" flag means case-Insensitive.
    //   2. We push it into the andCondition array.
    //
    // WHY RegExp for name but not for order?
    //   Names are text — users expect partial, flexible matching.
    //   Typing "elec" should find "Electronics" (partial match).
    //   Order is a number — you either want order 5 or you don't (exact match).

    if (request.body.order != undefined && request.body.order != "") {
      andCondition.push({ order: request.body.order });
    }
    // Order is an exact match — no regex needed for numbers.
  }

  let filter = { $and: andCondition };
  // Combine all conditions with $and.
  // MongoDB's $and means: ALL conditions must be true for a record to match.

  // ---------- How the filter looks for different scenarios ----------
  //
  // | User input       | andCondition array                                         | Final MongoDB query                                              |
  // |------------------|------------------------------------------------------------|------------------------------------------------------------------|
  // | No filters       | [{ deleted_at: null }]                                     | { $and: [{ deleted_at: null }] }                                 |
  // | Name only        | [{ deleted_at: null }, { name: /elec/i }]                  | { $and: [{ deleted_at: null }, { name: /elec/i }] }             |
  // | Order only       | [{ deleted_at: null }, { order: 5 }]                       | { $and: [{ deleted_at: null }, { order: 5 }] }                  |
  // | Name + Order     | [{ deleted_at: null }, { name: /elec/i }, { order: 5 }]    | { $and: [{ deleted_at: null }, { name: /elec/i }, { order: 5 }] }|
  //
  // In every case, deleted_at: null is always present — soft-deleted records never show up.
  // Additional filters are only added when the user provides them.

  try {
    const totalRecords = await CategoryModel.find(filter).countDocuments();
    // Count ALL matching records (ignoring limit/skip).
    // IMPORTANT: Uses the same filter, so the count reflects filtered results too.
    // If 50 categories exist but only 3 match "elec", totalRecords = 3.

    const result = await CategoryModel.find(filter)
      .select("name image order status")
      // Added "image" to the select — Category has an image field.
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
// DETAILS — Same as Default
// ============================================================
exports.details = async (request, response) => {
  try {
    const result = await CategoryModel.findOne({ _id: request.params.id });
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
// UPDATE — with file upload support
// ============================================================
exports.update = async (request, response) => {
  const dataSave = request.body;
  dataSave.updated_at = new Date();

  if (request.file) {
    dataSave.image = request.file.filename;
  }
  // Same as create — if a new image was uploaded, update the filename.
  // If no new image was uploaded, the old image stays unchanged
  // (because $set only updates the fields you provide).

  try {
    const result = await CategoryModel.updateOne(
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

// ============================================================
// TOGGLE STATUS & DESTROY — Same as Default
// ============================================================
exports.toggleStatus = async (request, response) => {
  try {
    const result = await CategoryModel.updateMany(
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
    const result = await CategoryModel.updateMany(
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
```

**What's different from Default's controller?**

|                 | Default                                           | Category                                                                          |
| --------------- | ------------------------------------------------- | --------------------------------------------------------------------------------- |
| File handling   | No                                                | `request.file` check in create and update                                         |
| View select     | `"name order status"`                             | `"name image order status"`                                                       |
| View filtering  | Simple `condition` object with exact `name` match | `$and` array with `RegExp` for case-insensitive name search + exact `order` match |
| Error handling  | Only checks `error.errors`                        | Also falls back to `error.message` for non-validation errors                      |
| Everything else | Same                                              | Same                                                                              |

> **Note:** The delete route also differs — Default uses `router.put("/delete", ...)` while Category uses `router.delete("/delete", ...)`. This is a routes-level difference, covered in Step 3 below.

### Step 3: Create the Routes — `src/routes/backend/category.routes.js`

This is where the biggest difference is. The Default routes were simple — just URL-to-function mapping. Category routes introduce **multer middleware** for handling file uploads.

```js
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
// Node.js built-in module for working with file paths.
// We need it for two things:
//   1. Building absolute paths for multer (see uploadDir below).
//   2. Extracting the file extension from the original filename.

const uploadDir = path.join(process.cwd(), "uploads/category");
// Multer v2 requires ABSOLUTE paths — relative paths like "uploads/category" will throw:
//   "Base path '' must be an absolute path"
//
// process.cwd() returns the directory where you ran `npm start` — the project root.
//   e.g., "/Users/sid/my-project"
// path.join() combines it with "uploads/category" to get:
//   "/Users/sid/my-project/uploads/category"
//
// WHY process.cwd() and not __dirname?
//   __dirname = the folder where THIS file lives (src/routes/backend/).
//   To reach uploads/ from there, you'd need "../../../uploads/category".
//   That's fragile — if you ever move this file, the path breaks.
//   process.cwd() always points to the project root, regardless of where the file lives.

const upload = multer({ dest: uploadDir });
// A BASIC multer setup — just saves files to the uploads/category folder.
// Files get a random name with no extension (e.g., "a1b2c3d4e5f6").
// We use this for routes that DON'T accept files (explained below).

const router = express.Router();

// ---------- Custom storage for better filenames ----------
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
    // Where to save the file. "cb" = callback.
    // cb(error, destination) — null means no error.
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    // Date.now() → milliseconds since 1970 (e.g., 1713098765432)
    // Math.random() * 1e9 → a random number up to 1 billion
    //   1e9 is scientific notation for 1,000,000,000 (1 × 10^9)
    //   Writing 1e9 is easier to read than 1000000000.
    // Together they make a unique suffix like: "1713098765432-483726195"

    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname),
    );
    // file.fieldname — the name from uploads.single("image"), so it's "image"
    //   This comes from what you pass to uploads.single().
    //   If you used uploads.single("photo"), fieldname would be "photo".
    //   In the frontend, the form field name must match:
    //     <input type="file" name="image" />
    //     In Postman: the key in form-data must be "image".
    //
    // path.extname(file.originalname) — extracts the file extension
    //   path.extname("photo.png")      → ".png"
    //   path.extname("document.pdf")   → ".pdf"
    //   path.extname("image.test.jpg") → ".jpg" (only the last extension)
    //   path.extname("noextension")    → ""
    //
    // Final filename example: "image-1713098765432-483726195.jpg"
  },
});

const uploads = multer({ storage: storage });
// A CUSTOM multer setup — uses our storage config for proper filenames with extensions.
// We use this for routes that DO accept file uploads.

// ---------- Why TWO multer instances? ----------
// "upload"  (basic)  → for routes that DON'T accept files but need multer to parse form-data.
// "uploads" (custom) → for routes that DO accept files — gives proper filenames.
//
// WHY do non-file routes need multer at all?
// When the frontend sends data as multipart/form-data (which it does when
// there's a file input in the form), express.json() and express.urlencoded()
// CANNOT parse it. Only multer can.
// upload.none() says: "Parse the form fields, but don't expect any files."

module.exports = (app) => {
  router.post("/create", uploads.single("image"), create);
  // uploads.single("image") — Accept ONE file from a form field named "image".
  // Multer processes the file and puts it in request.file.
  // The text fields (name, order, etc.) go into request.body as usual.

  router.post("/view", upload.none(), view);
  router.post("/details/:id", upload.none(), details);
  // upload.none() — Parse form fields only, no files expected.
  // Needed because the frontend sends form-data for all requests
  // (since the same form might sometimes include a file).

  router.put("/update/:id", uploads.single("image"), update);
  // Same as create — accept an optional new image.

  router.put("/toggle-status", upload.none(), toggleStatus);
  router.delete("/delete", upload.none(), destroy);

  return app.use("/api/backend/categories", router);
};
```

### Multer at a glance

| Concept                                         | What it does                                                                                                                                          |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `multer({ dest: absolutePath })`                | Basic setup — saves files with random names, no extension. **Multer v2 requires absolute paths** — use `path.join(process.cwd(), "uploads/category")` |
| `multer({ storage })`                           | Custom setup — you control the filename and destination                                                                                               |
| `multer.diskStorage({ destination, filename })` | Define WHERE and with WHAT NAME to save files                                                                                                         |
| `uploads.single("fieldname")`                   | Middleware: accept ONE file from this form field                                                                                                      |
| `upload.none()`                                 | Middleware: parse form fields only, reject any files                                                                                                  |
| `request.file`                                  | The uploaded file's info (set by multer after processing)                                                                                             |
| `request.file.filename`                         | The name multer saved the file as (e.g., "image-17130...-483726195.jpg")                                                                              |
| `request.file.originalname`                     | The original name from the user's computer (e.g., "my-photo.jpg")                                                                                     |
| `request.file.fieldname`                        | The form field name (e.g., "image" — from `uploads.single("image")`)                                                                                  |

### Step 4: Connect to server.js

Add one line to `server.js`:

```js
// Backend Routes
require("./src/routes/backend/default.routes")(app);
require("./src/routes/backend/category.routes")(app); // ← new line
```

### Step 5: Test Category Endpoints

> **Important:** Category uses **form-data** (not raw JSON) because of file uploads. In Postman, select "Body → form-data" instead of "Body → raw → JSON".

| What to test         | Method | URL                                                            | Body (form-data)                                                                               |
| -------------------- | ------ | -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Create a category    | POST   | `http://localhost:8000/api/backend/categories/create`          | `name: "Sofa"`, `image: [file]`                                                                |
| View all categories  | POST   | `http://localhost:8000/api/backend/categories/view`            | (no body needed)                                                                               |
| View with pagination | POST   | `http://localhost:8000/api/backend/categories/view`            | `page: 2`, `limit: 5`                                                                          |
| Filter by name       | POST   | `http://localhost:8000/api/backend/categories/view`            | `name: "elec"` (case-insensitive, partial match)                                               |
| Filter by order      | POST   | `http://localhost:8000/api/backend/categories/view`            | `order: 5` (exact match)                                                                       |
| Filter by both       | POST   | `http://localhost:8000/api/backend/categories/view`            | `name: "elec"`, `order: 5`                                                                     |
| Get one category     | POST   | `http://localhost:8000/api/backend/categories/details/ID_HERE` | (no body needed)                                                                               |
| Update a category    | PUT    | `http://localhost:8000/api/backend/categories/update/ID_HERE`  | `name: "Chair"`, `image: [file]` (only changed fields needed — `$set` preserves existing data) |
| Toggle status        | PUT    | `http://localhost:8000/api/backend/categories/toggle-status`   | `id: "ID_HERE"` or `id: ["ID1", "ID2"]`                                                        |
| Soft delete          | DELETE | `http://localhost:8000/api/backend/categories/delete`          | `id: "ID_HERE"` or `id: ["ID1", "ID2"]`                                                        |

> In Postman, for the `image` field, change the type dropdown from "Text" to "File" — then you can select a file from your computer.

### The takeaway

Adding a new module is the same recipe every time:

```
Model → Controller → Routes → server.js → Test
```

The structure never changes. What changes is the specifics — Category needed file uploads, so the routes got multer middleware and the controller got `request.file` handling. The next module might need something else (authentication, different validators, etc.), but the 5-step pattern stays the same.

---

## 10. Adding a SubCategory Module

The SubCategory module demonstrates how to create a hierarchical relationship between models, where a SubCategory belongs to a parent Category. This pattern is useful for organizing data in a tree-like structure.

### 10.1 Create the SubCategory Model

Create a file: `src/model/subCategory.js`

```js
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
```

**Key Features:**

- **Reference Field**: `parent_category_id` with `ref: "categories"` creates a relationship to the Category model
- **Unique Validation**: Ensures subcategory names are unique within the same parent category
- **Same Pattern**: Follows the same validation and timestamp pattern as other modules

### 10.2 Create the SubCategory Controller

Create a file: `src/controllers/backend/subCategory.controller.js`

```js
const subCategory = require("../../model/subCategory");
const category = require("../../model/category");

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

// Standard CRUD operations (create, view, details, update, toggleStatus, destroy)
// Follow the same pattern as other controllers but with parent category relationship

exports.create = async (request, response) => {
  const dataSave = request.body;
  if (request.file) {
    dataSave.image = request.file.filename;
  }
  try {
    const result = await new subCategory(dataSave).save();
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

// ... (other controller methods follow the same pattern)
```

**Key Features:**

- **parentCategory Helper**: Provides parent categories for frontend dropdowns
- **Relationship Handling**: Properly manages the parent-child relationship
- **File Upload**: Supports image uploads like the Category module

### 10.3 Create the SubCategory Routes

Create a file: `src/routes/backend/subCategory.routes.js`

```js
const express = require("express");
const {
  parentCategory,
  create,
  view,
  details,
  update,
  toggleStatus,
  destroy,
} = require("../../controllers/backend/subCategory.controller.js");
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
  router.post("/parent-category", upload.none(), parentCategory);
  router.post("/create", uploads.single("image"), create);
  router.post("/view", upload.none(), view);
  router.post("/details/:id", upload.none(), details);
  router.put("/update/:id", uploads.single("image"), update);
  router.put("/toggle-status", upload.none(), toggleStatus);
  router.post("/delete", upload.none(), destroy);

  return app.use("/api/backend/sub-categories", router);
};
```

**Key Features:**

- **parent-category Endpoint**: Special endpoint for fetching parent categories
- **File Upload**: Same image upload handling as Category
- **RESTful Routes**: Follows RESTful conventions with proper HTTP methods

### 10.4 Connect Routes to server.js

Add this line to your `server.js` in the Backend Routes section:

```js
require("./src/routes/backend/subCategory.routes")(app);
```

### 10.5 SubCategory-Specific Features

#### Parent Category Filtering

The view method supports filtering by parent category:

```js
if (
  request.body.parent_category_id != undefined &&
  request.body.parent_category_id != ""
) {
  andCondition.push({
    parent_category_id: request.body.parent_category_id,
  });
}
```

#### Population of Parent Data

When fetching subcategories, populate the parent category details:

```js
const result = await subCategory
  .find(filter)
  .populate("parent_category_id", "name")
  .select("name parent_category_id image order status")
  .sort({ _id: "desc" })
  .limit(limit)
  .skip(skip);
```

#### Hierarchical Validation

The unique validation ensures subcategory names are unique within each parent category, not globally unique.

---

## 11. Test the API

Start your server:

```bash
npm start
```

Open **Postman** (or any API testing tool) and try these:

| What to test          | Method | URL                                                         | Body (JSON)                                         |
| --------------------- | ------ | ----------------------------------------------------------- | --------------------------------------------------- |
| Create a record       | POST   | `http://localhost:8000/api/backend/default/create`          | `{ "name": "Test", "type": "User" }`                |
| View all records      | POST   | `http://localhost:8000/api/backend/default/view`            | (no body needed)                                    |
| View with pagination  | POST   | `http://localhost:8000/api/backend/default/view`            | `{ "page": 2, "limit": 5 }`                         |
| View with name filter | POST   | `http://localhost:8000/api/backend/default/view`            | `{ "name": "Test" }`                                |
| Get one record        | POST   | `http://localhost:8000/api/backend/default/details/ID_HERE` | (no body needed)                                    |
| Update a record       | PUT    | `http://localhost:8000/api/backend/default/update/ID_HERE`  | `{ "name": "Updated Name" }`                        |
| Toggle status         | PUT    | `http://localhost:8000/api/backend/default/toggle-status`   | `{ "id": "ID_HERE" }` or `{ "id": ["ID1", "ID2"] }` |
| Soft delete           | PUT    | `http://localhost:8000/api/backend/default/delete`          | `{ "id": "ID_HERE" }` or `{ "id": ["ID1", "ID2"] }` |

> Replace `ID_HERE` with the `_id` value you get from the create response. It looks like: `6789abc...`

### What to check:

- **Create** — Should return `_status: true` with the saved record. Try sending invalid data (empty name, wrong type) to see validation errors.
- **View** — Should return records with a `_paginate` object showing `total_records`, `current_page`, and `total_pages`. Try sending `{ "page": 1, "limit": 5 }` to test pagination. Try sending `{ "name": "Test" }` to filter by name. If no records match, you should get `_status: false` with "No Record Found". Soft-deleted records are automatically excluded.
- **Details** — Should return one specific record. Try with a wrong ID to see the error response.
- **Update** — Should return `_status: true`. Then call View again to confirm the data actually changed.
- **Toggle Status** — Should flip `status` from true to false (or vice versa). Call View before and after to confirm it changed. Try sending an array of IDs to toggle multiple records at once.
- **Soft Delete** — Should set `deleted_at` to the current date. Call Details on that ID to confirm `deleted_at` is no longer null. Try sending an array of IDs to delete multiple records at once.

---

## 12. Sub Sub Category Module

### Overview

The Sub Sub Category module provides three-level hierarchical categorization: Parent Category → Sub Category → Sub Sub Category. This follows the same architectural patterns as the Category and Sub Category modules.

### Model Schema

```javascript
// src/model/subSubCategory.js
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
        const user = await mongoose.model("sub_sub_categories").findOne({
          name: v,
          parent_category_id: this.parent_category_id,
          sub_category_id: this.sub_category_id,
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
  sub_category_id: {
    type: String,
    required: [true, "Sub Category is required!"],
    ref: "sub_categories",
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
```

### Key Features

- **Hierarchical Relationships**: References both parent category and sub category
- **Unique Validation**: Names are unique within each parent+sub category combination
- **Soft Delete**: Uses `deleted_at` field for soft deletion
- **Image Upload**: Supports category images with file storage
- **Status Toggle**: Enable/disable sub sub categories
- **Order Management**: Custom ordering within hierarchy

### API Endpoints

| Endpoint                                          | Method | Description                             | Request Body                                                                 |
| ------------------------------------------------- | ------ | --------------------------------------- | ---------------------------------------------------------------------------- |
| `/api/backend/sub-sub-categories/parent-category` | POST   | Get parent categories for dropdown      | `{}`                                                                         |
| `/api/backend/sub-sub-categories/sub-category`    | POST   | Get sub categories for dropdown         | `{ "parent_category_id": "ID" }`                                             |
| `/api/backend/sub-sub-categories/create`          | POST   | Create new sub sub category             | FormData (with image)                                                        |
| `/api/backend/sub-sub-categories/view`            | POST   | View sub sub categories with pagination | `{ "page": 1, "name": "", "parent_category_id": "", "sub_category_id": "" }` |
| `/api/backend/sub-sub-categories/details/:id`     | POST   | Get sub sub category details            | `{}`                                                                         |
| `/api/backend/sub-sub-categories/update/:id`      | PUT    | Update sub sub category                 | FormData (with optional image)                                               |
| `/api/backend/sub-sub-categories/toggle-status`   | PUT    | Toggle status (active/inactive)         | `{ "id": "ID" }` or `{ "id": ["ID1", "ID2"] }`                               |
| `/api/backend/sub-sub-categories/delete`          | POST   | Soft delete sub sub category            | `{ "id": "ID" }` or `{ "id": ["ID1", "ID2"] }`                               |

### Usage Examples

#### Create Sub Sub Category

```javascript
const formData = new FormData();
formData.append("parent_category_id", "parent_id_here");
formData.append("sub_category_id", "sub_id_here");
formData.append("name", "Electronics");
formData.append("order", "1");
formData.append("image", fileObject); // Optional

const response = await axios.post(
  "/api/backend/sub-sub-categories/create",
  formData,
  {
    headers: { "Content-Type": "multipart/form-data" },
  },
);
```

#### View with Filtering

```javascript
const filterData = {
  page: 1,
  name: "Electronics",
  parent_category_id: "parent_id_here",
  sub_category_id: "sub_id_here",
};

const response = await axios.post(
  "/api/backend/sub-sub-categories/view",
  filterData,
);
```

#### Helper Endpoints for Dropdowns

```javascript
// Get parent categories
const parents = await axios.post(
  "/api/backend/sub-sub-categories/parent-category",
);

// Get sub categories for a specific parent
const subCategories = await axios.post(
  "/api/backend/sub-sub-categories/sub-category",
  {
    parent_category_id: "parent_id_here",
  },
);
```

### Response Format

All endpoints return consistent responses:

```javascript
// Success
{
  _status: true,
  _message: "Record created successfully",
  _data: { /* sub sub category object */ }
}

// Success with pagination
{
  _status: true,
  _message: "Record fetched.",
  _paginate: {
    total_records: 25,
    current_page: 1,
    total_pages: 3
  },
  _data: [ /* array of sub sub categories */ ]
}

// Error
{
  _status: false,
  _message: "Validation error",
  _error: { name: "Name is required" }
}
```

### File Upload Configuration

```javascript
// Multer configuration for image uploads
const uploadDir = path.join(process.cwd(), "uploads/category");
const uploads = multer({ storage: storage });

router.post("/create", uploads.single("image"), create);
router.put("/update/:id", uploads.single("image"), update);
```

### Database Relationships

The sub sub category model establishes these relationships:

- **parent_category_id** → References `categories` collection
- **sub_category_id** → References `sub_categories` collection
- **Populated in responses** for better frontend integration

### Validation Rules

- Name: Required, alphanumeric, 2-10 characters
- Parent Category: Required, must exist in categories collection
- Sub Category: Required, must exist in sub_categories collection
- Order: Number, 0-1000 range
- Unique: Name must be unique within parent+sub category combination

---

## 13. How Dynamic Filtering Works — Category View

The Category `view` endpoint supports **dynamic filtering** — the MongoDB query changes based on what the user searches for. This is more advanced than the Default controller's simple condition object.

### The frontend sends these parameters

The React frontend (ViewCategory.jsx) sends a POST request with:

```js
axios.post(`${import.meta.env.VITE_SERVER_URL}api/backend/categories/view`, {
  page: currentPage, // which page of results
  name: filterData.name, // category name to search (from text input)
  order: filterData.order, // category order number (from number input)
});
```

The frontend also supports **editing categories**. The AddCategory.jsx component serves both create and update modes:

- **Create mode**: Route `/category/add-category` — sends `axios.post()` to `/api/backend/categories/create`
- **Edit mode**: Route `/category/update/:id` — fetches existing data via POST to `/api/backend/categories/details/:id`, populates the form with `defaultValue`, and sends `axios.put()` to `/api/backend/categories/update/:id`

The ViewCategory.jsx page also supports **bulk actions** via checkbox selection. A select-all checkbox in the table header toggles all row checkboxes, and individual row checkboxes toggle single selections. Selected record IDs are tracked in a `selectedRecord` array. The "Delete All" and "Change Status" buttons are disabled when no rows are selected (`selectedRecord.length === 0`) — these will send the array of IDs to the `toggle-status` and `delete` endpoints (which accept `id` as a single ID or an array).

### Step-by-step: how the filter is built

**Step 1 — Start with the base condition (always applied)**

```js
const andCondition = [{ deleted_at: null }];
```

This ensures soft-deleted categories never show up. This condition is **always present**, regardless of whether the user applied any filters.

**Step 2 — Add the name filter (optional, case-insensitive)**

```js
if (request.body.name != undefined && request.body.name != "") {
  const name = new RegExp(request.body.name, "i");
  andCondition.push({ name: name });
}
```

If the user typed a name in the search box:

1. `new RegExp(request.body.name, "i")` creates a **case-insensitive regular expression**.
   - `request.body.name` → the search pattern (e.g., `"elec"`)
   - `"i"` → the flag meaning **case-insensitive**
   - Result: `/elec/i`
2. This regex is pushed into the `andCondition` array.
3. In MongoDB, passing a RegExp as a field value works like the `$regex` operator — it does a **partial, case-insensitive match**.

So if the user searches for `"elec"`, it matches `"Electronics"`, `"Electrical"`, `"ELECTRIC"`, `"eLeCTRiC"`, etc.

**Step 3 — Add the order filter (optional, exact match)**

```js
if (request.body.order != undefined && request.body.order != "") {
  andCondition.push({ order: request.body.order });
}
```

Order is a number — users expect an exact match (order 5 means order 5, not 50 or 15).

**Step 4 — Combine all conditions with `$and`**

```js
let filter = { $and: andCondition };
```

MongoDB's `$and` means: **ALL conditions in the array must be true** for a record to match.

### The final query for every scenario

| User input               | `andCondition` array                                      | Final MongoDB query                                                 |
| ------------------------ | --------------------------------------------------------- | ------------------------------------------------------------------- |
| No filters               | `[{ deleted_at: null }]`                                  | `{ $and: [{ deleted_at: null }] }`                                  |
| Name only (e.g., "elec") | `[{ deleted_at: null }, { name: /elec/i }]`               | `{ $and: [{ deleted_at: null }, { name: /elec/i }] }`               |
| Order only (e.g., 5)     | `[{ deleted_at: null }, { order: 5 }]`                    | `{ $and: [{ deleted_at: null }, { order: 5 }] }`                    |
| Name + Order             | `[{ deleted_at: null }, { name: /elec/i }, { order: 5 }]` | `{ $and: [{ deleted_at: null }, { name: /elec/i }, { order: 5 }] }` |

In every case, `deleted_at: null` is always present — soft-deleted records never show up. Additional filters are only added when the user provides them.

**Step 5 — Query execution (same filter for count and results)**

```js
const totalRecords = await CategoryModel.find(filter).countDocuments();
const result = await CategoryModel.find(filter)
  .select("name image order status")
  .sort({ _id: "desc" })
  .limit(limit)
  .skip(skip);
```

The **same `filter`** is used for both the total count (for pagination) and the actual results. This is important because:

- If 50 categories exist but only 3 match the filter `"elec"`, `totalRecords` = 3 (not 50).
- Pagination stays accurate — `total_pages` is based on the filtered count, not the total count.

### Why `$and` array instead of a simple condition object?

The Default controller uses a simple object:

```js
const condition = { deleted_at: null, name: request.body.name };
```

This works for exact matches, but has limitations:

- You can't conditionally add/remove fields easily.
- You can't use RegExp values cleanly alongside other conditions.

The `$and` array approach lets you **push conditions only when they exist**:

```js
const andCondition = [{ deleted_at: null }]; // always present
if (hasName) andCondition.push({ name: /pattern/i }); // only if user searched
if (hasOrder) andCondition.push({ order: 5 }); // only if user filtered
```

This pattern scales well — when you add more filters later (status, date range, etc.), you just push more conditions into the array.

### Why RegExp for name but not for order?

- **Name** is text — users expect partial, flexible matching. Typing `"elec"` should find `"Electronics"`.
- **Order** is a number — you either want order 5 or you don't. Partial matching on numbers doesn't make sense.

---

## 13. Quick Reference — Common Gotchas

Things that are easy to forget but will save you hours of debugging.

### The Date Trap

This is the #1 most confusing thing in this project. Here's the complete picture:

| Code         | What it returns           | When it runs                  | Use for                                               |
| ------------ | ------------------------- | ----------------------------- | ----------------------------------------------------- |
| `Date.now`   | A function reference      | Later, when Mongoose calls it | Schema defaults (`default: Date.now`)                 |
| `new Date()` | A Date object (right now) | Immediately                   | Controller logic (`dataSave.updated_at = new Date()`) |
| `Date()`     | A STRING (not a Date!)    | Immediately                   | NEVER use this                                        |
| `Date.now()` | A number (milliseconds)   | Immediately                   | NEVER use as a schema default                         |

**The golden rule:**

- Giving it to Mongoose to call later? → `Date.now` (no parentheses)
- Need the value right now in your code? → `new Date()`

**Why `Date()` and `Date.now()` are traps in schema defaults:**

The model file runs ONCE at startup. If you write `default: Date()` or `default: Date.now()`, they run at that moment and return a FIXED value. Every document created after that gets the exact same timestamp — the time the server started, not the time the document was created.

`Date.now` (without parentheses) is just a reference to the function. Mongoose stores it and calls it fresh each time a new document is created. That's why each document gets its own correct timestamp.

### Common Mistakes Checklist

**Chaining `.sort()`, `.limit()`, `.skip()` AFTER `await` — they run on the JS array, not MongoDB:**

```js
// WRONG — await resolves first, returns a JS array.
// Then .sort(), .limit(), .skip() run on the array — limit/skip don't exist on arrays!
const result = (await Model.find(condition).select("name order status"))
  .sort({ _id: "desc" })
  .limit(limit)
  .skip(skip);

// CORRECT — chain everything BEFORE await, so MongoDB handles it all.
const result = await Model.find(condition)
  .select("name order status")
  .sort({ _id: "desc" })
  .limit(limit)
  .skip(skip);
```

**Pagination skip calculation — how it works:**

```js
// skip = (page - 1) * limit
//
// If limit = 10:
//   Page 1 → skip = (1-1) * 10 = 0   → records 1–10
//   Page 2 → skip = (2-1) * 10 = 10  → records 11–20
//   Page 3 → skip = (3-1) * 10 = 20  → records 21–30
//
// NOTE: If both "skip" and "page" are sent in request.body,
// the page calculation OVERWRITES skip (because it runs after).
// { skip: 5, page: 2 } → skip becomes 10, not 5.
```

**Missing `await`:**

```js
// WRONG — result is a Promise/Query object, not data
const result = DefaultModel.findOne({ _id: id });
if (result) { ... } // ALWAYS true because a Query object is truthy!

// CORRECT — result is the actual document (or null)
const result = await DefaultModel.findOne({ _id: id });
if (result) { ... } // Works correctly
```

**Missing `return response.send()` in catch blocks:**

```js
// WRONG — error happens but no response is ever sent. Request hangs forever.
catch (error) {
  const data = { _status: false, _message: "Error" };
  // forgot to send it!
}

// CORRECT
catch (error) {
  const data = { _status: false, _message: "Error" };
  return response.send(data);
}
```

**`for...in` on arrays vs objects:**

```js
// for...in on OBJECTS — gives you the KEYS ✅
for (const key in { name: "Sid", age: 20 }) { ... }
// key = "name", then "age"

// for...in on ARRAYS — gives you INDEXES as STRINGS (not values!) ⚠️
for (const i in ["apple", "banana"]) { ... }
// i = "0", then "1" (strings, not numbers!)

// for...of on ARRAYS — gives you the VALUES ✅
for (const item of ["apple", "banana"]) { ... }
// item = "apple", then "banana"
```

**Arrow functions don't have `this`:**

```js
// WRONG — arrow function, "this" is undefined
validate: {
  validator: async (v) => {
    const existing = await this.constructor.findOne(...); // ERROR! this is wrong
  }
}

// CORRECT — regular function (but see note below about this.constructor)
validate: {
  validator: async function (v) {
    const existing = await this.constructor.findOne(...); // Works during .save()
  }
}
```

**`this.constructor.findOne` breaks during `updateOne`:**

```js
// WRONG — works during .save(), but FAILS during updateOne with runValidators: true
// During updates, "this" is a Query object, not the document.
// Error: "this.constructor.findOne is not a function"
validate: {
  validator: async function (v) {
    const user = await this.constructor.findOne({ name: v });
  }
}

// CORRECT — mongoose.model() works in BOTH save() and updateOne() contexts
validate: {
  validator: async function (v) {
    const user = await mongoose.model("defaults").findOne({ name: v });
  }
}
```

**Aggregation pipeline updates require `updatePipeline: true` in Mongoose 9+:**

```js
// WRONG — Mongoose 9 throws:
//   "Cannot pass an array to query updates unless the 'updatePipeline' option is set."
await Model.updateMany({ _id: id }, [
  { $set: { status: { $not: ["$status"] } } },
]);

// CORRECT — pass { updatePipeline: true } as the third argument
await Model.updateMany(
  { _id: id },
  [{ $set: { status: { $not: ["$status"] } } }],
  { updatePipeline: true },
);
```

**`updateOne` skips validators by default:**

```js
// WRONG — validators won't run, invalid data can be saved
await DefaultModel.updateOne({ _id: id }, { $set: data });

// CORRECT — validators will run
await DefaultModel.updateOne(
  { _id: id },
  { $set: data },
  { runValidators: true },
);
```

**`enum` is a validator, not a type:**

```js
// WRONG — there is no "Enum" type in Mongoose
type: { type: Enum, values: ["User", "Admin"] }

// CORRECT — type is String, enum is a validator on it
type: { type: String, enum: ["User", "Admin"] }
```

**`enum` allows `undefined`:**

```js
// If the field is not "required" and no value is sent, it saves as undefined.
// The enum check only runs when a value IS provided.
// Add "required: true" if you don't want it to be optional.
```

**`match` without a custom message gives a generic error:**

```js
// HARD TO DEBUG — generic error message, doesn't tell you what's wrong
match: /^[a-zA-Z 0-9]{2,10}$/;
// Error: 'Path "name" is invalid (value).'

// BETTER — array syntax with a custom message
match: [/^[a-zA-Z 0-9]{2,10}$/, "Name must be 2-10 alphanumeric characters"];
// Error: 'Name must be 2-10 alphanumeric characters'
```

**`validate.message` props — use it or lose it:**

```js
// WASTEFUL — props is available but ignored
message: (props) => `The specified name is already in use.`;

// USEFUL — props gives you the value and field name
message: (props) => `${props.value} is already in use for ${props.path} field.`;
// If "Sofa" already exists: "Sofa is already in use for name field."

// Available props:
//   props.value — the value that failed (e.g., "Sofa")
//   props.path  — the field name (e.g., "name")
//   props.type  — the validator type (e.g., "user defined")
```

**`express.json()` cannot parse `multipart/form-data`:**

```js
// If the frontend sends form-data (for file uploads),
// express.json() and express.urlencoded() CANNOT read it.
// request.body will be empty — your data just vanishes silently.
//
// You MUST use multer middleware:
router.post("/create", uploads.single("image"), create); // file + form fields
router.post("/view", upload.none(), view); // form fields only, no file
```

**Multer v2 requires absolute paths:**

```js
// WRONG — multer v2 throws: "Base path '' must be an absolute path"
const upload = multer({ dest: "uploads/category" });

// CORRECT — use process.cwd() to build an absolute path from the project root
const uploadDir = path.join(process.cwd(), "uploads/category");
const upload = multer({ dest: uploadDir });

// WHY process.cwd() and not __dirname + "../../../"?
//   __dirname depends on where the file lives — move the file, path breaks.
//   process.cwd() always returns the project root (where you ran npm start).
```

**`require()` runs at startup, not on request:**

```js
// This line in server.js does NOT wait for a request to load the files.
require("./src/routes/backend/default.routes")(app);
// Everything in the require chain (routes → controller → model) loads IMMEDIATELY.
```

### Response Format Cheatsheet

Every controller should send responses in this consistent format:

```js
// Success
{
  _status: true,
  _message: "What happened",
  _data: result
}

// Success with pagination (for list/view endpoints)
{
  _status: true,
  _message: "Record fetched.",
  _paginate: {
    total_records: 25,
    current_page: 1,
    total_pages: 3
  },
  _data: result
}

// Failure
{
  _status: false,
  _message: "What went wrong",
  _data: null,
  _error: { fieldName: "Error message for this field" }
}
```

---

## Quick Start Checklist

When you want to add a new feature or module to your project, follow this order:

```
1. Create the Model         → src/model/ModelName.js
2. Create the Controller    → src/controllers/{group}/modelname.controller.js
3. Create the Routes        → src/routes/{group}/modelname.routes.js
4. Connect to server.js     → require("./src/routes/{group}/modelname.routes")(app)
5. Test with Postman
```

Replace `{group}` with `website`, `backend`, or `application` depending on who the feature is for.

That's it. Every new feature follows the same 5 steps. The more times you do it, the less you'll need to look at this guide.
