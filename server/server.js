
const exp = require("express");
const app = exp();
const cors=require("cors");
app.use(cors());

const nodemailer = require("nodemailer");

app.use(cors({ origin: true }));
app.use(exp.json());
app.listen(5000, () => {
  console.log("server is listening in port 5000");
});
// connecting backend and frontend by server
const path = require("path");
app.use(exp.static(path.join(__dirname,"../client/build")));

require("dotenv/config");

app.get("/",(req,res)=>{
  res.json("HELLO");
})
const mclient = require("mongodb").MongoClient;


// connect to mongodb server
mclient
  .connect(`mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_CLUSTER}/?retryWrites=true&w=majority&&appName=Cluster0`, { useNewUrlParser: true
  })
  .then((dbRef) => {

    // access user database
    let lchessdbObj = dbRef.db("lchessdb");
    let userCollection = lchessdbObj.collection("usercollection");
    let batchCollection =lchessdbObj.collection("batchcollection");
    let coachCollection =lchessdbObj.collection("coachcollection");
    let studentCollection =lchessdbObj.collection("studentcollection");


    console.log("connected to DB successfully");

    // share collections objects to APIs
    app.set("userCollection", userCollection);
    app.set("batchCollection", batchCollection);
    app.set("coachCollection", coachCollection);
    app.set("studentCollection", studentCollection);
    
    
  })
  .catch((err) => console.log("database connection err is", err));

const userapp = require("./APIs/userApi");
const batchapp = require("./APIs/batchApi");
const coachapp = require("./APIs/coachApi");
const studentapp = require("./APIs/studentApi");


app.use("/user-api", userapp);
app.use("/batch-api", batchapp);
app.use("/student-api", studentapp);
app.use("/coach-api", coachapp);






// create a middleware to handle invalid path
const invalidPathHandlingMiddleware = (request, response, next) => {
  response.send({ message: "Invalid path" });
};
app.use(invalidPathHandlingMiddleware);

// create err handling middleware
const errHandler = (error, request, response, next) => {
  response.send({ "error-message": error.message });
};
app.use(errHandler);

