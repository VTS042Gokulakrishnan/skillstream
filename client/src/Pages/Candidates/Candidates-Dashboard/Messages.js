import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { Server } from "../../../App";
import Contacts from "../../../Components/message/Contacts";
import ChatContainer from "../../../Components/message/ChatContainer";
const Messages = () => {
  const navigate = useNavigate();
  const socket = useRef();
  const [contacts, setContacts] = useState([]);
  const [currentChat, setCurrentChat] = useState(undefined);
  const [currentUser, setCurrentUser] = useState(undefined);
  const [currentUserDetails, setCurrentUserDetails] = useState({});
  let userId = localStorage.getItem("UserId");
  let role = localStorage.getItem("Role");

  let profileCompleted = localStorage.getItem("ProfileCompleted");

  useEffect(() => {
    if (profileCompleted === "false") {
      // console.log(typeof profileCompleted);
      if (role === "Candidate") {
        navigate("/my-profile");
      } else {
        navigate("/company-profile");
      }
    }
  }, []);
  useEffect(() => {
    setCurrentUser(localStorage.getItem("UserId"));
  }, []);
  // console.log(currentChat);
  useEffect(() => {
    // Scroll to the top when navigation occurs
    window.scrollTo(0, 0);
  }, []);
  useEffect(() => {
    if (currentUser) {
      socket.current = io(Server);
      socket.current.emit("add-user", currentUser);
    }
  }, [currentUser]);
  const handleChatChange = (chat) => {
    setCurrentChat(chat);
  };
  useEffect(() => {
    getUser();
  }, [currentUser]);
  const getUser = async () => {
    try {
      const { data } = await axios.get(
        `${Server}/api/v1/messages/users/${userId}/${role}`
      );
      setContacts(data);
      // console.log(data);
    } catch (error) {
      // console.log(error);
    }
  };
  useEffect(() => {
    userDetails();
  }, []);

  // console.log(role);
  const userDetails = async () => {
    try {
      if (role === "Candidate") {
        const { data } = await axios.get(
          `${Server}/api/v1/candidate/${userId}`
        );
        setCurrentUserDetails({
          image: data.Candidate[0].image,
          name: data.Candidate[0].name,
        });
        // console.log(currentUserDetails);
      } else if (role === "Employer") {
        const { data } = await axios.get(`${Server}/api/v1/employer/${userId}`);
        setCurrentUserDetails({
          image: data.Employer[0].image,
          name: data.Employer[0].companyName,
        });
        // console.log(currentUserDetails);
      }
    } catch (error) {
      // console.log(error);
    }
  };
  return (
    <div>
      <section class="user-dashboard">
        <div class="dashboard-outer">
          <div class="upper-title-box">
            <h3>Messages</h3>
            <div class="text">Ready to jump back in?</div>
          </div>

          <div class="row">
            <div class="col-lg-12">
              <div class="chat-widget">
                <div class="widget-content">
                  <div class="row">
                    <Contacts
                      contacts={contacts}
                      currentUserDetails={currentUserDetails}
                      changeChat={handleChatChange}
                      setContacts={setContacts}
                      getUser={getUser}
                    />
                    {currentChat === undefined ? null : (
                      <ChatContainer
                        currentChat={currentChat}
                        socket={socket}
                        currentUserDetails={currentUserDetails}
                        getUser={getUser}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div class="copyright-text">
        <p>© 2024 Skill Stream. All Right Reserved.</p>
      </div>
    </div>
  );
};

export default Messages;

{
  /**const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [recipientDetails, setRecipientDetails] = useState(null);

  let userId = localStorage.getItem("UserId");
  useEffect(() => {
    fetchMessages();
    console.log(userId);
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await axios.get(
        `${Server}/api/v1/messages/get/${userId}`
      ); // Replace 'currentUserId' with the actual user ID
      setMessages(response.data.messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const fetchRecipientDetails = async (recipientId) => {
    try {
      const response = await axios.get(`${Server}/${recipientId}`); // Assuming you have an endpoint to fetch user details by ID
      setRecipientDetails(response.data.user);
    } catch (error) {
      console.error("Error fetching recipient details:", error);
    }
  };

  const sendMessage = async () => {
    try {
      await axios.post(`${Server}`, {
        sender: "currentUserId", // Replace 'currentUserId' with the actual user ID
        recipient: "recipientUserId", // Replace 'recipientUserId' with the recipient's user ID
        message: newMessage,
      });
      setNewMessage(""); // Clear the input field after sending the message
      // Optionally, you can fetch messages again to update the UI with the new message
      fetchMessages();
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const renderMessages = () => {
    return messages.map((message) => (
      <div key={message._id} className="message">
        <div className="sender">
          {message.sender === "currentUserId"
            ? "You"
            : recipientDetails
            ? recipientDetails.name
            : "Unknown User"}
        </div>
        <div className="content">{message.message}</div>
      </div>
    ));
  };

  const unreadMessagesCount = messages.filter(
    (message) => !message.read
  ).length; */
}
