const verifytoken = require("./middlewares/verifyToken");
const exp = require("express");

const batchapp = exp.Router();
const expressAsyncHandler = require("express-async-handler");

const { ObjectId } = require("mongodb");

batchapp.get(
  "/get-batches",
  verifytoken,
  expressAsyncHandler(async (request, response) => {
    // get usercollection
    const batchCollection = request.app.get("batchCollection");

    let batches = await batchCollection.find({}).toArray();
    //get user credentials from req
    const userCollection = request.app.get("userCollection");
    const userId = request.user.id;
    //verify username
    let userOfDB = await userCollection.findOne({
      _id: new ObjectId(userId),
    }); //if username is invalid
    if (userOfDB === null) {
      response.status(200).send({ message: "Invalid User" });
    }
    //if username is valid
    else {
      if (userOfDB?.role === "admin") {
        
        response.status(200).send({ message: "users list", payload: batches });
      } else {
        response.status(200).send({ message: "UnAuthorized user" });
      }
    }
  })
);

batchapp.put(
  "/update-batch",
  verifytoken,
  expressAsyncHandler(async (request, response) => {
    const batchCollection = request.app.get("batchCollection");

    let modifiedStudent = request.body;
    //get user credentials from req

    const userCollection = request.app.get("userCollection");
    const userId = request.user.id;

    //verify username
    let userOfDB = await userCollection.findOne({
      _id: new ObjectId(userId),
    }); //if username is invalid
    if (userOfDB === null) {
      response.status(200).send({ message: "Invalid User" });
    }
    //if username is valid
    else {
      if (userOfDB?.role === "admin") {
        if (!modifiedStudent._id) {
          return response.status(400).send({ message: "batch ID is required" });
        }

        const studentId = new ObjectId(modifiedStudent._id);
        delete modifiedStudent._id;
        const result = await batchCollection.updateOne(
          { _id: studentId },
          { $set: modifiedStudent }
        );

        if (result.modifiedCount > 0) {
          response
            .status(200)
            .send({ message: "batch has been modified successfully" });
        } else {
          response
            .status(400)
            .send({ message: "No changes made or batch not found" });
        }
      } else {
        response.status(200).send({ message: "UnAuthorized user" });
      }
    }
  })
);
batchapp.delete(
  "/delete-batch/:_id",
  verifytoken,
  expressAsyncHandler(async (request, response) => {
    // get userCollection

    const batchCollection = request.app.get("batchCollection");

    //get user credentials from req
    const userCollection = request.app.get("userCollection");
    const userId = request.user.id;

    //verify username
    let userOfDB = await userCollection.findOne({
      _id: new ObjectId(userId),
    }); //if username is invalid
    if (userOfDB === null) {
      response.status(200).send({ message: "Invalid User" });
    }
    //if username is valid
    else {
      if (userOfDB?.role === "admin") {
        if (!request.params._id) {
          return response.status(400).send({ message: "batch ID is required" });
        }

        const studentId = new ObjectId(request.params._id);

        const result = await batchCollection.deleteOne({ _id: studentId });

        if (result.deletedCount > 0) {
          response
            .status(200)
            .send({ message: "batch has been deleted successfully" });
        } else {
          response
            .status(400)
            .send({ message: "batch not found or already deleted" });
        }
      } else {
        response.status(200).send({ message: "UnAuthorized user" });
      }
    }
  })
);

// json to java script obj
batchapp.use(exp.json());
batchapp.post(
  "/add-batch",
  verifytoken,
  expressAsyncHandler(async (request, response) => {
    //    get user from req
    const newuser = request.body;

    const batchCollection = request.app.get("batchCollection");

    //get user credentials from req
    const userCollection = request.app.get("userCollection");
    const userId = request.user.id;

    //verify username
    let userOfDB = await userCollection.findOne({
      _id: new ObjectId(userId),
    }); //if username is invalid

    if (userOfDB === null) {
      response.status(200).send({ message: "Invalid User" });
    }
    //if username is valid
    else {
      if (userOfDB?.role === "admin") {
        const existingBatch = await batchCollection.findOne({
          batch_id: newuser.batch_id,
        });

        if (!existingBatch) {
          // Batch does not exist, so insert it
          const insertResult = await batchCollection.insertOne(newuser);

          if (insertResult.insertedId) {
            response
              .status(200)
              .send({ message: "Batch has been added successfully" });
          } else {
            response.status(400).send({ message: "Failed to add batch" });
          }
        } else {
          // Batch already exists
          response
            .status(409)
            .send({ message: "Batch with this ID already exists" });
        }
      } else {
        response.status(200).send({ message: "UnAuthorized user" });
      }
    }
  })
);

// delete selected students
batchapp.post(
  "/delete-batches",
  verifytoken,
  expressAsyncHandler(async (request, response) => {
    const batchCollection = request.app.get("batchCollection");
    const userCollection = request.app.get("userCollection");
    const userId = request.user.id;

    // Verify user
    const userOfDB = await userCollection.findOne({
      _id: new ObjectId(userId),
    });

    if (!userOfDB) {
      return response.status(200).send({ message: "Invalid User" });
    }

    if (userOfDB.role !== "admin") {
      return response.status(200).send({ message: "UnAuthorized user" });
    }

    const { students } = request.body;

    if (!students || !Array.isArray(students) || students.length === 0) {
      return response
        .status(400)
        .send({ message: "No Batches selected for deletion" });
    }

    const idsToDelete = students.map((s) => new ObjectId(s._id));

    const result = await batchCollection.deleteMany({
      _id: { $in: idsToDelete },
    });

    if (result.deletedCount > 0) {
      response
        .status(200)
        .send({
          message: `${result.deletedCount} batche(s) deleted successfully`,
        });
    } else {
      response
        .status(400)
        .send({ message: "No matching batches found to delete" });
    }
  })
);

// Test api

batchapp.delete(
  "/delete-batches",

  expressAsyncHandler(async (request, response) => {
    // get userCollection

    const batchCollection = request.app.get("batchCollection");

    const result = await batchCollection.deleteMany({});

    if (result.deletedCount > 0) {
      response
        .status(200)
        .send({ message: "batch has been deleted successfully" });
    } else {
      response
        .status(400)
        .send({ message: "batch not found or already deleted" });
    }
  })
);

module.exports = batchapp;
