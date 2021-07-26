import React, { useState } from 'react'
import styled from 'styled-components'
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

function DealingsItem({
  customer,
  executor,
  termsOfAtransaction,
  confirmed,
  completed,
  completedByAdmin,
  transactionAmount,
  _id,
  date,
  updateDealing,
  deleteDealing,
}) {
  const [data, setData] = useState({
    customer: customer ? customer : null,
    executor: executor ? executor : null,
    termsOfAtransaction: termsOfAtransaction ? termsOfAtransaction : '',
    confirmed: confirmed ? confirmed : false,
    completed: completed ? completed : false,
    completedByAdmin: completedByAdmin ? completedByAdmin : false,
    transactionAmount: transactionAmount ? transactionAmount : 0,
    _id: _id ? _id : null,
    date: date ? date : null,
  });

  const [confirmDeleteDealing, setConfirmDeleteDealing] = useState(false);

  const closeDeleteDealing = () => {
    setConfirmDeleteDealing(false);
  };

  const onChangeData = (e) => {
    const { name, value } = e.target;
    setData({ ...data, [name]: value });
  };

  const onSubmit = () => {
    updateDealing(data);
  };

  return (
    <tr>
      {customer && executor ? (
        <>
          <td>{customer}</td>
          <td>{executor}</td>
        </>
      ) : !customer && !executor ? (
        <>
          <td>Пользователи удалены</td>
          <td></td>
        </>
      ) : (
        <>
          <td>{customer || 'Пользователь удален'}</td>
          <td>{executor || 'Пользователь удален'}</td>
        </>
      )}

      <td>
        <input
          value={data.termsOfAtransaction}
          type='text'
          onChange={onChangeData}
          name='termsOfAtransaction'
        />
      </td>
      <td>
        <input
          value={data.transactionAmount}
          type='number'
          onChange={onChangeData}
          name='transactionAmount'
        />
      </td>
      <td>{moment(date).format('DD.MM.YYYY')}</td>
      <td>
        {data.confirmed == true
          ? 'Подтверждена исполнителем, в процессе работы'
          : 'Сделка еще не подтвердилась другим пользователем'}
      </td>
      <td>
        {data.completed == true
          ? 'Сделка завершена успешно заказчиком'
          : 'Сделка еще в процессе работы или не была подтверждена исполнителем'}
      </td>
      <td>
        {data.completedByAdmin == true
          ? 'Сделка завершена успешно администратором'
          : 'Сделка еще не завершена администратором'}
      </td>
      <td>{_id}</td>
      <th>
        <button onClick={onSubmit} className='default-btn default-btn-s1'>
          Редактировать
        </button>
      </th>
      <th>
        {confirmDeleteDealing && (
          <>
            <Background onClick={closeDeleteDealing} />
            <Modal>
              <Row className='title'>
                <div className='modalTitle'>Удаление</div>
                <div className='cross' onClick={closeDeleteDealing}>
                  <i className='fas fa-times' />
                </div>
              </Row>
              <div className='message'>
                <div>
                  <div>Удалить сделку?</div>
                </div>
              </div>
              <Row className='btns'>
                <div onClick={closeDeleteDealing} className='close'>
                  Отмена
                </div>
                <div
                  className='confirm'
                  onClick={() => {
                    deleteDealing(_id);
                  }}
                >
                  Удалить
                </div>
              </Row>
            </Modal>
          </>
        )}
        <button
          onClick={() => setConfirmDeleteDealing(true)}
          className='default-btn'
        >
          Удалить
        </button>
      </th>
    </tr>
  );
}

export default DealingsItem;
