import './App.css';
import * as React from 'react';
import { Route, Routes } from 'react-router-dom';
import GraphPage from "./pages/Graph/GraphPage";
import SignIn from './pages/SignIn/SignIn';
import { FirebaseContextProvider } from './context/FirebaseContext';

function App() {
  return (
    <FirebaseContextProvider>
      <div>
        <Routes>
          <Route path='/' element={<SignIn />} />
          <Route path='/graph' element={<GraphPage />} />
        </Routes>
      </div>
    </FirebaseContextProvider>
  );
}

export default App;
