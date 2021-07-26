const handlers = {

    PROFILE_SET_LOADING: (state, { payload }) => ({
        ...state,
        loading: true
    }),

    PROFILE_SET_STATUS: (state, { payload }) => ({
        ...state,
        status: payload
    }),

    PROFILE_GET_OWN: (state, { payload }) => ({
        ...state,
        profile: payload,
        loading: false
    }),

    PROFILE_CHANGE_OWN: (state, { payload }) => ({
        ...state,
        profile: payload,
        loading: false
    }),

    PROFILE_GET_ANOTHER: (state, { payload }) => ({
        ...state,
        anotherProfile: payload,
        loading: false
    }),

    PROFILE_GET_ALL: (state, { payload }) => ({
        ...state,
        profiles: payload,
        loading: false
    }),

    DEFAULT: state => state
}

export const profileReducer = (state, action) => {
    const handler = handlers[action.type] || handlers.DEFAULT
    return handler(state, action)
}