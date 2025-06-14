require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const { collections } = require("../db");

// Find the earliest unpaid month (for overdue calculation)
function getEarliestUnpaidMonth(paymentDetails, year, month) {
  let y = Number(year);
  let m = Number(month);
  let earliest = null;
  while (y >= 2000) {
    const curr = paymentDetails?.[String(y)]?.[String(m)];
    if (curr && (curr.payment_status || "").trim().toLowerCase() !== "paid") {
      earliest = { year: String(y), month: String(m), data: curr };
      m--;
      if (m === 0) {
        m = 12;
        y -= 1;
      }
    } else {
      break;
    }
    if (y < 2000) break;
  }
  return earliest;
}

// Find the most recent previous month with payment_status === "paid"
function getLastPaidMonth(paymentDetails, year, month) {
  let y = Number(year);
  let m = Number(month) - 1;
  while (y >= 2000) {
    if (m === 0) {
      m = 12;
      y -= 1;
    }
    const prev = paymentDetails?.[String(y)]?.[String(m)];
    if (prev && (prev.payment_status || "").trim().toLowerCase() === "paid") {
      return { year: String(y), month: String(m), data: prev };
    }
    m--;
    if (m === 0) {
      m = 12;
      y -= 1;
    }
    if (y < 2000) break;
  }
  return null;
}

module.exports = async function generateMonthlyNotifications() {
  try {
    const studentCollection = collections.studentCollection;
    const notificationCollection = collections.notificationCollection;

    const now = new Date();
    const year = String(now.getFullYear());
    const month = String(now.getMonth() + 1); // JS months are 0-based

    const students = await studentCollection.find({}).toArray();
    for (const stu of students) {
      if ((stu.status || "").toLowerCase() !== "active") continue;

      const paymentDetails = stu.Payment_Details || {};
      const yearData = paymentDetails[year] || {};
      const currMonthData = yearData[month];

      // --- DUE SOON / MISSING ACCOUNT OVERDUE NOTIFICATION ---
      if (!currMonthData) {
        // Only if account does NOT exist for this month

        // Find last paid month
        const lastPaid = getLastPaidMonth(paymentDetails, year, month);

        // If last paid month exists, send due soon notification 10 days before expected due date
        if (lastPaid) {
          const lastPaidDueDateStr = lastPaid.data.Due_Date;
          if (!lastPaidDueDateStr) continue;

          // Calculate expected due date for this month
          const prevDueDate = new Date(lastPaidDueDateStr);
          if (isNaN(prevDueDate.getTime())) continue;
          const thisMonthDueDate = new Date(prevDueDate);
          thisMonthDueDate.setFullYear(Number(year));
          thisMonthDueDate.setMonth(Number(month) - 1); // JS months are 0-based

          // Notify 10 days before due date
          const notifyDate = new Date(thisMonthDueDate);
          notifyDate.setDate(thisMonthDueDate.getDate() - 10);

          if (
            now.getFullYear() === notifyDate.getFullYear() &&
            now.getMonth() === notifyDate.getMonth() &&
            now.getDate() === notifyDate.getDate()
          ) {
            const studentIdStr = stu._id.toString();
            const exists = await notificationCollection.findOne({
              studentId: studentIdStr,
              year,
              month,
              type: "due_soon"
            });
            if (!exists) {
              await notificationCollection.insertOne({
                studentId: studentIdStr,
                studentName: stu.Full_Name,
                year,
                month,
                lastPaidMonth: lastPaid.month,
                lastPaidYear: lastPaid.year,
                lastPaidDueDate: lastPaidDueDateStr,
                message: `Due date for ${stu.Full_Name} (${year}-${month}) is approaching (${thisMonthDueDate.toISOString().slice(0,10)}). Last paid month: ${lastPaid.year}-${lastPaid.month}. Do you want to copy previous month's account details?`,
                type: "due_soon",
                read: false,
                createdAt: new Date()
              });
            }
          }
        }

        // --- MISSING ACCOUNT OVERDUE: Walk back through all previous months for unpaid/overdue ---
        let y = Number(year);
        let m = Number(month) - 1;
        while (y >= 2000) {
          if (m === 0) {
            m = 12;
            y -= 1;
          }
          const prevData = paymentDetails?.[String(y)]?.[String(m)];
          if (prevData && (prevData.payment_status || "").trim().toLowerCase() !== "paid") {
            const prevDueDateStr = prevData.Due_Date;
            const prevDueDate = new Date(prevDueDateStr);
            if (!isNaN(prevDueDate.getTime()) && now > prevDueDate) {
              const daysOverdue = Math.floor((now - prevDueDate) / (1000 * 60 * 60 * 24));
              const studentIdStr = stu._id.toString();
              const exists = await notificationCollection.findOne({
                studentId: studentIdStr,
                year,
                month,
                type: "missing_account_overdue"
              });
              if (!exists) {
                await notificationCollection.insertOne({
                  studentId: studentIdStr,
                  studentName: stu.Full_Name,
                  year,
                  month,
                  prevDueDate: prevDueDateStr,
                  prevMonthData: prevData,
                  message: `No account exists for ${year}-${month} for ${stu.Full_Name}. Previous unpaid month (${y}-${m}) is still unpaid and overdue by ${daysOverdue} day(s). Please create the account for this month to maintain due tracking.`,
                  type: "missing_account_overdue",
                  read: false,
                  createdAt: new Date()
                });
              }
              break; // Only notify for the earliest found
            }
          }
          m--;
          if (m === 0) {
            m = 12;
            y -= 1;
          }
          if (y < 2000) break;
        }
      }

      // --- OVERDUE NOTIFICATION ---
      if (currMonthData) {
        // Only if account exists for this month
        const paymentStatus = (currMonthData.payment_status || "").trim().toLowerCase();
        const dueDateStr = currMonthData.Due_Date;
        if (!dueDateStr || paymentStatus === "paid") continue;

        // Find the earliest unpaid month (for correct overdue calculation)
        const earliestUnpaid = getEarliestUnpaidMonth(paymentDetails, year, month);
        let overdueFromDate = dueDateStr;
        if (earliestUnpaid && earliestUnpaid.data.Due_Date) {
          overdueFromDate = earliestUnpaid.data.Due_Date;
        }
        const overdueDate = new Date(overdueFromDate);
        if (isNaN(overdueDate.getTime())) continue;

        if (now > overdueDate) {
          const daysOverdue = Math.floor((now - overdueDate) / (1000 * 60 * 60 * 24));
          const studentIdStr = stu._id.toString();
          const exists = await notificationCollection.findOne({
            studentId: studentIdStr,
            year,
            month,
            type: "overdue",
            createdAt: {
              $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()), // today
              $lt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1) // tomorrow
            }
          });
          if (!exists) {
            await notificationCollection.insertOne({
              studentId: studentIdStr,
              studentName: stu.Full_Name,
              year,
              month,
              dueDate: dueDateStr,
              message: `Payment for ${stu.Full_Name} (Client ID: ${stu.Client_ID}) is overdue for ${year}-${month}. Earliest unpaid due date was ${overdueFromDate}. Overdue by ${daysOverdue} day(s).`,
              type: "overdue",
              read: false,
              createdAt: new Date()
            });
          }
        }
      }
    }
    console.log("Monthly due/overdue notifications generated (if needed).");
  } catch (err) {
    console.error("Error generating monthly notifications:", err);
  }
};

// If you want to run directly with node, add:
if (require.main === module) {
  require("../db").connectDB().then(() => module.exports());
}