import './App.css';
import * as React from 'react';
import { Route, Routes } from 'react-router-dom';
import Graph from './pages/Graph/Graph';
import SignIn from './pages/SignIn/SignIn';
import { FirebaseContextProvider } from './context/FirebaseContext';

function App() {
  return (
    <FirebaseContextProvider>
      <div>
        <Routes>
          <Route path='/' element={<SignIn />} />
          <Route path='/graph' element={<Graph />} />
        </Routes>
      </div>
    </FirebaseContextProvider>
  );
}

export default App;