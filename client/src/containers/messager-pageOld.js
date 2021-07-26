import Axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { useHistory } from "react-router-dom";
import { Dialogs, Box, Field } from "../components/messager/_index";
import "./_index.scss";
// import openSocket from "socket.io-client";
import styled from "styled-components";
// const socket = openSocket(
//   process.env.REACT_APP_SOCKET_EDPOINT || "http://localhost:5000"
// );

const ChatPlace = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;
const Column = styled.div`
  display: flex;
  flex-direction: row;

  .mainH,
  .search {
    margin-left: 7vw;
    font-size: 24px;
    font-weight: bold;
  }
  .search {
    margin-bottom: 20px;
  }
  .mainH {
    padding-left: 20px;
    padding-bottom: 20px;
  }
  .searchInput {
    border-radius: 25px 0 0 25px;
    height: 40px;
    width: 215px;
    border-top: 2px solid #f3f3f3;
    border-bottom: 2px solid #f3f3f3;
    border-left: 2px solid #f3f3f3;
    border-right: none;
    padding: 15px;
  }
  .searchBottom {
    border-top: 2px solid #f3f3f3;
    border-bottom: 2px solid #f3f3f3;
    border-right: 2px solid #f3f3f3;
    border-radius: 0 25px 25px 0;
    width: 30px;
    height: 40px;
    line-height: 30px;
  }
  .fa-search:before {
    font-size: 15px;
  }
`;
const MessagerPage = ({ socket }) => {
  const history = useHistory();
  let url = history.location.pathname.split("/messages/")[1];

  const [newDialog, setNewDialog] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [chats, setChats] = useState(null);
  const [filteredDialogs, setFilteredDialogs] = useState();
  const [myProfileData, setMyProfileData] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  const text = useRef("");
  const searchText = useRef("");

  // Область ввода сообщения
  const [textarea, setTextArea] = useState("");

  useEffect(() => {
    //socket.connect();
    //getMyProfile();
    getChat();
    // return () => {
    //   socket.disconnect();
    // };
  }, []);

  useEffect(() => {
    socket.connect();

    socket.on("new-message", function (newMessage) {
      alert('Новое сообщение получено')
      alert(newMessage)
      console.log(newDialog);
      console.log(newMessage);
      //setNewDialog([...newDialog, newMessage]);
    });
    // alert("Socket!");

    return () => {
      socket.disconnect();
    };
  }, [newDialog]);

  const getMyProfile = async () => {
    let res = await Axios({
      url: `http://localhost:5000/api/users/profile`,
      method: "GET",
      headers: {
        Authorization: localStorage.token,
      },
    });
    // .then((data) => {
    //   setMyProfileData(data.data);
    // })
    // .catch((err) => {
    //   console.log("Ошибка во время загрузки профиля");
    // });
    setMyProfileData(res.data);
    return res.data;
  };

  // Отправка сообщения
  const onChangeTextarea = (e) => {
    setTextArea(e.current.value);
  };
  useEffect(() => {
    console.log("url поменялся");
    //setScrolled(false)
    getChat();
  }, [url]);

  const sortDialogs = (arr, prof) => {
    console.log(prof);
    console.log(prof);
    console.log(prof);

    const sortByTime = (a, b) =>
      Date.parse(a.lastMessage.createdAt) > Date.parse(b.lastMessage.createdAt)
        ? -1
        : Date.parse(a.lastMessage.createdAt) <
          Date.parse(b.lastMessage.createdAt)
          ? 1
          : 0;

    if (prof) {
      // 1) Unread incoming messages
      let unreadIncomingMessages = arr.filter(
        (e) =>
          e.lastMessage.userMessage != prof._id && !e.lastMessage.readMessage
      );
      // sort by time
      unreadIncomingMessages = unreadIncomingMessages.sort(sortByTime);
      console.log(unreadIncomingMessages);
      // 2) Others messages
      let otherMessages = arr.filter(
        (e) =>
          e.lastMessage.userMessage == prof._id || e.lastMessage.readMessage
      );
      // sort by time
      otherMessages = otherMessages.sort(sortByTime);
      console.log(otherMessages);
      // concat arrays
      console.log([...unreadIncomingMessages, ...otherMessages]);
      return [...unreadIncomingMessages, ...otherMessages];
    }
    console.log(arr);
    return arr;
  };

  // Форма отправки
  const onSubmit = (e) => {
    e.preventDefault();
    //console.log(e.currentTarget)
    console.log(text.current.value);
    let nowValue = text.current.value;
    if (nowValue.length > 2) {
      text.current.value = "";
      setTextArea("");
      console.log(chats);
      console.log(profileData);
      Axios({
        method: "POST",
        url: `http://localhost:5000/api/messages/create/${chats.filter(
          (e) =>
            e.partner._id == profileData.user._id ||
            e.author._id == profileData.user._id
        )[0]._id
          }`,
        data: {
          textMessage: nowValue,
        },
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.token,
        },
      })
        .then((data) => {
          socket.connect();
          if (data.status === 200) {
            console.log("Успешно отправлено сообщение");
            setTextArea("");
            getChat();
            setNewDialog(data.data);
            socket.emit("broadcast-message", data.data);
            alert('Новое сообщение отправлено')
            // socket.on("new-message", data.data);

          }
        })
        .catch((err) => {
          if (err.response) {
            alert("Ошибка, попробуйте позже");
          }
        });
    }
  };

  // Получить диалоги пользователя по url
  const getChat = async () => {
    const call = await getMyProfile();
    const res = await Axios({
      url: `http://localhost:5000/api/chat`,
      method: "GET",
      headers: {
        Authorization: localStorage.token,
      },
    });
    console.log(url);
    // console.log(res.data.filter(e => url ? e.author._id == url || e.partner._id == url : true))
    setChats(sortDialogs(res.data, call));
    !filteredDialogs && setFilteredDialogs(sortDialogs(res.data, call));
    if (filteredDialogs) {
      console.log(filteredDialogs);
      let clone = Object.assign([], filteredDialogs);
      for (let i = 0; i < clone.length; ++i) {
        console.log(clone[i]);
        if (
          !clone[i].lastMessage.readMessage &&
          clone[i].lastMessage.userMessage == url
        ) {
          clone[i].lastMessage.readMessage = true;
        }
      }
      setFilteredDialogs(clone);
    }
    //setChats(res.data);
    if (url) {
      Axios({
        url: `http://localhost:5000/api/users/profile/${url}`,
        method: "GET",
      })
        .then((data) => {
          setProfileData(data.data);
          Axios({
            url: `http://localhost:5000/api/messages/${res.data.filter(
              (e) =>
                e.partner._id == data.data.user._id ||
                e.author._id == data.data.user._id
            )[0]._id
              }`,
            method: "GET",
            headers: {
              Authorization: localStorage.token,
            },
          })
            .then((data) => {
              // socket.connect();
              setNewDialog(data.data);
            })
            .catch((err) => {
              console.log("Ошибка загрузки диалога");
            });
        })
        .catch((err) => {
          console.log("Ошибка во время загрузки другого профиля");
        });
    }
    //console.log(res.data.filter(e => e.partner._id==profileData.user._id|| e.author._id==profileData.user._id)[0]._id)
    //console.log(profileData)
    //updateScroll()
  };

  //  async function beOnline() {
  //    const { data: _user } = await updateUser(
  //      user._id,
  //      { status: socket.id },
  //      {
  //        cancelToken: source.token,
  //      }
  //    );

  //    socket.emit("new-user", _user);
  //    setIsOnline(true);
  //    localStorage.setItem("isOnline", true);
  //  }

  //  function beOffline() {
  //    socket.emit("user-offline");
  //    setIsOnline(false);
  //    localStorage.setItem("isOnline", false);
  //  }

  function updateChats(newChats) {
    if (socket.connected) setNewDialog(newChats);

    // updateScroll();
  }

  const filterDialogs = () => {
    setFilteredDialogs(
      chats.filter((e) => {
        if (e.partner._id == myProfileData._id) {
          return e.author.username
            ?.toLowerCase()
            .includes(searchText.current.value.toLowerCase());
        } else if (e.author._id == myProfileData._id) {
          return e.partner.username
            .toLowerCase()
            .includes(searchText.current.value.toLowerCase());
        }
      })
    );
  };

  const updateScroll = () => {
    const chatbox = document.getElementById("chatbox");
    if (chatbox) {
      chatbox.scrollTop = chatbox.scrollHeight;
    }
  };

  return (
    <ChatPlace>
      <Column style={{ height: "50vh" }}>
        <div>
          <div className="mainH">Все чаты</div>
          <div className="search">
            <Column>
              <input
                onChange={filterDialogs}
                ref={searchText}
                className="searchInput"
                type="text"
              />
              <div className="searchBottom">
                <i className="fas fa-search" />
              </div>
            </Column>
          </div>

          <Dialogs
            chatsData={chats}
            profileData={profileData}
            socket={socket}
            myProfileData={myProfileData}
            //myProfileData={myProfileData}
            filteredDialogs={filteredDialogs}
          />
        </div>
        <Box
          id="chatbox"
          newDialog={newDialog}
          profile={profileData}
          url={url}
          updateScroll={updateScroll}
          scrolled={scrolled}
          setScrolled={setScrolled}
        />
      </Column>

      {newDialog && (
        <Field
          onSubmit={onSubmit}
          text={text}
          url={url}
          chats={chats}
          profileData={profileData}
          getChat={getChat}
          setScrolled={setScrolled}
        />
      )}
    </ChatPlace>
  );
};

export default MessagerPage;
