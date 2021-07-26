import React, { useState, useEffect } from "react";
import Axios from "axios";
import { Filter } from "./_index";
import Alert from "../alerts/Alert";
import PaymentApplicationsItem from "./PaymentApplicationsItem";
import qs from "qs";
import "./_index.scss";

function PaymentSystemApplicationsAdmin() {
  const [paymentApplications, setPaymentApplications] = useState([]);
  const [
    filteredPaymentApplications,
    setFilteredPaymentApplications,
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

  const onSetFilteredPaymentApplications = (e) => {
    let newList = [...paymentApplications];
    let { value } = e.target;
    newList = newList.filter(
      (item) => item.user && item.user.email.includes(value)
    );
    setFilteredPaymentApplications(newList);
  };

  useEffect(() => {
    getPaymentApplications();
  }, []);

  const getPaymentApplications = async () => {
    Axios({
      method: "GET",
      url: "http://localhost:5000/api/admin-panel/payment-system/applications",
      headers: {
        "Content-Type": "application/json",
        Authorization: localStorage.getItem("token"),
      },
    })
      .then((data) => {
        setPaymentApplications(data.data);
        setFilteredPaymentApplications(data.data);
      })
      .catch((err) => {
        if (err.response) {
          console.log(err.response);
        }
      });
  };

  const updatePaymentApplications = async (data) => {
    const changePaymentApplications = async () => {
      await Axios({
        method: "PUT",
        url: `http://localhost:5000/api/admin-panel/payment-system/applications/${data._id}`,
        headers: {
          Authorization: localStorage.token,
        },
        data: qs.stringify({
          completed: `${data.completed}`,
        }),
      })
        .then((res) => {
          setAlert({
            title: "Успешно",
            description: "Данные изменились",
            isActive: true,
          });
          getPaymentApplications();
          console.log(res.res);
        })
        .catch((err) => {
          console.log(err);
        });
    };
    changePaymentApplications();
  };

  const deletePaymentApplications = async (id) => {
    await Axios({
      method: "DELETE",
      url: `http://localhost:5000/api/admin-panel/payment-system/applications/${id}`,
      headers: {
        Authorization: localStorage.token,
      },
    })
      .then((data) => {
        setAlert({
          title: "Успешно",
          description:
            "Успешное удаление заявки на пополнение баланса пользователя",
          isActive: true,
        });
        getPaymentApplications();
      })
      .catch((err) => {
        setAlert({
          title: "Ошибка",
          description:
            "Ошибка удаления заявки на пополнение баланса пользователя",
          isActive: true,
        });
      });
  };

  return (
    <>
      <Filter
        paymentApplications={paymentApplications}
        filterMethod={onSetFilteredPaymentApplications}
      />
      <div className="table">
        <table className="table__content">
          <thead>
            <tr>
              <th>Пользоавтель, отправивший заявку</th>
              <th>Сумма пополнения</th>
              <th>Роль пользователя</th>
              <th>Депозит пользователя</th>
              <th>Рейтинг пользователя</th>
              <th>Методы оплаты пользователя</th>
              <th>Одобрение заявки на пополнение баланса</th>
              <th>Дата создания заявки</th>
              <th>Идентификатор заявки</th>
            </tr>
          </thead>
          <tbody>
            {filteredPaymentApplications?.map((item, index) => {
              let yandex, visaMastercard, qiwi, bitcoin
              if(item.user){
                yandex = item.user.paymentMethods.yandex
                visaMastercard = item.user.paymentMethods.visaMastercard
                qiwi = item.user.paymentMethods.qiwi
                bitcoin = item.user.paymentMethods.bitcoin
               
              }
              return (
                <PaymentApplicationsItem
                  key={item._id}
                  updatePaymentApplication={updatePaymentApplications}
                  deletePaymentApplication={deletePaymentApplications}
                  user={item.user && item.user.email}
                  role={item.user && item.user.role}
                  deposit={item.user && item.user.deposit}
                  rating={item.user && item.user.rating}
                  yandex={yandex}
                  visa={visaMastercard}
                  qiwi={qiwi}
                  bitcoin={bitcoin}
                  completed={item.completed}
                  _id={item._id}
                  date={item.createdAt}
                  userId={item.user && item.user._id}
                  replenishmentAmount={item.replenishmentAmount}
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

export default PaymentSystemApplicationsAdmin;
