import './App.css';
import * as React from 'react';
import { Route, Routes } from 'react-router-dom';
import GraphPage from "./pages/Graph/GraphPage";
import SignIn from './pages/SignIn/SignIn';
import { FirebaseContextProvider } from './context/FirebaseContext';
import NotificationManager from "./components/NotificationManager";

function MyRoutes() {
  return <Routes>
    <Route path='/' element={<SignIn />} />
    <Route path='/graph' element={<GraphPage />} />
  </Routes>;
}

function App() {
  return (
    <FirebaseContextProvider>
      <NotificationManager />
      <MyRoutes />
    </FirebaseContextProvider>
  );
}

export default App;
