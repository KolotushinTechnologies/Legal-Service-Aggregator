import axios from 'axios';
import React, { useReducer } from 'react';
import { profileReducer } from './profileReducer';
import { ProfileContext } from './profileContext';
import {
    PROFILE_SET_LOADING,
    PROFILE_GET_OWN,
    PROFILE_CHANGE_OWN,
    PROFILE_SET_STATUS,
    PROFILE_GET_ANOTHER,
    PROFILE_GET_ALL
} from '../types';

export const ProfileState = ({ children }) => {

    const initialState = {
        profile: {},
        profiles: {},
        anotherProfile: {},
        loading: false,
        status: ""
    }

    const [state, dispatch] = useReducer(profileReducer, initialState);

    //*** Поставить загрузку
    const setLoading = () => {
        dispatch({
            type: PROFILE_SET_LOADING
        })
    }

    //*** Получить данные своего профиля
    const getProfile = async () => {
        await axios({
            url: 'http://localhost:5000/api/users/profile',
            method: 'GET',
            headers:
            {
                'Authorization': localStorage.token,
            }
        })
            .then(data => {
                dispatch({
                    type: PROFILE_GET_OWN,
                    payload: data.data
                })
            })
            .catch(err => {
                dispatch({
                    type: PROFILE_SET_STATUS,
                    payload: "Ошибка"
                })
            })
    }

    //*** Изменить свои данные
    const changeProfile = async formData => {
        await axios({
            url: 'http://localhost:5000/api/users/profile/settings',
            method: 'PUT',
            headers:
            {
                'Authorization': localStorage.token,
            },
            data: formData
        })
            .then(data => {
                dispatch({
                    type: PROFILE_CHANGE_OWN,
                    payload: formData
                })
                dispatch({
                    type: PROFILE_SET_STATUS,
                    payload: "Данные изменились"
                })
            })
            .catch(err => {
                dispatch({
                    type: PROFILE_SET_STATUS,
                    payload: "Ошибка изменения данных"
                })
            })
    }

    //*** Получить данные другого профиля
    const getAnotherProfile = async id => {
        await axios({
            url: `http://localhost:5000/api/users/profile/${id}`,
            method: 'GET'
        })
            .then(data => {
                dispatch({
                    type: PROFILE_GET_ANOTHER,
                    payload: data.data
                })
            })
            .catch(err => {
                console.log("Ошибка во время загрузки другого профиля");
            })
    }

    // *** Получить всех пользователей
    const getAllProfiles = async () => {
        await axios({
            url: "http://localhost:5000/api/users/profiles",
            method: 'GET'
        })
            .then(data => {
                dispatch({
                    type: PROFILE_GET_ALL,
                    payload: data.data
                })
            })
            .catch(err => {
                console.log("Ошибка во время загрузки профилей");
            })
    }

    const { profile, profiles, anotherProfile, loading, status } = state;
    return (
        <ProfileContext.Provider value={{
            profile, profiles, anotherProfile, loading, status,
            setLoading, getProfile, changeProfile, getAnotherProfile, getAllProfiles
        }}>
            {children}
        </ProfileContext.Provider>
    )
}