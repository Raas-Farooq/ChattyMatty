import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import Navbar from './navbar';
import './App.css'
import MainBody from './body';


function App() {

  return (
    <>
      <Navbar />
      <MainBody />
    </>
  )
}

export default App
