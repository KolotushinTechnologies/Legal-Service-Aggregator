import Axios from "axios";
import React, { useContext, useEffect, useLayoutEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useHistory } from "react-router-dom";
// import socket from "../../../../socket";
import { ModalContext } from "../../context/modal/modalContext";
import { ProfileContext } from "../../context/profile/profileContext";
import Alert from "../alerts/Alert";
import AddServiceModal from "../modals/add-service-modal";
import { ChangeServiceModal } from "../modals/_index";
import ProfileService from "./profile-service";
import "./_index.scss";
import moment from "moment";
import "moment/locale/ru";
import styled from "styled-components";

const NotService = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px;
  padding: 10px;
  border-radius: 0 0 10px 10px;
  color: #7d7d7d;
  border: 1px solid #e2e2e2;
  border-top: 0;
  font-size: 20px;
`;

const AvatarUploaded = styled.img`
  background-color: #e1e1e1;
  object-fit: cover;
  height: 145px;
  width: 145px;
  border-radius: 50%;
  margin-right: 80px;
  margin-bottom: 20px;
  font-size: 95px;
  color: #fff;
  text-align: center;
  line-height: 145px;
`;
const Background = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.6);
  transition: all 0.3s ease;
  z-index: 2;
`;

const Modal = styled.div`
  z-index: 3;
  position: fixed;
  top: 15%;
  right: 50%;
  transform: translate(50%, 0);
  width: 400px;
  height: auto;
  border: 1px solid #c0c0c0;
  border-radius: 10px;
  background-color: #fff;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  padding: 25px 25px 55px 45px;
  .title {
    justify-content: space-between;
    font-size: 20px;
  }
  .message {
    font-size: 16px;
    text-align: center;
    margin-top: 70px;
  }
  .modalTitle {
    font-size: 24px;
    padding-top: 20px;
  }
  .cross {
    font-size: 20px;
    height: 28px;
    padding: 0 6px 8px 6px;
    cursor: pointer;
  }
  .btns {
    margin-top: 65px;
    justify-content: center;
    cursor: pointer;
    text-align: center;
    font-size: 17px;
  }
  .confirm {
    margin-left: 10px;
    border: 1px solid #c0c0c0;
    padding: 13px 32px;
    border-radius: 4px;
  }
  .close {
    border: none;
    background-color: #fc171e;
    color: #fff;
    padding: 13px 32px;
    border-radius: 4px;
  }
`;

const Row = styled.div`
  display: flex;
`

const ButtonBlock = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  @media(max-width: ${p => p.theme.breakpoints.SMdesktop}) {
    flex-direction: column;
  }
`

const SelectAvatarContainer = styled.div`
  display: flex;
  align-items: center;
  flex: 0 0 35%;
  @media(max-width: ${p => p.theme.breakpoints.SMdesktop}) {
    flex-direction: column;
    justify-content: center;
  }
`

const SelectAvatarTitle = styled.div`
  width: 245px; 
  margin-right: 20px;
  @media(max-width: ${p => p.theme.breakpoints.SMdesktop}) {
    width: auto;
    margin: 0px;
  }
`

const Avatar = styled.div`
  background-color: #e1e1e1;
  height: 145px;
  width: 145px;
  border-radius: 50%;
  margin-right: 80px;
  margin-bottom: 20px;
  font-size: 95px;
  color: #fff;
  text-align: center;
  line-height: 145px;
  @media(max-width: ${p => p.theme.breakpoints.SMdesktop}) {
    margin: 20px 0;
  }
`

const UploadAvatar = styled.div`
  height: 36px;
  @media(max-width: ${p => p.theme.breakpoints.SMdesktop}) {
    margin: 20px 0;
  }
`

const Profile = ({ socket }) => {
  const { setModalService, setModalServiceEdit } = useContext(ModalContext);
  const [profile, setProfile] = useState();
  const [alert, setAlert] = useState({
    title: "",
    description: "",
    isActive: false,
  });
  const [loaded, setLoaded] = useState(false);
  const [photoModal, setPhotoModal] = useState(false);
  const [file, setFile] = useState();

  const onChangeAlert = (active) => {
    setAlert({
      ...alert,
      isActive: active,
    });
  };

  const [currentService, setCurrentService] = useState();

  let history = useHistory();

  const [services, setServices] = useState([]);
  const [countDeals, setCountDeals] = useState();
  const [coutMessages, setCoutMessages] = useState();
  const [сountNotif, setCountNotif] = useState();

  const toggleAddService = (e) => {
    e.preventDefault();
    setModalService(true);
  };

  // Получить сервисы профиля
  const getServices = async () => {
    await Axios({
      url: "http://localhost:5000/api/services/user",
      method: "GET",
      headers: {
        Authorization: localStorage.token,
      },
    })
      .then((data) => {
        setServices(data.data);
      })
      .catch((err) => {
        console.log("Ошибка получения сервисов");
      });
  };

  // Получить данные профиля
  const getProfile = async () => {
    const res = await Axios({
      url: "http://localhost:5000/api/users/profile",
      method: "GET",
      headers: {
        Authorization: localStorage.token,
      },
    });
    setProfile(res.data);
  };

  // Удалить сервис
  const deleteService = async (id) => {
    await Axios({
      url: `http://localhost:5000/api/services/${id}`,
      method: "DELETE",
      headers: {
        Authorization: localStorage.token,
      },
    })
      .then((data) => {
        setAlert({
          title: "Успешно",
          description: "Успешное удаление сервиса",
          isActive: true,
        });
        getServices();
      })
      .catch((err) => {
        setAlert({
          title: "Ошибка",
          description: "Ошибка удаления сервиса",
          isActive: true,
        });
      });
  };

  const countNotifications = async () => {
    const res = await Axios({
      method: 'GET',
      url: 'http://localhost:5000/api/notifications/profile',
      headers: {
        Authorization: localStorage.token
      }
    })
    setCountNotif({
      all: res.data.read,
      unridden: res.data.unread
    })
  }

  const countActiveDeals = async () => {
    if (profile) {
      const res = await Axios({
        method: 'GET',
        url: 'http://localhost:5000/api/dealings',
        headers: {
          Authorization: localStorage.token
        }
      })
      let active = res.data.filter((e) => e.confirmed && !e.completed && !e.rejected)
      const performer = active.filter(
        (e) => e.customer?._id && e.customer?._id == profile._id
      ).length;
      const client = active.filter(
        (e) => e.executor && e.executor._id == profile._id
      ).length;
      setCountDeals({
        performer,
        client
      })
    }
  }

  const countMessages = async () => {
    if (profile) {
      const res = await Axios({
        url: `http://localhost:5000/api/chat`,
        method: "GET",
        headers: {
          Authorization: localStorage.token,
        },
      });
      const total = res.data.length;
      const newMessages = res.data.filter(
        (e) =>
          e.lastMessage.userMessage?._id !== profile?._id &&
          !e.lastMessage.readMessageUsers.includes(profile?._id)
      ).length;
      console.log(profile);
      console.log({ newMessages, total });
      setCoutMessages({
        newMessages,
        total,
      });
    }
  };

  useEffect(() => {
    getProfile();
    countMessages();
    countNotifications();
    getServices();
  }, []);

  useEffect(() => {
    if (profile) {
      countMessages();
      countActiveDeals();
      countNotifications();
    }
  }, [profile]);

  useEffect(() => {
    if (!localStorage.isOnline) {
      localStorage.setItem("isOnline", true);
      setAlert({
        title: "Успешно",
        description: "Успешный вход",
        isActive: true,
      });
    }
  }, [loaded]);
  const logOut = () => {
    socket.emit("user-offline", profile._id);
    console.log(profile._id);
    localStorage.clear();
    window.location.reload();
    history.push("/");
  };

  const sendFileAvatar = (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("file", file);

    Axios({
      url: "http://localhost:5000/api/avatars/profile/avatar-upload",
      method: "POST",
      headers: {
        Authorization: localStorage.token,
      },
      data: data,
    })
      .then((res) => {
        console.log(res.data);
        setPhotoModal(false);
        getProfile();
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // const getAvatar =

  return (
    <>
      {profile && countDeals && coutMessages ? (
        <>
          <AddServiceModal getServices={getServices} />
          <div className="profile">
            {profile.roles.includes('ADMIN') ? (
              <div className="d-flex flex-column align-start">
                <ButtonBlock>
                  <Alert
                    onChangeAlert={onChangeAlert}
                    title={alert.title}
                    description={alert.description}
                    isActive={alert.isActive}
                  />
                  <a onClick={logOut} className="default-btn mb-20">
                    Выйти из аккаунта
                  </a>
                  <Link to="/admin/users" className="default-btn mb-20">
                    Перейти в административную панель
                  </Link>
                  <Link to="/replenishment" className="default-btn mb-20">
                    Пополнить баланс
                  </Link>
                  <Link to="/withdrawal-of-funds" className="default-btn mb-20">
                    Вывод средств
                  </Link>
                </ButtonBlock>
              </div>
            ) : (
              <ButtonBlock>
                <button onClick={logOut} className="default-btn mb-20">
                  Выйти из аккаунта
                </button>
                <Link to="/replenishment" className="default-btn mb-20">
                  Пополнить баланс
                </Link>
                <Link to="/withdrawal-of-funds" className="default-btn mb-20">
                  Вывод средств
                </Link>
              </ButtonBlock>
            )}

            <div className="dashboard profile__dashboard">
              <Link to="/messages" className="dashboard__item">
                <p className="dashboard__title">Личные сообщения:</p>
                <p className="dashboard__satus">
                  Новых {coutMessages && coutMessages.newMessages}
                </p>
                <p className="dashboard__satus">
                  Всего {coutMessages && coutMessages.total}
                </p>
              </Link>

              <Link to="/deals" className="dashboard__item">
                <p className="dashboard__title">Сделки ожидающие завершения:</p>
                <p className="dashboard__satus">
                  Вы исполнитель {countDeals ? countDeals.performer : "0"}
                </p>
                <p className="dashboard__satus">
                  Вы заказчик {countDeals ? countDeals.client : "0"}
                </p>
              </Link>

              <Link to="/notifications" className="dashboard__item">
                <p className="dashboard__title">Уведомления:</p>
                <p className="dashboard__satus">
                  {console.log(сountNotif)}
                  Новых {сountNotif && сountNotif.unridden}
                </p>
                <p className="dashboard__satus">
                  Всего {сountNotif && сountNotif.all}
                </p>
              </Link>

              <div className="dashboard__item">
                <p className="dashboard__title">Ваш депозит:</p>
                <p className="dashboard__satus dashboard__satus_accent">
                  {profile.deposit} руб.
                </p>
              </div>

              <div className="dashboard__item">
                <p className="dashboard__title">Дата регистрации:</p>
                <p className="dashboard__satus dashboard__satus_accent">
                  {`${moment(profile.createdAt).fromNow()}`}
                </p>
              </div>

              <div className="dashboard__item">
                <p className="dashboard__title">Ваш баланс:</p>
                <p className="dashboard__satus dashboard__satus_accent">
                  {profile.balance != 0 && profile.balance} руб.
                </p>
              </div>
            </div>
            <SelectAvatarContainer>
              <SelectAvatarTitle>
                Изображение пользователя
              </SelectAvatarTitle>
              <Avatar>
                {profile.avatar ? (
                  <AvatarUploaded src={profile.avatar.url} onError={() => setProfile(prev => { return { ...prev, avatar: false } })} />
                ) : (
                  profile.username?.substr(0, 1)?.toUpperCase()
                )}
              </Avatar>
              <UploadAvatar onClick={() => setPhotoModal(true)} className='default-btn mb-20'>
                Изменить изображение
              </UploadAvatar>
            </SelectAvatarContainer>
            <div className="profile__username">
              <div className="profile__username-title">Имя пользователя</div>
              <div className="profile__username-group">
                <input
                  defaultValue={profile.username}
                  readOnly
                  type="text"
                  className="profile__username-input"
                />
                <span className="profile__username-text">Видимо всем</span>
              </div>
            </div>

            <form
              onClick={toggleAddService}
              onSubmit={toggleAddService}
              className="profile-services__add-form"
            >
              <button
                onClick={toggleAddService}
                type="submit"
                className="profile-services__add-btn"
              >
                <i className="profile-services__add-btn-icon fas fa-plus"></i>
              </button>
              <span
                onClick={toggleAddService}
                className="profile-services__add-text"
              >
                Добавить абзац
              </span>
            </form>

            {services !== null && services.length > 0 ? (
              <div className="profile-services profile__services">
                {services.map((service) => {
                  return (
                    <ProfileService
                      id={service._id}
                      key={service._id}
                      title={service.title}
                      textContent={service.textContent}
                      categories={service.categories}
                      deleteService={deleteService}
                      setModalServiceEdit={setModalServiceEdit}
                      locked={service.locked}
                      getServices={getServices}
                    />
                  );
                })}
              </div>
            ) : (
              <NotService>У Вас еще нет услуг</NotService>
            )}
          </div>
          {photoModal && (
            <>
              <Background onClick={() => setPhotoModal(false)} />
              <Modal>
                <Row className="title">
                  <div className="modalTitle">Изменение изображения</div>
                  <div className="cross" onClick={() => setPhotoModal(false)}>
                    <i className="fas fa-times" />
                  </div>
                </Row>
                <div className="message">
                  <div>
                    <form action="#" enctype="multipart/form-data">
                      <div>
                        <label htmlFor="file">Выбирете изображение</label>
                        <input
                          type="file"
                          id="file"
                          name="file"
                          accept="image/jpeg,image/png,image/gif"
                          onChange={(event) => {
                            const file = event.target.files[0];
                            setFile(file);
                          }}
                        />
                      </div>
                    </form>
                  </div>
                </div>
                <Row className="btns">
                  <div onClick={() => setPhotoModal(false)} className="close">
                    Отмена
                  </div>
                  <div onClick={sendFileAvatar} className="confirm">
                    Сохранить
                  </div>
                </Row>
              </Modal>
            </>
          )}
        </>
      ) : (
        <>Загрузка...</>
      )
      }
    </>
  );
};

export default Profile;
