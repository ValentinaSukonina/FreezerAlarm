import React from 'react';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';

const App: React.FC = () => {
    return (
        <div>
            <Header />
            <Dashboard />
        </div>
    );
};

export default App;
