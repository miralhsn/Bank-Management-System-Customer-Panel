import React from 'react';
import express from 'express';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.js'; // Add `.js` here
import './index.css';
import userRouter from './routes/user'; 


const app = express();
createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

app.use('/user', userRouter);

app.listen(5000, () => console.log('Server running on port 5000'));