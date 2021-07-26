import React, { useState } from 'react'
import { Grid, FormControl, InputLabel, Select, MenuItem } from '@material-ui/core'

import TransactionItem from './transaction-item'
import './index.scss'

const TransactionList = ({ transactions }) => {
    const [selectedType, setSelectedType] = useState(null)

    const change_type = (e) => {
        setSelectedType(e.target.value)
    }

    return (
        <div className='transactions-list'>
            <Grid container spacing={0} className='transactions-list__item'>
                <Grid item xs={2} className='grid'><span>Отправитель</span></Grid>
                <Grid item xs={1} className='grid'><i className='deal-item__icon fas fa-arrow-right' style={{ 'font-size': '14px', margin: 0 }} /></Grid>
                <Grid item xs={2} className='grid'><span>Получатель</span></Grid>
                <Grid item xs={2} className='grid'><span>Стоимость</span></Grid>
                <Grid item xs={2} className='grid'><span>Статус</span></Grid>
                <Grid item xs={2} className='grid'>
                    <FormControl>
                        <InputLabel>Тип</InputLabel>
                        <Select value={selectedType} onChange={change_type}>
                            <MenuItem value={null}>
                                Все типы
                            </MenuItem>
                            <MenuItem value='Депозит'>
                                Депозит
                            </MenuItem>
                            <MenuItem value='Гарант-Сервис Сделка'>
                                Гарант-Сервис Сделка
                            </MenuItem>
                            <MenuItem value='Реклама'>
                                Реклама
                            </MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={1} className='grid'><span>Дата</span></Grid>
            </Grid>
            {transactions.filter(transaction => {
                if (selectedType === null) return true
                else return transaction.typeTransaction === selectedType
            }).map((e) => (
                <TransactionItem
                    key={e.numberTransaction}
                    number={e.numberTransaction}
                    status={e.status}
                    date={e.createdAt}
                    price={e.transactionAmount}
                    payer={e.payerUser.username}
                    recipient={e.recipientUser.username}
                    typeTransaction={e.typeTransaction}
                />
            ))}
        </div>
    )
}

export default TransactionList