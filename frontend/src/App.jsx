import React from 'react';
import Header from './components/Header.jsx';
import Dashboard from './pages/Dashboard.jsx';
import FreezerList from "./pages/FreezerList";

console.log('App.tsx: Rendering App component...');

const App= () => {
    console.log('App.tsx: Inside App component!');
    return (
        <div>
            <Header />
            <Dashboard/>
            <FreezerList />
        </div>
    );
};

export default App



