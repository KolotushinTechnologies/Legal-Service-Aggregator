import React, { useState } from "react";
import styled from "styled-components";
import { makeStyles } from "@material-ui/core/styles";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import { Link } from "react-router-dom";

import moment from 'moment'

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
    display: "block",
    marginTop: theme.spacing(2),
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
}));

const UserItem = ({
  updateUser,
  deleteUser,
  _id,
  services,
  balance,
  deposit,
  onlineUser,
  email,
  username,
  createdAt,
  city,
  rating,
  guarantorService,
  roles,
  password,
}) => {
  const classes = useStyles()

  const [data, setData] = useState({
    _id: _id ? _id : null,
    services: services ? services : null,
    balance: balance ? balance : 0,
    email: email ? email : "",
    username: username ? username : "",
    createdAt: createdAt ? createdAt : "",
    onlineUser: onlineUser ? onlineUser : false,
    city: city ? city : "",
    rating: rating ? rating : 0,
    guarantorService: guarantorService ? guarantorService : false,
    deposit: deposit ? deposit : 0,
    role: roles.indexOf('ADMIN') === -1 ? 0 : 1,
    password: password ? password : "",
  })
  const [confirmDeleteUser, setConfirmDeleteUser] = useState(false);

  const closeDeleteUser = () => {
    setConfirmDeleteUser(false);
  }
  const onChangeData = (e) => {
    const { name, value } = e.target;
    setData({ ...data, [name]: value })
  }
  const onSumbit = () => updateUser(data)
  const changeRole = (e) => setData(p => ({ ...p, role: e.target.value }))

  return (
    <tr style={data.role >= 1 ? { background: '#9cee90' } : {}}>
      <>
        <td>
          <input
            className='input__username'
            value={data.username}
            type="text"
            onChange={onChangeData}
            name="username"
          />
        </td>
        <td>
          <input
            className='input__email'
            onChange={onChangeData}
            name="email"
            value={data.email}
            type="text"
          />
        </td>
      </>
      <td>{moment(createdAt).format('DD.MM.YYYY')}</td>
      <td>{data.services.length}</td>
      <td>
        <input
          className='input__balance'
          onChange={onChangeData}
          name="balance"
          defaultValue={data.balance}
          type="number"
        />
      </td>
      <td>
        <input
          className='input__city'
          onChange={onChangeData}
          name="city"
          value={data.city}
          type="text"
        />
      </td>
      <td>
        <input
          className='input__rating'
          onChange={onChangeData}
          name="rating"
          value={data.rating}
          type="number"
        />
      </td>
      <td>{data.guarantorService ? 'Да' : 'Нет'}</td>
      <td>
        <input
          onChange={onChangeData}
          name="deposit"
          value={data.deposit}
          type="number"
        />
      </td>
      <td className='input__role'>
        {roles.indexOf('SUPERADMIN') !== -1 ?
          <FormControl className={classes.formControl}>
            <InputLabel>Выбор роли</InputLabel>
            <Select
              value={0}
              disabled>
              <MenuItem value={0}>Супепадминистратор</MenuItem>
            </Select>
          </FormControl>
          :
          <FormControl className={classes.formControl}>
            <InputLabel onChange={onChangeData}>Выбор роли</InputLabel>
            <Select
              value={data.role}
              onChange={changeRole}>
              <MenuItem value={0}>Пользователь</MenuItem>
              <MenuItem value={1}>Администратор</MenuItem>
            </Select>
          </FormControl>}
      </td>
      <td>
        <input
          className='input__password'
          onChange={onChangeData}
          name="password"
          value={data.password}
          type="text"
        />
      </td>
      <td>
        <Link to={`/user/${data._id}`} className="results__col-btn">
          Перейти
        </Link>
      </td>
      <th>
        <button onClick={onSumbit} className="default-btn default-btn_s1">
          Обновить
        </button>
      </th>
      <th>
        {confirmDeleteUser && (
          <>
            <Background onClick={closeDeleteUser} />
            <Modal>
              <Row className="title">
                <div className="modalTitle">Удаление</div>
                <div className="cross" onClick={closeDeleteUser}>
                  <i className="fas fa-times" />
                </div>
              </Row>
              <div className="message">
                <div>
                  <div>Удалить пользователя?</div>
                </div>
              </div>
              <Row className="btns">
                <div onClick={closeDeleteUser} className="close">
                  Отмена
                </div>
                <div
                  className="confirm"
                  onClick={() => {
                    deleteUser(_id);
                  }}
                >
                  Удалить
                </div>
              </Row>
            </Modal>
          </>
        )}
        <button
          onClick={() => setConfirmDeleteUser(true)}
          className='default-btn default-btn_s1'>
          Удалить
        </button>
      </th>
    </tr>
  );
};

export default UserItem;
