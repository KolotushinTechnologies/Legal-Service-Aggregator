import React from 'react'
import { Grid } from '@material-ui/core'

function TransactionItem({ status, date, price, payer, recipient, typeTransaction }) {
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

    return (
        <Grid container spacing={0} className='transactions-list__item'>
            <Grid item xs={2} className='grid'><span>{payer}</span></Grid>
            <Grid item xs={1} className='grid'><i className='deal-item__icon fas fa-arrow-right' style={{ 'font-size': '14px', margin: 0 }} /></Grid>
            <Grid item xs={2} className='grid'><span>{recipient}</span></Grid>
            <Grid item xs={2} className='grid'><span>{`${price} руб.`}</span></Grid>
            <Grid item xs={2} className='grid'><span>{status && 'Операция выполнена успешно'}</span></Grid>
            <Grid item xs={2} className='grid'><span>{typeTransaction}</span></Grid>
            <Grid item xs={1} className='grid'><span>{getTime(date)}</span></Grid>
        </Grid>
    )
}

export default TransactionItem
