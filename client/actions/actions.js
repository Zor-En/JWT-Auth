
import * as types from './actionTypes';

export const toggleVerify = (bool) => ({
    types: types.TOGGLE_VERIFY,
    payload: bool
})