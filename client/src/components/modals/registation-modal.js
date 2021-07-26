import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { ModalContext } from "../../context/modal/modalContext";
import { UserContext } from "../../context/user/userContext";
import "./_index.scss";

const RegistrationModal = () => {
  const { modalRegistration, setModalAuth, setModalRegistration } =
    useContext(ModalContext);

  const {
    statusTitle,
    statusEmail,
    statusPassword,
    setLoading,
    setRegistration,
    setLogin,
  } = useContext(UserContext);

  const [data, setData] = useState({
    email: "",
    status_email: "",
    accept: false,
  });

  const onChange = (e) => {
    setData({
      ...data,
      [e.target.name]: e.target.value,
    });
  };

  const onSubmit = (e) => {
    // e.preventDefalt() Отменяет полную перезагрузку страницы после отправки данных
    e.preventDefault();
    if (data.accept && data.email) {
      setRegistration({ email: data.email });
    } else {
      alert("Подтвердите условиями пользования сайта");
    }
  };

  return (
    <React.Fragment>
      <form
        onSubmit={onSubmit}
        className={modalRegistration ? "modal modal_active" : "modal"}
      >
        <button
          type="button"
          className="modal__close"
          onClick={() => setModalRegistration(false)}
        >
          <i className="fas fa-times"></i>
        </button>
        <p className="modal__title">Зарегистрироваться</p>

        <div className="default-group">
          <input
            onChange={onChange}
            className="default-group__input"
            name="email"
            placeholder="Электронная почта"
            type="email"
          />
          <button type="button" className="default-group__toogle-password">
            <i className="far fa-eye"></i>
          </button>
        </div>

        <div
          style={{ textAlign: "center" }}
          className="default-group flex-wrap"
        >
          <p>{statusEmail}</p>
          <p>{statusTitle}</p>
        </div>

        <div className="default-checkbox modal__group">
          <input
            onChange={() => {
              setData({
                ...data,
                accept: !data.accept,
              });
            }}
            checked={data.accept}
            id="accept"
            type="checkbox"
            className="default-checkbox__input"
          />

          <label htmlFor="accept" className="default-checkbox__label">
            <span className="default-checkbox__text">
              Нажимая 'Зарегистрироваться', вы подтверждаете, что ознакомлены и
              полностью согласны с{" "}
              <Link
                to="/rulesProject"
                className="modal__agree-link"
                onClick={() => setModalRegistration(false)}
              >
                {" "}
                условиями пользования сайта
              </Link>
            </span>
          </label>
        </div>
        <div className="modal__footer">
          <button className="default-btn modal__btn">Регистрироваться</button>
          <p>
            Уже есть аккаунт?
            <button
              className="modal__footer-enter"
              type="button"
              onClick={() => {
                setModalRegistration(false);
                setModalAuth(true);
              }}
            >
              Войти
            </button>
          </p>
        </div>
      </form>
      <div
        onClick={() => setModalRegistration(false)}
        className={
          modalRegistration
            ? "modal_overlay modal_overlay_active"
            : "modal_overlay"
        }
      ></div>
    </React.Fragment>
  );
};

export default RegistrationModal;
