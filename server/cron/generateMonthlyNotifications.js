require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const { collections } = require("../db");

module.exports = async function generateMonthlyNotifications() {
  try {
    const studentCollection = collections.studentCollection;
    const notificationCollection = collections.notificationCollection;

    // Use current year and month
    const now = new Date();
    const year = String(now.getFullYear());
    const month = String(now.getMonth() + 1); // JS months are 0-based

    const students = await studentCollection.find({}).toArray();
    for (const stu of students) {
      const paymentDetails = stu.Payment_Details || {};
      const yearData = paymentDetails[year] || {};
      if (yearData[month]) continue; // Already has account

      // Find previous month (handle January/new year)
      let prevMonth = Number(month) - 1;
      let prevYear = Number(year);
      if (prevMonth === 0) {
        prevMonth = 12;
        prevYear = prevYear - 1;
      }
      const prevMonthData = paymentDetails[String(prevYear)]?.[String(prevMonth)];
      if (!prevMonthData) continue;

      // Check if notification already exists
      const exists = await notificationCollection.findOne({
        studentId: stu._id.toString(),
        year,
        month
      });
      if (exists) continue;

      // Create notification
      await notificationCollection.insertOne({
        studentId: stu._id.toString(),
        studentName: stu.Full_Name,
        year,
        month,
        prevMonthData,
        message: `New month detected for ${stu.Full_Name} (${year}-${month}). Do you want to copy previous month's account details?`,
        read: false,
        createdAt: new Date()
      });
    }
    console.log("Monthly notifications generated (if needed).");
  } catch (err) {
    console.error("Error generating monthly notifications:", err);
  }
};

// If you want to run directly with node, add:
if (require.main === module) {
  require("../db").connectDB().then(() => module.exports());
}