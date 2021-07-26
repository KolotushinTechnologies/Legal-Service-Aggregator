import React, { useReducer } from 'react';
import { ModalContext } from './modalContext';
import { modalReducer } from './modalReducer';
import {
    MODAL_AUTH_TOGGLE,
    MODAL_REGISTRATION_TOGGLE,
    MODAL_FORGOT_TOGGLE,
    MODAL_SERVICE_TOGGLE,
    MODAL_SERVICE_EDIT_TOGGLE
} from '../types';

export const ModalState = ({ children }) => {

    const initialState = {
        modalAuth: false,
        modalRegistration: false,
        modalForgot: false,
        modalService: false,
        modalServiceEdit: false
    }

    const [state, dispatch] = useReducer(modalReducer, initialState);

    //*** Авторизация
    const setModalAuth = (data) => {
        dispatch({
            type: MODAL_AUTH_TOGGLE,
            payload: data
        })
    }

    //*** Регистрация
    const setModalRegistration = (data) => {
        dispatch({
            type: MODAL_REGISTRATION_TOGGLE,
            payload: data
        })
    }

    //*** Сброс
    const setModalForgot = (data) => {
        dispatch({
            type: MODAL_FORGOT_TOGGLE,
            payload: data
        })
    }

    //*** Сервис добавление
    const setModalService = (data) => {
        dispatch({
            type: MODAL_SERVICE_TOGGLE,
            payload: data
        })
    }

    //*** Сервис изменение
    const setModalServiceEdit = (data) => {
        dispatch({
            type: MODAL_SERVICE_EDIT_TOGGLE,
            payload: data
        })
    }

    const { modalAuth, modalRegistration, modalForgot, modalService, modalServiceEdit } = state;

    return (
        <ModalContext.Provider value={{
            modalAuth, modalRegistration, modalForgot, modalService, modalServiceEdit,
            setModalAuth, setModalRegistration, setModalForgot, setModalService, setModalServiceEdit
        }}>
            {children}
        </ModalContext.Provider>
    )
}