import { visa, bitcoInIcon, qiwi, youMoney, webmoney, ethereum } from '../../assets/images/_index';

const get_payment_logo = (name) => {
    switch (name) {
        case 'Visa':
            return visa
        case 'BitCoin':
            return bitcoInIcon
        case 'Qiwi':
            return qiwi
        case 'ЮMoney':
            return youMoney
        case 'WebMoney':
            return webmoney
        case 'ethereum':
            return ethereum
        default:
            //throw new Error('logo_name_in_invalid')
    }
}

export default get_payment_logo