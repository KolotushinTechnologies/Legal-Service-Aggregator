import axios from 'axios'
import React, { useEffect, useRef, useState } from 'react'
import { useHistory } from 'react-router-dom'
import styled, { createGlobalStyle, keyframes, css } from 'styled-components'
import moment from 'moment'
import 'moment/locale/ru'
import { Editor } from 'react-draft-wysiwyg'
import { EditorState, convertFromRaw, convertToRaw } from 'draft-js'
import Alert from '../alerts/Alert'

const fadeout = keyframes`
    from {
        background: rgba(252,23,30,0.2);
    }
    to {
        background: transparent;
    }
`

const GlobalStyle = createGlobalStyle`
  body {
    overflow: ${props => (props.overflow && 'hidden')};
  }
`
const Response = styled.div`
    color: #7c7c7c;
    font-size: 28px;
    font-weight: 800;
    padding-left: 30px;
    width: max-content;
    cursor: pointer;
    display: flex;
    margin-bottom: 50px;
`

const avatarResponce = css`
    height: 80px;
    width: 80px;
    line-height: 80px;
    font-size: 42px;
`

const Avatar = styled.div`
    background-color: #e1e1e1;
    height: 120px;
    width: 120px;
    border-radius: 50%;
    font-size: 70px;
    color: #fff;
    text-align: center;
    line-height: 120px;
    margin-bottom: 5px;
    @media(max-width: ${p => p.theme.breakpoints.SMdesktop}) {
        ${p => p.isResponce && avatarResponce}
    }
`

const BodyComment = styled.div`
    display: flex;
    margin-bottom: 25px;
    animation: ${p => p.focused ? fadeout : null} 5s linear;
    animation-fill-mode: forwards;
    @media(max-width: ${p => p.theme.breakpoints.SMdesktop}) {
        flex-direction: column;
    }
`
const UserComment = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin-right: 15px;
    margin-left: ${props => props.response && '125px'};
    @media(max-width: ${p => p.theme.breakpoints.SMdesktop}) {
        margin: 0 15px;
    }
`
const ContentComment = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
    margin: 0 15px;
    @media(max-width: ${p => p.theme.breakpoints.SMdesktop}) {
        width: auto !important;
    }
`
const UserName = styled.div`
    font-weight: 900;
    font-size: 30px;
    color: #e1e1e1;
    text-decoration: underline;
    cursor: pointer;
`
const Rating = styled.div`
    color: #fc171e;
    display: flex;
    font-size: 26px;
`
const Deposit = styled.div`
    color: #e1e1e1;
    font-size: 18px;
`
const DateComment = styled.div`
    font-size: 18px;
    display: flex;
    justify-content: space-between;
    height: 56px;
`
const Angle = styled.div`
    margin-left: 6px;
`
const NoResponses = styled.div`
    font-size: 18px;
    display: flex;
    justify-content: center;
    margin-bottom: 35px;
`

const Answer = styled.div`
    font-size: 18px;
    text-decoration: underline;
    cursor: pointer;
    font-weight: 900;
`

const AnswerInput = styled.div`
    display: flex;
    flex-direction: column;
`
const Butt = styled.div`
    border: ${props => !props.white ? '1px solid #c0c0c0;' : 'none'};
    background-color: ${props => !props.white ? '#fff' : '#fc171e'};
    color: ${props => !props.white ? '#333' : '#fff'};
    padding: 13px 32px;
    border-radius: 4px;
    font-size: 20px;
    cursor: pointer;
    width: 50%;
    display: flex;
    justify-content: center;
`

const ButtPlace = styled.div`
    display: flex;
    justify-content: space-between;
`
const EditBtns = styled.div`
    display: flex;
    flex-direction: column;
    font-size: 14px;
`
const EditButton = styled.div`
    padding: 0 4px;
    color: #3b3b3b;
    margin-bottom: 5px;
    cursor: pointer;
`
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
`

const Row = styled.div`
  display: flex;
`;

const StarBackground = styled.i`
    position: absolute; 
    z-index: 2;
    font-size: inherit; /* и шрифту размер родителя */
    display: block; 
    top: 0; left: 0; bottom: 0;
    overflow: hidden;
    width: ${props => props.width ? props.width : '100%'};  
`
const Star = styled.i`
    position: relative;
    z-index: 1;
`
const SwitchRating = ({ rating }) => {
    const integer = Math.floor(rating)
    const fractional = +(rating - integer).toFixed(1)

    const FractionalStar = ({ fractionalRating }) => {
        const visualWidth = `${Math.round((Math.asin(2 * fractionalRating - 1) / Math.PI + 0.5) * 100)}%`

        return (
            <Star className='far fa-star'>
                <StarBackground className='fas fa-star' width={visualWidth} />
            </Star>
        )
    }

    switch (integer) {
        case 0:
            return (<>
                <i className='far fa-star' />
                <i className='far fa-star' />
                <i className='far fa-star' />
                <i className='far fa-star' />
                <i className='far fa-star' />
            </>)
        case 1:
            return (<>
                <i className='fas fa-star' />
                <FractionalStar fractionalRating={fractional} />
                <i className='far fa-star' />
                <i className='far fa-star' />
                <i className='far fa-star' />
            </>)
        case 2:
            return (<>
                <i className='fas fa-star' />
                <i className='fas fa-star' />
                <FractionalStar fractionalRating={fractional} />
                <i className='far fa-star' />
                <i className='far fa-star' />
            </>)
        case 3:
            return (<>
                <i className='fas fa-star' />
                <i className='fas fa-star' />
                <i className='fas fa-star' />
                <FractionalStar fractionalRating={fractional} />
                <i className='far fa-star' />
            </>)
        case 4:
            return (<>
                <i className='fas fa-star' />
                <i className='fas fa-star' />
                <i className='fas fa-star' />
                <i className='fas fa-star' />
                <FractionalStar fractionalRating={fractional} />
            </>)
        case 5:
            return (<>
                <i className='fas fa-star' />
                <i className='fas fa-star' />
                <i className='fas fa-star' />
                <i className='fas fa-star' />
                <i className='fas fa-star' />
            </>)
        default:
            return null
    }
}

const Comment = ({ createdAt, textComment, userComment, userResponses, id, serviceId, setCommentModal, url, isSignedIn, myProfileData, deleteComment, focusTo, answerTo }) => {
    const commentRef = useRef()

    const [responseData, setResponseData] = useState([])
    const [openRes, setOpenRes] = useState(answerTo === id)
    const [openAnswer, setOpenAnswer] = useState(false)
    const [editorState, setEditorState] = useState(() =>
        EditorState.createEmpty(),
    );
    const [editEditorState, setEditEditorState] = useState(() =>
        EditorState.createWithContent(convertFromRaw(
            JSON.parse(textComment)
        )))

    const [saveEditorState, setSaveEditorState] = useState()
    const [responsesCount, setResponsesCount] = useState(userResponses.length)
    const [deleteCommentModal, setDeleteCommentModal] = useState(false)
    const [activeEditComment, setActiveEditComment] = useState(false)

    const incRes = () => setResponsesCount(prev => prev + 1)
    const decRes = () => setResponsesCount(prev => prev - 1)
    const toggleRes = () => setOpenRes(prev => !prev)

    const [alert, setAlert] = useState({
        title: '',
        description: '',
        isActive: false,
    });

    const onChangeAlert = (active) => {
        setAlert({
            ...alert,
            isActive: active,
        });
    };

    useEffect(() => {
        responsesCount > 0 && getResponce()
    }, [])
    useEffect(() => {
        if (focusTo !== null && answerTo === null && focusTo === id && commentRef.current) {
            commentRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
                inline: 'center'
            })
        }
    }, [])

    const history = useHistory()

    const getResponce = async () => {
        const res = await axios({
            method: 'GET',
            url: `http://localhost:5000/api/services/all-responses-comments/${id}/service/${serviceId}`,
        })
        console.log(res.data)
        setResponseData(res.data?.reverse())
    }

    const createResponce = async (content) => {
        await axios({
            method: 'POST',
            url: `http://localhost:5000/api/services/add-response-comment/${id}/service/${serviceId}`,
            data: {
                responseText: content,
            },
            headers: {
                'Content-Type': 'application/json',
                Authorization: localStorage.token,
            },
        })

        incRes()
        await getResponce()
    }

    const editComment = async (commentId, textComment) => {
        await axios({
            method: 'PUT',
            url: `http://localhost:5000/api/services/edit-comment/${commentId}`,
            data: {
                textComment
            },
            headers: {
                Authorization: localStorage.token,
            },
        });
    }

    const editResponse = async (responseId, commentId, serviceId, responseText) => {
        await axios({
            method: 'PUT',
            url: `http://localhost:5000/api/services/edit-response-comment/${responseId}/comment/${commentId}/service/${serviceId}`,
            data: {
                responseText
            },
            headers: {
                Authorization: localStorage.token,
            },
        });
    }

    const deleteResponce = async (responceId, commentId, serviceId) => {
        await axios({
            method: 'DELETE',
            url: `http://localhost:5000/api/services/delete-response-comment/${responceId}/comment/${commentId}/service/${serviceId}`,
            headers: {
                Authorization: localStorage.token,
            },
        });

        decRes()
        await getResponce()
    }

    return (<>
        <GlobalStyle overflow={deleteCommentModal} />
        <Alert
            onChangeAlert={onChangeAlert}
            title={alert.title}
            description={alert.description}
            isActive={alert.isActive}
        />
        <BodyComment ref={focusTo === id ? commentRef : null} focused={focusTo === id}>
            <UserComment>
                <Avatar>
                    {userComment.username?.substr(0, 1)?.toUpperCase()}
                </Avatar>
                <UserName onClick={() => {
                    url != userComment._id && history.push(`/user/${userComment._id}`)
                    url != userComment._id && setCommentModal(false)
                }}>
                    {userComment.username}
                </UserName>
                <Rating>
                    <SwitchRating rating={+userComment.rating.toFixed(1)} />
                </Rating>
                <Deposit>
                    Депозит: {userComment.deposit}руб.
                </Deposit>
            </UserComment>
            <ContentComment>
                {!activeEditComment && <DateComment>
                    {moment(createdAt).locale('ru').format('DD.MM.YYYY hh:mm')}
                    {isSignedIn && (userComment._id == myProfileData?._id && <EditBtns>
                        <EditButton onClick={() => setDeleteCommentModal(true)}>
                            <i className='fas fa-times' />
                        </EditButton>
                        <EditButton onClick={() => setActiveEditComment(true)}>
                            <i className='fas fa-pen' />
                        </EditButton>
                        {deleteCommentModal && <>
                            <Background onClick={() => setDeleteCommentModal(false)} />
                            <Modal>
                                <Row className='title'>
                                    <div className='modalTitle'>Удаление</div>
                                    <div className='cross' onClick={() => setDeleteCommentModal(false)}>
                                        <i className='fas fa-times' />
                                    </div>
                                </Row>
                                <div className='message'>
                                    Удалить комментарий?
                                </div>
                                <Row className='btns'>
                                    <div onClick={() => setDeleteCommentModal(false)} className='close'>
                                        Отмена
                                    </div>
                                    <div onClick={() => deleteComment(id)} className='confirm'>
                                        Удалить
                                    </div>
                                </Row>
                            </Modal>
                        </>}
                    </EditBtns>)}
                </DateComment>}
                <Editor
                    editorState={
                        editEditorState
                    }
                    toolbarClassName='toolbarClassName'
                    wrapperClassName='wrapperClassName'
                    editorClassName='editorClassName'
                    wrapperStyle={{ width: '100%' }}
                    editorStyle={{ width: '100%', overflow: 'visible', border: !activeEditComment ? 'none' : '1px solid #F1F1F1', height: 'auto' }}
                    toolbarStyle={{ display: !activeEditComment ? 'none' : 'flex' }}
                    readOnly={!activeEditComment}
                    onEditorStateChange={e => {
                        !saveEditorState && activeEditComment && setSaveEditorState(editEditorState)
                        activeEditComment && setEditEditorState(e)
                    }} />
                <div style={{ marginTop: !activeEditComment ? 'auto' : '0' }}>
                    {activeEditComment && <Row>
                        <Butt onClick={() => {
                            setEditEditorState(saveEditorState ? saveEditorState : editEditorState)
                            setActiveEditComment(false)
                            setSaveEditorState()
                        }}>
                            Отмена
                        </Butt>
                        <Butt white onClick={() => {
                            let textContentBlocks = convertToRaw(editEditorState.getCurrentContent()).blocks
                            if (textContentBlocks.filter(blck => blck.text.trim() == '').length == textContentBlocks.length) {
                                setAlert({
                                    title: 'Ошибка',
                                    description: 'Введите текст комментария',
                                    isActive: true,
                                })
                            } else {
                                setAlert({
                                    title: 'Успех',
                                    description: 'Комментарий изменен',
                                    isActive: true,
                                })
                                editComment(id, JSON.stringify(convertToRaw(editEditorState.getCurrentContent())))
                                setActiveEditComment(false)
                                setSaveEditorState()
                            }
                        }}>
                            Изменить
                        </Butt>
                    </Row>}
                    {!activeEditComment && isSignedIn && <Answer onClick={() => setOpenAnswer(true)}>
                        ОТВЕТИТЬ
                    </Answer>}
                    {!activeEditComment && <hr align='center' width='310' size='2' color='#e1e1e1' />}
                </div>
            </ContentComment>
        </BodyComment>
        <AnswerInput>
            {openAnswer && !activeEditComment && <>
                <Editor
                    editorState={editorState}
                    toolbarClassName='toolbarClassName'
                    wrapperClassName='wrapperClassName'
                    editorClassName='editorClassName'
                    wrapperStyle={{ width: '100%', marginTop: '30px' }}
                    editorStyle={{ width: '100%', border: '1px solid #F1F1F1' }}
                    toolbarStyle={{ width: '100%' }}
                    onEditorStateChange={e => setEditorState(e)} />
                <ButtPlace>
                    <Butt onClick={() => {
                        setEditorState(() => EditorState.createEmpty())
                        setOpenAnswer(false)
                    }}>
                        Отмена
                    </Butt>
                    <Butt white onClick={() => {
                        console.log(convertToRaw(editorState.getCurrentContent()))
                        let textContentBlocks = convertToRaw(editorState.getCurrentContent()).blocks
                        if (textContentBlocks.filter(blck => blck.text.trim() == '').length == textContentBlocks.length) {
                            setAlert({
                                title: 'Ошибка',
                                description: 'Введите текст ответа',
                                isActive: true,
                            })
                        } else {
                            setAlert({
                                title: 'Успех',
                                description: 'Ответ опубликован',
                                isActive: true,
                            })
                            setEditorState(() => EditorState.createEmpty())
                            createResponce(JSON.stringify(convertToRaw(editorState.getCurrentContent())))
                            setOpenRes(true)
                            setOpenAnswer(false)
                        }
                    }}>
                        Отправить
                    </Butt>
                </ButtPlace>
            </>}
        </AnswerInput>
        <Response onClick={toggleRes}>
            Ответов({responsesCount})
            <Angle>
                {openRes ? <i className='fas fa-angle-up' /> : <i className='fas fa-angle-down' />}
            </Angle>
        </Response>
        {openRes && <>
            {responsesCount == 0 && <NoResponses>Пока никто не ответил на этот комментарий</NoResponses>}
            {responseData.map(res => {
                return (<>
                    <ResponceComment
                        focusTo={focusTo}
                        responseUser={res.responseUser}
                        createdAt={res.createdAt}
                        responseText={res.responseText}
                        comment={res.comment}
                        userComment={userComment}
                        id={res._id}
                        url={url}
                        setCommentModal={setCommentModal}
                        history={history}
                        myProfileData={myProfileData}
                        isSignedIn={isSignedIn}
                        deleteResponce={deleteResponce}
                        serviceId={serviceId}
                        editResponse={editResponse}
                        key={res._id}
                        answerTo={answerTo}
                        openRes={openRes}
                    />
                </>)
            })}
        </>}
    </>)
}

const ResponceComment = ({ responseUser, createdAt, responseText, comment, userComment, id, url, setCommentModal, history, myProfileData, isSignedIn, deleteResponce, serviceId, editResponse, focusTo, answerTo, openRes }) => {
    const subCommentRef = useRef()

    const [deleteCommentModal, setDeleteCommentModal] = useState(false)
    const [activeEditComment, setActiveEditComment] = useState(false)
    const [editEditorState, setEditEditorState] = useState(() =>
        EditorState.createWithContent(convertFromRaw(
            JSON.parse(responseText)
        )))

    const [saveEditorState, setSaveEditorState] = useState()
    const [alert, setAlert] = useState({
        title: '',
        description: '',
        isActive: false,
    });

    useEffect(() => {
        if (openRes && focusTo !== null && answerTo !== null && focusTo === id && subCommentRef.current) {
            subCommentRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
                inline: 'center'
            })
        }
    }, [])

    const onChangeAlert = (active) => {
        setAlert({
            ...alert,
            isActive: active,
        });
    };

    return (<>
        <Alert
            onChangeAlert={onChangeAlert}
            title={alert.title}
            description={alert.description}
            isActive={alert.isActive}
        />
        <BodyComment ref={focusTo === id ? subCommentRef : null} focused={focusTo === id}>
            <UserComment response>
                <Avatar isResponce>
                    {responseUser.username?.substr(0, 1)?.toUpperCase()}
                </Avatar>
                <UserName onClick={() => {
                    url != responseUser._id && history.push(`/user/${responseUser._id}`)
                    url != responseUser._id && setCommentModal(false)
                }}>
                    {responseUser.username}
                </UserName>
                <Rating>
                    <SwitchRating rating={+responseUser.rating.toFixed(1)} />
                </Rating>
                <Deposit>
                    Депозит: {responseUser.deposit}руб.
                </Deposit>
            </UserComment>
            <ContentComment>
                {!activeEditComment && <DateComment>
                    {moment(createdAt).locale('ru').format('DD.MM.YYYY hh:mm')}
                    {isSignedIn && (responseUser._id == myProfileData._id && <EditBtns>
                        <EditButton onClick={() => setDeleteCommentModal(true)}>
                            <i className='fas fa-times' />
                        </EditButton>
                        <EditButton onClick={() => setActiveEditComment(true)}>
                            <i className='fas fa-pen' />
                        </EditButton>
                        {deleteCommentModal && <>
                            <Background onClick={() => setDeleteCommentModal(false)} />
                            <Modal>
                                <Row className='title'>
                                    <div className='modalTitle'>Удаление</div>
                                    <div className='cross' onClick={() => setDeleteCommentModal(false)}>
                                        <i className='fas fa-times' />
                                    </div>
                                </Row>
                                <div className='message'>
                                    Удалить ответ?
                                </div>
                                <Row className='btns'>
                                    <div onClick={() => setDeleteCommentModal(false)} className='close'>
                                        Отмена
                                    </div>
                                    <div onClick={() => deleteResponce(id, comment._id, serviceId)} className='confirm'>
                                        Удалить
                                    </div>
                                </Row>
                            </Modal>
                        </>}
                    </EditBtns>)}
                </DateComment>}
                <Editor
                    editorState={
                        editEditorState
                    }
                    toolbarClassName='toolbarClassName'
                    wrapperClassName='wrapperClassName'
                    editorClassName='editorClassName'
                    wrapperStyle={{ width: '100%' }}
                    editorStyle={{ width: '100%', overflow: 'visible', border: !activeEditComment ? 'none' : '1px solid #F1F1F1', height: 'auto' }}
                    toolbarStyle={{ display: !activeEditComment ? 'none' : 'flex' }}
                    readOnly={!activeEditComment}
                    onEditorStateChange={e => {
                        !saveEditorState && activeEditComment && setSaveEditorState(editEditorState)
                        activeEditComment && setEditEditorState(e)
                    }} />
                <div style={{ marginTop: !activeEditComment ? 'auto' : '0' }}>
                    {activeEditComment && <Row>
                        <Butt onClick={() => {
                            setEditEditorState(saveEditorState ? saveEditorState : editEditorState)
                            setActiveEditComment(false)
                            setSaveEditorState()
                        }}>
                            Отмена
                        </Butt>
                        <Butt white onClick={() => {
                            let textContentBlocks = convertToRaw(editEditorState.getCurrentContent()).blocks
                            if (textContentBlocks.filter(blck => blck.text.trim() == '').length == textContentBlocks.length) {
                                setAlert({
                                    title: 'Ошибка',
                                    description: 'Введите текст ответа',
                                    isActive: true,
                                })
                            } else {
                                setAlert({
                                    title: 'Успех',
                                    description: 'Ответ изменен',
                                    isActive: true,
                                })
                                editResponse(id, comment._id, serviceId, JSON.stringify(convertToRaw(editEditorState.getCurrentContent())))
                                setActiveEditComment(false)
                                setSaveEditorState()
                            }
                        }}>
                            Изменить
                        </Butt>
                    </Row>}
                    {!activeEditComment && <hr align='center' width='310' size='2' color='#e1e1e1' />}
                </div>
            </ContentComment>
        </BodyComment>
    </>)
}

export default Comment;