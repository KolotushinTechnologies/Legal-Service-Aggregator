import Axios from "axios";
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useHistory } from "react-router-dom";
import { Loader } from './_index'

const Scroll = styled.div`
  flex: 1 1 70%;
  visibility: ${props => props.visibility};
`
const Column = styled.div`
  display: flex;
  flex-direction: column;
  padding: 40px 20px 0 20px;
`
const ContentMessage = styled.div`
  margin: 10px; 
`
const PartnerMessage = styled.div`
  background-color: #ffffff; 
  border: solid 2px #e0e0e0;
  border-radius: 0 12px 12px 12px;
  margin-bottom: 30px;
  align-self: flex-start;
  max-width: 75%;
  word-wrap: break-word;
`
const MyMessage = styled.div`
  background-color: #f3f3f3;
  border: solid 2px #e0e0e0;
  border-radius: 12px 0 12px 12px;
  margin-bottom: 30px;
  align-self: flex-end;
  max-width: 75%;
  word-wrap: break-word;
`
const MyMessageDeal = styled.div`
  background-color: #4d4d4d;
  color: #fdfdfd;
  border: solid 2px #4d4d4d;
  border-radius: 12px 0 12px 12px;
  margin-bottom: 30px;
  align-self: flex-end;
  width: 50%;
  max-width: 500px;
  word-wrap: break-word;
  cursor: pointer;
  @media(max-width: ${p => p.theme.breakpoints.SMdesktop}) {
    width: 80%;
  }
`
const PartnerMessageDeal = styled.div`
  background-color: #4d4d4d; 
  color: #fdfdfd;
  border: solid 2px #4d4d4d;
  border-radius: 0 12px 12px 12px;
  margin-bottom: 30px;
  align-self: flex-start;
  width: 50%;
  max-width: 500px;
  word-wrap: break-word;
  cursor: pointer;
  @media(max-width: ${p => p.theme.breakpoints.SMdesktop}) {
    width: 80%;
  }
`
const DealPrice = styled.div`
  font-size: 30px;
  font-weight: 900;
  margin-bottom: 5px;
`
const DealText = styled.div`
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 20px;
`
const Status = styled.div`
  background-color: #ebebeb;
  color: #4d4d4d;
  cursor: pointer;
  min-width: 40%;
  border-radius: 16px;
  line-height: 40px;
  text-align: center;
  padding: 0 10px;
`

const ToDialogs = styled.i`
  font-size: 20px;
  position: absolute;
  background: #fc171e;
  padding: 5px;
  border-radius: 50%;
  color: #fff;
  cursor: pointer;
  @media(min-width: ${p => p.theme.breakpoints.SMdesktop}) {
    display: none;
  }
`

const Box = ({ setNewDialog, newDialog, profile, url, updateScroll, IsAdmin, myProfileData, setNewMes, asyncMes }) => {
  const [newDialogUpd, setNewDialogUpd] = useState(newDialog)
  const [profileData, setProfileData] = useState(profile)
  const [dealData, setDealData] = useState({})
  const [loaded, setLoaded] = useState(false)

  const history = useHistory()

  useEffect(() => {
    setNewDialogUpd(newDialog)
  }, [newDialog])

  useEffect(() => {
    newDialogUpd && asyncMes[0] && setNewDialogUpd(prev => [...prev, ...asyncMes])
  }, [asyncMes])

  useEffect(() => {
    (newDialogUpd && (newDialogUpd.length > 0)) && getDealData()
    IsAdmin && setLoaded(true)
  }, [newDialogUpd])

  useEffect(() => {
    setProfileData(profile)
    console.log(profile)
  }, [profile])

  const getDealData = async () => {
    setLoaded(false)
    setDealData({})
    let obj = {}
    if (!IsAdmin) {
      const res = await Axios({
        url: 'http://localhost:5000/api/dealings',
        method: 'GET',
        headers: {
          Authorization: localStorage.token
        }
      })

      for (let item of res.data) {
        obj = { ...obj, [item._id]: item }
      }
    } else if (IsAdmin) {
      // запрос для админа
      const res = await Axios({
        url: 'http://localhost:5000/api/admin-panel/all-dealings',
        method: 'GET',
        headers: {
          Authorization: localStorage.token
        }
      })
      for (let item of res.data) {
        obj = { ...obj, [item._id]: item }
      }
    }
    setDealData(obj)
    setLoaded(true)
    setNewMes && updateScroll()
  }

  const confirmDeal = async (id) => {
    await Axios({
      url: 'http://localhost:5000/api/dealings/confirm/' + id,
      method: 'PUT',
      headers: {
        Authorization: localStorage.token
      }
    })
    await getDealData()
  }
  const deleteDeal = async (id) => {
    await Axios({
      url: 'http://localhost:5000/api/dealings/remove/' + id,
      method: 'DELETE',
      headers: {
        Authorization: localStorage.token
      }
    })
    await getDealData()
  }
  const goBack = () => {
    setNewDialog(null)
    if (IsAdmin) history.push('/admin/chat')
    else history.push('/messages')
  }

  function Condition() {
    if (newDialogUpd === null) {
      return url ? <Loader /> : <div>Выберите собеседника</div>
    } else if (newDialogUpd) {
      if (!loaded) {
        setNewMes && setLoaded(true)
        setNewMes(false)
      }
      return (
        <Column>
          <ToDialogs className='fas fa-arrow-left' onClick={goBack} />
          {loaded && myProfileData ? newDialogUpd?.map((item) => {
            return (
              item.userMessage && (item.userMessage._id != myProfileData._id || !IsAdmin && profileData.user && profileData.user._id == item.userMessage._id) ?
                (!(dealData[item.dealMessage]) &&
                  !item.dealMessage ? (
                  <PartnerMessage key={item._id}>
                    <ContentMessage>
                      {IsAdmin && <span style={{ 'fontWeight': '900' }}>{!item.chat.administrators?.map(el => el._id).includes(item.userMessage._id) ? 'Пользователь' : 'Администратор'} {item.userMessage.username}: </span>}
                      {!IsAdmin && item.chat.administrators?.map(el => el._id).includes(item.userMessage._id) && <span style={{ 'fontWeight': '900' }}>Администратор {item.userMessage.username}: </span>}
                      {item.textMessage}
                      {` ${new Date(+Date.parse(item.createdAt)).getHours()}:${new Date(+Date.parse(item.createdAt)).getMinutes() < 10 ? '0' + new Date(+Date.parse(item.createdAt)).getMinutes() : new Date(+Date.parse
                        (item.createdAt)).getMinutes()}`}
                    </ContentMessage>
                  </PartnerMessage>
                ) : dealData[item.dealMessage] &&
                <PartnerMessageDeal key={item._id} onClick={() => !IsAdmin && history.push(`/deals`)}>
                  <ContentMessage>
                    <div>
                      {IsAdmin && <span style={{ 'fontWeight': '900' }}>Пользователь {item.userMessage.username}: </span>}
                      <div>
                        Сделка №{dealData[item.dealMessage]._id} на сумму:
                      </div>
                      <DealPrice>
                        {dealData[item.dealMessage].transactionAmount} руб.
                      </DealPrice>
                      <DealText>
                        {dealData[item.dealMessage].termsOfAtransaction}
                      </DealText>
                      <div style={{ display: 'flex', 'flexDirection': 'row', 'justifyContent': 'space-between' }}>
                        {dealData[item.dealMessage].completed ? (<Status>Завершена</Status>) : (dealData[item.dealMessage].confirmed ? <Status>Ждет завершения</Status> : !IsAdmin ? <div style={{ display: 'flex', 'flexDirection': 'row' }}>
                          <Status onClick={(e) => {
                            e.stopPropagation()
                            deleteDeal(item.dealMessage)
                          }}>Отклонить</Status>
                          <Status style={{ 'margin-left': '10px' }} onClick={(e) => {
                            e.stopPropagation()
                            confirmDeal(item.dealMessage)
                          }}>Подтвердить</Status></div> : <Status>Ждет подтверждения</Status>)}
                        <div style={{ 'alignItems': 'flexEnd', display: 'flex' }}>
                          {` ${new Date(+Date.parse(item.createdAt)).getHours()}:${new Date(+Date.parse(item.createdAt)).getMinutes() < 10 ? '0' + new Date(+Date.parse(item.createdAt)).getMinutes() : new Date(+Date.parse
                            (item.createdAt)).getMinutes()}`}
                        </div>
                      </div>
                    </div>
                  </ContentMessage>
                </PartnerMessageDeal>
                ) :
                (!(dealData[item.dealMessage]) &&
                  !item.dealMessage ? (
                  <MyMessage key={item._id}>
                    <ContentMessage>
                      {item.textMessage}
                      {` ${new Date(+Date.parse(item.createdAt)).getHours()}:${new Date(+Date.parse(item.createdAt)).getMinutes() < 10 ? '0' + new Date(+Date.parse(item.createdAt)).getMinutes() : new Date(+Date.parse(item.createdAt)).getMinutes()}`}
                      {item.readMessageUsers?.length != 0 ? <><i className="fas fa-check" /><i className="fas fa-check" /></> : <i className="fas fa-check" />}
                    </ContentMessage>
                  </MyMessage>
                ) : (dealData[item.dealMessage] &&
                  <MyMessageDeal key={item._id}>
                    <ContentMessage onClick={() => history.push(`/deals`)}>
                      <div>
                        <div>
                          Сделка №{dealData[item.dealMessage]._id} на сумму:
                        </div>
                        <DealPrice>
                          {dealData[item.dealMessage].transactionAmount} руб.
                        </DealPrice>
                        <DealText>
                          {dealData[item.dealMessage].termsOfAtransaction}
                        </DealText>
                        <div style={{ display: 'flex', 'flexDirection': 'row', 'justifyContent': 'space-between' }}>
                          {dealData[item.dealMessage].completed ? (<Status>Завершена</Status>) : (dealData[item.dealMessage].confirmed ? <Status onClick={(e) => {
                            e.stopPropagation()
                            history.push(`/deals/${item.dealMessage}`)
                          }}>Завершить</Status> : <Status>Ждет подтверждения</Status>)}
                          <div style={{ 'alignItems': 'flexEnd', display: 'flex' }}>
                            <div>
                              {` ${new Date(+Date.parse(item.createdAt)).getHours()}:${new Date(+Date.parse(item.createdAt)).getMinutes() < 10 ? '0' + new Date(+Date.parse(item.createdAt)).getMinutes() : new Date(+Date.parse(item.createdAt)).getMinutes()}`}
                              {item.readMessageUsers?.length != 0 ? <><i className="fas fa-check" /><i className="fas fa-check" /></> : <i className="fas fa-check" />}
                            </div>
                          </div>
                        </div>
                      </div>
                    </ContentMessage>
                  </MyMessageDeal>
                ))
            )
          }) : <Loader />}{updateScroll()}
        </Column>
      );
    } else {
      return <p>Нет сообщений</p>
    }
  }
  return (
    <Scroll id='chatbox'>
      <Condition />
    </Scroll>
  )
}

export default Box