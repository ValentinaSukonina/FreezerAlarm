import React from 'react';
import {BrowserRouter as Router, Route, Routes} from "react-router-dom";

import Header from './components/Header.jsx';
import Home from "./pages/Home";
import Footer from "./components/Footer.jsx";
import Personal from "./pages/Personal";
import CreateAccount from "./pages/CreateAccount";
import FreezersAll from "./pages/Freezers";
import FreezerSingle from "./components/FreezerSingle";


console.log('App.jsx: Rendering App component...');

const App = () => {
    return (
        <Router> {/* Router should wrap everything */}
            <div className="main-content">
                <Header/>
                <Routes>
                    <Route path="/" element={<Home/>}/>
                    <Route path="/personal" element={<Personal/>}/>
                    <Route path="/create-account" element={<CreateAccount/>}/>
                    <Route path="/freezers" element={<FreezersAll/>}/>
                    <Route path="/freezer/:freezerNumber" element={<FreezerSingle/>}/>
                </Routes>
                <Footer/>
            </div>
        </Router>
    );
};

export default App;