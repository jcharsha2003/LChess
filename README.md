# ♟️ LChess Admin Dashboard

A full-stack **Admin Dashboard** for managing a global **Chess Learning Platform**, built to streamline operations such as student management, coach assignments, batch schedules, and international fee tracking with real-time currency conversion.  
**Live App**: [LChess.com](https://l-chess.vercel.app/)  
**GitHub Repo**: [GitHub Link](https://github.com/jcharsha2003/LChess)
## It will take time to log in ,because we use a free server 
## 🔐 Login Credentials (For Demo)

You can use the following credentials to log in and explore the system:

### 👑 Admin Login
- **Username**: `shourya.iitb@gmail.com`
- **Password**: `shourya`

> ⚠️ This account is for testing purposes only. Always update credentials and enforce strong password policies in production.


> 💼 Built for both **Admins** and **Super Admins**, this dashboard makes it easy to run your chess academy — whether it’s a small coaching center or a global learning platform.

---

## 🌐 Tech Stack

| Layer        | Technologies                            |
|--------------|------------------------------------------|
| 🖥 Frontend   | React.js, Tailwind CSS, PrimeReact       |
| 🔧 Backend    | Node.js, Express.js                      |
| 🧠 Database   | MongoDB (with Mongoose ODM)              |
| 🔐 Auth       | JWT (JSON Web Tokens)                    |
| 🌍 Currency   | Exchange Rate API for real-time rates    |
| ☁️ Hosting   | (Coming Soon: Render/Netlify/Vercel)     |

---

## 📂 Environment Setup

### ✅ Create `.env` Files

#### In `/client/.env`
```env
REACT_APP_API_URL=Your_Server_Domain_Name
```

#### In `/server/.env`
```env
MONGO_URL=Your_MongoDB_Connection_URI
```

> ⚠️ Make sure to **never commit your `.env` files** to public repositories.

---

## 🚀 How to Run the Application

### 📦 Client Side (React)
```bash
cd client
npm install
npm start
```

> 🔗 This runs the frontend on `http://localhost:3000`

---

### 🔧 Server Side (Node.js + Express)
```bash
cd server
npm install
nodemon server.js
```

> 🚀 Backend server runs on `http://localhost:5000` or as defined in your API URL

---

## 🎯 Key Features

- ✅ **Admin Dashboard**: Overview of total students, active batches, coach assignments, and payments
- 🧑‍🏫 **Coach Management**: Add/edit/remove coaches, assign to batches (main/sub-coach logic)
- 🧑‍🎓 **Student Management**: Maintain student records, fees, and track due dates
- 📅 **Batch Scheduling**: Set class types (theory/practice), weekdays, time slots
- 🌐 **Currency Conversion**: Automatically converts international fees to INR using API integration
- 📈 **Profit & Fees Breakdown**: Calculate net profit after coach payments per student
- 🔔 **Notifications**: Get alerts for pending fee payments and batch updates (planned)

---

## 📁 Folder Structure

```
LChess/
│
├── client/           # React frontend
│   └── .env          # Frontend environment config
│
├── server/           # Express backend
│   └── .env          # Backend MongoDB config
│
├── README.md         # Project documentation
└── ...
```

---

## 📅 Project Timeline

- **Phase 1**: Student & Coach Management ✔️  
- **Phase 2**: Batch Scheduling ✔️  
- **Phase 3**: Currency Conversion Integration ✔️  
- **Phase 4**: Notification System 🔄 (In Progress)

---

## ✨ Upcoming Features

- 🔔 Email Reminders for fee due dates  
- 📊 Charts for payment analytics and student growth  
- 🔐 Admin Roles & Permissions  
- 📤 CSV Export for student/coach records  

---

## 🙌 Final Note

The **LChess Admin Dashboard** is designed to help chess academies scale efficiently by simplifying all backend tasks into a single platform. Whether you're managing 5 students or 500, this tool helps you stay organized, informed, and in control.

> 💡 *Built with care to promote the love for chess through better management tools.*

---

**💻 Contributors**: [Your Name Here]  
**🗓️ Duration**: May 2024 – July 2024  
**📍 Location**: India (Supports international students)
