import Axios from 'axios';
import React, { useEffect, useState } from 'react';
import styled from "styled-components";
import Select from "@material-ui/core/Select";
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import { Link } from 'react-router-dom'

const NotificationsConteiner = styled.div`
    width: 100%;
    overflow: hidden;
`

const NotNotifications = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px;
  font-size: 30px;
`

const Title = styled.h1`
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 40px;
`

const ScrollContainer = styled.div`
    overflow-x: auto;
`

const TableContainer = styled.div`
    min-width: 850px;
`

const NotifItem = styled.div`
    border: none;
    outline: none;
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    margin-bottom: 15px;
    padding: 10px;
    background: ${props => props.unridden ? 'rgba(252, 23, 30, 0.2)' : '#fafafa'};
    cursor: ${p => p.disabled ? 'auto' : 'pointer'};
`

const NotifDiv = styled.div`
    padding: 0 5px;
    width: 8%;
    flex-grow: ${props => props.grow};
`

const LinkEmpty = styled(Link)`
    text-decoration: none;
    color: #333;
`

const getTime = (time) => {
    const ms = Date.parse(time)
    const dt = new Date(ms)
    const year = dt.getFullYear()
    const mounth = dt.getMonth() + 1
    const day = dt.getDate()
    const hours = dt.getHours()
    const minutes = dt.getMinutes()

    return `${hours < 10 ? '0' + hours : hours}:${minutes < 10 ? '0' + minutes : minutes}  ${day < 10 ? '0' + day : day}.${mounth < 10 ? '0' + mounth : mounth}.${year % 100}`
}

const NotificationHeader = ({ uniqTypes, filterData }) => {
    const [type, setType] = useState('');
    const [uniqType, setUniqType] = useState()

    useEffect(() => {
        setUniqType(uniqTypes)
    }, [uniqTypes])

    const handleChange = (event) => {
        let value = event.target.value
        setType(value)
        filterData(value)
    }

    return (
        <NotifItem disabled>
            <NotifDiv grow={1.5}>
                {uniqType ? <FormControl>
                    <InputLabel id="demo-simple-select-label">Тип</InputLabel>
                    <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={type}
                        onChange={handleChange}
                    >
                        <MenuItem value="">
                            <em>Все типы</em>
                        </MenuItem>
                        {uniqType.map(e => {
                            return <MenuItem value={e}>{e}</MenuItem>
                        })}
                    </Select>
                </FormControl> : 'Тип'}
            </NotifDiv>
            <NotifDiv grow={3}>Действие</NotifDiv>
            <NotifDiv grow={7}>Информация</NotifDiv>
            <NotifDiv grow={1}>Дата</NotifDiv>
        </NotifItem>
    )
}

const NotificationItem = ({ data }) => {
    const [notifData, setNotifData] = useState(data)

    if (data.notificationType === 'Комментарии') return (
        <LinkEmpty to={`/service/${data.serviceId}/page/${data.commentPage}${data.is_answer ? `?focusTo=${data.payload}&answerTo=${data.notificationName.match(/[0-9a-zA-Z]+/g)[0]}` : `?focusTo=${data.payload}`}`}>
            <NotifItem unridden={!notifData.notificationRead} disabled={false}>
                <NotifDiv grow={1.5}>{notifData.notificationType}</NotifDiv>
                <NotifDiv grow={3}>{notifData.notificationName}</NotifDiv>
                <NotifDiv grow={7}>{notifData.notificationText}</NotifDiv>
                <NotifDiv grow={1}>{getTime(notifData.createdAt)}</NotifDiv>
            </NotifItem>
        </LinkEmpty>
    )
    return (
        <NotifItem unridden={!notifData.notificationRead} disabled>
            <NotifDiv grow={1.5}>{notifData.notificationType}</NotifDiv>
            <NotifDiv grow={3}>{notifData.notificationName}</NotifDiv>
            <NotifDiv grow={7}>{notifData.notificationText}</NotifDiv>
            <NotifDiv grow={1}>{getTime(notifData.createdAt)}</NotifDiv>
        </NotifItem>
    )
}

const Notifications = () => {
    const [notifData, setNotifData] = useState()
    const [uniqTypes, setUniqTypes] = useState()
    const [filter, setFilter] = useState(null)

    useEffect(() => {
        getNotifications()
    }, [])

    const getNotifications = async () => {
        const res = await Axios({
            method: 'GET',
            url: 'http://localhost:5000/api/notifications',
            headers: {
                Authorization: localStorage.token
            }
        })

        setNotifData(res.data)
        setUniqTypes(Array.from(new Set(res.data.map(e => e.notificationType))))
    }
    const filterData = type => setFilter(type == '' ? null : type)

    if (notifData?.length <= 0) {
        return (
            <NotificationsConteiner>
                <NotNotifications>
                    Уведомления отсутствуют
                </NotNotifications>
            </NotificationsConteiner>
        )
    } else if (notifData) {
        return (
            <NotificationsConteiner>
                <Title>Уведомления</Title>
                <ScrollContainer>
                    <TableContainer>
                        <NotificationHeader uniqTypes={uniqTypes} filterData={filterData} />
                        {notifData.filter(notification => filter === null ? true : notification.notificationType === filter).map(el => <NotificationItem data={el} key={el._id} />)}
                    </TableContainer>
                </ScrollContainer>
            </NotificationsConteiner>
        )
    } else {
        return <NotificationsConteiner>Загрузка...</NotificationsConteiner>
    }
}

export default Notifications