import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { ModalState } from "./context/modal/modalState";
import { UserState } from "./context/user/userState";
import { ProfileState } from "./context/profile/profileState";
import { ServiceState } from "./context/services/serviceState";
import { Provider } from "react-redux";
import store from "./redux/store";
import {
  BreadcrumbsProvider
} from 'react-breadcrumbs-dynamic'
ReactDOM.render(
  // <React.StrictMode>
  <Provider store={store}>
    <BreadcrumbsProvider>
      <ModalState>
        <UserState>
          <ServiceState>
            <ProfileState>
              <App />
            </ProfileState>
          </ServiceState>
        </UserState>
      </ModalState>
    </BreadcrumbsProvider>
  </Provider>,
  // </React.StrictMode>
  document.getElementById("root")
);
