import React, { useState } from 'react'
import styled from 'styled-components'
import moment from 'moment'
import { makeStyles } from '@material-ui/core/styles'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import FormControl from '@material-ui/core/FormControl'
import Select from '@material-ui/core/Select'

const Background = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.6);
  transition: all 0.3s ease;
  z-index: 2;
`

const Modal = styled.div`
  z-index: 3;
  position: fixed;
  top: 10%;
  right: 50%;
  transform: translate(50%, 0);
  width: 30vw;
  max-width: 400px;
  height: auto;
  border: 1px solid #c0c0c0;
  border-radius: 10px;
  background-color: #fff;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  padding: 25px 25px 55px 45px;
  overflow-y: auto;
  @media(max-width: ${p => p.theme.breakpoints.SMdesktop}) {
    width: 85vw;
    height: 82vh;
  }

  .title {
    justify-content: space-between;
    font-size: 20px;
  }
  .message {
    font-size: 16px;
    text-align: center;
    margin-top: 70px;
  }
  .modalTitle {
    font-size: 24px;
    padding-top: 20px;
  }
  .cross {
    font-size: 20px;
    height: 28px;
    padding: 0 6px 8px 6px;
    cursor: pointer;
  }
  .btns {
    margin-top: 65px;
    justify-content: center;
    cursor: pointer;
    text-align: center;
    font-size: 17px;
    div {
      @media(max-width: ${p => p.theme.breakpoints.SMdesktop}) {
        padding: 11px 28px;
        font-size: 14px;
      }
    }
  }
  .confirm {
    margin-left: 10px;
    border: 1px solid #c0c0c0;
    padding: 13px 32px;
    border-radius: 4px;
  }
  .close {
    border: none;
    background-color: #fc171e;
    color: #fff;
    padding: 13px 32px;
    border-radius: 4px;
  }
`

const Row = styled.div`
  display: flex;
`

const useStyles = makeStyles((theme) => ({
  button: {
    display: 'block',
    marginTop: theme.spacing(2),
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
}))

function TransactionsItem({
  payerUser,
  recipientUser,
  status,
  transactionAmount,
  _id,
  date,
  updateTransaction,
  deleteTransaction,
}) {
  const classes = useStyles()

  const [data, setData] = useState({
    payerUser: payerUser ? payerUser : null,
    recipientUser: recipientUser ? recipientUser : null,
    status: status === 'false' ? false : true,
    transactionAmount: transactionAmount ? transactionAmount : 0,
    _id: _id ? _id : null,
    date: date ? date : null,
  })
  const [confirmDeleteTransaction, setConfirmDeleteTransaction] = useState(false)

  const handleChange = (e) => {
    setData({ ...data, status: e.target.value })
  }
  const closeDeleteTransaction = () => {
    setConfirmDeleteTransaction(false)
  }
  const onSubmit = () => {
    updateTransaction(data)
  }

  return (
    <tr style={data.status == false ? { background: 'rgba(252, 23, 30, 0.2)' } : {}}>
      {payerUser && recipientUser ? <>
        <td>{payerUser}</td>
        <td>{recipientUser}</td>
      </> : !payerUser && !recipientUser ? <>
        <td>Пользователи удалены</td>
        <td></td>
      </> : <>
        <td>{payerUser || 'Пользователь удален'}</td>
        <td>{recipientUser || 'Пользователь удален'}</td>
      </>}
      <td>
        <FormControl className={classes.formControl}>
          <InputLabel>
            Выбор статуса
          </InputLabel>
          <Select value={data.status} onChange={handleChange}>
            {console.log(status)}
            <MenuItem value={true}>
              Успешно
            </MenuItem>
            <MenuItem value={false}>
              Не прошла
            </MenuItem>
          </Select>
        </FormControl>
      </td>
      <td>{transactionAmount}</td>
      <td>{moment(date).format('DD.MM.YYYY')}</td>
      <td>{_id}</td>
      <th>
        <button onClick={onSubmit} className='default-btn default-btn-s1'>
          Редактировать
        </button>
      </th>
      <th>
        {confirmDeleteTransaction && (
          <>
            <Background onClick={closeDeleteTransaction} />
            <Modal>
              <Row className='title'>
                <div className='modalTitle'>Удалить транзакцию</div>
                <div className='cross' onClick={closeDeleteTransaction}>
                  <i className='fas fa-times' />
                </div>
              </Row>
              <div className='message'>
                <div>
                  <div>Удалить транзакцию?</div>
                </div>
              </div>
              <Row className='btns'>
                <div onClick={closeDeleteTransaction} className='close'>
                  Отмена
                </div>
                <div
                  className='confirm'
                  onClick={() => {
                    deleteTransaction(_id);
                  }}
                >
                  Удалить
                </div>
              </Row>
            </Modal>
          </>
        )}
        <button
          onClick={() => setConfirmDeleteTransaction(true)}
          className='default-btn'
        >
          Удалить
        </button>
      </th>
    </tr>
  );
}

export default TransactionsItem;
