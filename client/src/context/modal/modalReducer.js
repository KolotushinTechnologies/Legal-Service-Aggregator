const handlers = {
    MODAL_AUTH_TOGGLE: (state, { payload }) => ({
        ...state,
        modalAuth: payload
    }),
    MODAL_REGISTRATION_TOGGLE: (state, { payload }) => ({
        ...state,
        modalRegistration: payload
    }),
    MODAL_FORGOT_TOGGLE: (state, { payload }) => ({
        ...state,
        modalForgot: payload
    }),
    MODAL_SERVICE_TOGGLE: (state, { payload }) => ({
        ...state,
        modalService: payload
    }),
    MODAL_SERVICE_EDIT_TOGGLE: (state, { payload }) => ({
        ...state,
        modalServiceEdit: payload
    }),
    DEFAULT: state => state
}

export const modalReducer = (state, action) => {
    const handler = handlers[action.type] || handlers.DEFAULT
    return handler(state, action)
}