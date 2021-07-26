import React, { Component, useState } from 'react';
import styled from "styled-components"
import './Categories.sass'

const CategoriesPage = () => {

    return(
        <div className="categories-page">
            <div className="categories-page__container">
                <p className="categories-page__title">Все разделы</p>
                <ul className="categories-page__list">

                    <li className="categories-page__item categories-page__item_title">Пробив / поиск</li>

                    <li className="categories-page__item">
                        <a className="categories-page__link" href="#!">Пробив по гибдд</a>
                    </li>
                </ul> 
                <ul className="categories-page__list">

                    <li className="categories-page__item categories-page__item_title">Пробив / поиск</li>

                    <li className="categories-page__item">
                        <a className="categories-page__link" href="#!">Пробив по гибдд</a>
                    </li>
                </ul>   
            </div>
        </div>
    )
};

export default CategoriesPage;