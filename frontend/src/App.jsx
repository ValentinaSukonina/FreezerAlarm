import React from 'react';
import Header from './components/Header.jsx';
import Dashboard from './pages/Dashboard.jsx';


console.log('App.tsx: Rendering App component...');

const App = () => {
    return (
        <Router>
            <Header />
            <Dashboard/>
            <Routes>
                <Route path="/" element={<Home />} />
            </Routes>
        </Router>
    );
};

export default App



