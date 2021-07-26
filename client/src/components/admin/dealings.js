import React, { useState, useEffect } from "react";
import Axios from "axios";
import { Filter } from "./_index";
import Alert from "../alerts/Alert";
import DealingsItem from "./DealingsItem";
import "./_index.scss";

function DealingsAdmin() {
  const [dealings, setDealings] = useState([]);
  const [filteredDealings, setFilteredDealings] = useState([]);
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

  const onSetFilteredDealings = (e) => {
    let newList = [...dealings];
    let { value } = e.target;
    newList = newList.filter(
      (item) =>
        (item.customer && item.customer.email.includes(value)) ||
        (item.executor && item.executor.email.includes(value))
    );
    setFilteredDealings(newList);
  };

  useEffect(() => {
    getDealings();
  }, []);

  const getDealings = async () => {
    Axios({
      method: "GET",
      url: "http://localhost:5000/api/admin-panel/all-dealings",
      headers: {
        "Content-Type": "application/json",
        Authorization: localStorage.getItem("token"),
      },
    })
      .then((data) => {
        setDealings(data.data);
        setFilteredDealings(data.data);
      })
      .catch((err) => {
        if (err.response) {
          console.log(err.response);
        }
      });
  };

  const updateDealings = async (data) => {
    const changeDealings = async () => {
      await Axios({
        method: "PUT",
        url: `http://localhost:5000/api/admin-panel/dealings/completed-admin/${data._id}`,
        headers: {
          Authorization: localStorage.token,
        },
        // data: {
        //   ...data,
        // },
      })
        .then((res) => {
          setAlert({
            title: "Успешно",
            description: "Данные изменились",
            isActive: true,
          });
          getDealings();
          console.log(res.res);
        })
        .catch((err) => {
          console.log(err);
        });
    };
    changeDealings();
  };

  const deleteDealings = async (id) => {
    await Axios({
      method: "DELETE",
      url: `http://localhost:5000/api/admin-panel/delete-dealing/${id}`,
      headers: {
        Authorization: localStorage.token,
      },
    })
      .then((data) => {
        setAlert({
          title: "Успешно",
          description: "Успешное удаление сделки",
          isActive: true,
        });
        getDealings();
      })
      .catch((err) => {
        setAlert({
          title: "Ошибка",
          description: "Ошибка удаление сделки",
          isActive: true,
        });
      });
  };

  return (
    <>
      <Filter dealings={dealings} filterMethod={onSetFilteredDealings} />
      <div className="table">
        <table className="table__content">
          <thead>
            <tr>
              <th>Заказчик</th>
              <th>Исполнитель</th>
              <th>Условия сделки</th>
              <th>Сумма сделки</th>
              <th>Дата создания сделки</th>
              <th>Подтверждение сделки</th>
              <th>Завершение сделки заказчиком</th>
              <th>Завершение сделки администратором</th>
              <th>Идентификатор сделки</th>
            </tr>
          </thead>
          <tbody>
            {filteredDealings?.map((item, index) => {
              return (
                <DealingsItem
                  key={item._id}
                  updateDealing={updateDealings}
                  deleteDealing={deleteDealings}
                  _id={item._id}
                  date={item.date}
                  customer={item.customer && item.customer.email}
                  executor={item.executor && item.executor.email}
                  date={item.createdAt}
                  confirmed={item.confirmed}
                  completed={item.completed}
                  completedByAdmin={item.completedByAdmin}
                  termsOfAtransaction={item.termsOfAtransaction}
                  transactionAmount={item.transactionAmount}
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
  )
}

export default DealingsAdmin
