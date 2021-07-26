import React, { useMemo, useState } from 'react'

import get_payment_logo from '../payment/logo'
import './_index.scss'


const Payment = ({ readOnly = false, isChecked, click, name, choiceMethod, unchoiceMethod, id, boxs = true }) => {
    const logo = useMemo(() => get_payment_logo(name), [name])

    const [checked, setChecked] = useState(isChecked);

    const onCheck = async () => {
        !checked ? await choiceMethod(id) : await unchoiceMethod(id)
        setChecked(!checked)
        click()
    }

    if (readOnly) {
        return (<div className="payment" onClick={click}>
            {boxs && <span className='payment__checkbox'>
                {checked ? <i className="fas fa-check payment__checkbox-icon"></i> : null}
            </span>}
            <img src={logo} alt={name} className="payment__img" />
            {/* <span className='payments__label'>{name}</span> */}
        </div>)
    } else {
        return (<div onClick={onCheck} className="payment">
            {boxs && <span className='payment__checkbox'>
                {checked ? <i className="fas fa-check payment__checkbox-icon"></i> : null}
            </span>}
            <img src={logo} alt={name} className="payment__img" />
            {/* <span className='payments__label'>{name}</span> */}
        </div>)
    }
}

export default Payment