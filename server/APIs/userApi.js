const exp = require("express");
const userapp = exp.Router();
const expressAsyncHandler = require("express-async-handler");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const verifytoken = require("./middlewares/verifyToken");
const { ObjectId } = require("mongodb"); 
//creating a user api

userapp.get(
  "/get-students",
  verifytoken,
  expressAsyncHandler(async (request, response) => {
    // get usercollection
    const userCollection = request.app.get("userCollection");
    let users = await userCollection.find({ role: "employee" }).toArray();
    response.status(200).send({ message: "users list", payload: users });
  })
);

userapp.get(
  "/get-user/:email",
  verifytoken,
  expressAsyncHandler(async (request, response) => {
    // get usercollection
    const userCollection = request.app.get("userCollection");
    let userObj = await userCollection.findOne({ email: request.params.email });
    response.status(200).send({ message: "user list", payload: userObj });
  })
);

userapp.get(
  "/get-emp/:email",
  verifytoken,
  expressAsyncHandler(async (request, response) => {
    // get usercollection
    const userCollection = request.app.get("userCollection");
    let userObj = await userCollection.findOne({ email: request.params.email });
    response.status(200).send({ message: "user list", payload: userObj });
  })
);

// json to java script obj
userapp.use(exp.json());
userapp.post(
  "/create-user",
  verifytoken,
  expressAsyncHandler(async (request, response) => {
    // get userCollection
    const userCollection = request.app.get("userCollection");
    //    get user from req
    const newuser = request.body;
    // save or insert or create a newuser in userCollection
    await userCollection.insertOne(newuser);
    response.status(201).send({ message: "user has been created" });
  })
);

userapp.put(
  "/change-password",
  
  expressAsyncHandler(async (request, response) => {
   
    // get userCollection
    const userCollection = request.app.get("userCollection");
    
    let newUser = request.body;
   
    let hashedPassword = await bcryptjs.hash(newUser.password, 6);
   
    newUser.password = hashedPassword;

    await userCollection.updateOne(
      { email: newUser.email },
      { $set: { password: hashedPassword } }
    );
   
    response.status(200).send({ message: "task has been added successfully" });
  })
);
userapp.delete(
  "/delete-user/:email",
  verifytoken,
  expressAsyncHandler(async (request, response) => {
    // get userCollection
    const userCollection = request.app.get("userCollection");
    await userCollection.deleteOne({ email: request.params.email });

    response
      .status(200)
      .send({ message: "user has been deleted successfully" });
  })
);

userapp.use(exp.json());
userapp.post(
  "/register-user",
  expressAsyncHandler(async (request, response) => {
    const userCollection = request.app.get("userCollection");

    const newUser = request.body;

   
    const userOfEmail = await userCollection.findOne({ email: newUser.email });
     if (userOfEmail !== null) {
      response.status(200).send({ message: "user email already exists" });
    } else {
      let hashedPassword = await bcryptjs.hash(newUser.password, 6);
      newUser.password = hashedPassword;
      await userCollection.insertOne(newUser);
      response.status(201).send({ message: "user created" });
    }
  })
);


userapp.use(exp.json());
userapp.post(
  "/user-login",
  expressAsyncHandler(async (request, response) => {
    //get userCollectionObj
    const userCollection = request.app.get("userCollection");

    //get user credentials from req
    const userCredObj = request.body;

    //verify username
    let userOfDB = await userCollection.findOne({
      email: userCredObj.email,
    });

    //if username is invalid
    if (userOfDB === null) {
      response.status(200).send({ message: "Invalid email" });
    }
    //if username is valid
    else {
      //verify password
      let isEqual = await bcryptjs.compare(
        userCredObj.password,
        userOfDB.password
      );
      //if passwords not matched
      if (isEqual === false) {
        response.status(200).send({ message: "Invalid password" });
      }
      //if passwords matched
      else {
        //create a JWT token
        let jwtToken = jwt.sign({ id: userOfDB._id }, "abcdef", {
          expiresIn: "1d",
        });
        //send token in response
        
        response
          .status(200)
          .send({ message: "success", token: jwtToken, user: userOfDB });
      }
    }
  })
);

// employee edit profile api

userapp.put(
  "/update-user",
  verifytoken,
  expressAsyncHandler(async (request, response) => {
    const userCollection = request.app.get("userCollection");
    let modifieduser = request.body;
    let hashedPassword = await bcryptjs.hash(modifieduser.password, 6);
    modifieduser.password = hashedPassword;
    await userCollection.updateOne(
      { email: modifieduser.email },
      { $set: { ...modifieduser } }
    );
    response
      .status(200)
      .send({ message: "user has been modified successfully" });
  })
);


// reload verification user details 


userapp.use(exp.json());
userapp.post(
  "/verify-user",verifytoken,
  expressAsyncHandler(async (request, response) => {
    //get userCollectionObj
    const userCollection = request.app.get("userCollection");

    //get user credentials from req
    const userId = request.user.id;
    
    //verify username
    let userOfDB = await userCollection.findOne({
      _id: new ObjectId(userId)
    });

    //if username is invalid
    if (userOfDB === null) {
      response.status(200).send({ message: "Invalid User" });
    }
    //if username is valid
    else {
      
      //if passwords matched
      
        //create a JWT token
        let jwtToken = jwt.sign({ id: userOfDB._id }, "abcdef", {
          expiresIn: "1d",
        });
        //send token in response
        
        response
          .status(200)
          .send({ message: "success", token: jwtToken, user: userOfDB });
      
    }
  })
);
module.exports = userapp;
