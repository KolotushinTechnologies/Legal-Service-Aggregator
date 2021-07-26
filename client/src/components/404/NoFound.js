import React from "react";
import styled from "styled-components";

const Main = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: auto;
    padding: 15px;
    width: 100%;
`
const NumberErr = styled.div`
    display: flex;
    font-size: 98px;
`
const TextErr = styled.div`
    display: flex;
    font-size: 38px;
    text-align: center;
`

const NoFound = () => {
    return (<Main>
        <NumberErr>404</NumberErr>
        <TextErr>Запрашиваемая страница не найдена</TextErr>
    </Main>)
}

export default NoFound