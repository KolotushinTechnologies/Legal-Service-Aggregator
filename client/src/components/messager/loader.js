import React from 'react'
import styled from 'styled-components'

const LoaderWrapper = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    img {
        position: absolute;
        right: 50%;
        top: 50%;
        transform: translateX(160px) translateY(-136px);
    }
`

const Loader = () => <LoaderWrapper><img alt='Загрузка...' src='/loader.gif' /></LoaderWrapper>

export default Loader