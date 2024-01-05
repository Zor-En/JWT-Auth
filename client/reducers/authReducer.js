import * as types from '../actions/actionTypes';

const initialState = {
    verified: false
}

const authReducer = (state = initialState, action) => {
    switch(action.type) {
        case types.TOGGLE_VERIFY:
            return {
                ...state,
                verified: action.payload.bool
            }
        default:
            return state
    }
}

export default authReducer