import Axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useHistory } from "react-router-dom";
import styled from 'styled-components';
import AddServiceModal from '../modals/add-service-modal';
import DealItem from './deal-item';
import './_index.scss';
import '../search/index.sass';

const Background = styled.div`
    position: fixed;
    top: 0;
    right: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(255, 255, 255, 0.6);
    transition: all 0.3s ease;
    z-index: 2;
`
const Modal = styled.div`
    z-index: 3;
    position: fixed;
    top: 15%;
    right: 50%;
    transform: translate(50%, 0);
    width: 700px;
    height: 490px;
    border: 1px solid #c0c0c0;
    border-radius: 10px;
    background-color: #fff;
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
    padding: 25px 25px 55px 45px;
    .title {
        justify-content: space-between;
        font-size: 20px;
    }
    .message {
        font-size: 16px;
        text-align: center;
        margin-top: 70px;
        @media(max-width: ${p => p.theme.breakpoints.SMdesktop}) {
            margin-top: 15px;
        }
    }
    .modalTitle {
        font-size: 24px;
        padding-top: 20px;
        @media(max-width: ${p => p.theme.breakpoints.SMdesktop}) {
            padding-top: 0px;
            margin-top: 15px;
        }
    }
    .cross {
        font-size: 20px;
        height: 28px;
        padding: 0 6px 8px 6px;
        cursor: pointer;
    }
    .btns {
        margin-top: 35px;
        justify-content: center;
        cursor: pointer;
        text-align: center;
        font-size: 17px;
        
    }
    .confirm {
        margin-left: 10px;
        border: 1px solid #c0c0c0;
        padding: 13px 32px;
        border-radius: 4px;
        @media(max-width: ${p => p.theme.breakpoints.SMdesktop}) {
            margin: 0px;
            margin-top: 10px;
        }
    }
    .close {
        border: none;
        background-color: #fc171e;
        color: #fff;
        padding: 13px 32px;
        border-radius: 4px;
    }
    @media(max-width: ${p => p.theme.breakpoints.SMdesktop}) {
        top: 10%;
        width: 85vw !important;
        height: 82vh !important;
        overflow-y: auto;
        overflow-x: hidden;
    }
`
const Row = styled.div`
    display: flex;
`
const BigStar = styled.span`
    font-size: 45px;
`

const CenterDefault = styled.div`
    display: flex; 
    justify-content: center;
`

const Center = styled(CenterDefault)`
    margin-top: 20px;
`

const RatingContainer = styled.div`
    @media(max-width: ${p => p.theme.breakpoints.SMdesktop}) {
        margin-top: 15px;
        i {
            font-size: 35px;
        }
    }
`

const ButtonsContainer = styled.div`
    display: flex;
    @media(max-width: ${p => p.theme.breakpoints.SMdesktop}) {
        margin-top: 15px !important;
        flex-direction: column;
    }
`

const DealConfirm = () => {
    const [dealData, setDealData] = useState()
    const [myProfileData, setMyProfileData] = useState()
    const [alertConfirme, setAlertConfirme] = useState(false)
    const [activeModal, setActiveModal] = useState(false)
    const [rating, setRating] = useState()

    const history = useHistory();
    let url = history.location.pathname.split("/deals/")[1];

    useEffect(() => {
        getDeal()
        getMyProfile()
    }, [])

    const getDeal = async () => {
        const res = await Axios({
            url: 'http://localhost:5000/api/dealings/' + url,
            method: 'GET',
            headers: {
                Authorization: localStorage.token
            }
        })

        setDealData(res.data)
    }
    const getMyProfile = async () => {
        const res = await Axios({
            url: `http://localhost:5000/api/users/profile`,
            method: "GET",
            headers: {
                Authorization: localStorage.token,
            },
        })

        setMyProfileData(res.data)
    }
    const completeDeal = async () => {
        //http://localhost:5000/api/dealings/completed/
        await Axios({
            url: `http://localhost:5000/api/dealings/completed/${url}`,
            method: "PUT",
            data: {
                completed: true
            },
            headers: {
                Authorization: localStorage.token,
            },
        })
        //http://localhost:5000/api/dealings/evaluation/:_id/stars/:stars
        rating && !(rating < 1 || rating > 5) && await Axios({
            url: `http://localhost:5000/api/dealings/evaluation/${url}/stars/${rating}`,
            method: "POST",
            headers: {
                Authorization: localStorage.token,
            },
        })

        setAlertConfirme(false)
        history.push(`/deals`)
    }
    const createConfirm = () => {
        setAlertConfirme(true)
    }
    const closeConfirm = () => {
        setAlertConfirme(false)
    }

    return (<>
        {myProfileData && dealData ?
            (<div className="profile profile_deals">
                <p className="profile__title text-center">Подтверждение выполненной сделки</p>
                <div className="profile__confirm-deal confirm-deal">
                    <div className="confirm-deal__head">
                        <p className="confirm-deal__owner">Вы</p>
                        {dealData.customer && dealData.customer._id == myProfileData._id ? <i className="confirm-deal__icon fas fa-arrow-right" /> : <i className="confirm-deal__icon fas fa-arrow-left" />}
                        <p className="confirm-deal__partner">{
                            dealData.customer && dealData.customer._id == myProfileData._id ? dealData.executor && dealData.executor.username : dealData.customer && dealData.customer.username
                        }</p>
                    </div>
                    <div className="confirm-deal__body">
                        <div>
                            {dealData.termsOfAtransaction}
                        </div>
                        <button onClick={createConfirm} className="default-btn default-btn_s3 confirm-deal__btn confirm-deal__pay-button">Выплатить исполнителю {dealData.transactionAmount} рублей</button>
                        <p className="confirm-deal__number">Сделка №{dealData._id}</p>
                    </div>
                    {alertConfirme && (<>
                        <Background onClick={closeConfirm} />
                        <Modal>
                            <Row className='title'>
                                <div className='modalTitle'>Вы уверены?</div>
                                <div className='cross' onClick={closeConfirm}>
                                    <i class="fas fa-times" />
                                </div>
                            </Row>
                            <div className='message'>
                                Выплатить исполнителю <span style={{ 'text-decoration': 'underline' }}>{dealData.customer && dealData.customer._id == myProfileData._id ? dealData.executor && dealData.executor.username : dealData.customer && dealData.customer.username}</span> <span style={{ 'font-weight': '900' }}>{dealData.transactionAmount} рублей</span> и завершить сделку <span style={{ 'text-decoration': 'underline' }}>№{dealData._id}</span>
                            </div>
                            <Center className='modalTitle'>Пожалуйста, оцените работу исполнителя:</Center>
                            <CenterDefault>
                                <RatingContainer>
                                    <div className='star-rating'>
                                        <div className='star-rating__wrap'>
                                            <div className='rating'>
                                                <input
                                                    onChange={(e) => setRating(parseInt(e.target.value))}
                                                    id='rating-5'
                                                    type='radio'
                                                    name='rating'
                                                    defaultValue='5'
                                                />
                                                <label htmlFor='rating-5'>
                                                    <BigStar>
                                                        <i className='fas fa-star' />
                                                    </BigStar>
                                                </label>
                                                <input
                                                    onChange={(e) => setRating(parseInt(e.target.value))}
                                                    id='rating-4'
                                                    type='radio'
                                                    name='rating'
                                                    defaultValue='4'
                                                />
                                                <label htmlFor='rating-4'>
                                                    <BigStar>
                                                        <i className='fas fa-star' />
                                                    </BigStar>
                                                </label>
                                                <input
                                                    onChange={(e) => setRating(parseInt(e.target.value))}
                                                    id='rating-3'
                                                    type='radio'
                                                    name='rating'
                                                    defaultValue='3'
                                                />
                                                <label htmlFor='rating-3'>
                                                    <BigStar>
                                                        <i className='fas fa-star' />
                                                    </BigStar>
                                                </label>
                                                <input
                                                    onChange={(e) => setRating(parseInt(e.target.value))}
                                                    id='rating-2'
                                                    type='radio'
                                                    name='rating'
                                                    defaultValue='2'
                                                />
                                                <label htmlFor='rating-2'>
                                                    <BigStar>
                                                        <i className='fas fa-star' />
                                                    </BigStar>
                                                </label>
                                                <input
                                                    onChange={(e) => setRating(parseInt(e.target.value))}
                                                    id='rating-1'
                                                    type='radio'
                                                    name='rating'
                                                    defaultValue='1'
                                                />
                                                <label htmlFor='rating-1'>
                                                    <BigStar>
                                                        <i className='fas fa-star' />
                                                    </BigStar>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </RatingContainer>
                            </CenterDefault>
                            <ButtonsContainer className='btns'>
                                <div onClick={closeConfirm} className='close'>Отмена</div>
                                <div onClick={completeDeal} className='confirm'>Подтверждаю</div>
                            </ButtonsContainer>
                        </Modal>
                    </>)}
                </div>
            </div>) : <div>Загрузка...</div>
        }
    </>)
}

export default DealConfirm;