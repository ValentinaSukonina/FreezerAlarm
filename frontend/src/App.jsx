import React from 'react';
import {BrowserRouter as Router, Route, Routes} from "react-router-dom";

import Header from './components/Header.jsx';
import Home from "./pages/Home";
import Footer from "./components/Footer.jsx";
import Personal from "./pages/Personal";
import Login from "./pages/Login";
import Freezers from "./pages/Freezers";
import FreezerPage from "./pages/FreezerPage";
import AlertConfirmation from "./components/AlertConformation";
import Unauthorized from "./components/Unauthorized";


console.log('App.jsx: Rendering App component...');

const App = () => {
    return (
        <Router> {/* Router should wrap everything */}
            <div className="d-flex flex-column min-vh-100">
                <Header/>
                {/* Main content that grows */}
                <main className="flex-grow-1 d-flex flex-column">
                    <Routes>
                        <Route path="/" element={<Home/>}/>
                        <Route path="/personal" element={<Personal/>}/>
                        <Route path="/create-account" element={<Login/>}/>
                        <Route path="/freezers" element={<Freezers/>}/>
                        <Route path="/freezers/:freezerNumber" element={<FreezerPage/>}/>
                        <Route path="/confirmation" element={<AlertConfirmation/>}/>
                        <Route path="/unauthorized" element={<Unauthorized />} />
                    </Routes>
                </main>
                <Footer/>
            </div>
        </Router>
    );
};

export default App;