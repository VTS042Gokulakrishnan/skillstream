import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Server } from "../../App";
const Contacts = ({
  contacts,
  changeChat,
  currentUserDetails,
  setContacts,
  getUser,
}) => {
  const [currentUserName, setCurrentUserName] = useState(undefined);
  const [currentUserImage, setCurrentUserImage] = useState(undefined);
  const [currentSelected, setCurrentSelected] = useState(undefined);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  useEffect(() => {
    // console.log(currentUserImage, currentUserName);
    setCurrentUserName(currentUserDetails?.name);
    setCurrentUserImage(currentUserDetails?.image);
  }, []);
  let role = localStorage.getItem("Role");
  const changeCurrentChat = (index, contact) => {
    // console.log(index, contact);
    setCurrentSelected(index);
    changeChat(contact);
  };
  // console.log(contacts);
  // let role = localStorage.getItem("Role");
  const searchCandidate = async () => {
    try {
      if (role === "Candidate") {
        const { data } = await axios.post(
          `${Server}/api/v1/employer/contact/search?c=${search}`
        );
        // console.log(data.search);
        setContacts(data.search);
      } else {
        const { data } = await axios.post(
          `${Server}/api/v1/candidate/contact/search?c=${search}`
        );
        // console.log(data);
        setContacts(data);
      }
    } catch (error) {
      // console.log(error);
    }
  };
  useEffect(() => {
    if (search !== "") {
      searchCandidate();
    } else {
      getUser();
      // console.log(contacts.getUser);
    }
    // console.log("hi");
  }, [search]);
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
      return "yesterday ";
      //+
      // messageTime.toLocaleTimeString([], {
      //   hour: "numeric",
      //   minute: "2-digit",
      //   hour12: true,
      // })
    } else {
      // Within current week
      return messageTime.toLocaleTimeString([], {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    }
    // else {
    //   // Other cases
    //   return messageTime.toLocaleDateString([], {
    //     day: "numeric",
    //     month: "short",
    //     hour: "numeric",
    //     minute: "2-digit",
    //     hour12: true,
    //   });
    // }
  };
  return (
    <div
      class="contacts_column col-xl-4 col-lg-5 col-md-12 col-sm-12 chat"
      id="chat_contacts"
    >
      <div class="card contacts_card">
        <div class="card-header">
          <div class="search-box-one">
            <form method="post" action="#">
              <div class="form-group">
                <span class="icon flaticon-search-1"></span>
                <input
                  type="search"
                  name="search-field"
                  value={search}
                  placeholder="Search"
                  required=""
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </form>
          </div>
        </div>
        <div class="card-body contacts_body">
          <ul class="contacts">
            {contacts?.length === 0 ? (
              <p class="text-center">No company matched</p>
            ) : (
              contacts?.map((contacts, index) => (
                <li
                  key={index}
                  onClick={() => changeCurrentChat(index, contacts)}
                >
                  <a>
                    <div class="d-flex bd-highlight">
                      <div class="img_cont">
                        <img
                          src={contacts.image}
                          class="rounded-circle user_img"
                          alt=""
                        />
                      </div>
                      <div class="user_info">
                        {role === "Candidate" ? (
                          <>
                            <span>{contacts.companyName}</span>
                            {contacts?.lastMessage?.fromSelf === false ? (
                              <p>{contacts?.lastMessage?.text}</p>
                            ) : (
                              <p> {contacts?.lastMessage?.text}</p>
                            )}
                          </>
                        ) : (
                          <>
                            <span>{contacts.name}</span>
                            {contacts?.lastMessage?.fromSelf === false ? (
                              <p>{contacts?.lastMessage?.text}</p>
                            ) : (
                              <p> {contacts?.lastMessage?.text}</p>
                            )}
                          </>
                        )}

                        {/*<p> Head of Development</p>*/}
                      </div>
                      <span class="info">
                        {contacts?.lastMessageTime
                          ? formatMessageTime(contacts?.lastMessageTime)
                          : null}
                        {contacts.unreadCount ? (
                          <span class="count">{contacts.unreadCount}</span>
                        ) : null}
                      </span>
                    </div>
                  </a>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Contacts;
