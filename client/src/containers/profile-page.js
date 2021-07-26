import React, { useEffect } from 'react'
import { Navbar } from '../components/profile/_index'
import './_index.scss'

const ProfilePage = ({ children, anotherUser, isSignedIn, unreadChats = null }) => {
    useEffect(() => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        })
    }, [])

    //if (unreadChats === null) return <div className='profile-page'>Загрузка...</div>
    return (
        <div className='profile-page'>
            {!(localStorage.getItem('username') == 'false' && localStorage.getItem('token')) && <Navbar anotherUser={anotherUser} unreadChats={unreadChats || []} />}
            {children}
        </div>
    )
}

export default ProfilePage