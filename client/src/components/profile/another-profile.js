import Axios from "axios";
import React, { useEffect, useRef, useState, useContext } from "react";
import {
  visa as visaIcon,
  bitcoin as bitcoinIcon,
  qiwi as qiwiIcon,
  yandexWallet,
} from "../../assets/images/_index";
import { useHistory } from "react-router-dom";
import styled, { css } from "styled-components";
import Payment from "./payment";
import Comment from "./comment";
import TextareaAutosize from "@material-ui/core/TextareaAutosize";
import FroalaEditorView from "react-froala-wysiwyg/FroalaEditorView";
import "froala-editor/css/froala_style.min.css";
import "froala-editor/css/froala_editor.pkgd.min.css";
import "./_index.scss";
import { compact, identity } from "lodash";
import { Editor } from "react-draft-wysiwyg";
import { EditorState, convertFromRaw, convertToRaw } from "draft-js";
import { UserContext } from "../../context/user/userContext";
import { AuthModal, ForgotModal, RegistrationModal } from "../modals/_index";
import { ModalContext } from "../../context/modal/modalContext";
import moment from "moment";
import "moment/locale/ru";
import Breadcrumbs from "@material-ui/core/Breadcrumbs";
import { Link } from "react-router-dom";

const min_width_avatar = css`
  min-width: 45px;
`

const Avatar = styled.div`
  background-color: #e1e1e1;
  height: 45px;
  width: 45px;
  border-radius: 50%;
  margin-left: 2vw;
  margin-right: 20px;
  font-size: 32px;
  color: #fff;
  text-align: center;
  line-height: 45px;
  ${min_width_avatar}
`;
const AvatarUploaded = styled.img`
  object-fit: cover;
  background-color: #e1e1e1;
  height: 45px;
  width: 45px;
  border-radius: 50%;
  margin-left: 2vw;
  margin-right: 20px;
  font-size: 32px;
  color: #fff;
  text-align: center;
  line-height: 45px;
  ${min_width_avatar}
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
  width: 900px;
  height: auto;
  border: 1px solid #c0c0c0;
  border-radius: 10px;
  background-color: #fff;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  padding: 25px 25px 55px 45px;
  .content {
    overflow: auto;
    max-height: 60vh;
  }
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
`;

const InputComment = styled.input`
  width: 100%;
  padding: 15px;
  border-radius: 5px;
  border: 1px solid #c0c0c0;
`;

const Send = styled.div`
  border: none;
  background-color: #fc171e;
  color: #fff;
  padding: 13px 32px;
  border-radius: 4px;
  margin-left: auto;
  font-size: 20px;
  cursor: pointer;
  margin-top: 30px;
  margin-bottom: 30px;
`;
const Redirection = styled.div`
  font-size: 20px;
  display: flex;
  justify-content: center;
  margin: 30px auto;
`;
const Auth = styled.div`
  cursor: pointer;
  text-decoration: underline;
`;

const Angle = styled.div`
  margin-left: 6px;
`;
const ListComments = styled.div`
  color: #7c7c7c;
  font-size: 28px;
  font-weight: 800;
  padding-left: 30px;
  width: max-content;
  cursor: pointer;
  display: flex;
`;

const NameBreadcrumbs = styled.div`
  ${props => props.admin && `color: #fc171e; font-weight: bold;`}
`

const AnotherProfile = ({ isSignedIn }) => {
  const history = useHistory();

  const [profileData, setProfileData] = useState(null);
  const [textArea, setTextArea] = useState(false);
  const [myPartners, setMyPartners] = useState([]);
  const [favorite, setFavorite] = useState(false);
  const [favoriteData, setFavoriteData] = useState({});
  const [favoriteAddIsOpen, setFavoriteAddIsOpen] = useState(false);
  const [favoriteDelIsOpen, setFavoriteDelIsOpen] = useState(false);
  const [alertConfirme, setAlertConfirme] = useState(false);
  const [myProfileData, setMyProfileData] = useState();
  const [paymentMethods, setPaymentMethods] = useState()

  const text = useRef(null);
  const cause = useRef("");

  let url = history.location.pathname.split("user/")[1];

  useEffect(() => {
    console.log("url изменился");
    console.log(url);
    getData();
  }, [url]);

  const getFavorites = async () => {
    const res = await Axios({
      method: "GET",
      url: "http://localhost:5000/api/favorites",
      headers: {
        Authorization: localStorage.token,
      },
    });

    res.data.map((e) => e.favoriteUser && e.favoriteUser._id).includes(url)
      ? setFavorite(true)
      : setFavorite(false);
    const nowFavId = await res.data?.filter(
      (e) => e.favoriteUser && e.favoriteUser._id == url
    )[0];
    !favoriteData && !favoriteData[0] && setFavoriteData(nowFavId);
  };

  useEffect(() => {
    getData();
    getPaymentMethods()
  }, []);

  const getData = async () => {
    Axios({
      url: `http://localhost:5000/api/users/profile/${url}`,
      method: "GET",
    })
      .then((data) => {
        setProfileData(data.data);
      })
      .catch((err) => {
        console.log("Ошибка во время загрузки другого профиля");
        history.replace('/404')
      });
    localStorage.token && getFavorites();
    if (!myProfileData && isSignedIn) {
      const myProfile = await Axios({
        url: `http://localhost:5000/api/users/profile`,
        method: "GET",
        headers: {
          Authorization: localStorage.token,
        },
      });

      console.log(myProfile.data);

      setMyProfileData(myProfile.data);
    }
  };

  const getPaymentMethods = async () => {
    const res = await Axios({
      url: `http://localhost:5000/api/payment-methods`,
      method: 'GET',
    })
    console.log(res.data)
    setPaymentMethods(res.data)
  }

  const Service = ({ title, textContent, serviceId, comments, url, categories }) => {
    const [commentModal, setCommentModal] = useState(false);
    const [commentsData, setCommentsData] = useState();

    const [commentsCount, setCommentsCount] = useState(comments.length);

    const incComCount = () => setCommentsCount((prev) => prev + 1);
    const decComCount = () => setCommentsCount((prev) => prev - 1);

    const [editorState, setEditorState] = useState(() =>
      EditorState.createEmpty()
    );

    const { user } = useContext(UserContext);
    const {
      modalAuth,
      modalRegistration,
      modalForgot,
      setModalAuth,
      setModalRegistration,
      setModalForgot,
    } = useContext(ModalContext);

    useEffect(() => {
      commentsCount > 0 && getComments();
    }, []);

    const getComments = async () => {
      const res = await Axios({
        method: "GET",
        url: `http://localhost:5000/api/services/all-comments/${serviceId}`,
      });

      console.log(res.data);
      setCommentsData(res.data.reverse());
    };

    const createComment = async (content) => {
      console.log(content);
      const res = await Axios({
        method: "POST",
        url: `http://localhost:5000/api/services/add-comment/${serviceId}`,
        data: {
          textComment: content,
        },
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.token,
        },
      });

      incComCount();
      console.log(res.data);
      await getComments();
    };

    const deleteComment = async (commentId) => {
      await Axios({
        method: "DELETE",
        url: `http://localhost:5000/api/services/delete-comment/${commentId}`,
        headers: {
          Authorization: localStorage.token,
        },
      });

      decComCount();

      await getComments();
    };
    return (
      <>
        <RegistrationModal />
        <AuthModal />
        <ForgotModal />

        <form
          className="profile-services__item"
          onClick={() => {
            history.push(`${history.location.pathname}/service/${serviceId}`);
          }}
        >
          <p className="profile-services__title">{title}</p>
          <p style={{paddingLeft: '30px'}}>
            {categories?.map((item, indx) => (
              <span key={indx} className="profile-form__tag">
                {item}
              </span>
            ))}
          </p>
          <p className="profile-services__description">{textContent}</p>
          
          {/* <ListComments onClick={() => setCommentModal(prev => !prev)} >
          <p className="profile-services__comment">
            Комментарии ({commentsCount})
          </p>
          <Angle>
              {commentModal ? <i className="fas fa-angle-up"/> : <i className="fas fa-angle-down"/>}
          </Angle>
        </ListComments> */}
        </form>
        {/* {commentModal && <> 
          <div className="content">
            {isSignedIn ? 
              <>
                <p className="profile-services__title">Оставить комментарий</p>
                <Editor
                  editorState={editorState}
                  toolbarClassName="toolbarClassName"
                  wrapperClassName="wrapperClassName"
                  editorClassName="editorClassName"
                  wrapperStyle={{width: '100%'}}
                  editorStyle={{width: '100%', border: '1px solid #F1F1F1'}}
                  toolbarStyle={{width: '100%'}}
                  onEditorStateChange={e => setEditorState(e)}/>
                <Row>
                  <Send onClick={() => {
                    setEditorState(() => EditorState.createEmpty())
                    createComment(JSON.stringify(convertToRaw(editorState.getCurrentContent())))
                  }}>
                    Отправить
                  </Send>
                </Row>
              </>
            : 
            <Redirection>
              Для того, чтобы написать комментарий, необходимо&nbsp;  
              <Auth  onClick={()=>{setModalRegistration(true)}}>
                авторизоваться
              </Auth>
            </Redirection>}
            {commentsData?.map(comItem => {
              return(
                <Comment 
                  createdAt={comItem.createdAt}
                  textComment={comItem.textComment}
                  userComment={comItem.userComment}
                  userResponses={comItem.userResponses}
                  id={comItem._id}
                  serviceId={comItem.service._id}
                  setCommentModal={setCommentModal}
                  url={url}
                  isSignedIn={isSignedIn}
                  myProfileData={myProfileData}
                  deleteComment={deleteComment}
                  key={comItem._id}
                />
              )
            })}  
          </div>
      </>} */}
      </>
    );
  };

  function Condition() {
    const [errAvatar, setErrAvatar] = useState(false)
    const getChat = async () => {
      //проверить наличие чата
      if (!myPartners[0]) {
        const res = await Axios({
          url: `http://localhost:5000/api/chat`,
          method: "GET",
          headers: {
            Authorization: localStorage.token,
          },
        });
        console.log(myProfileData);
        const partnersId = [
          ...res.data
            .map((e) => e.author && e.author._id)
            .filter((e) => e != myProfileData && myProfileData._id),
          ...res.data
            .map((e) => e.partner && e.partner._id)
            .filter((e) => e != myProfileData && myProfileData._id),
        ];
        setMyPartners(partnersId);
        partnersId.indexOf(profileData.user._id) != -1 &&
          history.push(`/messages/${profileData.user._id}`);
      }

      if (myPartners.indexOf(profileData.user._id) == -1) {
        setTextArea((prev) => !prev);
      } else {
        history.push(`/messages/${profileData.user._id}`);
      }
    };

    const startDialog = async () => {
      //прочитать данные
      let textMessage = text.current.value;
      //отправить запрос и перекинуть в чат
      await Axios({
        method: "POST",
        url: "http://localhost:5000/api/chat/create",
        data: {
          partner: profileData.user._id,
          textMessage,
        },
        headers: {
          Authorization: localStorage.token,
        },
      });

      history.push(`/messages/${profileData.user._id}`);
    };

    const toggleFavorites = () => {
      if (!favorite) {
        // add to favorite

        addFavorite();
      } else {
        //delete from favorite
        deleteFavorite();
      }
    };

    const addFavorite = async () => {
      // POST http://localhost:5000/api/favorites
      const res = await Axios({
        method: "POST",
        url: "http://localhost:5000/api/favorites",
        data: {
          favoriteUser: url,
          additionalText: cause.current.value,
        },
        headers: {
          Authorization: localStorage.token,
        },
      });
      setFavoriteAddIsOpen(false);
      setFavorite(true);
      setFavoriteData(res.data);
    };

    const deleteFavorite = async () => {
      // DELETE http://localhost:5000/api/favorites/:_id
      console.log(favoriteData._id);
      await Axios({
        method: "DELETE",
        url: `http://localhost:5000/api/favorites/${favoriteData._id}`,
        headers: {
          Authorization: localStorage.token,
        },
      });
      setFavoriteDelIsOpen(false);
      setFavorite(false);
    };

    if (profileData) {
      const {
        city,
        guarantorService,
        username,
        email,
        createdAt,
        deposit,
        rating,
        avatar,
        paymentMethods: { yandex, visa, qiwi, masterCard, bitcoin },
      } = profileData.user;

      const services = profileData.services;
      let categories = [];
      services.forEach((item) => categories.push(item.categories));

      let all_categories = [];
      categories.map((item) =>
        item.forEach((string) => all_categories.push(string))
      );

      let categories_upd = [];
      categories_upd = all_categories.filter(function (item, pos, self) {
        return self.indexOf(item) == pos;
      });
      console.log(services);
      console.log(categories);
      console.log(all_categories);
      console.log(categories_upd);

      const closeAddFavorites = () => {
        setFavoriteAddIsOpen(false);
      };

      const closeDelFavorites = () => {
        setFavoriteDelIsOpen(false);
      };

      const closeWriteMessage = () => {
        setTextArea(false);
      };

      return (
        <div>
          <Breadcrumbs style={{ marginBottom: "25px" }}>
            <Link to={"/"}>Главная</Link>
            <Link to={"/search"}>Поиск</Link>
            <NameBreadcrumbs admin={profileData.user.roles.includes('ADMIN')}>{profileData.user.roles.includes('ADMIN') ? `Администратор ` : `Пользователь `}{username}</NameBreadcrumbs>
          </Breadcrumbs>
          {favoriteAddIsOpen && (
            <>
              <Background onClick={closeAddFavorites} />
              <Modal>
                <Row className="title">
                  <div className="modalTitle">Добавить в избранное</div>
                  <div className="cross" onClick={closeAddFavorites}>
                    <i className="fas fa-times" />
                  </div>
                </Row>
                <div className="message">
                  <div>
                    <div>Добавить комментарий</div>
                    <InputComment ref={cause} placeholder="Комментарий" />
                  </div>
                </div>
                <Row className="btns">
                  <div onClick={closeAddFavorites} className="close">
                    Отмена
                  </div>
                  <div onClick={toggleFavorites} className="confirm">
                    Добавить
                  </div>
                </Row>
              </Modal>
            </>
          )}
          {favoriteDelIsOpen && (
            <>
              <Background onClick={closeDelFavorites} />
              <Modal>
                <Row className="title">
                  <div className="modalTitle">Удаление из избранного</div>
                  <div className="cross" onClick={closeDelFavorites}>
                    <i className="fas fa-times" />
                  </div>
                </Row>
                <div className="message">
                  <div>
                    <div>Удалить пользователя из избранного?</div>
                  </div>
                </div>
                <Row className="btns">
                  <div onClick={closeDelFavorites} className="close">
                    Нет
                  </div>
                  <div onClick={toggleFavorites} className="confirm">
                    Да
                  </div>
                </Row>
              </Modal>
            </>
          )}
          <h1 className="profile__title">
            {profileData.user.avatar && !errAvatar ? (
              <AvatarUploaded src={avatar.url} onError={() => setErrAvatar(true)} />
            ) : (
              <Avatar>{username?.substr(0, 1)?.toUpperCase()}</Avatar>
            )}
            <span className="profile__title-text">{username === undefined ? '-' : username}</span>
            {localStorage.token && (
              <>
                <button
                  onClick={() => favorite ? setFavoriteDelIsOpen(true) : setFavoriteAddIsOpen(true)}
                  className='profile__title-icon'
                >
                  <i
                    className={favorite ? "fas fa-bookmark" : "far fa-bookmark"}
                  />
                </button>
                <button onClick={getChat} className="profile__title-icon">
                  <i className="far fa-envelope"></i>
                </button>
              </>
            )}
          </h1>

          <div className="profile__form profile-form">
            <div className="default-group profile-form__group">
              <p className="profile-form__title">Регион / город</p>
              <input
                value={city ? city : ""}
                readOnly
                className="default-group__input"
                name="city"
                placeholder="Город"
                type="text"
              />
            </div>

            <div className="profile-form__group profile-form__group__text">
              <p className="profile-form__title">Работа через гарант сервис</p>
              <div className='default-checkbox profile-form__checkbox-colision'>
                <input
                  readOnly
                  defaultChecked={guarantorService ? !!guarantorService : false}
                  type="checkbox"
                  className="default-checkbox__input"
                />
                <label className="default-checkbox__label"></label>
              </div>
            </div>

            <div className="profile-form__group">
              <p className="profile-form__title">Принимаемые способы оплаты</p>
              <div className="payments">
                {paymentMethods.map(el =>
                  <Payment
                    readOnly
                    isChecked={!!profileData.user.paymentMethods.filter(method => method === el._id)[0]}
                    name={el.name}
                  />
                )}
              </div>
            </div>

            <div className="profile-form__group profile-form__group__text">
              <p className="profile-form__title">Дата регистрации</p>
              <div className="profile-form__tags">
                {`${moment(createdAt).fromNow()}`}
              </div>
            </div>

            <div className="profile-form__group profile-form__group__text">
              <p className="profile-form__title">Депозит</p>
              <div className="profile-form__tags">{deposit} руб.</div>
            </div>

            <div className="profile-form__group profile-form__group__text">
              <p className="profile-form__title">Рейтинг</p>
              <div className="profile-form__tags" style={{ display: "block" }}>
                <i className="results__col-star fas fa-star"></i> {rating}
              </div>
            </div>
            {profileData.user?.contacts && <>
              {profileData.user.contacts?.telegram &&
                <div className="profile-form__group">
                  <p className="profile-form__title">Telegram</p>
                  <div className="profile-form__tags" style={{ display: "block" }}>
                    {profileData.user.contacts.telegram}
                  </div>
                </div>
              }
              {profileData.user.contacts?.info &&
                <div className="profile-form__group">
                  <p className="profile-form__title">Дополнительная информация</p>
                  <div className="profile-form__tags" style={{ display: "block" }}>
                    {profileData.user.contacts.info}
                  </div>
                </div>
              }
            </>}
            <div className="profile-form__group">
              <p className="profile-form__title">Категории</p>
              <div className="profile-form__tags">
                {categories_upd.length > 0 ? (
                  categories_upd.map((item, indx) => (
                    <span key={indx} className="profile-form__tag">
                      {item}
                    </span>
                  ))
                ) : (
                  <span>Нет категорий</span>
                )}
              </div>
            </div>
          </div>

          {profileData.services !== null && profileData.services.length > 0 ? (
            <div
              style={{
                borderBottom: "1px solid #e2e2e2",
                borderBottomRightRadius: "10px",
                borderBottomLeftRadius: "10px",
              }}
              className="profile-services profile__services"
            >
              {profileData.services.map((service) => {
                return (
                  <Service
                    key={service._id}
                    title={service.title}
                    serviceId={service._id}
                    comments={service.comments}
                    url={url}
                    textContent={
                      <Editor
                        editorState={
                          //json test
                          /^[\],:{}\s]*$/.test(
                            service.textContent
                              .replace(/\\["\\\/bfnrtu]/g, "@")
                              .replace(
                                /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
                                "]"
                              )
                              .replace(/(?:^|:|,)(?:\s*\[)+/g, "")
                          )
                            ? EditorState.createWithContent(
                              convertFromRaw(JSON.parse(service.textContent))
                            )
                            : EditorState.createEmpty()
                        }
                        toolbarClassName="toolbarClassName"
                        wrapperClassName="wrapperClassName"
                        editorClassName="editorClassName"
                        wrapperStyle={{ width: "100%" }}
                        editorStyle={{ width: "100%" }}
                        toolbarStyle={{ display: "none" }}
                        readOnly={true}
                      />
                    }
                    categories={service.categories}
                  />
                );
              })}
            </div>
          ) : null}
          {textArea && (
            <>
              <Background onClick={closeWriteMessage} />
              <Modal>
                <Row className="title">
                  <div className="modalTitle">Написать сообщение</div>
                  <div className="cross" onClick={closeWriteMessage}>
                    <i className="fas fa-times" />
                  </div>
                </Row>
                <div className="message">
                  <div>
                    <div>Написать сообщение</div>
                    <TextareaAutosize
                      placeholder="Напишите сообщение..."
                      className="textarea__autosize"
                      ref={text}
                    />
                  </div>
                </div>
                <Row className="btns">
                  <div onClick={closeWriteMessage} className="close">
                    Отмена
                  </div>
                  <input
                    className="confirm"
                    type="button"
                    onClick={startDialog}
                    value="Отправить сообщение"
                  />
                </Row>
              </Modal>
            </>
          )}
        </div>
      );
    } else {
      return <div>Нет данных</div>;
    }
  }

  return (
    <React.Fragment>
      <div className="profile profile_settings">
        <Condition />
      </div>
    </React.Fragment>
  );
};

export default AnotherProfile;
