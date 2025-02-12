import React from 'react';
import {BrowserRouter as Router, Route, Routes} from "react-router-dom";
import Header from './components/Header.jsx';
import Home from "./pages/Home";
import Personal from "./pages/Personal";
import Footer from "./components/Footer";
import CreateAccount from "./pages/CreateAccount";



console.log('App.tsx: Rendering App component...');

const App = () => {
    return (
        <Router>
            <Header />
            <Routes>
                <Route path="/" element={<Home/>} />
                <Route path="/personal" element={<Personal/>} />
                <Route path="/create-account" element={<CreateAccount />} />
            </Routes>
            <Footer/>
        
        </Router>
    );
};

export default App



