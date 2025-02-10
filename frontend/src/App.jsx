import React from 'react';
import Header from './components/Header.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Home from "./pages/Home";
import {BrowserRouter as Router,Route,Routes} from "react-router-dom";


console.log('App.tsx: Rendering App component...');

const App = () => {
    return (
        <Router>
            <Header />
            <Routes>
                <Route path="/" element={<Home/>} />
            </Routes>
        </Router>
    );
};
//dashborad is removed
export default App



