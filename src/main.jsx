import React from 'react';
import ReactDOM from 'react-dom/client'; // OK
import App from './App';
import './index.css';
import { BrowserRouter } from "react-router-dom"; 
import 'react-toastify/dist/ReactToastify.css';


//const root = ReactDOM.createRoot(document.getElementById('root'));

//root.render(
 // <React.StrictMode>
   // <App />
  //</React.StrictMode>
//);


ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
      <App />

  </React.StrictMode>
);