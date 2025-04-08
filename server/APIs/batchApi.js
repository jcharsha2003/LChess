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



batchapp.get(
  "/get-Tbatches",
  verifytoken,
  expressAsyncHandler(async (request, response) => {
    // get usercollection
    const batchCollection = request.app.get("batchCollection");

    let batches = await batchCollection.find({ session: "theory" }).toArray();
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
batchapp.get(
  "/get-Pbatches",
  verifytoken,
  expressAsyncHandler(async (request, response) => {
    // get usercollection
    const batchCollection = request.app.get("batchCollection");

    let batches = await batchCollection.find({ session: "practice" }).toArray();
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
          response.status(200).send({ message: "batch has been modified successfully" });
        } else {
          response.status(400).send({ message: "No changes made or batch not found" });
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
        if (!request.params._id ) {
          return response.status(400).send({ message: "batch ID is required" });
        }

        const studentId = new ObjectId(request.params._id );
        
        const result = await batchCollection.deleteOne({ _id: studentId });

        if (result.deletedCount > 0) {
          response.status(200).send({ message: "batch has been deleted successfully" });
        } else {
          response.status(400).send({ message: "batch not found or already deleted" });
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
  "/add-Tbatch",
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
      

        
        const existingStudent = await batchCollection.findOne({ 
          session: "theory", 
          batch_id: newuser.batch_id 
        });

if (existingStudent) {
  const existingDays = existingStudent.session_days || [];
  const newDays = newuser.session_days || [];

  // Check for any overlapping days
  const hasOverlap = newDays.some(day => existingDays.includes(day));

  if (hasOverlap) {
    return response.status(400).json({ message: "Overlapping session days detected." });
  }
  

  const insertResult = await batchCollection.insertOne(newuser);

  if (insertResult.insertedId) {
    response.status(200).send({ message: "Batch has been added successfully" });
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
// json to java script obj
batchapp.use(exp.json());
batchapp.post(
  "/add-Pbatch",
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
      

        
        const existingStudent = await batchCollection.findOne({ 
          session: "practice", 
          batch_id: newuser.batch_id 
        });

if (existingStudent) {
  const existingDays = existingStudent.session_days || [];
  const newDays = newuser.session_days || [];

  // Check for any overlapping days
  const hasOverlap = newDays.some(day => existingDays.includes(day));

  if (hasOverlap) {
    return response.status(400).json({ message: "Overlapping session days detected." });
  }
  

  const insertResult = await batchCollection.insertOne(newuser);

  if (insertResult.insertedId) {
    response.status(200).send({ message: "Batch has been added successfully" });
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

// Test api 

// batchapp.delete(
//   "/delete-batches",
  
//   expressAsyncHandler(async (request, response) => {
//     // get userCollection
    
//     const batchCollection = request.app.get("batchCollection");

 
   
   

    
        
//         const result = await batchCollection.deleteMany({});

//         if (result.deletedCount > 0) {
//           response.status(200).send({ message: "batch has been deleted successfully" });
//         } else {
//           response.status(400).send({ message: "batch not found or already deleted" });
//         }
      
      
    
//   })
// );

module.exports = batchapp;
