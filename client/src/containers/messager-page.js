import Axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { useHistory } from "react-router-dom";
import { Dialogs, Box, Field } from "../components/messager/_index";
import "./_index.scss";
import styled from "styled-components";
import { set } from "lodash";

const ChatPlace = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  position: relative;
`
const Column = styled.div`
  display: flex;
  flex-direction: row;
  @media(max-width: ${p => p.theme.breakpoints.SMdesktop}) {
    .mainH,
    .search {
      margin-right: 5vw;
    }
  }
  .mainH,
  .search {
    margin-left: 5vw;
    font-size: 24px;
    font-weight: bold;
  }
  .search {
    margin-bottom: 20px;
  }
  .mainH {
    padding-bottom: 20px;
  }
  .searchInput {
    border-radius: 25px 0 0 25px;
    height: 40px;
    width: 100%;
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
`

const ChatContainer = styled(Column)`
  height: 50vh;
  @media(max-width: ${p => p.theme.breakpoints.SMdesktop}) {
    height: 70vh;
  }
`

const DialogContainer = styled.div`
  max-width: calc(5vw + 300px);
  @media(max-width: ${p => p.theme.breakpoints.SMdesktop}) {
    display: ${p => p.visible ? 'block' : 'none'};
    max-width: none;
    width: 100%;
  }
`

const BoxContainer = styled.div`
  width: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  display: ${p => p.visible ? 'block' : 'none'};
  &::-webkit-scrollbar {
    width: 0px;
    background: rgba(255, 255, 255, 0.0);
  }
  @media(min-width: ${p => p.theme.breakpoints.SMdesktop}) {
    margin-right: 5vw;
  }
`

const MessagerPage = ({ socket, IsAdmin, change_unread_chats, read_chat }) => {
  const history = useHistory();
  let url = !IsAdmin
    ? history.location.pathname.split("/messages/")[1]
    : history.location.pathname.split("admin/chat/")[1];

  const [newDialog, setNewDialog] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [chats, setChats] = useState(null);
  const [filteredDialogs, setFilteredDialogs] = useState();
  const [myProfileData, setMyProfileData] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [firstload, setFirstLoad] = useState(true);
  const [clearChat, setClearChat] = useState();
  const [newMes, setNewMes] = useState(false);
  const [asyncMes, setAsyncMes] = useState([])
  // Область ввода сообщения
  const [textarea, setTextArea] = useState("");

  const text = useRef("");
  const searchText = useRef("");

  useEffect(() => {
    getChat();
  }, []);

  useEffect(() => {
    if (asyncMes[0] && filteredDialogs) {
      let chatId = asyncMes[asyncMes.length - 1].chat._id

      setFilteredDialogs(prev => prev?.map(e => e._id == chatId ? { ...e, lastMessage: asyncMes[asyncMes.length - 1] } : e))
      console.log(filteredDialogs?.map(e => e._id == chatId ? { ...e, lastMessage: asyncMes[asyncMes.length - 1] } : e))
    }

  }, [asyncMes])

  useEffect(() => {
    getChat();
  }, [url]);

  useEffect(() => {
    socket.on("new-message", (newMessage) => {
      // alert("Новое сообщение получено");
      // alert(newMessage);
      console.log(newDialog);
      console.log(newMessage);
      //setNewDialog([...newDialog, newMessage]);
    });

    // return () => {
    //   socket.disconnect();
    // }
  }, [newDialog]);



  const getMyProfile = async () => {
    let res = await Axios({
      url: `http://localhost:5000/api/users/profile`,
      method: "GET",
      headers: {
        Authorization: localStorage.token,
      },
    });

    setMyProfileData(res.data);
    return res.data;
  };

  const sortByTime = (a, b) =>
    Date.parse(a.lastMessage.createdAt) > Date.parse(b.lastMessage.createdAt)
      ? -1
      : Date.parse(a.lastMessage.createdAt) <
        Date.parse(b.lastMessage.createdAt)
        ? 1
        : 0;

  const sortDialogs = (arr, prof) => {
    if (arr && prof) {
      console.log("Сортировка");
      // 1) Unread incoming messages
      let unreadIncomingMessages = arr.filter(
        (e) =>
          e.lastMessage.userMessage?._id != prof?._id &&
          !e.lastMessage.readMessageUsers.includes(prof?._id)
      );
      // sort by time
      unreadIncomingMessages = unreadIncomingMessages.sort(sortByTime);
      // 2) Others messages
      let otherMessages = arr.filter(
        (e) =>
          e.lastMessage.userMessage?._id == prof?._id ||
          e.lastMessage.readMessageUsers.includes(prof?._id)
      );
      // sort by time
      otherMessages = otherMessages.sort(sortByTime);
      // concat arrays
      console.log(unreadIncomingMessages);
      console.log(otherMessages);
      return [...unreadIncomingMessages, ...otherMessages];
    }
    return arr;
  };


  useEffect(() => {
    const interval = setInterval(async () => {
      if (profileData) {
        const res = await Axios({
          url: `http://localhost:5000/api/chat/last-message/${chats.filter(
            (e) =>
              (e.partner && e.partner._id == profileData.user._id) ||
              (e.author && e.author._id == profileData.user._id)
          )[0]._id}`,
          method: 'GET',
          headers: {
            Authorization: localStorage.token
          }
        })
        // console.log(res.data)
        res.data[0] && setAsyncMes(res.data)
      }
    }, 3000)
    return () => clearInterval(interval);
  }, [chats]);

  // Форма отправки
  const onSubmit = async (e) => {
    e.preventDefault();
    let nowValue = text.current.value;
    if (nowValue.length > 2) {
      text.current.value = ""
      setTextArea("")

      let res;

      if (!IsAdmin) {
        res = await Axios({
          method: "POST",
          url: `http://localhost:5000/api/messages/create/${chats.filter(
            (e) =>
              (e.partner && e.partner._id == profileData.user._id) ||
              (e.author && e.author._id == profileData.user._id)
          )[0]._id
            }`,
          data: {
            textMessage: nowValue,
          },
          headers: {
            "Content-Type": "application/json",
            Authorization: localStorage.token,
          },
        });
      } else {
        res = await Axios({
          method: "PUT",
          url: `http://localhost:5000/api/chat/${url}`,
          data: {
            textMessage: nowValue,
          },
          headers: {
            Authorization: localStorage.token,
          },
        });
      }

      if (res.status === 200) {
        //socket.connect()
        console.log("Успешно отправлено сообщение");
        setTextArea("");
        console.log([res.data])
        setAsyncMes([res.data])
        //getChat();
        //setNewDialog(res.data)
        socket.emit("broadcast-message", res.data);
        //alert("Новое сообщение отправлено");
        setNewMes(true);
      }
    }
  };

  // Получить диалоги пользователя по url
  const getChat = async () => {
    let call = await getMyProfile();
    let res = await getChatData(call);

    setChats(sortDialogs(res, call));
    console.log(filteredDialogs);

    !filteredDialogs && setFilteredDialogs(sortDialogs(res, call));
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

    if (url) {
      const userProfileData = !IsAdmin && (await getUserProfile());
      const allMessages = await getMessages(res, userProfileData);
      setNewDialog([].concat(allMessages));
    }
    setFirstLoad(false);
  };

  const getChatData = async () => {
    if (!IsAdmin) {
      const res = await Axios({
        url: 'http://localhost:5000/api/chat',
        method: 'GET',
        headers: {
          Authorization: localStorage.token
        }
      })
      change_unread_chats(res.data)
      setClearChat(res.data)
      return res.data
    } else {
      const res = await Axios({
        url: `http://localhost:5000/api/chat/admin-chat`,
        method: "GET",
        headers: {
          Authorization: localStorage.token
        }
      })
      // const reports = await Axios({
      //   url: 'http://localhost:5000/api/admin-panel/complaints/list',
      //   method: 'GET',
      //   headers: {
      //     Authorization: localStorage.token,
      //   }
      // })
      // let reportChats = reports.data.map(e => (e.chat && e.userWhoIsComplaining) ? [ e.chat,  e.userWhoIsComplaining._id ] : null).filter(e => e)
      // //const filtered = res.data.filter(e => reportChats.includes(e._id) && e.partner && e.partner._id != call._id && e.author && e.author._id != call._id  )
      // const filtered = res.data.map(e => {
      //   for(let i of reportChats){
      //     if(i[0].includes(e._id) && e.partner && e.partner._id != call._id && e.author && e.author._id != call._id){
      //       return {...e, reportUserId: i[1]}
      //     }
      //   }
      //   return null
      //   //reportChats.includes(e._id) && e.partner && e.partner._id != call._id && e.author && e.author._id != call._id && {...e, reportId: }
      // }).filter(e => e)
      // //.filter(e =>
      //   // !( (e.partner && e.partner._id) == (profileData && profileData.user._id) ||
      //   // (e.author && e.author._id) == (profileData && profileData.user._id)))
      //   //!(call && ( (e.partner && (e.partner._id == call._id )) || (e.author && (e.author._id == call._id ) )) ))
      // console.log(res.data)
      // console.log(call)
      // console.log(reports.data)
      // console.log(filtered)

      setClearChat(res.data);
      return res.data;
    }
  };

  const getUserProfile = async () => {
    const res = await Axios({
      url: `http://localhost:5000/api/users/profile/${url}`,
      method: "GET",
    });

    setProfileData(res.data);
    return res.data;
  };

  const getMessages = async (res, data) => {
    const response = await Axios({
      url: `http://localhost:5000/api/messages/${!IsAdmin
        ? res.filter(
          (e) =>
            (e.partner && e.partner._id == data.user._id) ||
            (e.author && e.author._id == data.user._id)
        )[0]._id
        : url
        }`,
      method: "GET",
      headers: {
        Authorization: localStorage.token,
      },
    });

    // setNewDialog(response.data)
    return response.data;
  };

  const filterDialogs = () => {
    setFilteredDialogs(
      chats.filter((e) => {
        if (searchText.current.value.trim() === '') return true
        if (IsAdmin) {
          return (
            e.author.username
              ?.toLowerCase()
              .includes(searchText.current.value.toLowerCase()) ||
            e.partner.username
              ?.toLowerCase()
              .includes(searchText.current.value.toLowerCase())
          );
        } else if (
          e.partner &&
          e.partner._id == myProfileData._id &&
          e.author
        ) {
          return e.author.username
            ?.toLowerCase()
            .includes(searchText.current.value.toLowerCase());
        } else if (e.author && e.author._id == myProfileData._id && e.partner) {
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
      <ChatContainer>
        <DialogContainer visible={!url}>
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
            filteredDialogs={filteredDialogs}
            setFilteredDialogs={setFilteredDialogs}
            IsAdmin={IsAdmin}
            asyncMes={asyncMes}
          />
        </DialogContainer>
        <BoxContainer visible={!!url} id='chatbox'>
          <Box
            setNewDialog={setNewDialog}
            newDialog={newDialog}
            profile={profileData}
            url={url}
            updateScroll={updateScroll}
            scrolled={scrolled}
            setScrolled={setScrolled}
            IsAdmin={IsAdmin}
            myProfileData={myProfileData}
            setNewMes={setNewMes}
            asyncMes={asyncMes}
          />
        </BoxContainer>
      </ChatContainer>
      {newDialog && (
        <Field
          onSubmit={onSubmit}
          text={text}
          url={url}
          chats={chats}
          profileData={profileData}
          getChat={getChat}
          setScrolled={setScrolled}
          IsAdmin={IsAdmin}
        />
      )}
    </ChatPlace>
  );
};

export default MessagerPage;
