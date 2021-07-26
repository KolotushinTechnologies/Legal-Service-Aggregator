import React, { useState, useEffect } from "react";
import Axios from "axios";
import { Filter } from "./_index";
import Alert from "../alerts/Alert";
import TransactionsItem from "./TransactionsItem";
import "./_index.scss";
import qs from 'qs'
function TransactionsAdmin() {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [alert, setAlert] = useState({
    title: "",
    description: "",
    isActive: false,
  });

  const onChangeAlert = (active) => {
    setAlert({
      ...alert,
      isActive: active,
    });
  };

  const onSetFilteredTransactions = (e) => {
    let newList = [...transactions];
    let { value } = e.target;
    newList = newList.filter(
      (item) =>
        (item.payerUser && item.payerUser.email.includes(value)) ||
        (item.recipientUser && item.recipientUser.email.includes(value))
    );
    setFilteredTransactions(newList);
  };

  useEffect(() => {
    getTransactions();
  }, []);

  const getTransactions = async () => {
    Axios({
      method: "GET",
      url: "http://localhost:5000/api/admin-panel/all-transactions",
      headers: {
        "Content-Type": "application/json",
        Authorization: localStorage.getItem("token"),
      },
    })
      .then((data) => {
        setTransactions(data.data);
        setFilteredTransactions(data.data);
      })
      .catch((err) => {
        if (err.response) {
          console.log(err.response);
        }
      });
  };

  const updateTransactions = async (data) => {
    const changeTransactions = async () => {
      await Axios({
        method: "PUT",
        url: `http://localhost:5000/api/admin-panel/change-transaction/${data._id}`,
        headers: {
          Authorization: localStorage.token,
        },
        data: qs.stringify({
          status: `${data.status}`
        })
      })
        .then((res) => {
          setAlert({
            title: "Успешно",
            description: "Данные изменились",
            isActive: true,
          });
          getTransactions();
          console.log(res.res);
        })
        .catch((err) => {
          console.log(err);
        });
    };
    changeTransactions();
  };

  const deleteTransactions = async (id) => {
    await Axios({
      method: "DELETE",
      url: `http://localhost:5000/api/admin-panel/delete-transaction/${id}`,
      headers: {
        Authorization: localStorage.token,
      },
    })
      .then((data) => {
        setAlert({
          title: "Успешно",
          description: "Успешное удаление транзакции",
          isActive: true,
        });
        getTransactions();
      })
      .catch((err) => {
        setAlert({
          title: "Ошибка",
          description: "Ошибка удаления транзакции",
          isActive: true,
        });
      });
  };

  return (
    <>
      <Filter
        transactions={transactions}
        filterMethod={onSetFilteredTransactions}
      />
      <div className="table">
        <table className="table__content">
          <thead>
            <tr>
              <th>Отправитель(Плательщик)</th>
              <th>Получатель</th>
              <th>Статус отправки</th>
              <th>Сумма транзакции</th>
              <th>Дата проведения транзакции</th>
              <th>Идентификатор транзакции</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions?.map((item, index) => {
              return (
                <TransactionsItem
                  key={item._id}
                  updateTransaction={updateTransactions}
                  deleteTransaction={deleteTransactions}
                  payerUser={item.payerUser && item.payerUser.email}
                  recipientUser={item.recipientUser && item.recipientUser.email}
                  status={item.status}
                  transactionAmount={item.transactionAmount}
                  _id={item._id}
                  date={item.createdAt}
                />
              );
            })}
          </tbody>
        </table>
      </div>
      <Alert
        onChangeAlert={onChangeAlert}
        title={alert.title}
        description={alert.description}
        isActive={alert.isActive}
      />
    </>
  );
}

export default TransactionsAdmin;
