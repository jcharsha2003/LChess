const exp = require("express");
const coachapp = exp.Router();
const expressAsyncHandler = require("express-async-handler");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const verifytoken = require("./middlewares/verifyToken");
const { ObjectId } = require("mongodb");

coachapp.get(
  "/get-coaches",
  verifytoken,
  expressAsyncHandler(async (request, response) => {
    // get usercollection
    const coachCollection = request.app.get("coachCollection");

    let coaches = await coachCollection.find({}).toArray();
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
        response.status(200).send({ message: "users list", payload: coaches });
      } else {
        response.status(200).send({ message: "UnAuthorized user" });
      }
    }
  })
);

coachapp.put(
  "/update-coach",
  verifytoken,
  expressAsyncHandler(async (request, response) => {
    const coachCollection = request.app.get("coachCollection");

    let modifiedCoach = request.body;
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
        if (!modifiedCoach._id) {
          return response.status(400).send({ message: "coach ID is required" });
        }

        const coachId = new ObjectId(modifiedCoach._id);
        delete modifiedCoach._id;
        const result = await coachCollection.updateOne(
          { _id: coachId },
          { $set: modifiedCoach }
        );

        if (result.modifiedCount > 0) {
          response
            .status(200)
            .send({ message: "coach has been modified successfully" });
        } else {
          response
            .status(400)
            .send({ message: "No changes made or coach not found" });
        }
      } else {
        response.status(200).send({ message: "UnAuthorized user" });
      }
    }
  })
);
coachapp.delete(
  "/delete-coach/:_id",
  verifytoken,
  expressAsyncHandler(async (request, response) => {
    // get userCollection

    const coachCollection = request.app.get("coachCollection");

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
          return response.status(400).send({ message: "coach ID is required" });
        }

        const coachId = new ObjectId(request.params._id);

        const result = await coachCollection.deleteOne({ _id: coachId });

        if (result.deletedCount > 0) {
          response
            .status(200)
            .send({ message: "coach has been deleted successfully" });
        } else {
          response
            .status(400)
            .send({ message: "coach not found or already deleted" });
        }
      } else {
        response.status(200).send({ message: "UnAuthorized user" });
      }
    }
  })
);

// json to java script obj
coachapp.use(exp.json());
coachapp.post(
  "/add-coach",
  verifytoken,
  expressAsyncHandler(async (request, response) => {
    //    get user from req
    const newuser = request.body;

    const coachCollection = request.app.get("coachCollection");

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
        const existingcoach = await coachCollection.findOne({
          _id: new ObjectId(newuser._id),
        });

        if (existingcoach) {
          response
            .status(400)
            .send({ message: "coach with this ID already exists" });
        } else {
          const insertResult = await coachCollection.insertOne(newuser);

          if (insertResult.insertedId) {
            response
              .status(200)
              .send({ message: "coach has been added successfully" });
          } else {
            response.status(400).send({ message: "Failed to add coach" });
          }
        }
      } else {
        response.status(200).send({ message: "UnAuthorized user" });
      }
    }
  })
);

// test

// coachapp.delete(
//   "/delete-coaches",

//   expressAsyncHandler(async (request, response) => {
//     // get userCollection

//     const coachCollection = request.app.get("coachCollection");

//     const result = await coachCollection.deleteMany({});

//     if (result.deletedCount > 0) {
//       response
//         .status(200)
//         .send({ message: "Coaches has been deleted successfully" });
//     } else {
//       response
//         .status(400)
//         .send({ message: "Coaches not found or already deleted" });
//     }
//   })
// );

module.exports = coachapp;
