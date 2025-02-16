import React, {useEffect, useState} from "react";
import {fetchUsers} from "../services/api"; // Ensure this API function fetches users correctly

console.log("PersonalContent.jsx: Rendering PersonalContent component...");

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
                setError("Failed to load users");
            } finally {
                setLoading(false);
            }
        };

        getUsers();
    }, []);

    return (
        <main className="container mt-5">
            <h2 className="text-center">List of Registered Personnel</h2>

            {loading && <p className="text-center">Loading users...</p>}
            {error && <p className="text-center text-danger">{error}</p>}

            {users.length > 0 ? (
                <div className="table-responsive mt-4 px-2">
                    <table className="table table-bordered table-hover text-center"
                           style={{
                               backgroundColor: "#F4FFC3",
                               color: "#5D8736",
                               border: "2px solid #5D8736",
                               width: "100%",
                               tableLayout: "auto" // Allows columns to resize properly
                           }}>
                        <thead style={{backgroundColor: "#5D8736", color: "white"}}>
                        <tr>
                            <th scope="col">Name</th>
                            <th scope="col">Email</th>
                            <th scope="col">Phone Number</th>
                            <th scope="col">Role</th>
                        </tr>
                        </thead>
                        <tbody>
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td>{user.name}</td>
                                <td className="text-wrap">{user.email}</td>
                                {/* Allow wrapping */}
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

export default PersonalContent