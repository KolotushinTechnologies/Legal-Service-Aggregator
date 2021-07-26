import React, { useState, useEffect } from "react";
import Axios from "axios";
import { Filter } from "./_index";
import Alert from "../alerts/Alert";
import ComplaintsItem from "./ComplaintsItem";
import qs from "qs";
import "./_index.scss";

function ComplaintsAdmin() {
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
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

  const onSetFilteredComplaints = (e) => {
    let newList = [...complaints];
    let { value } = e.target;
    newList = newList.filter(
      (item) =>
        (item.userWhoIsComplaining &&
          item.userWhoIsComplaining.email.includes(value)) ||
        (item.userViolator && item.userViolator.email.includes(value))
    );
    setFilteredComplaints(newList);
  };

  useEffect(() => {
    getComplaints();
  }, []);

  const getComplaints = async () => {
    Axios({
      method: "GET",
      url: "http://localhost:5000/api/admin-panel/complaints/list",
      headers: {
        "Content-Type": "application/json",
        Authorization: localStorage.getItem("token"),
      },
    })
      .then((data) => {
        setComplaints(data.data);
        setFilteredComplaints(data.data);
      })
      .catch((err) => {
        if (err.response) {
          console.log(err.response);
        }
      });
  };

  const updateComplaints = async (data) => {
    const changeComplaints = async () => {
      await Axios({
        method: "PUT",
        url: `http://localhost:5000/api/admin-panel/complaints/${data._id}`,
        headers: {
          Authorization: localStorage.token,
        },
        data: qs.stringify({
          complaintsApproved: `${data.complaintsApproved}`,
        }),
      })
        .then((res) => {
          setAlert({
            title: "Успешно",
            description: "Данные изменились",
            isActive: true,
          });
          getComplaints();
          console.log(res.res);
        })
        .catch((err) => {
          console.log(err);
        });
    };
    changeComplaints();
  };

  const deleteComplaints = async (id) => {
    await Axios({
      method: "DELETE",
      url: `http://localhost:5000/api/admin-panel/complaints/${id}`,
      headers: {
        Authorization: localStorage.token,
      },
    })
      .then((data) => {
        setAlert({
          title: "Успешно",
          description: "Успешное удаление жалобы",
          isActive: true,
        });
        getComplaints();
      })
      .catch((err) => {
        setAlert({
          title: "Ошибка",
          description: "Ошибка удаления жалобы",
          isActive: true,
        });
      });
  };

  return (
    <>
      <Filter complaints={complaints} filterMethod={onSetFilteredComplaints} />
      <div className="table">
        <table className="table__content">
          <thead>
            <tr>
              <th>Пользователь, который отправил жалобу</th>
              <th>Пользователь, на которого отправили жалобу</th>
              <th>Причина жалобы</th>
              <th>Депозит пользователя, который отправил жалобу</th>
              <th>Депозит пользователя, на которого отправили жалобу</th>
              <th>Рейтинг пользователя, который отправил жалобу</th>
              <th>Рейтинг пользователя, на которого отправили жалобу</th>
              <th>Роль пользователя, который подал жалобу</th>
              <th>Роль пользователя, на которого подали жалобу</th>
              <th>Отклик на жалобу</th>
              <th>Дата отправки жалобы</th>
              <th>Идентификатор жалобы</th>
            </tr>
          </thead>
          <tbody>
            {filteredComplaints?.map((item, index) => {
              return (<>
              {console.log(item)}
                <ComplaintsItem
                  key={item._id}
                  updateComplaint={updateComplaints}
                  deleteComplaint={deleteComplaints}
                  userWhoIsComplaining={
                    item.userWhoIsComplaining && item.userWhoIsComplaining.email
                  }
                  userViolator={item.userViolator && item.userViolator.email}
                  depositUserWhoIsComplaining={
                    item.userWhoIsComplaining &&
                    item.userWhoIsComplaining.deposit
                  }
                  depositUserViolator={
                    item.userViolator && item.userViolator.deposit
                  }
                  ratingUserWhoIsComplaining={
                    item.userWhoIsComplaining &&
                    item.userWhoIsComplaining.rating
                  }
                  ratingUserViolator={
                    item.userViolator && item.userViolator.rating
                  }
                  roleUserWhoIsComplaining={
                    item.userWhoIsComplaining && item.userWhoIsComplaining.role
                  }
                  textComplaining={item.textComplaining}
                  roleUserViolator={item.userViolator && item.userViolator.role}
                  complaintsApproved={item.complaintsApproved}
                  _id={item._id}
                  date={item.createdAt}
                  chatId={item.chat}
                /></>
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

export default ComplaintsAdmin;
