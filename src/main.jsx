import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
<<<<<<< HEAD
import { BrowserRouter } from 'react-router-dom'
=======
>>>>>>> 7bb20d4b4a205f015614370ff883869d6628d8eb
import App from './App.jsx'
import 'bootstrap/dist/css/bootstrap.min.css'
import './index.css'

createRoot(document.getElementById('root')).render(
    <StrictMode>
<<<<<<< HEAD
        <BrowserRouter>
            <App />
        </BrowserRouter>
=======
        <App />
>>>>>>> 7bb20d4b4a205f015614370ff883869d6628d8eb
    </StrictMode>,
)
