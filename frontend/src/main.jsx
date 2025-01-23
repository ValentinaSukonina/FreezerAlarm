import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

const root = document.getElementById('root');
if (root) {
    const reactRoot = ReactDOM.createRoot(root);
    reactRoot.render(<App />);
}