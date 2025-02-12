import React, { useEffect, useState } from 'react';
import { fetchUsers } from "../services/api"; // Ensure this API function fetches users correctly

console.log('PersonalContent.jsx: Rendering PersonalContent component...');

const PersonalContent = () => {
    const [users, setUsers] = useState([]); // State to store users
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const getUsers = async () => {
            try {
                const data = await fetchUsers(); // Fetch users from backend
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
        <main className="container mt-5">  {/* Added Bootstrap container and margin-top */}
            <h2 className="text-center">List of Registered Personnel</h2> {/* Centered Title */}

            {loading && <p className="text-center">Loading users...</p>}
            {error && <p className="text-center text-danger">{error}</p>}

            {users.length > 0 ? (
                <div className="table-responsive mt-4 px-4"> {/* Centers the table and prevents overflow */}
                    <table className="table table-bordered table-hover"
                           style={{
                               backgroundColor: "#F4FFC3",
                               color: "#5D8736",
                               border: "2px solid #5D8736"
                           }}>
                        <thead style={{ backgroundColor: "#5D8736", color: "white" }}>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone Number</th>
                            <th>Role</th>
                        </tr>
                        </thead>
                        <tbody>
                        {users.map(user => (
                            <tr key={user.id} style={{ borderBottom: "2px solid #5D8736" }}>
                                <td>{user.name}</td>
                                <td>{user.email}</td>
                                <td>{user.phone_number}</td>
                                <td>{user.role}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                !loading && <p className="text-center">No users found.</p>
            )}
        </main>
    );
};

export default PersonalContent;
