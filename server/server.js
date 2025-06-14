
const exp = require("express");
const app = exp();
const cors=require("cors");
app.use(cors());
// filepath: d:\LChess\server\server.js
const cron = require('node-cron');
const generateMonthlyNotifications = require('./cron/generateMonthlyNotifications');


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



const { connectDB, collections } = require("./db");

connectDB()
  .then(() => {
    app.set("userCollection", collections.userCollection);
    app.set("batchCollection", collections.batchCollection);
    app.set("coachCollection", collections.coachCollection);
    app.set("studentCollection", collections.studentCollection);
    app.set("notificationCollection", collections.notificationCollection);
    console.log("Connected to DB successfully");
    // ...rest of your code (API setup, etc.)
    // Schedule the job to run every day at midnight
cron.schedule('0 0 * * *', () => {
  generateMonthlyNotifications();
});

  })
  .catch((err) => {
    console.error("Database connection error:", err);
    process.exit(1); // Optional: stop the server if DB fails
  });

const userapp = require("./APIs/userApi");
const batchapp = require("./APIs/batchApi");
const coachapp = require("./APIs/coachApi");
const studentapp = require("./APIs/studentApi");

const notifyapp = require("./APIs/notifyApi");
app.use("/notify-api", notifyapp);
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

