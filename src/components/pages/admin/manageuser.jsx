import { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../../sidenav"; // Adjust this path if your folder structure is different

function ManageUsers() {
    const [activeTab, setActiveTab] = useState("requests"); // "requests" or "directory"
    
    const [requests, setRequests] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const token = localStorage.getItem("access_token");

    // Fetch data based on which tab is currently open
    const fetchData = async () => {
        setLoading(true);
        try {
            const headers = { Authorization: `Bearer ${token}` };
            if (activeTab === "requests") {
                const res = await axios.get("http://127.0.0.1:8000/admin/organizer_requests", { headers });
                setRequests(res.data);
            } else {
                const res = await axios.get("http://127.0.0.1:8000/admin/all_users", { headers });
                setAllUsers(res.data);
            }
        } catch (error) {
            console.error("🚨 Failed to fetch users:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchData();
    }, [activeTab, token]);

    // --- UNIVERSAL ACTION HANDLER ---
    // This handles Approving, Rejecting, Banning, Unbanning, Promoting, and Demoting!
    const handleAction = async (endpoint, successMessage) => {
        try {
            await axios.put(`http://127.0.0.1:8000/admin/${endpoint}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert(successMessage);
            fetchData(); // Instantly refresh the list to show the change
        } catch (error) {
            console.error("Action failed:", error);
            alert(error.response?.data?.detail || "Action failed.");
        }
    };

    return (
        <div className="bg-[#F4F5F9] min-h-screen flex flex-row font-['Lato']">
            <Sidebar />

            <div className="flex-1 p-8 lg:p-12 overflow-y-auto">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h1 className="font-['bebas-neue'] font-bold text-4xl text-[#2D2D2D] tracking-wide uppercase leading-none">
                            Access Control
                        </h1>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-2">
                            Manage permissions and platform security
                        </p>
                    </div>
                </div>

                {/* --- TABS NAVIGATION --- */}
                <div className="flex gap-4 border-b border-gray-200 mb-8">
                    <button 
                        onClick={() => setActiveTab("requests")}
                        className={`pb-3 px-2 font-bold text-sm tracking-wide uppercase transition-colors relative ${
                            activeTab === "requests" ? "text-[#6E39CB]" : "text-gray-400 hover:text-gray-600"
                        }`}
                    >
                        Pending Requests
                        {activeTab === "requests" && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#6E39CB] rounded-t-full"></div>}
                        {requests.length > 0 && activeTab !== "requests" && (
                            <span className="absolute top-0 -right-4 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                        )}
                    </button>
                    <button 
                        onClick={() => setActiveTab("directory")}
                        className={`pb-3 px-2 font-bold text-sm tracking-wide uppercase transition-colors relative ${
                            activeTab === "directory" ? "text-[#6E39CB]" : "text-gray-400 hover:text-gray-600"
                        }`}
                    >
                        User Directory
                        {activeTab === "directory" && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#6E39CB] rounded-t-full"></div>}
                    </button>
                </div>

                {/* --- TAB 1: PENDING ORGANIZER REQUESTS --- */}
                {activeTab === "requests" && (
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                        {loading ? (
                            <div className="p-12 text-center text-gray-400 font-bold tracking-widest uppercase text-xs">Loading Requests...</div>
                        ) : requests.length === 0 ? (
                            <div className="p-16 text-center">
                                <div className="text-5xl mb-4">✅</div>
                                <h3 className="text-gray-800 font-bold text-xl mb-1">You're all caught up!</h3>
                                <p className="text-gray-400 text-sm">There are no pending organizer requests right now.</p>
                            </div>
                        ) : (
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="py-4 px-6 text-gray-500 text-[10px] font-black uppercase tracking-widest">User Details</th>
                                        <th className="py-4 px-6 text-gray-500 text-[10px] font-black uppercase tracking-widest">Current Role</th>
                                        <th className="py-4 px-6 text-gray-500 text-[10px] font-black uppercase tracking-widest text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {requests.map(user => (
                                        <tr key={user.user_id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                            <td className="py-4 px-6">
                                                <p className="font-bold text-gray-800">{user.name}</p>
                                                <p className="text-xs text-gray-400">{user.email}</p>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-2.5 py-1 rounded-md uppercase">
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 flex justify-end gap-3">
                                                <button 
                                                    onClick={() => handleAction(`approve_organizer/${user.user_id}`, "User approved!")}
                                                    className="bg-green-50 text-green-600 hover:bg-green-500 hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors"
                                                >
                                                    Approve
                                                </button>
                                                <button 
                                                    onClick={() => handleAction(`reject_organizer/${user.user_id}`, "Request rejected.")}
                                                    className="bg-red-50 text-red-600 hover:bg-red-500 hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors"
                                                >
                                                    Reject
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}

                {/* --- TAB 2: USER DIRECTORY --- */}
                {activeTab === "directory" && (
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col min-h-125">
                        
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="font-bold text-gray-800">All Registered Users</h3>
                            
                            {/* SEARCH BAR */}
                            <div className="relative w-64 group">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none group-focus-within:text-[#6E39CB] transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
                                </span>
                                <input 
                                    type="text" 
                                    placeholder="Search email or name..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#6E39CB] focus:border-transparent outline-none transition-all shadow-sm group-hover:border-gray-300"
                                />
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex-1 flex items-center justify-center p-12 text-gray-400 font-bold tracking-widest uppercase text-xs">Loading Directory...</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-white border-b border-gray-100">
                                        <tr>
                                            <th className="py-4 px-6 text-gray-400 text-[10px] font-black uppercase tracking-widest">User</th>
                                            <th className="py-4 px-6 text-gray-400 text-[10px] font-black uppercase tracking-widest">Role</th>
                                            <th className="py-4 px-6 text-gray-400 text-[10px] font-black uppercase tracking-widest">Status</th>
                                            <th className="py-4 px-6 text-gray-400 text-[10px] font-black uppercase tracking-widest text-right">Moderation Tools</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {allUsers
                                            .filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase()))
                                            .map(user => (
                                            <tr key={user.user_id} className={`border-b border-gray-50 transition-colors ${!user.is_active ? 'bg-red-50/30' : 'hover:bg-gray-50'}`}>
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${!user.is_active ? 'bg-red-100 text-red-500' : 'bg-gray-100 text-gray-500'}`}>
                                                            {user.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className={`font-bold text-sm ${!user.is_active ? 'text-red-700' : 'text-gray-800'}`}>{user.name}</p>
                                                            <p className="text-[10px] text-gray-400">{user.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-md uppercase ${
                                                        user.role === "Admin" ? "bg-purple-100 text-[#6E39CB]" : 
                                                        user.role === "Organizer" ? "bg-blue-50 text-blue-600" : "bg-gray-100 text-gray-500"
                                                    }`}>
                                                        {user.role}
                                                    </span>
                                                </td>
                                                
                                                <td className="py-4 px-6">
                                                    {/* 🚨 UPDATED LOGIC: Checking is_active instead of is_banned */}
                                                    {!user.is_active ? (
                                                        <span className="text-red-500 font-bold text-xs flex items-center gap-1.5 bg-red-50 px-2 py-1 rounded w-fit">
                                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5"><path fillRule="evenodd" d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z" clipRule="evenodd" /></svg>
                                                            Banned
                                                        </span>
                                                    ) : (
                                                        <span className="text-green-600 font-bold text-xs flex items-center gap-1.5">
                                                            <div className="w-2 h-2 rounded-full bg-green-500"></div> Active
                                                        </span>
                                                    )}
                                                </td>
                                                
                                                <td className="py-4 px-6 flex justify-end gap-2">
                                                    {/* 🚨 UPDATED LOGIC: BAN / UNBAN TOGGLE */}
                                                    {!user.is_active ? (
                                                        <button 
                                                            onClick={() => handleAction(`users/${user.user_id}/unban`, "User Unbanned!")}
                                                            className="text-green-600 border border-green-200 hover:bg-green-50 hover:border-green-300 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm"
                                                        >
                                                            Unban
                                                        </button>
                                                    ) : (
                                                        <button 
                                                            onClick={() => handleAction(`users/${user.user_id}/ban`, "User Banned!")}
                                                            className="text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                                                        >
                                                            Ban
                                                        </button>
                                                    )}

                                                    {/* PROMOTE / DEMOTE ADMIN */}
                                                    <div className="w-px h-6 bg-gray-200 mx-1 self-center"></div>

                                                    {user.role === "Admin" ? (
                                                        <button 
                                                            onClick={() => handleAction(`users/${user.user_id}/demote`, "Admin rights revoked.")}
                                                            className="text-gray-500 hover:bg-gray-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                                                        >
                                                            Demote
                                                        </button>
                                                    ) : (
                                                        <button 
                                                            onClick={() => handleAction(`users/${user.user_id}/promote-admin`, "Promoted to Admin!")}
                                                            className="text-[#6E39CB] hover:bg-purple-50 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                                                        >
                                                            Make Admin
                                                        </button>
                                                    )}

                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default ManageUsers;