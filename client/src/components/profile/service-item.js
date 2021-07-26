import styled from 'styled-components'
import Axios from 'axios'
import React, { useState, useCallback, useRef, useContext, useEffect } from 'react'
import { Editor } from 'react-draft-wysiwyg'
import { EditorState, convertToRaw } from 'draft-js'
import { useHistory } from 'react-router-dom'
import { Pagination } from '@material-ui/lab'

import Alert from '../alerts/Alert'
import Comment from './comment'
import { UserContext } from '../../context/user/userContext'
import { Underline } from '../footer/items/styles/style'
import { ModalContext } from '../../context/modal/modalContext'
import { AuthModal, ForgotModal, RegistrationModal } from '../modals/_index'

const Back = styled.div`
    cursor: pointer;
    padding-left: 30px;
`

const Angle = styled.div`
  margin-left: 6px;
`

const ListComments = styled.div`
  color: #7c7c7c;
  font-size: 28px;
  font-weight: 800;
  padding-left: 30px;
  width: max-content;
  cursor: pointer;
  display: flex;
`

const Row = styled.div`
  display: flex;
`

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
`

const Redirection = styled.div`
  font-size: 20px;
  display: flex;
  justify-content: center;
  margin: 30px auto;
`

const Auth = styled.div`
  cursor: pointer;
  text-decoration: underline;
`

const PaginationPlace = styled.div`
  display: flex;
  justify-content: center;
  
  .MuiPaginationItem-page.Mui-selected {
    color: #fff;
    background-color: #fc171e;
}`

const ServiceContent = ({ title, textContent, serviceId, comments, url, pageUrl = 1, focusTo, answerTo, isSignedIn, myProfileData }) => {
    const history = useHistory()

    const [alert, setAlert] = useState({
        title: "",
        description: "",
        isActive: false,
    });

    const onChangeAlert = (active) => {
        setAlert({
            ...alert,
            isActive: active,
        });
    };

    const [commentModal, setCommentModal] = useState(pageUrl != 1 || focusTo !== null);
    const [commentsData, setCommentsData] = useState();

    const [commentsCount, setCommentsCount] = useState(comments.length);
    const [pagesCount, setPagesCount] = useState(comments.length / 10 > 1 ? Math.ceil(comments.length / 10) : null)
    const [page, setPage] = useState(+pageUrl)

    const incComCount = useCallback(() => setCommentsCount((prev) => prev + 1), [commentsCount])
    const decComCount = useCallback(() => setCommentsCount((prev) => prev - 1), [commentsCount])
    const incPageCount = useCallback(() => setPagesCount((prev) => prev ? prev + 1 : 2), [pagesCount])
    const decPageCount = useCallback(() => setPagesCount((prev) => prev - 1 > 1 ? prev - 1 : null), [pagesCount])

    const [editorState, setEditorState] = useState(() =>
        EditorState.createEmpty()
    );

    const startComments = useRef(null)

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
        !commentsData && commentsCount > 0 && getComments(page);
    }, []);

    const getComments = async (page) => {
        if (page < 1) {
            history.push(`/service/${serviceId}`)
            return
        }
        const res = await Axios({
            method: "GET",
            url: `http://localhost:5000/api/services/all-comments/${serviceId}/page/${page}`,
        });
        !res.data[0] && history.push(`/service/${serviceId}`)
        console.log(res.data);
        setCommentsData(res.data);
    };

    // useEffect(() => {
    //   console.log(startComments.current)
    //   startComments.current && startComments.current.scrollIntoView({ behavior: "smooth" })
    // }, [pagesCount])

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

        incComCount()
        commentsCount % 10 == 0 && incPageCount()
        console.log(commentsCount + 1)
        console.log(res.data);
        await getComments(1)

        page != 1 && window.history.pushState("object or string", "Title", `/service/${url}/page/1`)
        setCommentModal(true)
    };

    const deleteComment = async (commentId) => {
        await Axios({
            method: "DELETE",
            url: `http://localhost:5000/api/services/delete-comment/${commentId}`,
            headers: {
                Authorization: localStorage.token,
            },
        });

        decComCount()

        if (commentsCount % 10 == 1) {
            decPageCount()

            if (pagesCount == page) {
                history.push(`/service/${serviceId}/page/${pagesCount - 1}`)
                return
            }
        }

        await getComments(page);
    };
    return (
        <>
            <Alert
                onChangeAlert={onChangeAlert}
                title={alert.title}
                description={alert.description}
                isActive={alert.isActive}
            />
            <RegistrationModal />
            <AuthModal />
            <ForgotModal />
            <Back onClick={() => history.goBack()}>
                {"<"}
                <Underline>Вернуться назад</Underline>
            </Back>
            <form className="profile-services__item">
                <p className="profile-services__title">{title}</p>
                <p className="profile-services__description">{textContent}</p>
                <ListComments onClick={() => setCommentModal((prev) => !prev)}>
                    <p className="profile-services__comment" ref={startComments}>
                        Комментарии ({commentsCount})
                    </p>
                    <Angle>
                        {commentModal ? (
                            <i className="fas fa-angle-up" />
                        ) : (
                            <i className="fas fa-angle-down" />
                        )}
                    </Angle>
                </ListComments>
            </form>
            {commentModal && (
                <>
                    <div className="content" >
                        {isSignedIn ? (
                            <>
                                <p className="profile-services__title">
                                    Оставить комментарий
                                </p>
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
                                            let textContentBlocks = convertToRaw(editorState.getCurrentContent()).blocks
                                            console.log(textContentBlocks)
                                            if (textContentBlocks.filter(blck => blck.text.trim() == '').length == textContentBlocks.length) {
                                                setAlert({
                                                    title: "Ошибка",
                                                    description: "Введите текст комментария",
                                                    isActive: true,
                                                })
                                            } else {
                                                setAlert({
                                                    title: "Успех",
                                                    description: "Комментарий опубликован",
                                                    isActive: true,
                                                })
                                                setEditorState(() => EditorState.createEmpty());
                                                createComment(
                                                    JSON.stringify(
                                                        convertToRaw(editorState.getCurrentContent())
                                                    )
                                                );
                                            }
                                        }}
                                    >
                                        Отправить
                                    </Send>
                                </Row>
                            </>
                        ) : (
                            <Redirection>
                                Для того, чтобы написать комментарий, необходимо&nbsp;
                                <Auth
                                    onClick={() => {
                                        setModalRegistration(true);
                                    }}
                                >
                                    авторизоваться
                                </Auth>
                            </Redirection>
                        )}
                        {commentsData?.map((comItem) => {
                            return (
                                <Comment
                                    id={comItem._id}
                                    createdAt={comItem.createdAt}
                                    textComment={comItem.textComment}
                                    userComment={comItem.userComment}
                                    userResponses={comItem.userResponses}
                                    serviceId={comItem.service._id}
                                    setCommentModal={setCommentModal}
                                    url={url}
                                    isSignedIn={isSignedIn}
                                    myProfileData={myProfileData}
                                    deleteComment={deleteComment}
                                    key={comItem._id}
                                    focusTo={focusTo}
                                    answerTo={answerTo}
                                />
                            );
                        })}
                        {pagesCount &&
                            <PaginationPlace>
                                <Pagination count={pagesCount} page={page} showFirstButton showLastButton
                                    onChange={async (event, value) => {
                                        if (value != page) {
                                            startComments.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
                                            setPage(value)
                                            await getComments(value)
                                            // window.history.pushState("object or string", "Title", `/service/${url}/page/${value}`)
                                            const reg = /\/page\/[0-9]+/gm
                                            if (reg.test(history.location.pathname)) {
                                                //console.log(history.location.pathname.replace(reg, `/page/${value}`))
                                                window.history.pushState("object or string", "Title", history.location.pathname.replace(reg, `/page/${value}`))
                                            } else {
                                                //console.log(`${history.location.pathname}/page/${value}`)
                                                window.history.pushState("object or string", "Title", `${history.location.pathname}/page/${value}`)
                                            }
                                        }
                                    }} />
                            </PaginationPlace>
                        }
                    </div>
                </>
            )}

        </>
    )
}

export default ServiceContent