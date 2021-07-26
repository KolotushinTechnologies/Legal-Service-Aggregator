import React, { useEffect, useState } from 'react'
import Axios from 'axios'
import styled from 'styled-components'

const Title = styled.h1`
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 50px;
`

const WalletItem = styled.div`
    margin-bottom: 15px;
`

// какие-то определенные входные данные
const api_url = 'http://localhost:5000'

const Wallet = () => {
    const [wallets, setWallets] = useState(null)

    useEffect(() => {
        const fetch_wallets = async () => {
            try {
                const res = await Axios({
                    url: `${api_url}/api/wallets`,
                    method: 'GET',
                    headers: {
                        Authorization: localStorage.token
                    }
                })
                setWallets({
                    status: 'success',
                    data: res.data
                })
            } catch {
                setWallets({
                    status: 'error',
                    data: 'Критическая ошибка загрузки кошельков!'
                })
            }
        }

        fetch_wallets()
    }, [])

    return (
        <>
            <Title>Кошельки</Title>
            {
                wallets === null ? 'Загрузка...' :
                    wallets.status === 'error' ? wallets.data :
                        wallets.data.map(wallet => <WalletItem>{wallet.nameWallet}: {wallet.balanceWallet} руб.</WalletItem>)
            }
        </>
    )
}

export default Wallet