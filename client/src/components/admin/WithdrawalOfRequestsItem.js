import React, { useState } from 'react'
import styled from 'styled-components'
import moment from 'moment'
import { makeStyles } from '@material-ui/core/styles'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import FormControl from '@material-ui/core/FormControl'
import Select from '@material-ui/core/Select'
import { Link } from 'react-router-dom'

import './_index.scss'

const Background = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.6);
  transition: all 0.3s ease;
  z-index: 2;
`;

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
`;

const useStyles = makeStyles((theme) => ({
  button: {
    display: 'block',
    marginTop: theme.spacing(2),
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
}));

function WithdrawalOfRequestsItem({
  user,
  role,
  deposit,
  rating,
  yandex,
  visa,
  qiwi,
  bitcoin,
  completed,
  _id,
  date,
  updatePaymentApplication,
  deletePaymentApplication,
  userId,
  replenishmentAmount,
}) {
  const classes = useStyles()

  const handleChange = (e) => {
    setData({ ...data, completed: e.target.value })
  }

  const [data, setData] = useState({
    user: user ? user : null,
    role: role ? role : 0,
    deposit: deposit ? deposit : 0,
    rating: rating ? rating : 0,
    yandex: yandex ? yandex : false,
    visa: visa ? visa : false,
    qiwi: qiwi ? qiwi : false,
    bitcoin: bitcoin ? bitcoin : false,
    completed: completed ? completed : false,
    _id: _id ? _id : null,
    date: date ? date : null,
  });

  const [confirmDeletePaymentApplication, setConfirmDeletePaymentApplication] =
    useState(false);

  const closeDeletePaymentApplication = () => {
    setConfirmDeletePaymentApplication(false);
  };

  const onChangeData = (e) => {
    const { name, value } = e.target;
    setData({
      ...data,
      [name]: value,
    });
  };

  const onSubmit = () => {
    updatePaymentApplication(data);
  };

  return (
    <tr
      style={
        data.completed == false ? { background: 'rgba(252, 23, 30, 0.2)' } : {}
      }
    >
      {user ? (
        <>
          <td>{user}</td>
          <td>
            <input
              onChange={onChangeData}
              name='balance'
              defaultValue={replenishmentAmount}
              type='number'
            />
          </td>
          <td>{role}</td>
          <td>{deposit}</td>
          <td>{rating}</td>
        </>
      ) : (
        <>
          <td colspan='4'>Пользователь удален</td>
        </>
      )}

      <td>
        <h3 className='payment__yandex'>Yandex:</h3>{' '}
        {yandex ? 'Использует' : 'Не использует'}
        <br></br>
        <h3 className='payment__visa'>Visa:</h3>{' '}
        {visa ? 'Использует' : 'Не использует'}
        <br></br>
        <h3 className='payment__qiwi'>Qiwi:</h3>{' '}
        {qiwi ? 'Использует' : 'Не использует'}
        <br></br>
        <h3 className='payment__bitcoin'>Bitcoin:</h3>{' '}
        {bitcoin ? 'Использует' : 'Не использует'}
      </td>
      <td>
        <FormControl className={classes.formControl}>
          <InputLabel>
            Выбор одобрения
          </InputLabel>
          <Select
            value={data.completed}
            onChange={handleChange}>
            <MenuItem value={true}>
              Одобрена
            </MenuItem>
            <MenuItem value={false}>
              Не одобрена
            </MenuItem>
          </Select>
        </FormControl>
      </td>
      <td>{moment(date).format('DD.MM.YYYY')}</td>
      <td>{_id}</td>
      <th>
        <Link to={`/user/${userId}`} className='default-btn default-btn-s1'>
          Перейти
        </Link>
      </th>
      <th>
        <button onClick={onSubmit} className='default-btn default-btn-s1'>
          Редактировать
        </button>
      </th>
      <th>
        {confirmDeletePaymentApplication && (
          <>
            <Background onClick={closeDeletePaymentApplication} />
            <Modal>
              <Row className='title'>
                <div className='modalTitle'>
                  Удаление
                </div>
                <div className='cross' onClick={closeDeletePaymentApplication}>
                  <i className='fas fa-times' />
                </div>
              </Row>
              <div className='message'>
                <div>
                  <div>Удалить заявку?</div>
                </div>
              </div>
              <Row className='btns'>
                <div onClick={closeDeletePaymentApplication} className='close'>
                  Отмена
                </div>
                <div
                  className='confirm'
                  onClick={() => {
                    deletePaymentApplication(_id);
                  }}
                >
                  Удалить
                </div>
              </Row>
            </Modal>
          </>
        )}
        <button
          onClick={() => setConfirmDeletePaymentApplication(true)}
          className='default-btn'
        >
          Удалить
        </button>
      </th>
    </tr>
  );
}

export default WithdrawalOfRequestsItem;
