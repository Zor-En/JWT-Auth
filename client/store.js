
import { configureStore } from '@reduxjs/toolkit';
import authReducers from './reducers/authReducer'

// we are adding composeWithDevTools here to get easy access to the Redux dev tools
const store = configureStore({reducer: authReducers});

export default store;
