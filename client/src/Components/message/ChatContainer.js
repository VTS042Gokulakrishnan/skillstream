import React, { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { Server } from "../../App";
import { formatDistanceToNow } from "date-fns";
import { BsEmojiSmileFill } from "react-icons/bs";
import { IoMdSend } from "react-icons/io";
import Picker from "emoji-picker-react";
const ChatContainer = ({
  currentChat,
  socket,
  currentUserDetails,
  getUser,
}) => {
  // console.log(currentUserDetails);
  const [messages, setMessages] = useState([]);
  const scrollRef = useRef();
  const [arrivalMessage, setArrivalMessage] = useState(null);
  //   console.log(messages);
  useEffect(() => {
    receiveMessage();
    // console.log("hi");
  }, [currentChat]);
  // console.log(currentChat);
  let userId = localStorage.getItem("UserId");
  let role = localStorage.getItem("Role");
  const receiveMessage = async () => {
    try {
      let data = {
        from: userId,
        to: currentChat.userId,
      };
      const response = await axios.post(`${Server}/api/v1/messages/get`, data);
      // console.log("hi");
      // console.log(response.data);
      // console.log(data);
      // setMessages(response.data);
    } catch (error) {
      // console.log(error);
    }
  };
  const formatTime = (time) => {
    {
      formatDistanceToNow(new Date(time), {
        includeSeconds: true,
        includeMinutes: true,
        includeHours: true,
        addSuffix: true,
      });
    }
  };
  useEffect(() => {
    getUser();
  }, [messages]);
  useEffect(() => {
    const getCurrentChat = async () => {
      if (currentChat) {
        const data = userId;
        // console.log(data);
      }
    };
    getCurrentChat();
  }, [currentChat]);

  const handleSendMsg = async (msg) => {
    try {
      // console.log("hi");
      const currentTime = new Date();
      socket.current.emit("send-msg", {
        to: currentChat.userId,
        from: userId,
        msg,
        time: currentTime.toISOString(),
      });
      await axios.post(`${Server}/api/v1/messages/send`, {
        from: userId,
        to: currentChat.userId,
        message: msg,
      });

      const msgs = [...messages];
      msgs.push({ fromSelf: true, message: msg, time: currentTime });
      setMessages(msgs);
    } catch (error) {
      // console.log(error);
    }
  };

  useEffect(() => {
    if (socket.current) {
      socket.current.on("msg-recieve", (msg) => {
        const currentTime = new Date();
        setArrivalMessage({ fromSelf: false, message: msg, time: currentTime });
      });
    }
  }, []);

  const [msg, setMsg] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const handleEmojiPickerhideShow = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  const handleEmojiClick = (event, emojiObject) => {
    let message = msg;
    message += emojiObject.emoji;
    setMsg(message);
  };

  const sendChat = (event) => {
    // event.preventDefault();
    // console.log("hi", msg);
    if (msg.length > 0) {
      handleSendMsg(msg);
      setMsg("");
    }
  };

  useEffect(() => {
    arrivalMessage && setMessages((prev) => [...prev, arrivalMessage]);
  }, [arrivalMessage]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatMessageTime = (timeString) => {
    const messageTime = new Date(timeString);
    const currentTime = new Date();

    // Calculate the difference in days between message date and current date
    const diffInDays = Math.floor(
      (currentTime - messageTime) / (1000 * 60 * 60 * 24)
    );

    // Previous day

    if (diffInDays === 0) {
      // Same day
      return messageTime.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } else if (diffInDays === 1) {
      return (
        "yesterday " +
        messageTime.toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
      );
    } else if (diffInDays < 7) {
      // Within current week
      return messageTime.toLocaleTimeString([], {
        weekday: "short",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } else {
      // Other cases
      return messageTime.toLocaleDateString([], {
        day: "numeric",
        month: "short",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    }
  };

  return (
    <div class=" col-xl-8 col-lg-7 col-md-12 col-sm-12 chat">
      <div class="card message-card">
        <div class="card-header msg_head">
          <div class="d-flex bd-highlight">
            <div class="img_cont">
              <img
                src={currentChat?.image}
                alt=""
                class="rounded-circle user_img"
              />
            </div>
            <div class="user_info">
              {role === "Candidate" ? (
                <span>{currentChat?.companyName}</span>
              ) : (
                <span>{currentChat?.name}</span>
              )}

              {/*<p>Active</p>*/}
            </div>
          </div>

          {/*      <div class="btn-box">
            <button class="dlt-chat">Delete Conversation</button>
            <button class="toggle-contact">
              <span class="fa fa-bars"></span>
            </button>
  </div>*/}
        </div>

        <div class="card-body msg_card_body">
          {messages.length === 0 ? (
            <p>No messages</p>
          ) : (
            messages.map((message, index) =>
              message.fromSelf ? (
                <div class="d-flex justify-content-end mb-2 reply">
                  <div class="img_cont_msg">
                    <img
                      src={currentUserDetails.image}
                      alt=""
                      class="rounded-circle user_img_msg"
                    />
                    <div class="name">
                      You{" "}
                      <span class="msg_time">
                        {formatMessageTime(message.time)}
                      </span>
                    </div>
                  </div>
                  <div class="msg_cotainer">{message.message}</div>
                </div>
              ) : (
                <div class="d-flex justify-content-start mb-2">
                  <div class="img_cont_msg">
                    <img
                      src={currentChat?.image}
                      alt=""
                      class="rounded-circle user_img_msg"
                    />
                    <div class="name">
                      {role === "Candidate" ? (
                        <span>{currentChat?.companyName}</span>
                      ) : (
                        <span>{currentChat?.name}</span>
                      )}

                      <span class="msg_time">
                        {formatMessageTime(message.time)}{" "}
                      </span>
                    </div>
                  </div>
                  <div class="msg_cotainer">{message.message}</div>
                </div>
              )
            )
          )}
        </div>

        <div class="card-footer">
          <form class="form-group mb-0">
            <textarea
              class="form-control type_msg"
              placeholder="Type a message..."
              onChange={(e) => setMsg(e.target.value)}
              value={msg}
            ></textarea>

            <button
              type="button"
              class="theme-btn btn-style-one submit-btn"
              onClick={(event) => sendChat(event)}
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatContainer;
