import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { ModalContext } from '../../context/modal/modalContext';
import { UserContext } from '../../context/user/userContext';
import { ProfileContext } from '../../context/profile/profileContext';
import "./_index.scss";

const AuthModal = ({ setAlert }) => {

    const { modalAuth, modalRegistration, modalForgot,
        setModalAuth, setModalRegistration, setModalForgot
    } = useContext(ModalContext);

    const { statusTitle, statusEmail, statusPassword,
        setLoading, setRegistration, setLogin
    } = useContext(UserContext)

    const { profile, getProfile } = useContext(ProfileContext)

    // const [localData, setLocalData] = useState({
    //     email: "",
    //     password: ""
    // });

    const [formData, setFormData] = useState({
        email: "",
        password: "",
        save_me: false,
    });

    const onChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const onSubmit = (e) => {
        e.preventDefault();
        setLogin({ email: formData.email, password: formData.password })
    }

    // useEffect(() => {
    //     const email = localStorage.getItem('auth_form_email');
    //     const password = localStorage.getItem('auth_form_password');

    //     if (email) {
    //         setLocalData(prev => { return { ...prev, email: email } })
    //         setFormData(prev => { return { ...prev, email: email } })
    //     }
    //     if (password) {
    //         setLocalData(prev => { return { ...prev, password: password } })
    //         setFormData(prev => { return { ...prev, password: password } })
    //     }
    // }, [])

    return (
        <React.Fragment>
            <form onSubmit={onSubmit} className={modalAuth ? "modal modal_active" : "modal"}>
                <button className="modal__close" type="button" onClick={() => { setModalAuth(false) }}><i className="fas fa-times"></i></button>
                <p className="modal__title">Вход в личный кабинет</p>

                <div className="default-group flex-wrap">
                    <input
                        onChange={onChange}
                        className="default-group__input"
                        name="email"
                        placeholder="Электронная почта"
                        value={formData.email}
                        type="email" />
                    <p>{statusEmail}</p>
                </div>

                <div className="default-group flex-wrap">
                    <input
                        onChange={onChange}
                        className="default-group__input"
                        name="password"
                        placeholder="Пароль"
                        value={formData.password}
                        type="password" />
                    <p>{statusPassword}</p>
                </div>

                <p>{statusTitle}</p>

                {/* <div className="default-checkbox modal__group">
                    <input onChange={() => { setFormData(prev => { return { ...prev, save_me: !prev.save_me } }) }} defaultChecked={formData.save_me} id="remember" type="checkbox" className="default-checkbox__input" />
                    <label htmlFor="remember" className="default-checkbox__label">
                        <span className="default-checkbox__text">
                            Запомнить меня на этом компьютере
                        </span>
                    </label>
                </div> */}

                <div className="modal__footer">
                    <button type="submit" className="default-btn modal__btn">Войти</button>
                    <p>Забыли пароль?
                    <button className="modal__footer-enter" type="button" onClick={() => {
                            setModalAuth(false);
                            setModalForgot(true);
                        }}>Восстановить</button>
                    </p>
                </div>

            </form>
            <div onClick={() => { setModalAuth(false) }} className={modalAuth ? "modal_overlay modal_overlay_active" : "modal_overlay"}></div>
        </React.Fragment>
    );
};

export default (AuthModal);