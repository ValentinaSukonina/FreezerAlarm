import React from 'react';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

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

console.log('App.jsx: Rendering App component...');

const App = () => {
    return (
        <Router>
            <div className="d-flex flex-column min-vh-100">
                <Header />
                <main className="flex-grow-1 d-flex flex-column">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/create-account" element={<Login />} />
                        <Route path="/freezers" element={<Freezers />} />
                        <Route path="/freezers/:freezerNumber" element={<FreezerPage />} />
                        <Route path="/confirmation" element={<AlertConfirmation />} />
                        <Route path="/unauthorized" element={<Unauthorized />} />

                        {/* Protected: Only for logged-in users */}
                        <Route
                            path="/my-account"
                            element={
                                <ProtectedRoute>
                                    <MyAccount />
                                </ProtectedRoute>
                            }
                        />

                        {/* Protected: Only for logged-in admins */}
                        <Route
                            path="/personal"
                            element={
                                <ProtectedRoute requiredRole="admin">
                                    <Personal />
                                </ProtectedRoute>
                            }
                        />
                    </Routes>
                </main>
                <Footer />
            </div>
        </Router>
    );
};

export default App;
