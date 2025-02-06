import React, { useEffect, useState } from 'react';
import { fetchUsers } from '../services/api';

console.log('Dashboard.jsx: Rendering Dashboard component...');

const Dashboard = () => {
    const [users, setUsers] = useState([]); // State to store users
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const getUsers = async () => {
            try {
                const data = await fetchUsers();
                setUsers(data);
            } catch (err) {
                setError('Failed to load users');
            } finally {
                setLoading(false);
            }
        };

        getUsers();
    }, []);

    return (
        <main>
            <h2>Dashboard</h2>
            <p>Welcome to the dashboard!</p>

            {loading && <p>Loading users...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}

            <ul>
                {users.length > 0 ? (
                    users.map(user => (
                        <li key={user.id}>
                            {user.name} - {user.email}
                        </li>
                    ))
                ) : (
                    !loading && <p>No users found.</p>
                )}
            </ul>
        </main>
    );
};

export default Dashboard;



