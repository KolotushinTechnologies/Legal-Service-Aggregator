import axios from "axios";
import jwt from 'jsonwebtoken'
import React, { useEffect, useRef, useState } from "react";
import { useHistory } from "react-router-dom";
import styled from "styled-components";
import moment from "moment";
import "moment/locale/ru";
import { Editor } from "react-draft-wysiwyg";
import { EditorState, convertFromRaw, convertToRaw } from "draft-js";
import { Link } from "react-router-dom";

const Content = styled.div`
  width: 100%;
  max-width: 1140px;
  margin: 0 auto;
  padding: 0 15px;
  display: flex;
  flex-direction: column;
`;
const Back = styled.div`
  padding-left: 9vw;
  cursor: pointer;
`;
const Underline = styled.span`
  text-decoration: underline;
`;
const Nws = styled.h1`
  font-size: 30px;
  font-weight: 900;
`;
const Title = styled.h2`
  font-size: 50px;
  font-weight: 900;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
const ArticleContent = styled.div`
  margin-bottom: 15px;
  @media(max-width: ${p => p.theme.breakpoints.SMdesktop}) {
    h2 {
      font-size: 22px !important;
    }
    img {
      width: auto !important;
      height: auto !important;
      max-width: 100% !important;
    }
  }
`;
const Date = styled.div`
  font-weight: 900;
  margin-bottom: 5px;
`;
const ButtPlace = styled.div`
  font-size: 14px;
`;
const Butt = styled.div`
  cursor: pointer;
  padding: 0 4px;
  margin-bottom: 4px;
`;
const ButtEdit = styled.div`
  border: ${(props) => (!props.white ? "1px solid #c0c0c0;" : "none")};
  background-color: ${(props) => (!props.white ? "#fff" : "#fc171e")};
  color: ${(props) => (!props.white ? "#333" : "#fff")};
  padding: 13px 32px;
  border-radius: 4px;
  font-size: 20px;
  cursor: pointer;
  width: 50%;
  display: flex;
  justify-content: center;
`;
const Row = styled.div`
  display: flex;
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
const AddNew = styled.div`
  font-size: 30px;
  font-weight: 800;
  padding-left: 30px;
  margin-bottom: 20px;
`;
const TitleInput = styled.input`
  min-height: 35px;
  width: 100%;
  padding-left: 10px;
  padding-right: 10px;
  border-radius: 5px;
  border: 1px solid #c0c0c0;
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
  top: 10%;
  right: 50%;
  transform: translate(50%, 0);
  width: 30vw;
  max-width: 400px;
  height: auto;
  border: 1px solid #c0c0c0;
  border-radius: 10px;
  background-color: #fff;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  padding: 25px 25px 55px 45px;
  overflow-y: auto;
  @media(max-width: ${p => p.theme.breakpoints.SMdesktop}) {
    width: 85vw;
    height: 82vh;
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
    div {
      @media(max-width: ${p => p.theme.breakpoints.SMdesktop}) {
        padding: 11px 28px;
        font-size: 14px;
      }
    }
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
`;

const Profile = styled.div`
  display: flex;
  align-items: center;
  font-size: 30px;
  font-weight: 900;
  margin: 10px 0;
`;

const AvatarUploaded = styled.img`
  background-color: #e1e1e1;
  object-fit: cover;
  height: 45px;
  width: 45px;
  border-radius: 50%;
  margin-right: 80px;
  margin-bottom: 20px;
  font-size: 95px;
  color: #fff;
  text-align: center;
  line-height: 145px;
`

const News = ({ isSignedIn }) => {
  const [newsData, setNewsData] = useState();
  const [myProfileData, setMyProfileData] = useState();
  const [isAdmin, setIsAdmin] = useState(false);

  const [editorState, setEditorState] = useState(() =>
    EditorState.createEmpty()
  );

  const titleText = useRef("");

  useEffect(() => {
    getNews();
  }, []);

  useEffect(() => {
    isAdmin && getAdminNews();
  }, [isAdmin]);

  const history = useHistory();

  // useEffect(() => console.log(newsData), [newsData])
  const getAdminNews = async () => {
    const res = await axios({
      method: "GET",
      url: `http://localhost:5000/api/news`,
      headers: {
        Authorization: localStorage.token,
      },
    });

    console.log(res.data);
    setNewsData(res.data);
  };

  const getSimpleNews = async () => {
    const res = await axios({
      method: "GET",
      url: `http://localhost:5000/api/news/blog`,
    });
    console.log(res.data);
    setNewsData(res.data);
  };

  const getNews = async () => {
    isSignedIn && !myProfileData && (await checkMyProfile());

    if (!newsData) {
      if (!isAdmin) {
        await getSimpleNews();
      }
    }
  };

  const checkMyProfile = () => {
    if (localStorage?.token && jwt.decode(localStorage.token.replace('Bearer ', '')).roles.indexOf('ADMIN') !== -1) setIsAdmin(true)
  }

  const createNews = async (title, textContent) => {
    const res = await axios({
      method: "POST",
      url: "http://localhost:5000/api/news",
      headers: {
        Authorization: localStorage.token,
      },
      data: {
        title,
        textContent,
      },
    });

    title = "";
    setEditorState(() => EditorState.createEmpty());
    await getAdminNews();
  };

  const deleteNews = async (id) => {
    await axios({
      method: "DELETE",
      url: `http://localhost:5000/api/news/${id}`,
      headers: {
        Authorization: localStorage.token,
      },
    });
    await getAdminNews();
  };

  return (
    <>
      <Back onClick={() => history.goBack()}>
        {"<"}
        <Underline>Вернуться назад</Underline>
      </Back>
      <Content>
        <Nws>Новости</Nws>
        {isAdmin && (
          <>
            <AddNew>Добавить новость</AddNew>
            <TitleInput ref={titleText} placeholder="Заголовок" type="text" />
            <Editor
              editorState={editorState}
              toolbarClassName="toolbarClassName"
              wrapperClassName="wrapperClassName"
              editorClassName="editorClassName"
              wrapperStyle={{ width: "100%" }}
              editorStyle={{ width: "100%", border: "1px solid #F1F1F1" }}
              toolbarStyle={{ width: "100%" }}
              onEditorStateChange={(e) => setEditorState(e)}
            />
            <Row>
              <Send
                onClick={() => {
                  createNews(
                    titleText.current.value,
                    JSON.stringify(
                      convertToRaw(editorState.getCurrentContent())
                    )
                  )
                }}>
                Отправить
              </Send>
            </Row>
          </>
        )}
        {newsData?.map((news) => {
          return (
            <NewsItem
              title={news.title}
              textContent={news.textContent}
              createdAt={news.createdAt}
              isAdmin={isAdmin}
              deleteNews={deleteNews}
              author={news.author}
              id={news._id}
              key={news._id}
            />
          );
        })}
      </Content>
    </>
  );
};

const NewsItem = ({
  title,
  textContent,
  createdAt,
  id,
  isAdmin,
  deleteNews,
  author,
}) => {
  const [activeEditComment, setActiveEditComment] = useState(false);
  const [saveEditorState, setSaveEditorState] = useState();
  const [deleteNewsModal, setDeleteNewsModal] = useState(false);
  const [titleNews, setTitleNews] = useState(title);
  const [errAvt, setErrAvt] = useState(false)
  const [editEditorState, setEditEditorState] = useState(() =>
    //json test
    /^[\],:{}\s]*$/.test(
      textContent
        .replace(/\\["\\\/bfnrtu]/g, "@")
        .replace(
          /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
          "]"
        )
        .replace(/(?:^|:|,)(?:\s*\[)+/g, "")
    )
      ? EditorState.createWithContent(convertFromRaw(JSON.parse(textContent)))
      : EditorState.createEmpty()
  );

  const titleText = useRef(titleNews);

  const editNews = async (id, title, textContent) => {
    await axios({
      method: "PUT",
      url: `http://localhost:5000/api/news/${id}`,
      headers: {
        Authorization: localStorage.token,
      },
      data: {
        title,
        textContent,
      },
    });
    setTitleNews(title);
  };

  return (
    <ArticleContent>
      <Title>
        {!activeEditComment ? (
          titleNews
        ) : (
          <TitleInput
            ref={titleText}
            defaultValue={titleNews}
            placeholder="Заголовок"
            type="text"
          />
        )}
        {isAdmin && !activeEditComment && (
          <ButtPlace>
            <Butt onClick={() => setDeleteNewsModal(true)}>
              <i className="fas fa-times" />
            </Butt>
            <Butt onClick={() => setActiveEditComment(true)}>
              <i className="fas fa-pen" />
            </Butt>
            {deleteNewsModal && (
              <>
                <Background onClick={() => setDeleteNewsModal(false)} />
                <Modal>
                  <Row className="title">
                    <div className="modalTitle">Удаление</div>
                    <div
                      className="cross"
                      onClick={() => setDeleteNewsModal(false)}
                    >
                      <i className="fas fa-times" />
                    </div>
                  </Row>
                  <div className="message">
                    Удалить новость?
                  </div>
                  <Row className="btns">
                    <div
                      onClick={() => setDeleteNewsModal(false)}
                      className="close"
                    >
                      Отмена
                    </div>
                    <div
                      onClick={() => {
                        deleteNews(id);
                        setDeleteNewsModal(false);
                      }}
                      className="confirm"
                    >
                      Удалить
                    </div>
                  </Row>
                </Modal>
              </>
            )}
          </ButtPlace>
        )}
      </Title>
      {isAdmin && author && (
        <Profile>
          <Avatar>{author?.avatar && !errAvt ? <AvatarUploaded src={author?.avatar.url} onError={() => setErrAvt(true)} /> : author?.username?.substr(0, 1)?.toUpperCase()}</Avatar>
          <Link to={`/user/${author?._id}`}>{author?.username}</Link>
        </Profile>
      )}
      {!activeEditComment && (
        <Date>{moment(createdAt).locale("ru").format("DD.MM.YY")}</Date>
      )}
      <div>
        <Editor
          editorState={editEditorState}
          toolbarClassName="toolbarClassName"
          wrapperClassName="wrapperClassName"
          editorClassName="editorClassName"
          wrapperStyle={{ width: "100%" }}
          editorStyle={{
            width: "100%",
            overflow: "visible",
            border: !activeEditComment ? "none" : "1px solid #F1F1F1",
            height: "auto",
          }}
          toolbarStyle={{ display: !activeEditComment ? "none" : "flex" }}
          readOnly={!activeEditComment}
          onEditorStateChange={(e) => {
            !saveEditorState &&
              activeEditComment &&
              setSaveEditorState(editEditorState);
            activeEditComment && setEditEditorState(e);
          }}
        />
        {activeEditComment && (
          <Row>
            <ButtEdit
              onClick={() => {
                setEditEditorState(
                  saveEditorState ? saveEditorState : editEditorState
                );
                setActiveEditComment(false);
                setSaveEditorState();
              }}
            >
              Отмена
            </ButtEdit>
            <ButtEdit
              white
              onClick={() => {
                //editResponse(id, comment._id, serviceId, JSON.stringify(convertToRaw(editEditorState.getCurrentContent())))
                editNews(
                  id,
                  titleText.current.value,
                  JSON.stringify(
                    convertToRaw(editEditorState.getCurrentContent())
                  )
                );
                setActiveEditComment(false);
                setSaveEditorState();
              }}
            >
              Изменить
            </ButtEdit>
          </Row>
        )}
      </div>
    </ArticleContent>
  );
};
export default News;
