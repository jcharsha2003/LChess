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



// students Account Api

studentapp.get(
  "/get-student-accounts",
  verifytoken,
  expressAsyncHandler(async (request, response) => {
    const studentCollection = request.app.get("studentCollection");
    const userCollection = request.app.get("userCollection");
    const userId = request.user.id;

    const { year, month } = request.query;

    if (!year || !month) {
      return response.status(400).send({ message: "Year and month are required" });
    }

    const userOfDB = await userCollection.findOne({ _id: new ObjectId(userId) });

    if (!userOfDB) {
      return response.status(401).send({ message: "Invalid User" });
    }

    if (userOfDB.role !== "admin") {
      return response.status(403).send({ message: "Unauthorized user" });
    }

    const students = await studentCollection.find({}).toArray();

    const filteredStudents = students
      .map((student) => {
        const paymentDetails = student.Payment_Details?.[year]?.[month];

        if (!paymentDetails) return null;

        const hasValidPayment =
          paymentDetails.Payment_Amount > 0 &&
          typeof paymentDetails.Currency === "string" &&
          paymentDetails.Currency.trim() !== "";

        const hasValidCoachFees = Array.isArray(paymentDetails.coach_fees) &&
          paymentDetails.coach_fees.some(
            (c) =>
              c &&
              typeof c.coach_name === "string" &&
              c.coach_name.trim() !== "" &&
              c.coach_fee > 0
          );

        const hasProfit =
          typeof paymentDetails.profit === "number" && paymentDetails.profit > 0;
        const hasPercentageProfit =
          typeof paymentDetails.percentage_profit === "number" &&
          paymentDetails.percentage_profit > 0;

        if (hasValidPayment && hasValidCoachFees && hasProfit && hasPercentageProfit) {
          return {
            ...student,
            Payment_Details: {
              [year]: {
                [month]: paymentDetails,
              },
            },
          };
        }

        return null;
      })
      .filter((s) => s !== null);

    response.status(200).send({
      message: "Filtered student accounts",
      payload: filteredStudents,
    });
  })
);



studentapp.put(
  "/soft-delete-student",
  verifytoken,
  expressAsyncHandler(async (request, response) => {
    const studentCollection = request.app.get("studentCollection");
    const { _id } = request.body;
 const { year, month } = request.query; 
     if (!_id || !year || !month) {
      return response.status(400).send({ message: "Student ID, year, and month are required" });
    }

    const studentId = new ObjectId(_id);

    // Get user credentials from request
    const userCollection = request.app.get("userCollection");
    const userId = request.user.id;

    const userOfDB = await userCollection.findOne({ _id: new ObjectId(userId) });

    if (!userOfDB) {
      return response.status(401).send({ message: "Invalid User" });
    }

    if (userOfDB.role !== "admin") {
      return response.status(403).send({ message: "Unauthorized user" });
    }

    // Get student to preserve coach_fees structure
    const student = await studentCollection.findOne({ _id: studentId });
    if (!student) {
      return response.status(404).send({ message: "Student not found" });
    }

   // Remove the selected month
    const paymentDetails = { ...student.Payment_Details };
    if (
      paymentDetails[year] &&
      paymentDetails[year][month]
    ) {
      delete paymentDetails[year][month];
      // If the year has no months left, remove the year
      if (Object.keys(paymentDetails[year]).length === 0) {
        delete paymentDetails[year];
      }
    } else {
      return response.status(400).send({ message: "No such month/year to delete" });
    }

    const result = await studentCollection.updateOne(
      { _id: studentId },
      { $set: { Payment_Details: paymentDetails } }
    );

    if (result.modifiedCount > 0) {
      response.status(200).send({ message: "Selected month account deleted successfully" });
    } else {
      response.status(400).send({ message: "No changes made" });
    }
  })
);

studentapp.put(
  "/soft-delete-students",
  verifytoken,
  expressAsyncHandler(async (request, response) => {
    const studentCollection = request.app.get("studentCollection");
    const userCollection = request.app.get("userCollection");
    const userId = request.user.id;
    const { students } = request.body;
    const { year, month } = request.query;

    if (!Array.isArray(students) || students.length === 0) {
      return response.status(400).send({ message: "No students provided" });
    }
    if (!year || !month) {
      return response.status(400).send({ message: "Year and month are required" });
    }

    const userOfDB = await userCollection.findOne({ _id: new ObjectId(userId) });
    if (!userOfDB) {
      return response.status(401).send({ message: "Invalid User" });
    }
    if (userOfDB.role !== "admin") {
      return response.status(403).send({ message: "Unauthorized user" });
    }

    let updateResults = [];

    for (const student of students) {
      const studentId = new ObjectId(student._id);
      const existingStudent = await studentCollection.findOne({ _id: studentId });
      if (!existingStudent) continue;

      // Remove the selected month
      const paymentDetails = { ...existingStudent.Payment_Details };
      if (
        paymentDetails[year] &&
        paymentDetails[year][month]
      ) {
        delete paymentDetails[year][month];
        if (Object.keys(paymentDetails[year]).length === 0) {
          delete paymentDetails[year];
        }
      } else {
        updateResults.push({ _id: student._id, modified: false, reason: "No such month/year" });
        continue;
      }

      const result = await studentCollection.updateOne(
        { _id: studentId },
        { $set: { Payment_Details: paymentDetails } }
      );
      updateResults.push({ _id: student._id, modified: result.modifiedCount > 0 });
    }

    response.status(200).send({
      message: "Selected month accounts deleted for students",
      result: updateResults,
    });
  })
);

studentapp.put(
  "/soft-update-student",
  verifytoken,
  expressAsyncHandler(async (request, response) => {
    const studentCollection = request.app.get("studentCollection");
    const userCollection = request.app.get("userCollection");
    const userId = request.user.id;
    let modifiedStudent = request.body;

    // Validate user
    const userOfDB = await userCollection.findOne({ _id: new ObjectId(userId) });

    if (!userOfDB) {
      return response.status(200).send({ message: "Invalid User" });
    }

    if (userOfDB.role !== "admin") {
      return response.status(200).send({ message: "Unauthorized user" });
    }

    // Validate student _id
    if (!modifiedStudent._id) {
      return response.status(400).send({ message: "Student ID is required" });
    }

    const studentId = new ObjectId(modifiedStudent._id);
    
    delete modifiedStudent._id;
  
    // Get the updated year and month from the frontend
    const updatedPaymentDetails = modifiedStudent.Payment_Details;
    const updatedYear = Object.keys(updatedPaymentDetails)[0];
    const updatedMonth = Object.keys(updatedPaymentDetails[updatedYear])[0];

    // Fetch the existing student
    const existingStudent = await studentCollection.findOne({ _id: studentId });

    if (!existingStudent) {
      return response.status(404).send({ message: "Student not found" });
    }

    // Merge Payment_Details
    const mergedPaymentDetails = {
      ...existingStudent.Payment_Details,
      [updatedYear]: {
        ...(existingStudent.Payment_Details?.[updatedYear] || {}),
        [updatedMonth]: updatedPaymentDetails[updatedYear][updatedMonth],
      },
    };

    // Prepare the update object
    const updateObj = {
      ...modifiedStudent,
      Payment_Details: mergedPaymentDetails,
    };

    const result = await studentCollection.updateOne(
      { _id: studentId },
      { $set: updateObj }
    );

    if (result.modifiedCount > 0) {
      response.status(200).send({ message: "Student has been modified successfully" });
    } else {
      response.status(400).send({ message: "No changes made or student not found" });
    }
  })
);

studentapp.put(
  "/copy-last-month-accounts",
  verifytoken,
  expressAsyncHandler(async (request, response) => {
    const studentCollection = request.app.get("studentCollection");
    const userCollection = request.app.get("userCollection");
    const userId = request.user.id;
    const { year, month } = request.query;

    if (!year || !month) {
      return response.status(400).send({ message: "Year and month are required" });
    }

    const userOfDB = await userCollection.findOne({ _id: new ObjectId(userId) });
    if (!userOfDB) {
      return response.status(401).send({ message: "Invalid User" });
    }
    if (userOfDB.role !== "admin") {
      return response.status(403).send({ message: "Unauthorized user" });
    }

    // Calculate previous month/year
    let prevMonth = Number(month) - 1;
    let prevYear = Number(year);
    if (prevMonth === 0) {
      prevMonth = 12;
      prevYear = prevYear - 1;
    }

    // Find all students
    const students = await studentCollection.find({}).toArray();
    let updatedCount = 0;
    for (const stu of students) {
      const pd = stu.Payment_Details || {};
      const prevMonthData = pd[String(prevYear)]?.[String(prevMonth)];
      const thisMonthData = pd[year]?.[month];

      // Only copy if previous month exists and this month does NOT exist
      if (prevMonthData && !thisMonthData) {
        // Deep copy to avoid reference issues
        const newMonthData = JSON.parse(JSON.stringify(prevMonthData));
        // Reset payment_status and Payment_Date
        newMonthData.payment_status = "Not Paid";
        newMonthData.Payment_Date = "";

        // Set Due_Date to same day as previous, but with new year and month
        if (prevMonthData.Due_Date) {
          const prevDue = new Date(prevMonthData.Due_Date);
          const day = prevDue.getDate().toString().padStart(2, "0");
          // Format: yyyy-mm-dd
          newMonthData.Due_Date = `${year}-${month.toString().padStart(2, "0")}-${day}`;
        } else {
          // fallback if no previous due date
          newMonthData.Due_Date = `${year}-${month.toString().padStart(2, "0")}-01`;
        }

        // Set in Payment_Details
        if (!pd[year]) pd[year] = {};
        pd[year][month] = newMonthData;

        await studentCollection.updateOne(
          { _id: stu._id },
          { $set: { Payment_Details: pd } }
        );
        updatedCount++;
      }
    }

    response.status(200).send({
      message: `Copied last month's accounts for ${updatedCount} students.`,
    });
  })
);

studentapp.put(
  "/soft-add-student",
  verifytoken,
  expressAsyncHandler(async (request, response) => {
    const studentCollection = request.app.get("studentCollection");
    let { _id, selectedYear, selectedMonthNum, paymentData } = request.body;
    const userCollection = request.app.get("userCollection");
    const userId = request.user.id;

    // Verify user
    let userOfDB = await userCollection.findOne({ _id: new ObjectId(userId) });
    if (!userOfDB) {
      return response.status(401).send({ message: "Invalid User" });
    }

    // Only allow admin
    if (userOfDB.role !== "admin") {
      return response.status(403).send({ message: "Unauthorized user" });
    }

    if (!_id || !selectedYear || !selectedMonthNum || !paymentData) {
      return response.status(400).send({ message: "Student ID, year, month, and payment data are required" });
    }

    const studentId = new ObjectId(_id);

    // Set only the nested Payment_Details for the selected year/month
    const updatePath = `Payment_Details.${selectedYear}.${selectedMonthNum}`;
    const result = await studentCollection.updateOne(
      { _id: studentId },
      { $set: { [updatePath]: paymentData } }
    );

    if (result.modifiedCount > 0) {
      response.status(200).send({ message: "Student Account has been added successfully" });
    } else {
      response.status(400).send({ message: "No changes made or student not found" });
    }
  })
);

module.exports = studentapp;
