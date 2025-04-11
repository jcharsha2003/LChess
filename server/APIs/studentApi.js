const exp = require("express");
const studentapp = exp.Router();
const expressAsyncHandler = require("express-async-handler");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const verifytoken = require("./middlewares/verifyToken");
const { ObjectId } = require("mongodb");

studentapp.get(
  "/get-students",
  verifytoken,
  expressAsyncHandler(async (request, response) => {
    // get usercollection
    const studentCollection = request.app.get("studentCollection");

    let students = await studentCollection.find({}).toArray();
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
      
        response.status(200).send({ message: "users list", payload: students });
      } else {
        response.status(200).send({ message: "UnAuthorized user" });
      }
    }
  })
);

studentapp.put(
  "/update-student",
  verifytoken,
  expressAsyncHandler(async (request, response) => {
    const studentCollection = request.app.get("studentCollection");

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
          return response.status(400).send({ message: "Student ID is required" });
        }

        const studentId = new ObjectId(modifiedStudent._id);
        delete modifiedStudent._id;
        
        const result = await studentCollection.updateOne(
          { _id: studentId },
          { $set: modifiedStudent }
        );

        if (result.modifiedCount > 0) {
          response.status(200).send({ message: "Student has been modified successfully" });
        } else {
          response.status(400).send({ message: "No changes made or student not found" });
        }
      } else {
        response.status(200).send({ message: "UnAuthorized user" });
      }
    }
  })
);
studentapp.delete(
  "/delete-student/:_id",
  verifytoken,
  expressAsyncHandler(async (request, response) => {
    // get userCollection
    
    const studentCollection = request.app.get("studentCollection");

 
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
        if (!request.params._id ) {
          return response.status(400).send({ message: "Student ID is required" });
        }

        const studentId = new ObjectId(request.params._id );
        
        const result = await studentCollection.deleteOne({ _id: studentId });

        if (result.deletedCount > 0) {
          response.status(200).send({ message: "Student has been deleted successfully" });
        } else {
          response.status(400).send({ message: "Student not found or already deleted" });
        }
      } else {
        response.status(200).send({ message: "UnAuthorized user" });
      }
    }
  })
);


// delete selected students
studentapp.post(
  "/delete-students",
  verifytoken,
  expressAsyncHandler(async (request, response) => {
    const studentCollection = request.app.get("studentCollection");
    const userCollection = request.app.get("userCollection");
    const userId = request.user.id;

    // Verify user
    const userOfDB = await userCollection.findOne({ _id: new ObjectId(userId) });

    if (!userOfDB) {
      return response.status(200).send({ message: "Invalid User" });
    }

    if (userOfDB.role !== "admin") {
      return response.status(200).send({ message: "UnAuthorized user" });
    }

    const { students } = request.body;

    if (!students || !Array.isArray(students) || students.length === 0) {
      return response.status(400).send({ message: "No students selected for deletion" });
    }

    const idsToDelete = students.map((s) => new ObjectId(s._id));
    
    const result = await studentCollection.deleteMany({ _id: { $in: idsToDelete } });

    if (result.deletedCount > 0) {
      response.status(200).send({ message: `${result.deletedCount} student(s) deleted successfully` });
    } else {
      response.status(400).send({ message: "No matching students found to delete" });
    }
  })
);


// json to java script obj
studentapp.use(exp.json());
studentapp.post(
  "/add-student",
  verifytoken,
  expressAsyncHandler(async (request, response) => {
    

    //    get user from req
    const newuser = request.body;
   
    const studentCollection = request.app.get("studentCollection");

 
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
      

        
        const existingStudent = await studentCollection.findOne({ Client_ID: newuser.Client_ID });

if (existingStudent) {
  response.status(400).send({ message: "Student with this Client ID already exists" });
} else {
  const insertResult = await studentCollection.insertOne(newuser);

  if (insertResult.insertedId) {
    response.status(200).send({ message: "Student has been added successfully" });
  } else {
    response.status(400).send({ message: "Failed to add student" });
  }
}

      } else {
        response.status(200).send({ message: "UnAuthorized user" });
      }
    }
  })
);

module.exports = studentapp;
