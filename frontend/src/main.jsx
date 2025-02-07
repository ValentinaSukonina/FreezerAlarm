import React from 'react';
import ReactDOM from 'react-dom/client';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

import App from './App.jsx';

const root = document.getElementById('root');
if (root) {
    const reactRoot = ReactDOM.createRoot(root);
    reactRoot.render(<App />);
}

