import React from 'react';
import {BrowserRouter as Router, Route, Routes} from "react-router-dom";

import Header from './components/Header.jsx';
import Home from "./pages/Home";
import Footer from "./components/Footer.jsx";
import Personal from "./pages/Personal";
import CreateAccount from "./pages/CreateAccount";


console.log('App.tsx: Rendering App component...');

const App = () => {
    return (
        <Router> {/* Router should wrap everything */}
            <div className="main-content">
                <Header/>
                <Routes>
                    <Route path="/" element={<Home/>}/>
                    <Route path="/personal" element={<Personal/>}/>
                    <Route path="/create-account" element={<CreateAccount/>}/>
                </Routes>
                <Footer/>
            </div>
        </Router>
    );
};

export default App;


