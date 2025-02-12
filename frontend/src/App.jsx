import React from 'react';
import Header from './components/Header.jsx';
import Home from "./pages/Home";
import {BrowserRouter as Router,Route,Routes} from "react-router-dom";
import Personal from "./pages/Personal";
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
        </Router>
    );
};

export default App



