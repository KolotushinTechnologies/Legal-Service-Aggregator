import { connect } from 'react-redux'
import React, { useEffect, useState } from 'react'
import './styles/index.scss'
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
  useHistory
} from 'react-router-dom'
import Footer from './components/footer/footer'
import {
  AboutProject,
  CheckSellers,
  Cooperation,
  GuarantorService,
  RulesProject,
  SiteMap,
} from './components/footer/_index'
import {
  NoFound
} from './components/404/_index'
import { Header, Navbar } from './components/header/_index'
import Deals from './components/profile/deals'
import CompletedDeals from './components/profile/completed-deals'
import Service from './components/profile/service'
import News from './components/news/news'
import {
  AnotherProfile,
  DealConfirm,
  Favorites,
  Profile,
  Settings,
  Transactions,
  Replenishment,
  Notifications,
  WithdrawalOfFunds,
} from './components/profile/_index'
import Users from './components/admin/users'
import Services from './components/admin/services'
import {
  GlobalSearchPage,
  MainPage,
  MessagerPage,
  ProfilePage,
  CategoriesPage,
  AdminPage
} from './containers/_index'
import openSocket from 'socket.io-client'
import Axios from 'axios'
import {
  CategoriesAdmin,
  CitiesAdmin,
  ComplaintsAdmin,
  DealingsAdmin,
  FavoritesAdmin,
  PaymentSystemApplicationsAdmin,
  TransactionsAdmin,
  WithdrawalOfRequestsAdmin,
  PaymentMethods,
  SectionsAdmin
} from './components/admin/_index'
import Wallet from './components/admin/wallet'
import { ThemeProvider } from 'styled-components'

import jwt from 'jsonwebtoken'
import theme from './theme.js'

const socket = openSocket(
  process.env.REACT_APP_SOCKET_EDPOINT || 'http://localhost:5000'
)

const PrivateRoute = ({
  component: Component,
  render,
  redirect,
  isSignedIn,
  ...rest
}) => (
  <Route
    {...rest}
    render={(props) => {
      if (!isSignedIn)
        return (
          <Redirect
            to={{
              pathname: redirect,
              state: { referrer: props.history.location.pathname }
            }}
          />
        )
      if (render) return render({ ...props })
      return <Component {...props} />
    }}
  />
)

const App = () => {
  const [profileId, setProfileId] = useState()
  const [searchTextState, setSearchTextState] = useState()
  const [activeNav, setActiveNav] = useState(false)
  const [transOnSub, setTransOnSub] = useState()
  const [unreadChats, setUnreadChats] = useState(null)
  let history = useHistory()

  useEffect(() => {
    if (localStorage.getItem('token') && !socket.connected) {
      socket.connect()
      console.log('Подключение сокетов')
    }
    if (localStorage.getItem('token') && socket.connected && profileId) {
      socket.emit('update-socket', profileId)
    }
  }, [profileId])

  const change_unread_chats = (res_data) => {
    const user_id = jwt.decode(localStorage.token.replace('Bearer ', ''))?.id
    if (!user_id) throw new Error()
    if (JSON.stringify(unreadChats) !== JSON.stringify(res_data.filter(dialog => dialog.lastMessage.userMessage._id !== user_id && dialog.lastMessage.readMessageUsers.indexOf(user_id) === -1).map(dialog => dialog._id))) {
      setUnreadChats(res_data.filter(dialog => dialog.lastMessage.userMessage._id !== user_id && dialog.lastMessage.readMessageUsers.indexOf(user_id) === -1).map(dialog => dialog._id))
    }
  }

  useEffect(() => {
    (async () => {
      if (!localStorage.token) return
      const user_id = jwt.decode(localStorage.token.replace('Bearer ', ''))?.id
      const username = jwt.decode(localStorage.token.replace('Bearer ', '')).username
      console.log(jwt.decode(localStorage.token.replace('Bearer ', '')))
      setProfileId(user_id)
      localStorage.getItem('token') && localStorage.setItem('username', username)
      try {
        const res = await Axios({
          url: 'http://localhost:5000/api/chat',
          method: 'GET',
          headers: {
            Authorization: localStorage.token
          }
        })
        change_unread_chats(res.data)
      } catch {
        throw new Error('JWT invalid')
      }
    })()
  }, [])

  // useEffect(() => {
  //   if((localStorage.getItem('username') == 'false') && localStorage.getItem('token') && localStorage.getItem('reloaded') != 'true'){
      
  //     setTimeout(() => { 
  //       window.history.pushState("object or string", "Title", '/settings')
  //       localStorage.setItem('reloaded', true)
  //       window.location.reload() 
  //     }, 1000)
      
  //     console.log('NEED PUSH!!!')
  //   }
  // }, [])

  Axios.interceptors.response.use(
    (response) => response,
    (error) => {
      const { status } = error.response;
      if (status === 401) {
        logOut()
        return Promise.reject(error)
      }
    }
  )

  const logOut = () => {
    socket.emit('user-offline', profileId);
    console.log(profileId)
    localStorage.clear()
    window.location.reload()
    history.push('/')
  }

  return (
    <Router>
      <ThemeProvider theme={theme}>
        <Navbar activeNav={activeNav} />
        <Header
          setSearchTextState={setSearchTextState}
          searchTextState={searchTextState}
          transOnSub={transOnSub}
        />
        <Switch>
          <PrivateRoute
            exact
            path='/profile'
            isSignedIn={!!localStorage.token}
            component={() => (
              <ProfilePage unreadChats={unreadChats}>
                <Profile socket={socket} />
              </ProfilePage>
            )}
          />
          <PrivateRoute
            exact
            path='/settings'
            component={() => (
              <ProfilePage unreadChats={unreadChats}>
                <Settings />
              </ProfilePage>
            )}
            isSignedIn={!!localStorage.token}
          />
          <PrivateRoute
            exact
            path={['/user/:id', '/search/user/:id', '/search/:id/user/:user_id']}
            component={() => (
              <ProfilePage anotherUser={true} unreadChats={unreadChats} isSignedIn={!!localStorage.token}>
                <AnotherProfile isSignedIn={!!localStorage.token} />
              </ProfilePage>
            )}
            isSignedIn={true}
          />
          <PrivateRoute
            exact
            path={'/deals'}
            component={() => (
              <ProfilePage unreadChats={unreadChats}>
                <Deals />
              </ProfilePage>
            )}
            isSignedIn={!!localStorage.token}
          />
          <PrivateRoute
            exact
            path={'/completedDeals'}
            component={() => (
              <ProfilePage unreadChats={unreadChats}>
                <CompletedDeals />
              </ProfilePage>
            )}
            isSignedIn={!!localStorage.token}
          />
          <PrivateRoute
            exact
            path='/deals/:id'
            component={() => (
              <ProfilePage unreadChats={unreadChats}>
                <DealConfirm />
              </ProfilePage>
            )}
            isSignedIn={!!localStorage.token}
          />
          <PrivateRoute
            exact
            path='/transactions'
            component={() => (
              <ProfilePage unreadChats={unreadChats}>
                <Transactions />
              </ProfilePage>
            )}
            isSignedIn={!!localStorage.token}
          />
          <PrivateRoute
            exact
            path='/favorites'
            component={() => (
              <ProfilePage unreadChats={unreadChats}>
                <Favorites />
              </ProfilePage>
            )}
            isSignedIn={!!localStorage.token}
          />
          <PrivateRoute
            exact
            path='/replenishment'
            component={() => (
              <ProfilePage unreadChats={unreadChats}>
                <Replenishment />
              </ProfilePage>
            )}
            isSignedIn={!!localStorage.token}
          />
          <PrivateRoute
            exact
            path='/withdrawal-of-funds'
            component={() => (
              <ProfilePage unreadChats={unreadChats}>
                <WithdrawalOfFunds />
              </ProfilePage>
            )}
            isSignedIn={!!localStorage.token}
          />
          <PrivateRoute
            exact
            path='/notifications'
            component={() => (
              <ProfilePage unreadChats={unreadChats}>
                <Notifications />
              </ProfilePage>
            )}
            isSignedIn={!!localStorage.token}
          />
          <Route exact path='/'>
            <MainPage />
          </Route>
          <Route exact path='/categories'>
            <CategoriesPage setActiveNav={setActiveNav} />
          </Route>
          <Route exact path={['/search', '/search/:id']}>
            <GlobalSearchPage
              setTransOnSub={setTransOnSub}
              searchTextState={searchTextState}
            />
          </Route>
          <PrivateRoute
            exact
            path='/admin/users'
            component={() => (
              <AdminPage>
                <Users />
              </AdminPage>
            )}
            isSignedIn={!!localStorage.token}
          />
          <PrivateRoute
            exact
            path='/admin/services'
            component={() => (
              <AdminPage>
                <Services />
              </AdminPage>
            )}
            isSignedIn={!!localStorage.token}
          />
          <PrivateRoute
            exact
            path='/admin/dealings'
            component={() => (
              <AdminPage>
                <DealingsAdmin />
              </AdminPage>
            )}
            isSignedIn={!!localStorage.token}
          />
          <PrivateRoute
            exact
            path='/admin/favorites'
            component={() => (
              <AdminPage>
                <FavoritesAdmin />
              </AdminPage>
            )}
            isSignedIn={!!localStorage.token}
          />
          <PrivateRoute
            exact
            path='/admin/transactions'
            component={() => (
              <AdminPage>
                <TransactionsAdmin />
              </AdminPage>
            )}
            isSignedIn={!!localStorage.token}
          />
          <PrivateRoute
            exact
            path='/admin/balance-replenishment-applications'
            component={() => (
              <AdminPage>
                <PaymentSystemApplicationsAdmin />
              </AdminPage>
            )}
            isSignedIn={!!localStorage.token}
          />
          <PrivateRoute
            exact
            path='/admin/withdrawal-of-requests'
            component={() => (
              <AdminPage>
                <WithdrawalOfRequestsAdmin />
              </AdminPage>
            )}
            isSignedIn={!!localStorage.token}
          />
          <PrivateRoute
            exact
            path='/admin/complaints'
            component={() => (
              <AdminPage>
                <ComplaintsAdmin />
              </AdminPage>
            )}
            isSignedIn={!!localStorage.token}
          />
          <PrivateRoute
            exact
            path='/admin/categories'
            component={() => (
              <AdminPage>
                <CategoriesAdmin />
              </AdminPage>
            )}
            isSignedIn={!!localStorage.token}
          />
          <PrivateRoute
            exact
            path='/admin/cities'
            component={() => (
              <AdminPage>
                <CitiesAdmin />
              </AdminPage>
            )}
            isSignedIn={!!localStorage.token}
          />
          <PrivateRoute
            exact
            path='/admin/sections'
            component={() => (
              <AdminPage>
                <SectionsAdmin />
              </AdminPage>
            )}
            isSignedIn={!!localStorage.token}
          />
          <PrivateRoute
            exact
            path={['/admin/chat', '/admin/chat/:id']}
            component={() => (
              <AdminPage>
                <MessagerPage socket={socket} IsAdmin={true} />
              </AdminPage>
            )}
            isSignedIn={!!localStorage.token}
          />
          <PrivateRoute
            exact
            path={['/messages/:id', '/messages']}
            component={() => <MessagerPage socket={socket} change_unread_chats={change_unread_chats} />}
            isSignedIn={!!localStorage.token}
          />
          <PrivateRoute
            exact
            path={'/news'}
            component={() => <News isSignedIn={!!localStorage.token} />}
            isSignedIn={true}
          />
          <PrivateRoute
            exact
            path='/checkSellers'
            component={() => <CheckSellers />}
            isSignedIn={true}
          />
          <PrivateRoute
            exact
            path='/cooperation'
            component={() => <Cooperation />}
            isSignedIn={true}
          />
          <PrivateRoute
            exact
            path='/guarantorService'
            component={() => <GuarantorService />}
            isSignedIn={true}
          />
          <PrivateRoute
            exact
            path='/rulesProject'
            component={() => <RulesProject />}
            isSignedIn={true}
          />
          <PrivateRoute
            exact
            path='/siteMap'
            component={() => <SiteMap />}
            isSignedIn={true}
          />
          <PrivateRoute
            exact
            path='/aboutProject'
            component={() => <AboutProject />}
            isSignedIn={true}
          />
          <PrivateRoute
            exact
            path={[
              '/service/:id',
              '/service/:id/page/:numPage',
              '/search/service/:id',
              '/search/service/:id/page/:numPage',
              '/search/:id/service/:service_id/page/:numPage',
              '/search/:id/service/:service_id',
              '/search/:id/user/:user_id/service/:service_id/page/:numPage',
              '/search/:id/user/:user_id/service/:service_id',
              '/search/user/:user_id/service/:service_id/page/:numPage',
              '/search/user/:user_id/service/:service_id',
            ]}
            component={() => <Service isSignedIn={!!localStorage.token} />}
            isSignedIn={true}
          />
          <PrivateRoute
            exact
            path='/admin/payment-methods'
            component={() => (
              <AdminPage>
                <PaymentMethods />
              </AdminPage>
            )}
            isSignedIn={!!localStorage.token}
          />
          <PrivateRoute
            exact
            path={['/admin/wallet']}
            component={() => (
              <AdminPage>
                <Wallet />
              </AdminPage>
            )}
            isSignedIn={!!localStorage.token}
          />
          <Route>
            <NoFound />
          </Route>
        </Switch>
        <Footer />
      </ThemeProvider>
    </Router>
  )
}

export default connect(null)(App)
