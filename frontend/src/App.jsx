import React from 'react';
import {BrowserRouter as Router, Route, Routes} from "react-router-dom";

import Header from './components/Header.jsx';
import Footer from "./components/Footer.jsx";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Personal from "./pages/Personal";
import Login from "./pages/Login";
import Freezers from "./pages/Freezers";
import FreezerPage from "./pages/FreezerPage";
import AlertConfirmation from "./components/AlertConformation";
import Unauthorized from "./components/Unauthorized";
import MyAccount from "./pages/MyAccount";

const App = () => {
    return (
        <Router>
            <div className="d-flex flex-column min-vh-100">
                <Header/>
                <main className="flex-grow-1 d-flex flex-column">
                    <Routes>
                        <Route path="/" element={<Home/>}/>
                        <Route path="/create-account" element={<Login/>}/>
                        <Route path="/confirmation" element={<AlertConfirmation/>}/>
                        <Route path="/unauthorized" element={<Unauthorized/>}/>

                        {/* Protected: login required */}
                        <Route
                            path="/my-account"
                            element={
                                <ProtectedRoute>
                                    <MyAccount/>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/freezers"
                            element={
                                <ProtectedRoute>
                                    <Freezers/>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/freezers/:freezerNumber"
                            element={
                                <ProtectedRoute>
                                    <FreezerPage/>
                                </ProtectedRoute>
                            }
                        />

                        {/* Protected: admin only */}
                        <Route
                            path="/personal"
                            element={
                                <ProtectedRoute requiredRole="admin">
                                    <Personal/>
                                </ProtectedRoute>
                            }
                        />
                    </Routes>
                </main>
                <Footer/>
            </div>
        </Router>
    );
};

export default App;

