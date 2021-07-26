import Axios from "axios";
import React, { useEffect, useState } from "react";
import TransactionList from "../transactions/transaction-list";
import "./_index.scss";
import styled from "styled-components";

const NotTransaction = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px;
  font-size: 30px;
`

const Transactions = () => {
  const [transactionData, setTransactionData] = useState([]);
  const [load, setLoad] = useState(true);

  useEffect(() => {
    getTransaction();
  }, []);

  const getTransaction = async () => {
    const res = await Axios({
      url: `http://localhost:5000/api/transactions`,
      method: "GET",
      headers: {
        Authorization: localStorage.token,
      },
    });
    setTransactionData(res.data);
    setLoad(false);
    console.log(res.data);
  };

  return (
    <div className="profile profile_transactions">
      <h1 className="profile__title">Транзакции</h1>
      {/* select here */}
      {!load ? (
        <>
          <TransactionList transactions={transactionData} />
          {!transactionData[0] && (
            <NotTransaction>Транзакции отсутствуют</NotTransaction>
          )}
        </>
      ) : 'Загрузка...'}
    </div>
  );
};

export default Transactions;
