import React from 'react'

import { AdminNavigation } from '../components/admin-navigation'
import './_index.scss'

const AdminPage = ({ children }) => {
    return (
        <div className="admin-page">
            <AdminNavigation />
            {children}
        </div>
    )
}

export default AdminPage