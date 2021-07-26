import React, { useContext } from 'react';
import axios from 'axios';
import "./_index.scss";
import { ModalContext } from '../../context/modal/modalContext';
import { UserContext } from '../../context/user/userContext';

const ForgotModal = () => {

    const { modalAuth, modalRegistration, modalForgot,
        setModalAuth, setModalRegistration, setModalForgot
    } = useContext(ModalContext);

    const { statusTitle, statusEmail, statusPassword,
        setLoading, setRegistration, setLogin, setReset
    } = useContext(UserContext);

    const [email, setEmail] = React.useState("");
    // const [status, setStatus] = React.useState("");

    const onChange = e => {
        setEmail(e.target.value)
    }

    const onSubmit = e => {
        e.preventDefault();
        setReset({email: email})
    }

    return (
        <React.Fragment>
            <form onSubmit={onSubmit} className={modalForgot ? "modal modal_active" : "modal"}>
                <button className="modal__close" type="button" onClick={()=>{setModalForgot(false)}}><i className="fas fa-times"></i></button>
                <p className="modal__title">Восстановить пароль</p>
                <div className="default-group flex-wrap">
                    <input onChange={onChange} className="default-group__input" name="email" placeholder="Электронная почта" type="email" />
                    <p>{statusEmail}</p>
                    <p>{statusTitle}</p>
                </div>
                <div className="modal__footer">
                    <button className="default-btn modal__btn">Восстановить</button>
                    <div>
                        <button 
                        className="modal__footer-enter"
                        type="submit"
                        onClick={()=>{
                            setModalForgot(false)
                            setModalRegistration(true)
                        }}>Назад к регистрации</button>
                    </div>
                </div>
            </form>
            <div onClick={()=>{setModalForgot(false)}} className={modalForgot ? "modal_overlay modal_overlay_active" : "modal_overlay"}></div>

        </React.Fragment>
    );
};

export default ForgotModal;