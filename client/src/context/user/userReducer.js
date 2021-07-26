const handlers = {
    AUTH_REGISTER: (state, { payload }) => ({
        ...state,
        registration: payload,
        loading: false
    }),
    AUTH_LOGIN: (state, { payload }) => ({
        ...state,
        user: payload,
        loading: false
    }),
    AUTH_STATUS_TITLE: (state, { payload }) => ({
        ...state,
        statusTitle: payload
    }),
    AUTH_STATUS_EMAIL: (state, { payload }) => ({
        ...state,
        statusEmail: payload
    }),
    AUTH_STATUS_PASSWORD: (state, { payload }) => ({
        ...state,
        statusPassword: payload
    }),
    AUTH_RESET: (state, action) => ({
        ...state,
        user: {},
        loading: false
    }),
    AUTH_DELETE: (state, action) => ({
        ...state,
        user: {},
        loading: false
    }),
    AUTH_LOADING: (state, action) => ({
        ...state,
        loading: true
    }),
    DEFAULT: state => state
}

export const userReducer = (state, action) => {
    const handler = handlers[action.type] || handlers.DEFAULT
    return handler(state, action)
}