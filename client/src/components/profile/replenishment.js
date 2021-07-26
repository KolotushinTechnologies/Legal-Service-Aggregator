import Axios from 'axios'
import React, { useEffect, useRef, useState } from 'react'
import moment from 'moment'
import styled from 'styled-components'
import { Grid } from '@material-ui/core'

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

const InputSum = styled.input`
  width: 100%;
  padding: 15px;
  border-radius: 5px;
  border: 1px solid #c0c0c0;
`;

const GridContainer = styled(Grid)`
  padding: 5px;
  border-radius: 5px;
  background: #f3f3f3;
  margin: 5px;
  .MuiGrid-root {
    overflow: hidden;
    text-overflow: ellipsis;
    padding: 5px;
  }
`

const NotReplenishment = styled.div`
  display: flex;
  align-items: center;
  padding: 10px;
  font-size: 30px;
`

const Replenishment = () => {
  const [modalStatus, setModalStatus] = useState(false);
  const [paymentData, setPaymentData] = useState();
  const [load, setLoad] = useState(true)

  const text = useRef('');

  useEffect(() => {
    getPayment();
  }, []);

  const replenish = async () => {
    if (text && Number.isInteger(+text.current.value)) {
      await Axios({
        method: 'POST',
        url: 'http://localhost:5000/api/payment-system',
        data: {
          replenishmentAmount: text.current.value,
        },
        headers: {
          Authorization: localStorage.token,
        },
      });
      text.current.value = '';
      await getPayment();
      setModalStatus(false);
    }
  };

  const getPayment = async () => {
    const res = await Axios({
      method: 'GET',
      url: 'http://localhost:5000/api/payment-system',
      headers: {
        Authorization: localStorage.token,
      },
    });
    setPaymentData(res.data);
    setLoad(false)
  };

  const PaymentItem = ({ price, completed, dateCreate }) => {
    return (
      <GridContainer container spacing={0}>
        <Grid item xs={4}>{price}</Grid>
        <Grid item xs={4}>{completed ? 'Завершен' : 'Незавершен'}</Grid>
        <Grid item xs={4}>{moment(dateCreate).format('DD.MM.YYYY')}</Grid>
      </GridContainer>
    )
  }

  return (
    <div className='payment__page'>
      {modalStatus && (
        <>
          <Background onClick={() => setModalStatus(false)} />
          <Modal>
            <Row className='title'>
              <div className='modalTitle'>Введите сумму пополнения</div>
              <div className='cross' onClick={() => setModalStatus(false)}>
                <i className='fas fa-times' />
              </div>
            </Row>
            <div className='message'>
              <div>
                <div>Введите сумму пополнения</div>
                <InputSum ref={text} onChange={e => e.target.value = e.target.value.replace(/[^0-9]+/g, '')} />
              </div>
            </div>
            <Row className='btns'>
              <div onClick={() => setModalStatus(false)} className='close'>
                Отмена
              </div>
              <div className='confirm' onClick={replenish}>
                Пополнить
              </div>
            </Row>
          </Modal>
        </>
      )}
      <h1 className='profile__title'>Пополнение баланса</h1>
      <div className='default-btn mb-20' onClick={() => setModalStatus(true)}>
        Пополнить баланс
      </div>
      <div>
        <div>История</div>
        {!load
          ? paymentData[0] ? paymentData?.map((e) => {
            return (
              <PaymentItem
                price={e.replenishmentAmount}
                completed={e.completed}
                dateCreate={e.createdAt}
              />
            );
          }) : <NotReplenishment>
            Заявки на пополнение баланса отсутствуют
          </NotReplenishment>
          : 'Загрузка...'}
      </div>
    </div>
  );
};

export default Replenishment;
