import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginScreen from './screen/LoginScreen';
import HomeScreen from './screen/HomeScreen';
import ProtectedRoute from './components/ProtectedRoute';
import { ToastContainer } from 'react-toastify';

const App = () => {
  return (
    <>
    <ToastContainer/>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginScreen />} />
        <Route 
          path="/home" 
          element={
            <ProtectedRoute>
              <HomeScreen />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
    </>
  );
};

export default App;
