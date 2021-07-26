import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import Axios from "axios";
import openSocket from "socket.io-client";
import styled from "styled-components";
import { common } from "@material-ui/core/colors";
const socket = openSocket(
  process.env.REACT_APP_SOCKET_EDPOINT || "http://localhost:5000"
);
const OnlinePoint = styled.span`
  font-size: 10px;
  color: #4bb34b;
  transform: translate(-32px, 16px);
`;
const Scroll = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100% - 99px);
  overflow: scroll;
  &::-webkit-scrollbar {
    width: 0px;
    background: rgba(255, 255, 255, 0);
  }
`;
const Column = styled.div`
  display: flex;
  flex-direction: row;
`;
const ColumnDialog = styled.div`
  display: flex;
  flex-direction: row;
  min-height: 70px;
  align-items: center;
  margin-left: 5vw;
  cursor: pointer;
  @media(max-width: ${p => p.theme.breakpoints.SMdesktop}) {
    margin-right: 5vw;
  }
  :hover {
    background: ${(props) =>
    props.status == "primary"
      ? "#f3f3f3"
      : props.ridden
        ? "rgba(252, 23, 30, 0.2)"
        : "#f7f7f7"};
  }
  background: ${(props) =>
    props.status == "primary"
      ? "#f3f3f3"
      : props.ridden && "rgba(252, 23, 30, 0.2)"};
  .photo {
    background-color: #e1e1e1;
    height: 45px;
    width: 45px;
    min-width: 45px;
    border-radius: 50%;
    margin-left: 2vw;
    margin-right: 20px;
    font-size: 32px;
    color: #fff;
    text-align: center;
    line-height: 45px;
  }
  .userName {
    font-size: 16px;
    font-weight: 900;
    max-width: 65%;
    overflow-wrap: break-word;
  }
`;
const Row = styled.div`
  display: flex;
  flex-direction: column;

  .userName {
    font-size: 16px;
    font-weight: 900;
    max-width: 65%;
    overflow-wrap: break-word;
  }
  .shortMessage {
    max-width: 220px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;
const AvatarUploaded = styled.img`
  background-color: #e1e1e1;
  object-fit: cover;
  height: 45px;
  width: 45px;
  min-width: 45px;
  border-radius: 50%;
  margin-right: 80px;
  margin-bottom: 20px;
  font-size: 95px;
  color: #fff;
  text-align: center;
  line-height: 145px;
`

const DialogTextContainer = styled.div`
  margin-left: 5vw;
  width: 300px;
`

const DialogContent = styled(Row)`
  overflow: hidden;
  margin-right: 35px;
`

const TimeContainer = styled.div`
  margin: 0 5px;
`

const NickName = styled.span`
  ${props => props.admin && 'color: #fc171e;'}
`

const Dialogs = ({
  chatsData,
  profileData,
  socket,
  myProfileData,
  filteredDialogs,
  setFilteredDialogs,
  setScrolled,
  IsAdmin,
  asyncMes,
}) => {

  const history = useHistory();
  let url = !IsAdmin
    ? history.location.pathname.split("/messages/")[1]
    : history.location.pathname.split("admin/chat/")[1];

  // const [profileData, setProfileData] = useState(null);
  //const [myProfileData, setMyProfileData] = useState(null);
  //  const [chatsData, setChatsData] = useState(null);

  useEffect(() => {
    let url = !IsAdmin
      ? history.location.pathname.split("/messages/")[1]
      : history.location.pathname.split("admin/chat/")[1];

    // socket.connect();

    // const getMyProfile = () => {
    //   Axios({
    //     url: `http://localhost:5000/api/users/profile`,
    //     method: "GET",
    //     headers: {
    //       Authorization: localStorage.token,
    //     },
    //   })
    //     .then((data) => {
    //       setMyProfileData(data.data);
    //     })
    //     .catch((err) => {
    //       console.log("Ошибка во время загрузки профиля");
    //     });
    // };

    // getMyProfile();

    console.log(chatsData);

    // return () => {
    //   socket.disconnect();
    // };
  }, []);
  useEffect(() => console.log(profileData), [profileData]);

  // useEffect(() => {
  //   console.log(profile);
  //   setProfileData(profile);
  // }, [profile]);

  // useEffect(() => {
  //   console.log(chats);
  //   setChatsData(chats);
  // }, [chats]);

  const itsToday = (time) => {
    const ms = Date.parse(time);
    console.log(ms);
    const year = new Date(ms).getFullYear();
    const mounth = new Date(ms).getMonth() + 1;
    const day = new Date(ms).getDate();
    const today = new Date().setHours(0, 0, 0, 0);
    console.log(today);
    if (ms >= today) {
      const hours = new Date(ms).getHours();
      const minutes = new Date(ms).getMinutes();
      return `${hours}:${minutes < 10 ? "0" + minutes : minutes}`;
    } else {
      return `${day}.${mounth < 10 ? "0" + mounth : mounth}.${year % 100}`;
    }
  };
  const DialogItem = ({ e }) => {
    const [errAvt, setErrAvt] = useState(false)
    {
      return (
        <>
          {e.partner &&
            e.partner &&
            (!profileData ||
              e.author?._id != profileData.user._id ||
              e.partner?._id != profileData.user._id) && (
              <ColumnDialog
                status={
                  !IsAdmin
                    ? e.lastMessage.userMessage?._id &&
                      e.lastMessage.userMessage?._id !=
                      myProfileData._id
                      ? e.lastMessage.readMessageUsers.includes(
                        myProfileData._id
                      )
                        ? ""
                        : "ridden"
                      : "ridden"
                    : url == e._id && "primary"
                }
                ridden={
                  e.lastMessage.userMessage?._id != myProfileData._id &&
                    !e.lastMessage.readMessageUsers.includes(
                      myProfileData._id
                    )
                    ? true
                    : false
                }
                id={
                  !IsAdmin
                    ? chatsData.reportUserId
                      ? chatsData.reportUserId
                      : e.author && e.author._id != myProfileData._id
                        ? e.author._id
                        : e.partner && e.partner._id
                    : e._id
                }
                key={
                  !IsAdmin
                    ? e.author && e.author._id != myProfileData._id
                      ? e.author._id + "0"
                      : e.partner && e.partner._id + "0"
                    : e._id
                }
                onClick={(e) => {
                  !IsAdmin
                    ? history.push(`/messages/${e.currentTarget.id}`)
                    : history.push(`/admin/chat/${e.currentTarget.id}`);
                }}
              >
                {!IsAdmin && (
                  <>
                    <div className="photo">
                      {e.author && e.author._id != myProfileData._id
                        ? e.author.avatar && !errAvt ? <AvatarUploaded src={e.author.avatar.url} onError={() => setErrAvt(true)} /> : e.author.username?.substr(0, 1)?.toUpperCase()
                        : e.partner &&
                          e.partner.avatar && !errAvt ? <AvatarUploaded src={e.partner.avatar.url} onError={() => setErrAvt(true)} /> : e.partner.username?.substr(0, 1)?.toUpperCase()}
                    </div>
                    <OnlinePoint>
                      {e.author && e.author._id != myProfileData._id
                        ? e.author.onlineUser && (
                          <i className="fas fa-circle" />
                        )
                        : e.partner &&
                        e.partner.onlineUser && (
                          <i className="fas fa-circle" />
                        )}
                    </OnlinePoint>
                  </>
                )}
                <DialogContent>
                  <Column style={{alignItems: 'center'}}>
                    <div className="userName">
                      {!IsAdmin
                        ? e.author && e.author._id != myProfileData._id
                          ? <NickName admin={e.author.roles.includes('ADMIN')}>{e.author.username}</NickName>
                          : e.partner && <NickName admin={e.partner.roles.includes('ADMIN')}>{e.partner.username}</NickName>
                        : e.partner &&
                        e.author && (
                          <>
                            <span>
                              {e.author.username} и{" "}
                              {e.partner.username}
                            </span>
                          </>
                        )}
                    </div>
                    
                    {!IsAdmin
                      && e.author && e.author._id != myProfileData._id
                        ? e.author.roles.includes('ADMIN') && <i className="fas fa-star" style={{marginLeft: '4px', color: '#fc171e'}}/>
                        : e.partner && e.partner.roles.includes('ADMIN') && <i className="fas fa-star" style={{marginLeft: '4px', color: '#fc171e'}}/>}
                    <TimeContainer>{itsToday(e.lastMessage.createdAt)}</TimeContainer>
                    <div>
                      {e.lastMessage.userMessage?._id ==
                        myProfileData._id &&
                        (e.lastMessage.readMessageUsers?.length != 0 ? (
                          <>
                            <i className="fas fa-check"></i>
                            <i className="fas fa-check"></i>
                          </>
                        ) : (
                          <i className="fas fa-check"></i>
                        ))}
                    </div>
                  </Column>
                  <div className="shortMessage">
                    {IsAdmin && (
                      <span style={{ fontWeight: "900" }}>
                        {e.author &&
                          e.author._id == e.lastMessage.userMessage?._id
                          ? `${e.author.username}: `
                          : e.partner &&
                            e.partner._id ==
                            e.lastMessage.userMessage?._id
                            ? `${e.partner.username}: `
                            : e.administrator &&
                            e.administrator._id ==
                            e.lastMessage.userMessage?._id &&
                            `Вы: `}
                      </span>
                    )}
                    {e.lastMessage.textMessage}
                    {e.lastMessage.dealMessage &&
                      (!IsAdmin ? (
                        e.lastMessage.userMessage?._id ==
                          myProfileData._id ? (
                          <span style={{ fontWeight: "900" }}>
                            Исходящая сделка
                          </span>
                        ) : (
                          <span style={{ fontWeight: "900" }}>
                            Входящая сделка
                          </span>
                        )
                      ) : (
                        <span style={{ fontWeight: "900" }}>
                          Cделка
                        </span>
                      ))}
                  </div>
                </DialogContent>
              </ColumnDialog>
            )}
        </>
      )
    }
  }

  if (chatsData === null) {
    return <DialogTextContainer>Загрузка...</DialogTextContainer>
  } else if (chatsData.length > 0) {
    return (
      <Scroll>
        {console.log(myProfileData)}
        {chatsData && myProfileData && filteredDialogs && filteredDialogs[0]
          ? filteredDialogs.map((e) => <DialogItem key={e._id} e={e} />)
          : <DialogTextContainer>Поиск не дал результатов</DialogTextContainer>}
      </Scroll>
    )
  } else {
    return (
      <DialogTextContainer>
        У Вас еще нет сообщений. Напишите кому-нибудь, воспользовшись поиском
      </DialogTextContainer>
    )
  }
}

export default Dialogs