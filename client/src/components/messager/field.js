import React, { useRef, useState } from 'react'
import Select from 'react-dropdown-select'
import Axios from 'axios'
import styled from 'styled-components'
import Popover from '@material-ui/core/Popover'

const SendPlace = styled.div`
  display: flex;
  height: 40px;
  margin: 20px 7vw 0 7vw;
  @media(max-width: ${p => p.theme.breakpoints.SMdesktop}) {
    flex-direction: column;
    height: auto;
  }
  input {
    flex: 1;
    border-radius: 25px 0 0 25px;
    border-bottom: 2px solid #f3f3f3;
    border-left: 2px solid #f3f3f3;
    border-top: 2px solid #f3f3f3;
    border-right: none;
    padding: 15px;
  }
`

const ActionsContainer = styled.div`
  display: flex;
`

const InputContainer = styled.div`
  width: 100%;
  display: flex;
  @media(max-width: ${p => p.theme.breakpoints.SMdesktop}) {
    margin-top: 26px;
  }
`

const Create = styled.div`
  background-color: #fc171e;
  width: 175px;
  border-radius: 16px;
  color: #fff;
  line-height: 40px;
  text-align: center;
  visibility: ${props => props.hiddenElem ? 'hidden' : 'visible'};
  cursor: ${props => props.hiddenElem ? 'default' : 'pointer'};
  margin-right: 10px;
`

const Setting = styled.div`
  padding: 8px 8px;
  font-size: 18px;
  visibility: ${props => props.hiddenElem ? 'hidden' : 'visible'};
  cursor: ${props => props.hiddenElem ? 'default' : 'pointer'};
`

const Send = styled.div`
  width: 45px;
  font-size: 20px;
  line-height: 35px;
  border-top: 2px solid #f3f3f3;
  border-bottom: 2px solid #f3f3f3;
  border-right: 2px solid #f3f3f3;
  border-radius: 0 25px 25px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-right: 10px;
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
`

const Modal = styled.div`
  z-index: 3;
  position: fixed;
  top: 10%;
  right: 50%;
  transform: translate(50%, 0);
  width: 30vw;
  max-width: 600px;
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
`

const InputDeal = styled.input`
  width: 100%;
  padding: 15px;
  margin: 5px;
  border-radius: 5px;
  border: 1px solid #c0c0c0;
  border: ${p => p.error ? '1px solid #fc171e' : '1px solid #c0c0c0'};
`

const SelectDealStyled = styled(Select)`
  margin: 5px;
  width: 100%;
  height: 47px;
  border-radius: 5px;
  border: 1px solid #c0c0c0;
`

const ErrorWrapper = styled.div`
  color: #fc171e;
`

const Field = ({ onSubmit, text, url, chats, profileData, getChat, IsAdmin }) => {
  const [alert, setAlert] = useState(false);
  const [reportModal, setReportModal] = useState(false)
  const [question, setQuestion] = useState(false)
  const [errorBalance, setErrorBalance] = useState(false)

  const transactionAmount = useRef('')
  const termsOfAtransaction = useRef('')
  const [deal, setDeal] = useState([{
    label: 'Гарант-Сервис Сделка',
    value: 'Гарант-Сервис Сделка'
  }])
  const reportRef = useRef('')

  const createInputForDeal = () => {
    setAlert(true);
  };
  const closeInputForDeal = () => {
    setAlert(false);
    setErrorBalance(false)
  };
  const createDeal = async () => {
    if (
      transactionAmount.current.value.length > 2 &&
      termsOfAtransaction.current.value.length > 2
    ) {
      try {
        const newDeal = await Axios({
          method: 'POST',
          url: 'http://localhost:5000/api/dealings',
          data: {
            executor: url,
            transactionAmount: transactionAmount.current.value,
            termsOfAtransaction: termsOfAtransaction.current.value,
            typeDealing: deal[0].value
          },
          headers: {
            Authorization: localStorage.token
          }
        })
        await Axios({
          method: "POST",
          url: `http://localhost:5000/api/messages/create/${chats.filter((e) =>
            e.partner && e.partner._id == profileData.user._id ||
            e.author && e.author._id == profileData.user._id)[0]._id}`,
          data: {
            dealMessage: newDeal.data._id
          },
          headers: {
            Authorization: localStorage.token
          }
        })
        closeInputForDeal()
        getChat()
      } catch (e) {
        // нету баланса - отобразить
        setErrorBalance(true)
        console.log(e)
      }
    }
  }

  const complaintToUser = async () => {
    if (reportRef.current.value.length > 2) {
      const res = await Axios({
        method: 'POST',
        url: `http://localhost:5000/api/complaints/${url}`,
        data: {
          textComplaining: reportRef.current.value,
          chat: chats.filter((e) =>
            e.partner && e.partner._id == profileData.user._id ||
            e.author && e.author._id == profileData.user._id)[0]._id
        },
        headers: {
          Authorization: localStorage.token,
        }
      })
      setReportModal(false)
    }
  }

  return (
    <>
      <SendPlace>
        <ActionsContainer>
          <Create onClick={() => setReportModal(true)} hiddenElem={IsAdmin}>
            Жалоба
          </Create>
          <Create onClick={createInputForDeal} hiddenElem={IsAdmin}>Создать сделку</Create>
          <Setting onMouseEnter={(event) => setQuestion(event.currentTarget)}
            onMouseLeave={() => setQuestion(null)}
            hiddenElem={IsAdmin}>
            <i className="far fa-question-circle" />
            <Popover
              transformOrigin={{
                vertical: 'top',
                horizontal: 'rigth',
              }}
              open={Boolean(question)}
              anchorEl={question}
              onClose={() => setQuestion(false)}
              disableRestoreFocus>
              <div style={{ width: '240px', padding: '5px 10px' }}>
                Создавая сделку или оставляя жалобу, Вы подтверждаете, что ознакомлены и полностью согласны с условиями пользования сайта
              </div>
            </Popover>
          </Setting>
        </ActionsContainer>
        <InputContainer>
          <input ref={text} type="text" placeholder="Введите сообщение" onKeyDown={e => {
            if (e.key === 'Enter') onSubmit(e)
          }} />
          <Send onClick={onSubmit}>
            <i className="fas fa-paper-plane"></i>
          </Send>
        </InputContainer>
      </SendPlace>
      {alert && (
        <>
          <Background onClick={closeInputForDeal} />
          <Modal>
            <Row className="title">
              <div className="modalTitle">Заключить сделку</div>
              <div className="cross" onClick={closeInputForDeal}>
                <i className="fas fa-times" />
              </div>
            </Row>
            <div className="message">
              <div>
                <div>Заполните поля</div>
                <InputDeal
                  ref={transactionAmount}
                  placeholder="Цена"
                  type="text"
                  error={errorBalance}
                  onChange={() => setErrorBalance(false)}
                />
                {errorBalance && <ErrorWrapper>У вас недостаточно баланса для проведения такой сделки!</ErrorWrapper>}
                <InputDeal
                  ref={termsOfAtransaction}
                  placeholder="Условиe"
                  type="text"
                />
                <SelectDealStyled
                  options={deals_data}
                  placeholder='Разделы'
                  color='#fc171e'
                  onChange={value => setDeal(value)}
                  values={deal}
                />
              </div>
            </div>
            <Row className="btns">
              <div onClick={closeInputForDeal} className="close">
                Отмена
              </div>
              <div onClick={createDeal} className="confirm">
                Создать
              </div>
            </Row>
          </Modal>
        </>
      )}
      {reportModal && (
        <>
          <Background onClick={() => setReportModal(false)} />
          <Modal>
            <Row className="title">
              <div className="modalTitle">Пожаловаться</div>
              <div className="cross" onClick={() => setReportModal(false)}>
                <i className="fas fa-times" />
              </div>
            </Row>
            <div className="message">
              <div>
                <div>Заполните поле</div>
                <InputDeal
                  ref={reportRef}
                  placeholder='Причина жалобы'
                />
              </div>
            </div>
            <Row className="btns">
              <div onClick={() => setReportModal(false)} className="close">
                Отмена
              </div>
              <div onClick={complaintToUser} className="confirm">
                Пожаловаться
              </div>
            </Row>
          </Modal>
        </>
      )}
    </>
  )
}

const deals_data = [
  {
    label: 'Депозит',
    value: 'Депозит'
  },
  {
    label: 'Гарант-Сервис Сделка',
    value: 'Гарант-Сервис Сделка'
  },
  {
    label: 'Реклама',
    value: 'Реклама'
  }
]

export default Field