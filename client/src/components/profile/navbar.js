import React from 'react'
import { NavLink } from 'react-router-dom'

const Navbar = ({ anotherUser, unreadChats }) => {
    console.log(unreadChats)

    const Condition = () => {
        if (!anotherUser) {
            return (
                <nav className="navbar">
                    <NavLink
                        className="navbar__item"
                        activeClassName="navbar__item_active"
                        exact
                        to="/profile">
                        Личный кабинет
                    </NavLink>
                    <NavLink
                        className={`navbar__item ${unreadChats.length > 0 && 'navbar__item_chat-active'}`}
                        activeClassName="navbar__item_active"
                        exact
                        to="/messages">
                        Чаты
                    </NavLink>
                    <NavLink
                        className="navbar__item"
                        activeClassName="navbar__item_active"
                        exact
                        to="/transactions">
                        История транзакций
                    </NavLink>
                    <NavLink
                        className="navbar__item"
                        activeClassName="navbar__item_active"
                        exact
                        to="/favorites">
                        Избранное
                    </NavLink>
                    <NavLink
                        className="navbar__item"
                        activeClassName="navbar__item_active"
                        exact
                        to="/settings">
                        Настройки
                    </NavLink>
                    <NavLink
                        className="navbar__item navbar__item_icon"
                        activeClassName="navbar__item_active"
                        exact
                        to="/profile">
                        <i className="fas fa-user-circle"></i>
                    </NavLink>
                    <NavLink
                        className={`navbar__item navbar__item_icon ${unreadChats.length > 0 && 'navbar__item_chat-active'}`}
                        activeClassName="navbar__item_active"
                        exact
                        to='/messages'>
                        <i className='fas fa-comments' />
                    </NavLink>
                    <NavLink
                        className="navbar__item navbar__item_icon"
                        activeClassName="navbar__item_active"
                        exact
                        to="/transactions"
                    >
                        <i className="fas fa-money-check-alt"></i>
                    </NavLink>
                    <NavLink
                        className="navbar__item navbar__item_icon"
                        activeClassName="navbar__item_active"
                        exact
                        to="/favorites"
                    >
                        <i className="fab fa-gratipay"></i>
                    </NavLink>
                    <NavLink
                        className="navbar__item navbar__item_icon"
                        activeClassName="navbar__item_active"
                        exact
                        to="/settings"
                    >
                        <i className="fas fa-user-cog"></i>
                    </NavLink>
                </nav>
            )
        } else {
            return (
                <nav style={{ marginTop: 0 }} className="navbar">
                    <NavLink
                        style={{ textDecoration: 'none', alignItems: 'center' }}
                        className="navbar__item"
                        activeClassName="navbar__item_active"
                        exact
                        to="/search"
                    >
                        <i style={{ textDecoration: 'none' }} className="fas fa-chevron-left"></i>
                        <span style={{ marginLeft: 10, textDecoration: 'underline' }}>Назад к поиску</span>
                    </NavLink>
                    <NavLink
                        className="navbar__item navbar__item_icon"
                        activeClassName="navbar__item_active"
                        exact
                        to="/search"
                    >
                        <i className="fas fa-chevron-left"></i>
                    </NavLink>
                </nav>
            )
        }
    }

    return (
        <Condition />
    )
}

Navbar.defaultProps = {
    anotherUser: false
}

export default Navbar