import React, { useState } from 'react'
import styled from 'styled-components'
import moment from 'moment'
import { makeStyles } from '@material-ui/core/styles'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import FormControl from '@material-ui/core/FormControl'
import Select from '@material-ui/core/Select'
import { useHistory } from 'react-router-dom'

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

function ComplaintsItem({
  userWhoIsComplaining,
  userViolator,
  textComplaining,
  depositUserWhoIsComplaining,
  depositUserViolator,
  ratingUserWhoIsComplaining,
  ratingUserViolator,
  roleUserWhoIsComplaining,
  roleUserViolator,
  complaintsApproved,
  _id,
  date,
  updateComplaint,
  deleteComplaint,
  chatId
}) {
  const classes = useStyles()
  const history = useHistory()

  const handleChange = (e) => {
    setData({ ...data, complaintsApproved: e.target.value })
  }

  const [data, setData] = useState({
    userWhoIsComplaining: userWhoIsComplaining ? userWhoIsComplaining : null,
    userViolator: userViolator ? userViolator : null,
    textComplaining: textComplaining ? textComplaining : '',
    roleUserWhoIsComplaining: roleUserWhoIsComplaining
      ? roleUserWhoIsComplaining
      : 0,
    roleUserViolator: roleUserViolator ? roleUserViolator : 0,
    depositUserWhoIsComplaining: depositUserWhoIsComplaining
      ? depositUserWhoIsComplaining
      : 0,
    depositUserViolator: depositUserViolator ? depositUserViolator : 0,
    ratingUserWhoIsComplaining: ratingUserWhoIsComplaining
      ? ratingUserWhoIsComplaining
      : 0,
    ratingUserViolator: ratingUserViolator ? ratingUserViolator : 0,
    complaintsApproved: complaintsApproved ? complaintsApproved : false,
    _id: _id ? _id : null,
    date: date ? date : null,
  });

  const [confirmDeleteComplaint, setConfirmDeleteComplaint] = useState(false);

  const closeDeleteComplaint = () => {
    setConfirmDeleteComplaint(false);
  };

  const onChangeData = (e) => {
    const { name, value } = e.target;
    setData({
      ...data,
      [name]: value,
    });
  };

  const onSubmit = () => {
    updateComplaint(data);
  };

  return (
    <tr
      style={
        data.complaintsApproved == false
          ? { background: 'rgba(252, 23, 30, 0.2)' }
          : {}
      }
    >
      {userWhoIsComplaining && userViolator ? <>
        <td>{userWhoIsComplaining}</td>
        <td>{userViolator}</td>
      </> : !userWhoIsComplaining && !userViolator ? <>
        <td colspan='2'>Пользователи удалены</td>
      </> : <>
        <td>{userWhoIsComplaining || 'Пользователь удален'}</td>
        <td>{userViolator || 'Пользователь удален'}</td>
      </>
      }
      <td>{textComplaining}</td>
      <td>{depositUserWhoIsComplaining}</td>
      <td>{depositUserViolator}</td>
      <td>{ratingUserWhoIsComplaining}</td>
      <td>{ratingUserViolator}</td>
      <td>{roleUserWhoIsComplaining}</td>
      <td>{roleUserViolator}</td>
      <td>
        <FormControl className={classes.formControl}>
          <InputLabel>
            Выбор обработки
          </InputLabel>
          <Select
            value={data.complaintsApproved}
            onChange={handleChange}>
            <MenuItem value={true}>
              Обработана
            </MenuItem>
            <MenuItem value={false}>
              Не обработана
            </MenuItem>
          </Select>
        </FormControl>
      </td>
      <td>{moment(date).format('DD.MM.YYYY')}</td>
      <td>{_id}</td>

      {chatId && <th>
        <button onClick={() => {

          history.push(`chat/${chatId}`)
        }} className='default-btn default-btn-s1'>
          Перейти в чат
        </button>
      </th>}
      <th>
        <button onClick={onSubmit} className='default-btn default-btn-s1'>
          Редактировать
        </button>
      </th>
      <th>
        {confirmDeleteComplaint && (
          <>
            <Background onClick={closeDeleteComplaint} />
            <Modal>
              <Row className='title'>
                <div className='modalTitle'>Удаление</div>
                <div className='cross' onClick={closeDeleteComplaint}>
                  <i className='fas fa-times' />
                </div>
              </Row>
              <div className='message'>
                <div>
                  <div>Удалить жалобу?</div>
                </div>
              </div>
              <Row className='btns'>
                <div onClick={closeDeleteComplaint} className='close'>
                  Отмена
                </div>
                <div
                  className='confirm'
                  onClick={() => {
                    deleteComplaint(_id);
                  }}
                >
                  Удалить
                </div>
              </Row>
            </Modal>
          </>
        )}
        <button
          onClick={() => setConfirmDeleteComplaint(true)}
          className='default-btn'
        >
          Удалить
        </button>
      </th>
    </tr>
  );
}

export default ComplaintsItem;
