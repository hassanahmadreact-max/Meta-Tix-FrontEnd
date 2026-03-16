import { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../../sidenav"; 

function OrgProfile() {
    const [profile, setProfile] = useState({ name: "", email: "", role: "", is_organizer_pending: false });
    const [loading, setLoading] = useState(true);

    const [isEditingName, setIsEditingName] = useState(false);
    const [isEditingEmail, setIsEditingEmail] = useState(false);
    
    const [editName, setEditName] = useState("");
    const [editEmail, setEditEmail] = useState("");

    const token = localStorage.getItem("access_token");

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await axios.get("http://127.0.0.1:8000/users/me", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setProfile(response.data);
                setEditName(response.data.name);
                setEditEmail(response.data.email);
                setLoading(false);
            } catch (error) {
                console.error("🚨 Failed to fetch profile:", error);
                setLoading(false);
            }
        };

        if (token) fetchProfile();
    }, [token]);

    const handleUpdate = async (field) => {
        try {
            const payload = {};
            if (field === "name") payload.name = editName;
            if (field === "email") payload.email = editEmail;

            const response = await axios.patch("http://127.0.0.1:8000/users/update_me", payload, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            setProfile(response.data);
            
            if (field === "name") setIsEditingName(false);
            if (field === "email") setIsEditingEmail(false);
            
            if (field === "name") localStorage.setItem("user_name", response.data.name);

        } catch (error) {
            console.error("🚨 Failed to update profile:", error);
            alert("Could not update profile. Please check your inputs.");
        }
    };

    const handleOrganizerRequest = async () => {
        try {
            await axios.post("http://127.0.0.1:8000/users/request_organizer", {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setProfile((prev) => ({ ...prev, is_organizer_pending: true }));
            alert("🎉 Request sent! An admin will review your account shortly.");
        } catch (error) {
            console.error("🚨 Failed to request organizer status:", error);
            alert("Failed to send request. You might have already sent one!");
        }
    };

    return (
        <div className="bg-[#F4F5F9] min-h-screen flex flex-row font-['Lato']">
            
            <Sidebar />

            <div className="w-full flex-1 p-4 pt-24 md:p-10 lg:p-16 overflow-y-auto">
                
                {/* 🚨 UPDATED HEADER WITH SVG */}
                <div className="flex items-center gap-3 mb-8">
                    <div className="bg-white p-2.5 rounded-xl shadow-sm border border-gray-200 text-[#6E39CB]">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.99l1.004.828c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        </svg>
                    </div>
                    <h1 className="font-['bebas-neue'] font-bold text-4xl text-[#2D2D2D] tracking-wide translate-y-0.5">
                        Account Settings
                    </h1>
                </div>

                {loading ? (
                    <div className="flex items-center gap-3 text-[#6E39CB] text-lg font-bold">
                        <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        Loading your details...
                    </div>
                ) : (
                    <div className="max-w-3xl bg-white rounded-3xl shadow-sm border border-gray-200 p-5 md:p-8 flex flex-col gap-8">
                        
                        {/* 1. NAME AND EDIT */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-gray-100 gap-4">
                            <div className="flex-1 w-full">
                                {/* 🚨 UPDATED LABEL WITH SVG */}
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="bg-purple-50 p-1.5 rounded-lg text-[#6E39CB]">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                                        </svg>
                                    </div>
                                    <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Full Name</p>
                                </div>
                                
                                {isEditingName ? (
                                    <input 
                                        type="text" 
                                        value={editName} 
                                        onChange={(e) => setEditName(e.target.value)}
                                        className="w-full p-3 bg-gray-50 border border-[#6E39CB] rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all font-medium text-gray-900"
                                    />
                                ) : (
                                    <p className="text-xl text-gray-900 font-medium pl-1">{profile.name}</p>
                                )}
                            </div>
                            <div className="w-full sm:w-auto mt-2 sm:mt-0">
                                {isEditingName ? (
                                    <div className="flex gap-2">
                                        <button onClick={() => setIsEditingName(false)} className="flex-1 sm:flex-none px-5 py-2.5 border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50 font-bold transition-colors">Cancel</button>
                                        <button onClick={() => handleUpdate("name")} className="flex-1 sm:flex-none px-5 py-2.5 bg-[#6E39CB] text-white rounded-xl hover:bg-[#5a2ca0] font-bold shadow-md transition-colors">Save</button>
                                    </div>
                                ) : (
                                    <button onClick={() => setIsEditingName(true)} className="w-full sm:w-auto text-[#6E39CB] bg-purple-50 hover:bg-purple-100 px-5 py-2.5 rounded-xl font-bold transition-colors">Edit Name</button>
                                )}
                            </div>
                        </div>

                        {/* 2. EMAIL AND EDIT */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-gray-100 gap-4">
                            <div className="flex-1 w-full">
                                {/* 🚨 UPDATED LABEL WITH SVG */}
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="bg-purple-50 p-1.5 rounded-lg text-[#6E39CB]">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                                        </svg>
                                    </div>
                                    <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Email Address</p>
                                </div>

                                {isEditingEmail ? (
                                    <input 
                                        type="email" 
                                        value={editEmail} 
                                        onChange={(e) => setEditEmail(e.target.value)}
                                        className="w-full p-3 bg-gray-50 border border-[#6E39CB] rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all font-medium text-gray-900"
                                    />
                                ) : (
                                    <p className="text-xl text-gray-900 font-medium pl-1">{profile.email}</p>
                                )}
                            </div>
                            <div className="w-full sm:w-auto mt-2 sm:mt-0">
                                {isEditingEmail ? (
                                    <div className="flex gap-2">
                                        <button onClick={() => setIsEditingEmail(false)} className="flex-1 sm:flex-none px-5 py-2.5 border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50 font-bold transition-colors">Cancel</button>
                                        <button onClick={() => handleUpdate("email")} className="flex-1 sm:flex-none px-5 py-2.5 bg-[#6E39CB] text-white rounded-xl hover:bg-[#5a2ca0] font-bold shadow-md transition-colors">Save</button>
                                    </div>
                                ) : (
                                    <button onClick={() => setIsEditingEmail(true)} className="w-full sm:w-auto text-[#6E39CB] bg-purple-50 hover:bg-purple-100 px-5 py-2.5 rounded-xl font-bold transition-colors">Edit Email</button>
                                )}
                            </div>
                        </div>

                        {/* 3. ROLE (No Edit) */}
                        <div className="pb-6 border-b border-gray-100">
                            {/* 🚨 UPDATED LABEL WITH SVG */}
                            <div className="flex items-center gap-2 mb-3">
                                <div className="bg-purple-50 p-1.5 rounded-lg text-[#6E39CB]">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Zm6-10.125a1.875 1.875 0 1 1-3.75 0 1.875 1.875 0 0 1 3.75 0Zm1.294 6.336a6.721 6.721 0 0 1-3.17.789 6.721 6.721 0 0 1-3.168-.789 3.376 3.376 0 0 1 6.338 0Z" />
                                    </svg>
                                </div>
                                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Current Role</p>
                            </div>
                            <span className="inline-block bg-[#e0d4f7] text-[#6E39CB] font-bold px-5 py-2 rounded-xl text-sm shadow-sm ml-1">
                                {profile.role}
                            </span>
                        </div>

                        {/* 4. ORGANIZER PRIVILEGES & PENDING STATUS */}
                        <div className="pt-2">
                            {/* 🚨 UPDATED HEADER WITH SVG */}
                            <div className="flex items-center gap-2 mb-3">
                                <div className="text-yellow-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
                                    </svg>
                                </div>
                                <h3 className="font-bold text-xl text-gray-900">Want to host your own events?</h3>
                            </div>
                            
                            {profile.role === "Organizer" || profile.role === "Admin" ? (
                                <div className="text-green-700 font-bold bg-green-50 p-5 rounded-2xl border border-green-200 flex items-center gap-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                                    You already have Organizer privileges!
                                </div>
                            ) : profile.is_organizer_pending ? (
                                <div className="text-orange-700 font-bold bg-orange-50 p-5 rounded-2xl border border-orange-200 flex items-center gap-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 animate-spin shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                    <span>Your request to become an Organizer is currently pending Admin approval.</span>
                                </div>
                            ) : (
                                <div className="bg-gray-50 p-5 md:p-6 rounded-2xl border border-gray-100">
                                    <p className="text-gray-600 mb-5 leading-relaxed">
                                        Apply for an Organizer account to create, manage, and sell tickets to your own events directly on our platform.
                                    </p>
                                    <button 
                                        onClick={handleOrganizerRequest}
                                        className="w-full sm:w-auto bg-[#2D2D2D] text-white px-8 py-3.5 rounded-xl font-bold hover:bg-black transition-colors shadow-md flex items-center justify-center gap-2"
                                    >
                                        Request Organizer Privileges
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3" /></svg>
                                    </button>
                                </div>
                            )}
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
}

export default OrgProfile;