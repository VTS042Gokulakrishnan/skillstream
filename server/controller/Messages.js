const messageModel = require("../models/messageModel");
const employerModel = require("../models/employerModel");
const candidateModel = require("../models/candidateModel");
const controller = {
  async addMessages(req, res) {
    try {
      const { from, to, message } = req.body;
      const data = await messageModel.create({
        message: { text: message },
        users: [from, to],
        sender: from,
        isRead: false,
      });
      res
        .status(201)
        .json({ success: true, message: "Message added successfully" });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        error: "Internal Server Error" + error.message,
        status: false,
      });
    }
  },
  async getMessages(req, res) {
    try {
      const { from, to } = req.body;
      // console.log("hi", req.body);
      const messages = await messageModel
        .find({
          users: {
            $all: [from, to],
          },
        })
        .sort({ updatedAt: 1 });
      // console.log(messages);
      const projectedMessages = messages.map((msg) => {
        return {
          fromSelf: msg.sender.toString() === from,
          message: msg.message.text,
          time: msg.createdAt,
          isRead: msg.isRead,
        };
      });
      const filtered = messages.filter((e, idx) => e.isRead != true);
      // console.log(filtered);

      filtered.forEach(async (msg) => {
        try {
          await messageModel.findByIdAndUpdate(msg._id, { isRead: true });
        } catch (error) {
          console.log("Error updating message:", error);
        }
      });
      res.json(projectedMessages);
    } catch (error) {
      console.log(error);
      res.status(500).json({
        error: "Internal Server Error" + error.message,
        status: false,
      });
    }
  },
  async getMessgeContacts(req, res) {
    try {
      const { role, userId } = req.params;
      const messages = await messageModel
        .find({
          users: { $in: [userId] },
        })
        .sort({ updatedAt: -1 });
      console.log(messages);

      const contactIds = new Set();
      messages.forEach((msg) => {
        msg.users.forEach((user) => {
          if (user !== userId) {
            contactIds.add(user);
          }
        });
      });

      // Filter out the userId from the contactIds set
      contactIds.delete(userId);

      const contacts = Array.from(contactIds);
      // console.log(contacts);
      let users;
      if (role === "Candidate") {
        users = await employerModel
          .find({ userId: { $in: contacts } })
          .select(["email", "companyName", "image", "_id", "userId"]);

        // return res.json({ users });
      } else if (role === "Employer") {
        users = await candidateModel
          .find({ userId: { $in: contacts } })
          .select(["email", "name", "image", "_id", "userId"]);

        // return res.json({ users });
      }

      const sortedContacts = users
        .map((user) => {
          const lastMsg = messages.find((msg) =>
            msg.users.includes(user.userId)
          );
          const checkSelf = messages.filter((msg) => msg.sender !== userId);
          const unreadCount = checkSelf.filter(
            (msg) => msg.users.includes(user.userId) && !msg.isRead
          ).length;
          let lastMessage = null;
          if (lastMsg) {
            lastMessage = {
              fromSelf: lastMsg.sender === userId,
              text: lastMsg.message.text,
            };
          }
          return {
            ...user.toObject(),
            lastMessageTime: lastMsg ? lastMsg.updatedAt : null,
            lastMessage,
            unreadCount: unreadCount,
          };
        })
        .sort((a, b) => {
          // Sort by the updatedAt timestamp of the last message
          const timeA = a.lastMessageTime || 0;
          const timeB = b.lastMessageTime || 0;
          return timeB - timeA; // Sort in descending order (most recent first)
        });
      // console.log(sortedContacts);
      res.json(sortedContacts);
    } catch (error) {
      console.log(error);
      res.status(500).json({
        error: "Internal Server Error" + error.message,
        status: false,
      });
    }
  },
  // async getMessgeContacts(req, res) {
  //   try {
  //     const { userId } = req.params;
  //     const sentMessages = await messageModel.find( {
  //       sender: userId,
  //     });
  //     const receivedMessages = await messageModel.distinct("sender", {
  //       users: userId,
  //       sender: { $ne: userId }
  //     });
  //     const contactIds = [...sentMessages, ...receivedMessages].filter(
  //       (id, index, self) => self.indexOf(id) === index
  //     );
  //     res.json({ contacts: contactIds });
  //   }  catch (error) {
  //     console.log(error);
  //     res.status(500).json({
  //       error: "Internal Server Error" + error.message,
  //       status: false,
  //     });
  //   }
  // },
};
module.exports = controller;

// const candidateModel = require("../models/candidateModel");
// const employerModel = require("../models/employerModel");
// const jwt = require("jsonwebtoken");
// const moment = require("moment");

// const { senderId, receiverId } = req.params;
//       const { messageContent } = req.body;
//       const senderUser = await candidateModel.findOne({ userId: senderId });
//       const receiverUser = await employerModel.findOne({ userId: receiverId });
//       const existingConversation = senderUser.messages.find(
//         (msg) => msg.receiverId === receiverId || msg.senderId === receiverId
//       );
//       console.log(existingConversation);
//       if (existingConversation) {
//         // Update the existing conversation by adding the new message

//       } else {
//         // Create a new conversation thread and add the message
//         const storeMessages = await candidateModel.updateOne(
//           { userId: senderId },
//           {
//             $push: {
//               messages: {
//                 receiverId: receiverId,
//                 senderId: senderId,
//                 imageName: receiverUser.image,
//                 message: [
//                   {
//                     message: messageContent,
//                     time: moment().format(),
//                   },
//                 ],
//               },
//             },
//           }
//         );
//       }
//       await senderUser.save();
//       await receiverUser.save();
//       res.send("success");
// async addMessages(req, res) {
//   try {
//     const { sender, recipient, message } = req.body;
//     const newMessage = await messageModel.create({
//       sender,
//       recipient,
//       message,
//     });
//     res.status(201).json({ success: true, message: newMessage });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({
//       error: "Internal Server Error" + error.message,
//       status: false,
//     });
//   }
// },
// async getMessages(req, res) {
//   try {
//     const userId = req.params.userId;

//     const messages = await messageModel.find({
//       $or: [{ sender: userId }, { recipient: userId }],
//     });
//     res.status(200).json({ success: true, messages });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({
//       error: "Internal Server Error" + error.message,
//       status: false,
//     });
//   }
// },
