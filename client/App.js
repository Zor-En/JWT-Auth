import React from "react";
import Login from './components/Login'
import Homepage from './components/Homepage'
import {useSelector} from 'react-redux'

const App = () => {
  const verified = useSelector((state) => state.verified)

  return ( 
    <div>
    {!verified ? <Login /> : <Homepage />} 
    </div>
  )
};

export default App;
