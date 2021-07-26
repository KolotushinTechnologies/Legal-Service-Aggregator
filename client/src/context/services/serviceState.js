import axios from 'axios';
import React, { useReducer } from 'react';
import { ServiceContext } from './serviceContext';
import { serviceReducer } from './serviceReducer';

import {
    SERVICE_CREATE,
    SERVICE_GET_USER,
    SERVICE_GET_ALL,
    SERVICE_GET_ONE,
    SERVICE_CHENGE,
    SERVICE_DELETE
} from '../types';

export const ServiceState = ({ children }) => {

    const initialState = {
        allServices: null,
        user: null,
        name: null,
        title: null,
        textContent: null,
        categories: null,
        date: null,
        loading: false
    }

    const [state, dispatch] = useReducer(serviceReducer, initialState);


    //*** Получить все сервисы
    const serviceGetAll = async () => {
        await axios({
            url: "http://localhost:5000/api/services",
            method: 'GET',
            headers:
            {
                'Authorization': localStorage.token,
            }
        })
            .then(data => {
                dispatch({
                    type: SERVICE_GET_ALL,
                    payload: data.data
                })
            })
            .catch(err => {
                console.log("Ошибка во время загрузки загрузки всех сервисов");
            })
    }

    const { allServices, user, name, title, textContent, categories, date, loading } = state;

    return (
        <ServiceContext.Provider value={{
            allServices, user, name, title, textContent, categories, date, loading,
            serviceGetAll
        }}>
            {children}
        </ServiceContext.Provider>
    )
}