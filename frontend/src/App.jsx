import React from 'react';
import {BrowserRouter as Router, Route, Routes} from "react-router-dom";

import Header from './components/Header.jsx';
import Home from "./pages/Home";
import Footer from "./components/Footer.jsx";
import Personal from "./pages/Personal";


console.log('App.tsx: Rendering App component...');

const App = () => {
    return (
        <div className="main-content">
            <Router>
                <Header/>
                <Routes>
                    <Route path="/" element={<Home/>}/>
                    <Route path="/personal" element={<Personal/>}/>
                </Routes>
                <Footer/>
            </Router>
        </div>
    );
};

export default App;