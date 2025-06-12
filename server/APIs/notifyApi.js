const verifytoken = require("./middlewares/verifyToken");
const exp = require("express");
const notifyapp = exp.Router();
const expressAsyncHandler = require("express-async-handler");
const { ObjectId } = require("mongodb");

// GET all notifications (admin only)
notifyapp.get(
  "/get-notifications",
  verifytoken,
  expressAsyncHandler(async (request, response) => {
    const notificationCollection = request.app.get("notificationCollection");
    const userCollection = request.app.get("userCollection");
    const userId = request.user.id;

    let userOfDB = await userCollection.findOne({ _id: new ObjectId(userId) });
    if (!userOfDB) {
      return response.status(200).send({ message: "Invalid User" });
    }
    if (userOfDB.role !== "admin") {
      return response.status(200).send({ message: "UnAuthorized user" });
    }

    const notifications = await notificationCollection.find({}).sort({ createdAt: -1 }).toArray();
    response.status(200).send({ message: "Notifications list", payload: notifications });
  })
);

// PUT mark as read
notifyapp.put(
  "/mark-read/:_id",
  verifytoken,
  expressAsyncHandler(async (request, response) => {
    const notificationCollection = request.app.get("notificationCollection");
    const userCollection = request.app.get("userCollection");
    const userId = request.user.id;

    let userOfDB = await userCollection.findOne({ _id: new ObjectId(userId) });
    if (!userOfDB) {
      return response.status(200).send({ message: "Invalid User" });
    }
    if (userOfDB.role !== "admin") {
      return response.status(200).send({ message: "UnAuthorized user" });
    }

    const notifId = new ObjectId(request.params._id);
    await notificationCollection.updateOne({ _id: notifId }, { $set: { read: true } });
    response.status(200).send({ message: "Notification marked as read" });
  })
);

// DELETE notification
notifyapp.delete(
  "/delete-notification/:_id",
  verifytoken,
  expressAsyncHandler(async (request, response) => {
    const notificationCollection = request.app.get("notificationCollection");
    const userCollection = request.app.get("userCollection");
    const userId = request.user.id;

    let userOfDB = await userCollection.findOne({ _id: new ObjectId(userId) });
    if (!userOfDB) {
      return response.status(200).send({ message: "Invalid User" });
    }
    if (userOfDB.role !== "admin") {
      return response.status(200).send({ message: "UnAuthorized user" });
    }

    const notifId = new ObjectId(request.params._id);
    await notificationCollection.deleteOne({ _id: notifId });
    response.status(200).send({ message: "Notification removed" });
  })
);

module.exports = notifyapp;