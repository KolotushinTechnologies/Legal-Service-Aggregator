import Axios from 'axios';
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import DealItem from './deal-item'
import './_index.scss'

const CompletedDeals = () => {
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
            method: 'GET',
            headers: {
                Authorization: localStorage.token
            }
        })
        setMyProfileData(res.data)
    }

    return (
        <div className="profile profile_deals">
            <p className="profile__title">Завершенные сделки</p>
            <div className="profile__deals">
                {dealsData && console.log(dealsData.filter(e => e.completed))}
                {(myProfileData && dealsData) ? (
                    dealsData[0] ? (
                        dealsData.filter(e => e.completed).map(deal => (
                            <DealItem key={deal._id}
                                transfer={{ transferData, setTransferData }}
                                deal={{
                                    _id: deal._id,
                                    price: deal.transactionAmount,
                                    number: `Сделка №${deal._id}`,
                                    condition: deal.termsOfAtransaction,
                                    confirmed: deal.confirmed,
                                    completed: deal.completed,
                                    partner: deal.customer && deal.customer._id == myProfileData._id ? (
                                        { username: deal.executor && deal.executor.username, role: 'executor' }
                                    ) : { username: deal.customer && deal.customer.username, role: 'customer' }

                                }} />
                        ))
                    ) : <div>Нет завершенных сделок</div>
                ) : <div>Загрузка...</div>}
            </div>
            <Link to={'/deals'} style={{ textDecoration: 'none' }}>
                Активные сделки
            </Link>
        </div>
    )
}

export default CompletedDeals