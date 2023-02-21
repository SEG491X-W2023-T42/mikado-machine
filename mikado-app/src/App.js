import './App.css';
import * as React from 'react';
import { Route, Routes } from 'react-router-dom';
import Plaza from './pages/Graph/Plaza';
import SignIn from './pages/SignIn/SignIn';
import { FirebaseContextProvider } from './context/FirebaseContext';

function App() {
  return (
    <FirebaseContextProvider>
      <div>
        <Routes>
          <Route path='/' element={<SignIn />} />
          <Route path='/graph' element={<Plaza />} />
        </Routes>
      </div>
    </FirebaseContextProvider>
  );
}

export default App;
