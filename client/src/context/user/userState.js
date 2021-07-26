import axios from "axios";
import React, { useReducer } from "react";
import { UserContext } from "./userContext";
import { userReducer } from "./userReducer";

import {
  AUTH_REGISTER,
  AUTH_LOGIN,
  AUTH_STATUS_TITLE,
  AUTH_STATUS_EMAIL,
  AUTH_STATUS_PASSWORD,
  AUTH_LOADING,
  AUTH_RESET,
  AUTH_DELETE,
  MODAL_AUTH_TOGGLE,
} from "../types";

import openSocket from "socket.io-client";
import { useHistory } from "react-router-dom";
const socket = openSocket(
  process.env.REACT_APP_SOCKET_EDPOINT || "http://localhost:5000"
);

export const UserState = ({ children }) => {
  const initialState = {
    registration: {},
    user: {},
    loading: false,
    statusTitle: "",
    statusEmail: "",
    statusPassword: "",
  };

  const [state, dispatch] = useReducer(userReducer, initialState);
  //*** Поставить загрузку
  const setLoading = () => {
    dispatch({
      type: AUTH_LOADING,
    });
  };

  //*** Зарегистрироваться
  const setRegistration = async (formData) => {
    await axios({
      url: "http://localhost:5000/api/users/registration",
      method: "POST",
      data: formData,
    })
      .then((data) => {
        if (data !== undefined) {
          dispatch({
            type: AUTH_REGISTER,
            payload: data.data
          })
          dispatch({
            type: AUTH_STATUS_EMAIL,
            payload: ''
          })
        }
        // dispatch({
        //     type: AUTH_STATUS_TITLE,
        //     payload: "Успешная регистрация. Проверьте почту",
        // })
        // dispatch({
        //     type: AUTH_STATUS_EMAIL,
        //     payload: "",
        // })
        // dispatch({
        //     type: AUTH_STATUS_PASSWORD,
        //     payload: "",
        // })
        alert("Успешная регистрация. Проверьте почту");
      })
      .catch((err) => {
        // dispatch({
        //     type: AUTH_STATUS_TITLE,
        //     payload: "Ошибка регистрации",
        // })
        // dispatch({
        //     type: AUTH_STATUS_EMAIL,
        //     payload: "Неправильная почта",
        // })
        const errData = err.response.data
        console.log(errData)
        if (errData.email) {
          console.log('Введите почту')
          dispatch({
            type: AUTH_STATUS_EMAIL,
            payload: "Введите существующую почту",
          });
        } else {
          dispatch({
            type: AUTH_STATUS_EMAIL,
            payload: "",
          });
        }
        if (errData.message == 'Email already exists!') {
          dispatch({
            type: AUTH_STATUS_EMAIL,
            payload: "Эта почта уже зарегистрирована",
          });
        }
        alert("Ошибка регистрации");
      });
  };

  //*** Войти
  const setLogin = async (formData) => {
    try {
      const res = await axios({
        url: "http://localhost:5000/api/users/login",
        method: "POST",
        data: formData,
      })
      // .then((data) => {
      localStorage.setItem("token", res.data.token);

      socket.emit("new-user", res.data);
      // socket.on("user-connected", data.data);
      window.location.reload();

      dispatch({
        type: AUTH_LOGIN,
        payload: res.data,
      });
    } catch (err) {
      const errData = err.response?.data
      if (errData?.message) {
        console.log('Данные введены неверно')
        dispatch({
          type: AUTH_STATUS_PASSWORD,
          payload: "Данные введены неверно",
        });
        dispatch({
          type: AUTH_STATUS_EMAIL,
          payload: "",
        });
      } else {
        if (errData?.password) {
          console.log('Введите пароль')
          dispatch({
            type: AUTH_STATUS_PASSWORD,
            payload: "Введите пароль",
          });
        } else {
          dispatch({
            type: AUTH_STATUS_PASSWORD,
            payload: "",
          });
        }

        if (errData?.email) {
          console.log('Введите почту')
          dispatch({
            type: AUTH_STATUS_EMAIL,
            payload: "Введите почту",
          });
        } else {
          dispatch({
            type: AUTH_STATUS_EMAIL,
            payload: "",
          });
        }
      }
      // console.log(err.response.data.message)
      // console.log(err.response)
    }
    //   // dispatch({
    //   //     type: AUTH_STATUS_TITLE,
    //   //     payload: "Успешный вход.",
    //   // });
    //   // dispatch({
    //   //     type: AUTH_STATUS_EMAIL,
    //   //     payload: "",
    //   // });
    //   // dispatch({
    //   //     type: AUTH_STATUS_PASSWORD,
    //   //     payload: "",
    //   // });
    //   alert("Переход в профиль");
    //   //history.push('/profile')

    // })
    // .catch((err) => {
    //   // dispatch({
    //   //     type: AUTH_STATUS_TITLE,
    //   //     payload: "Ошибка входа",
    //   // });
    //   // dispatch({
    //   //     type: AUTH_STATUS_EMAIL,
    //   //     payload: "Неправильная почта",
    //   // });
    //   // dispatch({
    //   //     type: AUTH_STATUS_PASSWORD,
    //   //     payload: "Неправильный пароль",
    //   // });

    //   alert("Ошибка входа");
    // });
  };

  //*** Сбросить пароль
  const setReset = async (formData) => {
    await axios({
      url: "http://localhost:5000/api/users/reset-password",
      method: "POST",
      data: formData,
    })
      .then((data) => {
        console.log(data)
        if (data !== undefined) {
          dispatch({
            type: AUTH_RESET,
            payload: data.data
          })
          dispatch({
            type: AUTH_STATUS_TITLE,
            payload: 'Успешная сброс. Проверьте почту'
          })
          dispatch({
            type: AUTH_STATUS_EMAIL,
            payload: ''
          })
          dispatch({
            type: AUTH_STATUS_PASSWORD,
            payload: ''
          })
        }
      })
      .catch((err) => {
        const errData = err.response.data
        if (errData.email) {
          dispatch({
            type: AUTH_STATUS_EMAIL,
            payload: "Неправильная почта",
          });
          dispatch({
            type: AUTH_STATUS_TITLE,
            payload: "",
          });
        } else {
          dispatch({
            type: AUTH_STATUS_TITLE,
            payload: "Ошибка сброса пароля",
          });
          dispatch({
            type: AUTH_STATUS_EMAIL,
            payload: "",
          });
        }

      });
  };

  const {
    registration,
    user,
    statusTitle,
    statusEmail,
    statusPassword,
    loading,
  } = state;
  return (
    <UserContext.Provider
      value={{
        registration,
        user,
        loading,
        statusTitle,
        statusEmail,
        statusPassword,
        setLoading,
        setRegistration,
        setLogin,
        setReset,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
