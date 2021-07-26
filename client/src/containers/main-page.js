import React, { useEffect } from 'react'
import styled from 'styled-components'
import { useHistory } from 'react-router-dom'

import './_index.scss'

const LoaderContainer = styled.div`
    width: 100%;
    display: flex;
    justify-content: center;
    flex-grow: 3;
    align-items: center;
`

const MainPage = () => {
    const history = useHistory()
    useEffect(() => {
        localStorage.token && !localStorage.isOnline && history.push('/profile')
    }, [])

    return (
        <LoaderContainer>
            <img alt='Загрузка...' src='/loader.gif' />
        </LoaderContainer>
    )
}

export default MainPage;