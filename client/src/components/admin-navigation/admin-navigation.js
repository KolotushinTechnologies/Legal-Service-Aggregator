import React from 'react'
import { NavLink } from 'react-router-dom'

import './index.scss'

const AdminNavigation = () => {
  return (
    <nav className='admin-navigation mb-30'>
      <NavLink
        to='/admin/users'
        activeClassName='default-btn admin-navigation__btn admin-navigation__btn_active'
        className='default-btn admin-navigation__btn'>
        Все пользователи
      </NavLink>
      <NavLink
        to='/admin/services'
        activeClassName='default-btn admin-navigation__btn admin-navigation__btn_active'
        className='default-btn admin-navigation__btn'>
        Все услуги
      </NavLink>
      <NavLink
        to='/admin/dealings'
        activeClassName='default-btn admin-navigation__btn admin-navigation__btn_active'
        className='default-btn admin-navigation__btn'>
        Все сделки
      </NavLink>
      <NavLink
        to='/admin/favorites'
        activeClassName='default-btn admin-navigation__btn admin-navigation__btn_active'
        className='default-btn admin-navigation__btn'>
        Избранное пользователей
      </NavLink>
      <NavLink
        to='/admin/transactions'
        activeClassName='default-btn admin-navigation__btn admin-navigation__btn_active'
        className='default-btn admin-navigation__btn'>
        Транзакции пользователей
      </NavLink>
      <NavLink
        to='/admin/balance-replenishment-applications'
        activeClassName='default-btn admin-navigation__btn admin-navigation__btn_active'
        className='default-btn admin-navigation__btn'>
        Заявки пользователей на пополнение баланса
      </NavLink>
      <NavLink
        to='/admin/withdrawal-of-requests'
        activeClassName='default-btn admin-navigation__btn admin-navigation__btn_active'
        className='default-btn admin-navigation__btn'>
        Заявки пользователей на вывод денежных средств
      </NavLink>
      <NavLink
        to='/admin/complaints'
        activeClassName='default-btn admin-navigation__btn admin-navigation__btn_active'
        className='default-btn admin-navigation__btn'>
        Жалобы
      </NavLink>
      <NavLink
        to='/admin/sections'
        activeClassName='default-btn admin-navigation__btn admin-navigation__btn_active'
        className='default-btn admin-navigation__btn'>
        Разделы
      </NavLink>
      <NavLink
        to='/admin/categories'
        activeClassName='default-btn admin-navigation__btn admin-navigation__btn_active'
        className='default-btn admin-navigation__btn'>
        Категории
      </NavLink>
      <NavLink
        to='/admin/cities'
        activeClassName='default-btn admin-navigation__btn admin-navigation__btn_active'
        className='default-btn admin-navigation__btn'>
        Города
      </NavLink>
      <NavLink
        to='/admin/chat'
        activeClassName='default-btn admin-navigation__btn admin-navigation__btn_active'
        className='default-btn admin-navigation__btn'>
        Чат с пользователями
      </NavLink>
      <NavLink
        to='/news'
        activeClassName='default-btn admin-navigation__btn admin-navigation__btn_active'
        className='default-btn admin-navigation__btn'>
        Новости
      </NavLink>
      <NavLink
        to='/admin/payment-methods'
        activeClassName='default-btn admin-navigation__btn admin-navigation__btn_active'
        className='default-btn admin-navigation__btn'>
        Платежные методы
      </NavLink>
      <NavLink
        to='/admin/wallet'
        activeClassName='default-btn admin-navigation__btn admin-navigation__btn_active'
        className='default-btn admin-navigation__btn'>
        Кошельки
      </NavLink>
    </nav>
  )
}

export default AdminNavigation