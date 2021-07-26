import React, { useState, useEffect } from "react";
import Axios from "axios";
import { Filter } from "./_index";
import Alert from "../alerts/Alert";
import NotificationsPaymentsApplicationsItem from "./NotificationsPaymentsApplicationsItem";
import "./_index.scss";

function NotificationsPaymentsApplications() {
  const [
    notificationsPaymentsApplications,
    setNotificationsPaymentsApplications,
  ] = useState([]);
  const [
    filteredNotificationsPaymentsApplications,
    setFilteredNotificationsPaymentsApplications,
  ] = useState([]);
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

  const onSetFilteredNotificationsPaymentsApplications = (e) => {
    let newList = [...notificationsPaymentsApplications];
    let { value } = e.target;
    newList = newList.filter(
      (item) =>
        item.userPaymentQuery && item.userPaymentQuery.email.includes(value)
    );
    setFilteredNotificationsPaymentsApplications(newList);
  };

  useEffect(() => {
    getNotificationsPaymentsApplications();
  }, []);

  const getNotificationsPaymentsApplications = async () => {
    Axios({
      method: "GET",
      url: "http://localhost:5000/api/notifications-admin-payment",
      headers: {
        "Content-Type": "application/json",
        Authorization: localStorage.getItem("token"),
      },
    })
      .then((data) => {
        setNotificationsPaymentsApplications(data.data);
        setFilteredNotificationsPaymentsApplications(data.data);
      })
      .catch((err) => {
        if (err.response) {
          console.log(err.response);
        }
      });
  };

  const deleteNotificationsPaymentsApplications = async (id) => {
    await Axios({
      method: "DELETE",
      url: `http://localhost:5000/api/notifications-admin-payment/delete/${id}`,
      headers: {
        Authorization: localStorage.token,
      },
    })
      .then((data) => {
        setAlert({
          title: "Успешно",
          description:
            "Успешное удаление уведомления о заявке на пополнение баланса пользователя",
          isActive: true,
        });
        getNotificationsPaymentsApplications();
      })
      .catch((err) => {
        setAlert({
          title: "Ошибка",
          description:
            "Ошибка удаления уведомления о заявке на пополнение баланса пользователя",
          isActive: true,
        });
      });
  };

  return (
    <>
      <Filter
        notificationsPaymentsApplications={notificationsPaymentsApplications}
        filterMethod={onSetFilteredNotificationsPaymentsApplications}
      />
      <div className="table">
        <table className="table__content">
          <thead>
            <tr>
              <th>Имя уведомления</th>
              <th>Сумма пополнения</th>
              <th>Статус прочтения</th>
              <th>Пользоавтель, отправивший заявку</th>
              <th>Username</th>
              <th>ID пользователя</th>
              <th>Дата создания уведомления</th>
              <th>Идентификатор уведомления</th>
            </tr>
          </thead>
          <tbody>
            {filteredNotificationsPaymentsApplications?.map((item, index) => {
              return (
                <NotificationsPaymentsApplicationsItem
                  key={item._id}
                  deleteNotificationsPaymentsApplication={
                    deleteNotificationsPaymentsApplications
                  }
                  userPaymentQuery={
                    item.userPaymentQuery && item.userPaymentQuery.email
                  }
                  userPaymentQueryUsername={
                    item.userPaymentQuery && item.userPaymentQuery.username
                  }
                  readNotify={item.readNotify}
                  nameNotify={item.nameNotify}
                  replenishmentAmount={item.replenishmentAmount}
                  _idUser={item.userPaymentQuery && item.userPaymentQuery._id}
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

export default NotificationsPaymentsApplications;
