import React, { useState, useContext } from 'react'
import { Link } from 'react-router-dom'

import { AuthModal, ForgotModal, RegistrationModal } from '../modals/_index'
import { ModalContext } from '../../context/modal/modalContext'

const Cabinet = () => {
  const { setModalRegistration } = useContext(ModalContext)
  const Condition = () => {
    if (!!localStorage.token) {
      return (
        <Link to='/profile' className='header__bar'>
          <i className='header__bar-icon far fa-user' />
        </Link>
      )
    } else {
      return (
        <button
          onClick={() => setModalRegistration(true)}
          className='header__bar'>
          <i className='header__bar-icon far fa-user' />
        </button>
      )
    }
  }

  return (
    <>
      <Condition />
      {/* Если setModalRegistration === true, то показать RegistrationModal, AuthModal, ForgotModal */}
      <RegistrationModal />
      <AuthModal />
      <ForgotModal />
    </>
  )
}

export default Cabinet;