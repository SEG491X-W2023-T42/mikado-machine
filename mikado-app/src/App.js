import './App.css';
import * as React from 'react';
import { Route, Routes } from 'react-router-dom';
import GraphWrapper from "./pages/Graph/GraphWrapper";
import SignIn from './pages/SignIn/SignIn';
import { FirebaseContextProvider } from './context/FirebaseContext';
import ToastManager from "./graph/components/ToastManager";

function MyRoutes() {
  return <Routes>
    <Route path='/' element={<SignIn />} />
    <Route path='/graph' element={<GraphWrapper />} />
  </Routes>;
}

function App() {
  return (
    <FirebaseContextProvider>
      <ToastManager />
      <MyRoutes />
    </FirebaseContextProvider>
  );
}

export default App;
