import React, { useState } from "react";
import styled from "styled-components";
import "./_index.scss";

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
  top: 15%;
  right: 50%;
  transform: translate(50%, 0);
  width: 400px;
  height: auto;
  border: 1px solid #c0c0c0;
  border-radius: 10px;
  background-color: #fff;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  padding: 25px 25px 55px 45px;
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
`;

const Row = styled.div`
  display: flex;
`;

function NotificationsPaymentsApplicationsItem({
  userPaymentQuery,
  userPaymentQueryUsername,
  nameNotify,
  readNotify,
  replenishmentAmount,
  _idUser,
  _id,
  date,
  deleteNotificationsPaymentsApplication,
}) {
  const [data, setData] = useState({
    userPaymentQuery: userPaymentQuery ? userPaymentQuery : null,
    userPaymentQueryUsername: userPaymentQueryUsername
      ? userPaymentQueryUsername
      : null,
    nameNotify: nameNotify ? nameNotify : null,
    replenishmentAmount: replenishmentAmount ? replenishmentAmount : 0,
    readNotify: readNotify ? readNotify : false,
    _idUser: _idUser ? _idUser : null,
    _id: _id ? _id : null,
    date: date ? date : null,
  });

  const [
    confirmDeleteNotificationPaymentApplication,
    setConfirmDeleteNotificationPaymentApplication,
  ] = useState(false);

  const closeDeleteNotificationPaymentApplication = () => {
    setConfirmDeleteNotificationPaymentApplication(false);
  };

  const onChangeData = (e) => {
    const { name, value } = e.target;
    setData({
      ...data,
      [name]: value,
    });
  };

  return (
    <tr>
      <td>{nameNotify || 'Пользователь удален'}</td>
      <td>{replenishmentAmount}</td>
      <td>{readNotify ? "Прочитано" : "Не прочитано"}</td>
      <td>{userPaymentQuery || 'Пользователь удален'}</td>
      <td>{userPaymentQueryUsername}</td>
      <td>{_idUser}</td>
      <td>{date}</td>
      <td>{_id}</td>
      <th>
        {confirmDeleteNotificationPaymentApplication && (
          <>
            <Background onClick={closeDeleteNotificationPaymentApplication} />
            <Modal>
              <Row className="title">
                <div className="modalTitle">
                  Удалить уведомление о пополнении баланса пользователя
                </div>
                <div
                  className="cross"
                  onClick={closeDeleteNotificationPaymentApplication}
                >
                  <i className="fas fa-times" />
                </div>
              </Row>
              <div className="message">
                <div>
                  <div>
                    Удалить уведомление о пополнении баланса пользователя?
                  </div>
                </div>
              </div>
              <Row className="btns">
                <div
                  onClick={closeDeleteNotificationPaymentApplication}
                  className="close"
                >
                  Отмена
                </div>
                <div
                  className="confirm"
                  onClick={() => {
                    deleteNotificationsPaymentsApplication(_id);
                  }}
                >
                  Удалить
                </div>
              </Row>
            </Modal>
          </>
        )}
        <button
          onClick={() => setConfirmDeleteNotificationPaymentApplication(true)}
          className="default-btn"
        >
          Удалить
        </button>
      </th>
    </tr>
  );
}

export default NotificationsPaymentsApplicationsItem;
