import React from 'react'
import { Link, useHistory } from 'react-router-dom'

import Payment from '../profile/payment'

const ResultContent = ({ user, paymentMethods }) => {
    const history = useHistory()

    return (<>
        <div className="results__content">
            <div className="results__col results__col_name">
                {user.username ? user.username : null}
            </div>
            <div className="results__col"><span className="results__col-city">{user.city ? user.city : null}</span>
            </div>
            <div className="results__col results__col_rating"><i className="results__col-star fas fa-star"></i>{user.rating ? +user.rating.toFixed(1) : null}</div>
            <div className="results__col results__col_center">
                {user.deposit ? (<span>От {user.deposit ? (user.deposit / 1000) : null} тыс. руб.</span>) : (<span>-</span>)}
            </div>
            <div className="results__col results__col_guarantor">
                {user.guarantorService ? (<span>Да</span>) : (<span>-</span>)}
            </div>
            <div className="results__col results__col_payment">
                <div className='results__payment-methods'>
                    {user.paymentMethods.length > 0 ? paymentMethods.sort((a, b) => {
                        if (user.paymentMethods.indexOf(a._id) !== -1 && user.paymentMethods.indexOf(b._id) === -1) return -1
                        else if (user.paymentMethods.indexOf(a._id) === -1 && user.paymentMethods.indexOf(b._id) !== -1) return 1
                        return 0
                    }).map(method =>
                        {if(user.paymentMethods.indexOf(method._id) !== -1){
                            return(<Payment
                                readOnly
                                isChecked={user.paymentMethods.indexOf(method._id) !== -1}
                                name={method.name}
                                boxs={false}
                            />)
                        } }
                    ) : '-'}
                </div>
            </div>
            <div className="results__col results__col_contact">
                <Link to={`/search/user/${user._id}`} className="results__col-btn">Cвязаться</Link>
            </div>
        </div>
        {user.services.map(e =>
            <div style={{ display: "table-row", textDecoration: "none", cursor: "pointer", border: "1px solid #333" }} onClick={() => history.push(`/search/user/${user._id}/service/${e._id}`)}>
                <div style={{ display: "flex", flexDirection: "column", textDecoration: "none", margin: "10px" }}>
                    <div style={{ fontSize: "18px" }}>{e.title}</div>
                    <div style={{ color: "#e1e1e1" }}>{e.textContent[0] == '{' ? JSON.parse(e.textContent).blocks.find(e => e.text.trim() != "").text.slice(0, 40) : e.textContent}</div>
                </div>
            </div>)}
    </>)
}

export default ResultContent;
