import './App.css';
import * as React from 'react';
import { Route, Routes } from 'react-router-dom';
import Graph from './pages/Graph';
import SignIn from './pages/SignIn';

function App() {
  return (
    <div>
      <Routes>
        <Route path='/' element={<SignIn />} />
        <Route path='/graph' element={<Graph />} />
      </Routes>
    </div>
  );
}

export default App;