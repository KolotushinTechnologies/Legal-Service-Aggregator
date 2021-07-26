import Axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const DealItem = ({ deal, transfer }) => {
    const { _id, partner, number, price, condition, confirmed, completed, rejected } = deal;
    const { username, role } = partner
    //[transferData, setTransferData] = tranfer

    const [statusData, setStatusData] = useState()
    const [closeComp, setCloseComp] = useState(false)
    //console.log(setTranfer)
    useEffect(() => {
        setStatusData({
            confirmed,
            completed
        })
    }, [confirmed, completed])
    const confirmDeal = async () => {
        //http://localhost:5000/api/dealings/:_id
        await Axios({
            url: 'http://localhost:5000/api/dealings/confirm/' + _id,
            method: 'PUT',
            data: {
                'confirmed': 'true'
            },
            headers: {
                Authorization: localStorage.token
            }
        })

        setStatusData({
            confirmed: true,
            completed
        })
        transfer.setTransferData([
            ...transfer.transferData,
            deal
        ])
        setCloseComp(true)
    }
    const deleteDeal = async () => {
        await Axios({
            url: 'http://localhost:5000/api/dealings/remove/' + _id,
            method: 'DELETE',
            headers: {
                Authorization: localStorage.token
            }
        })

        setStatusData()
    }
    return (
        <div className='deal-item-container'>
            {statusData && (!closeComp && <div className="deal-item">
                <div className="deal-item__first">
                    <p className="deal-item__owner">Вы</p>
                    <div className="deal-item__direction">
                        {role == 'executor' ? <i className="deal-item__icon fas fa-arrow-right" /> : <i className="deal-item__icon fas fa-arrow-left" />}
                        <p className="deal-item__number">{_id}</p>
                    </div>
                    <p className="deal-item__partner">{username}</p>
                </div>
                <div>
                    {condition}
                </div>
                {rejected ?
                    <div className="deal-item__second">
                        <p className="deal-item__price">{`${price} руб.`}</p>
                        <div>Сделка отменена</div>
                    </div> : (
                        statusData.confirmed ?
                            !statusData.completed ?
                                <div className="deal-item__second">
                                    <p className="deal-item__price">{price + ' руб.'}</p>
                                    {role == 'executor' ? <Link to={`/deals/${_id}`} className="default-btn deal-item__btn">Завершить</Link> : <div>Заказчик еще не завершил сделку</div>}
                                </div> :
                                <p className="deal-item__price">{price + ' руб.'}</p>
                            : <div className="deal-item__second">
                                <p className="deal-item__price">{price + ' руб.'}</p>
                                {role == 'executor' ?
                                    <div>Клиент еще не подтвердил сделку</div> :
                                    <div>{console.log(statusData)}
                                        <div onClick={deleteDeal} className="default-btn deal-item__btn">Отклонить</div>
                                        <div onClick={confirmDeal} className="default-btn deal-item__btn" style={{ 'margin-left': '15px' }}>Подтвердить</div>
                                    </div>
                                }
                            </div>
                    )}
            </div>)}
        </div>)
}

export default DealItem