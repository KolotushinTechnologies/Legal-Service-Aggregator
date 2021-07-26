import React, { useState, useEffect } from "react";
import Axios from "axios";
import { Filter } from "./_index";
import Alert from "../alerts/Alert";
import NotificationsComplaintsItem from "./NotificationsComplaintsItem";
import "./_index.scss";

function NotificationsComplaints() {
  const [notificationsComplaints, setNotificationsComplaints] = useState([]);
  const [
    filteredNotificationsComplaints,
    setFilteredNotificationsComplaints,
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

  const onSetFilteredNotificationsComplaints = (e) => {
    let newList = [...notificationsComplaints];
    let { value } = e.target;
    newList = newList.filter(
      (item) =>
        (item.userWhoIsComplaining &&
          item.userWhoIsComplaining.email.includes(value)) ||
        (item.userViolator && item.userViolator.email.includes(value))
    );
    setFilteredNotificationsComplaints(newList);
  };

  useEffect(() => {
    getNotificationsComplaints();
  }, []);

  const getNotificationsComplaints = async () => {
    Axios({
      method: "GET",
      url: " http://localhost:5000/api/notifications-admin-complaints",
      headers: {
        "Content-Type": "application/json",
        Authorization: localStorage.getItem("token"),
      },
    })
      .then((data) => {
        setNotificationsComplaints(data.data);
        setFilteredNotificationsComplaints(data.data);
      })
      .catch((err) => {
        if (err.response) {
          console.log(err.response);
        }
      });
  };

  const deleteNotificationsComplaints = async (id) => {
    await Axios({
      method: "DELETE",
      url: `http://localhost:5000/api/notifications-admin-complaints/delete/${id}`,
      headers: {
        Authorization: localStorage.token,
      },
    })
      .then((data) => {
        setAlert({
          title: "Успешно",
          description: "Успешное удаление уведомление о жалобе",
          isActive: true,
        });
        getNotificationsComplaints();
      })
      .catch((err) => {
        setAlert({
          title: "Ошибка",
          description: "Ошибка удаления уведомления о жалобе",
          isActive: true,
        });
      });
  };

  return (
    <>
      <Filter
        notificationsComplaints={notificationsComplaints}
        filterMethod={onSetFilteredNotificationsComplaints}
      />
      <div className="table">
        <table className="table__content">
          <thead>
            <tr>
              <th>Имя уведомления</th>
              <th>Текст жалобы</th>
              <th>Статус прочтения</th>
              <th>Пользоавтель, отправивший жалобу</th>
              <th>Пользователь, на которого отправили жалобу</th>
              <th>Дата создания уведомления</th>
              <th>Идентификатор уведомления</th>
            </tr>
          </thead>
          <tbody>
            {filteredNotificationsComplaints?.map((item, index) => {
              return (
                <NotificationsComplaintsItem
                  key={item._id}
                  deleteNotificationsComplaint={deleteNotificationsComplaints}
                  userWhoIsComplaining={
                    item.userWhoIsComplaining && item.userWhoIsComplaining.email
                  }
                  userViolator={item.userViolator && item.userViolator.email}
                  textComplainingNotify={item.textComplainingNotify}
                  readNotify={item.readNotify}
                  nameNotify={item.nameNotify}
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

export default NotificationsComplaints;
