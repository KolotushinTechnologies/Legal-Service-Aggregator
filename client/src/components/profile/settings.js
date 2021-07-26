import React, { useContext, useEffect, useState } from "react";
import Payment from "./payment";
import {
  visa as visaIcon,
  bitcoin as bitcoinIcon,
  qiwi as qiwiIcon,
  yandexWallet as yandexIcon,
} from "../../assets/images/_index";
import Axios from "axios";
import "./_index.scss";
import Alert from "../alerts/Alert";
import { useHistory } from "react-router-dom";

export default function Settings() {
  const history = useHistory()

  const [data, setData] = useState();
  const [payment, setPayment] = useState();
  const [paymentMethods, setPaymentMethods] = useState();
  const [alert, setAlert] = useState({
    title: "",
    description: "",
    isActive: false,
  });
  const [needUsername, setNeedUsername] = useState()
  const onChangeAlert = (active) => {
    setAlert({
      ...alert,
      isActive: active,
    });
  };

  useEffect(() => {
    const getProfile = async () => {
      await Axios({
        url: "http://localhost:5000/api/users/profile",
        method: "GET",
        headers: {
          Authorization: localStorage.token,
        },
      })
        .then((data) => {
          setData(data.data);
        })
        .catch((err) => {
          alert("Ошибка получения настроек профиля");
        });
    };
    getProfile();
    getPaymentMethods()
    if(localStorage.getItem('username') == 'false' && localStorage.getItem('token')){
      setNeedUsername(true)
    }
    return () => {
      localStorage.setItem('reloaded', false)
    }
  }, []);

  const onChange = (e) => {
    setData({
      ...data,
      [e.target.name]: e.target.value,
    });

  };

  const clickMethod = (name) => {
    !payment
      ? setPayment({
        ...data.paymentMethods,
        [name]: !data.paymentMethods[name],
      })
      : setPayment({
        ...payment,
        [name]: !payment[name],
      });
    // console.log({
    //   ...payment,
    //   [name]: !payment[name]
    // })
  };

  const choiceMethod = async (id) => {
    await Axios({
      method: "PUT",
      url: `http://localhost:5000/api/payment-methods/user-add-payment-method/${id}`,
      headers: {
        "Content-Type": "application/json",
        Authorization: localStorage.token,
      },
    })
  }

  const unchoiceMethod = async (id) => {
    await Axios({
      method: "PUT",
      url: `http://localhost:5000/api/payment-methods/user-delete-payment-method/${id}`,
      headers: {
        "Content-Type": "application/json",
        Authorization: localStorage.token,
      },
    })
  }

  const submitForm = (e) => {
    e.preventDefault();
    const changeProfile = async () => {
      console.log(payment)
      await Axios({
        url: "http://localhost:5000/api/users/profile/settings",
        method: "PUT",
        headers: {
          Authorization: localStorage.token,
        },
        data: {
          ...data,
          ...payment,
          // guarantorService: JSON.stringify(data.guarantorService),
          // paymentMethods: {
          //   visa: JSON.stringify(data.paymentMethods.visa),
          //   masterCard: JSON.stringify(data.paymentMethods.yandex),
          //   yandex: JSON.stringify(data.paymentMethods.yandex),
          // },
        },
      })
        .then((data) => {
          setAlert({
            title: "Успешно",
            description: "Успешное изменение данных",
            isActive: true,
          });
          localStorage.setItem('username', data.data.username)
          needUsername && history.push('/profile')
        })
        .catch((err) => {
          debugger;
          alert("Ошибка изменения данных");
        });
    };
    changeProfile();
  };

  const getPaymentMethods = async () => {
    const res = await Axios({
      url: `http://localhost:5000/api/payment-methods`,
      method: 'GET',
    })
    console.log(res.data)
    setPaymentMethods(res.data)
  }


  if (data) {
    const {
      username,
      email,
      city,
      onlineUser,
      password,
      guarantorService,
      paymentMethods: { yandex, visaMastercard, bitcoin, qiwi },
    } = data;
    return (
      <>
        <div className="profile profile_settings">
          <h1 className="profile__title">Настройки</h1>
          {needUsername && <div style={{fontSize: '20px'}}>
            Введите имя пользователя, чтобы продолжить
          </div>}
          <form onSubmit={submitForm} className="profile__form profile-form">
            <div className="default-group profile-form__group">
              <p className="profile-form__title"></p>
            </div>
            <div className="default-group profile-form__group">
              <p className="profile-form__title">Электронная почта</p>
              <input
                onChange={onChange}
                readOnly
                defaultValue={email}
                className="profile-form__input default-group__input"
                name="email"
                placeholder="Электронная почта"
                type="email"
              />
              <button
                type="button"
                className="default-group__toogle-password default-group__toogle-password_absolute profile-form__toggle"
              >
                <i className="far fa-eye"></i>
              </button>
            </div>
            <div className="default-group profile-form__group">
              <p className="profile-form__title">Имя пользователя</p>
              <input
                onChange={onChange}
                defaultValue={username}
                className="default-group__input"
                name="username"
                placeholder="Имя пользователя"
                type="text"
              />
            </div>
            <div className="default-group profile-form__group">
              <p className="profile-form__title">Регион / город</p>
              <input
                onChange={onChange}
                defaultValue={city}
                className="default-group__input"
                name="city"
                placeholder="Город"
                type="text"
              />
            </div>
            <div className="default-group profile-form__group">
              <p className="profile-form__title">Пароль</p>
              <input
                onChange={onChange}
                className="default-group__input"
                name="password"
                placeholder="Пароль"
                type="password"
              />
            </div>

            <div className="default-group profile-form__group">
              <p className="profile-form__title">Telegram</p>
              <input
                onChange={onChange}
                defaultValue={data.contacts?.telegram}
                className="default-group__input"
                name="telegram"
                placeholder="Telegram"
                type="text"
              />
            </div>

            <div className="default-group profile-form__group">
              <p className="profile-form__title">Дополнительная информация</p>
              <input
                onChange={onChange}
                defaultValue={data.contacts?.info}
                className="default-group__input"
                name="info"
                placeholder="Дополнительная информация (максимум 300 символов)"
                type="text"
              />
            </div>

            <div className="profile-form__group">
              <p className="profile-form__title">Работа через гарант сервис</p>
              <div className="default-checkbox">
                <input
                  checked={guarantorService}
                  onChange={() => {
                    setData({
                      ...data,
                      guarantorService: !guarantorService,
                    });
                  }}
                  type="checkbox"
                  className="default-checkbox__input"
                  id="guarator"
                />
                <label
                  htmlFor="guarator"
                  className="default-checkbox__label"
                ></label>
              </div>
            </div>
            <div className="profile-form__group">
              <p className="profile-form__title">Принимаемые способы оплаты</p>
              <div className="payments">
                {paymentMethods?.map(el =>
                  <Payment
                    key={el._id}
                    id={el._id}
                    isChecked={!!data.paymentMethods.includes(el._id)}
                    name={el.name}
                    click={() => clickMethod(el.name)}
                    choiceMethod={choiceMethod}
                    unchoiceMethod={unchoiceMethod}
                  />
                )}
                {/* <Payment
                  isChecked={!!yandex}
                  img={yandexIcon}
                  click={() => clickMethod("yandex")}
                />
                <Payment
                  isChecked={!!visaMastercard}
                  img={visaIcon}
                  click={() => clickMethod("visaMastercard")}
                />
                <Payment
                  isChecked={!!bitcoin}
                  img={bitcoinIcon}
                  click={() => clickMethod("bitcoin")}
                />
                <Payment
                  isChecked={!!qiwi}
                  img={qiwiIcon}
                  click={() => clickMethod("qiwi")}
                /> */}
              </div>
            </div>
            <div className="profile-form__group">
              <p className="profile-form__title"></p>
              <button className="default-btn">Сохранить</button>
            </div>
          </form>
        </div>
        <Alert
          onChangeAlert={onChangeAlert}
          title={alert.title}
          description={alert.description}
          isActive={alert.isActive}
        />
      </>
    );
  } else {
    return <div>Загрузка...</div>;
  }
}
