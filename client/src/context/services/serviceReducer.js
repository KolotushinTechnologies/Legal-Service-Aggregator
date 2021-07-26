const handlers = {

    SERVICE_GET_ALL: (state, { payload }) => ({
        ...state,
        allServices: payload,
        loading: false
    }),

    DEFAULT: state => state
}

export const serviceReducer = (state, action) => {
    const handler = handlers[action.type] || handlers.DEFAULT
    return handler(state, action)
}