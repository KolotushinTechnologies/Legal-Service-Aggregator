import Axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import DealItem from './deal-item'
import './_index.scss'

const Deals = () => {
    const [dealsData, setDealsData] = useState()
    const [myProfileData, setMyProfileData] = useState()
    const [transferData, setTransferData] = useState([])

    useEffect(() => {
        getDeals()
        getMyProfile()
    }, [])

    const getDeals = async () => {
        const res = await Axios({
            url: 'http://localhost:5000/api/dealings',
            method: 'GET',
            headers: {
                Authorization: localStorage.token
            }
        })

        setDealsData(res.data)
    }
    const getMyProfile = async () => {
        const res = await Axios({
            url: `http://localhost:5000/api/users/profile`,
            method: "GET",
            headers: {
                Authorization: localStorage.token,
            },
        })
        setMyProfileData(res.data)
    }

    return (
        <div className="profile profile_deals">
            <p className="profile__title">Сделки, ожидающие подтверждения</p>
            <div className="profile__deals">
                {(myProfileData && dealsData) ? (
                    dealsData.filter(e => !e.confirmed).length > 0 ? (
                        dealsData.filter(e => !e.confirmed).map(deal => (
                            <DealItem key={deal._id}
                                transfer={{ transferData, setTransferData }}
                                deal={{
                                    _id: deal._id,
                                    price: deal.transactionAmount,
                                    number: `Сделка №${deal._id}`,
                                    condition: deal.termsOfAtransaction,
                                    confirmed: deal.confirmed,
                                    completed: deal.completed,
                                    rejected: deal.rejected,
                                    partner: deal.customer && deal.customer._id == myProfileData._id ? (
                                        { username: deal.executor && deal.executor.username, role: 'executor' }
                                    ) : { username: deal.customer && deal.customer.username, role: 'customer' }

                                }} />
                        ))
                    ) : <div>Нет активных сделок</div>
                ) : <div>Загрузка...</div>}
            </div>
            <p className="profile__title">Активные сделки</p>
            <div className="profile__deals">
                {(myProfileData && dealsData) ? (
                    dealsData.filter(e => e.confirmed && !e.completed && !e.rejected).lenght > 0 ? (
                        dealsData.filter(e => e.confirmed && !e.completed && !e.rejected).map(deal => (
                            <DealItem key={deal._id}
                                deal={{
                                    _id: deal._id,
                                    price: deal.transactionAmount,
                                    number: `Сделка №${deal._id}`,
                                    condition: deal.termsOfAtransaction,
                                    confirmed: deal.confirmed,
                                    completed: deal.completed,
                                    rejected: deal.rejected,
                                    partner: deal.customer && deal.customer._id == myProfileData._id ? (
                                        { username: deal.executor && deal.executor.username, role: 'executor' }
                                    ) : { username: deal.customer && deal.customer.username, role: 'customer' }

                                }} />
                        ))
                    ) : <div>Нет активных сделок</div>
                ) : <div>Загрузка...</div>}
                {transferData.lenght != 0 && transferData.map(deal => (
                    <DealItem key={deal._id}
                        deal={{
                            _id: deal._id,
                            price: deal.price,
                            number: `Сделка №${deal._id}`,
                            condition: deal.condition,
                            confirmed: true,
                            completed: deal.completed,
                            rejected: deal.rejected,
                            partner: { username: deal.partner.username, role: deal.partner.role }
                        }} />
                ))}
            </div>
            <p className="profile__title">Отменённые сделки</p>
            {console.log(dealsData?.filter(e => e.rejected))}
            <div className="profile__deals">
                {(myProfileData && dealsData) ? (
                    dealsData.filter(e => e.rejected).length > 0 ? (
                        dealsData.filter(e => e.rejected).map(deal => (
                            <DealItem key={deal._id}
                                deal={{
                                    _id: deal._id,
                                    price: deal.transactionAmount,
                                    number: `Сделка №${deal._id}`,
                                    condition: deal.termsOfAtransaction,
                                    confirmed: deal.confirmed,
                                    completed: deal.completed,
                                    rejected: deal.rejected,
                                    partner: deal.customer && deal.customer._id == myProfileData._id ? (
                                        { username: deal.executor && deal.executor.username, role: 'executor' }
                                    ) : { username: deal.customer && deal.customer.username, role: 'customer' }
                                }} />
                        ))
                    ) : <div>Нет отменённых сделок</div>
                ) : <div>Загрузка...</div>}
            </div>
            <Link to='/completedDeals' style={{ textDecoration: 'none' }}>
                Завершенные сделки
            </Link>
        </div>
    )
}

export default Deals