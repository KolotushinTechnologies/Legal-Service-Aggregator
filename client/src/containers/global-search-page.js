import React, { useContext, useEffect, useState } from 'react'
import { Search } from "../components/search"
import { ProfileContext } from '../context/profile/profileContext'
import './_index.scss'

const GlobalSearchPage = ({ searchTextState, setTransOnSub }) => {
    return (
        <div className="global-search">
            <Search searchTextState={searchTextState} setTransOnSub={setTransOnSub} />
        </div>
    )
}

export default GlobalSearchPage