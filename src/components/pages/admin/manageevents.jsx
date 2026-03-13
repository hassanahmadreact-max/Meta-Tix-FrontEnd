import { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../../sidenav"; // Adjust path if needed

function ManageEvents() {
    const [activeTab, setActiveTab] = useState("pending"); // "pending", "all", "venues"
    
    // Data States
    const [pendingEvents, setPendingEvents] = useState([]);
    const [allEvents, setAllEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Rejection Modal States
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [selectedEventId, setSelectedEventId] = useState(null);
    const [rejectReason, setRejectReason] = useState("");

    // Venue Form State
    const [venueForm, setVenueForm] = useState({ name: "", city: "", capacity: "" });

    const token = localStorage.getItem("access_token");
    const headers = { Authorization: `Bearer ${token}` };

    // --- FETCH DATA ---
    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === "pending") {
                const res = await axios.get("http://127.0.0.1:8000/admin/event-requests", { headers });
                setPendingEvents(res.data);
            } else if (activeTab === "all") {
                // Assuming you have this endpoint in your events router
                const res = await axios.get("http://127.0.0.1:8000/events/all", { headers });
                setAllEvents(res.data);
            }
        } catch (error) {
            console.error("🚨 Failed to fetch events:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token && activeTab !== "venues") {
            fetchData();
        } else {
            setLoading(false);
        }
    }, [activeTab, token]);

    // --- ACTIONS ---
    const handleApprove = async (eventId) => {
        try {
            await axios.put(`http://127.0.0.1:8000/admin/approve_event/${eventId}`, {}, { headers });
            alert("Event approved successfully!");
            fetchData();
        } catch (error) {
            alert(error.response?.data?.detail || "Failed to approve event.");
        }
    };

    const openRejectModal = (eventId) => {
        setSelectedEventId(eventId);
        setRejectReason("");
        setIsRejectModalOpen(true);
    };

    const handleRejectSubmit = async () => {
        if (!rejectReason.trim()) return alert("Please provide a rejection reason.");
        
        try {
            await axios.put(`http://127.0.0.1:8000/admin/reject_event/${selectedEventId}`, 
                { reason: rejectReason }, // 🚨 Sending the JSON body expected by your schema!
                { headers }
            );
            alert("Event rejected.");
            setIsRejectModalOpen(false);
            fetchData();
        } catch (error) {
            alert(error.response?.data?.detail || "Failed to reject event.");
        }
    };

    const handleCreateVenue = async (e) => {
        e.preventDefault();
        try {
            await axios.post("http://127.0.0.1:8000/admin/create_venue", venueForm, { headers });
            alert("Venue created successfully!");
            setVenueForm({ name: "", city: "", capacity: "" }); // Reset form
        } catch (error) {
            alert(error.response?.data?.detail || "Failed to create venue.");
        }
    };

    return (
        <div className="bg-[#F4F5F9] min-h-screen flex flex-row font-['Lato'] relative">
            <Sidebar />

            {/* --- REJECTION MODAL OVERLAY --- */}
            {isRejectModalOpen && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-gray-100">
                        <h3 className="font-bold text-2xl text-gray-800 mb-2">Reject Event</h3>
                        <p className="text-sm text-gray-500 mb-6">Please provide a reason. This will be sent to the organizer so they can fix the issue.</p>
                        
                        <textarea 
                            className="w-full border border-gray-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-red-500 outline-none resize-none h-32 mb-6 bg-gray-50"
                            placeholder="e.g., The event image is missing, or the description violates terms of service..."
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                        ></textarea>
                        
                        <div className="flex justify-end gap-3">
                            <button 
                                onClick={() => setIsRejectModalOpen(false)}
                                className="px-5 py-2.5 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors text-sm"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleRejectSubmit}
                                className="px-5 py-2.5 rounded-xl font-bold bg-red-500 text-white hover:bg-red-600 transition-colors shadow-sm text-sm"
                            >
                                Confirm Rejection
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex-1 p-8 lg:p-12 overflow-y-auto">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h1 className="font-['bebas-neue'] font-bold text-4xl text-[#2D2D2D] tracking-wide uppercase leading-none">
                            Event Operations
                        </h1>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-2">
                            Manage inventory, venues, and approvals
                        </p>
                    </div>
                </div>

                {/* --- TABS --- */}
                <div className="flex gap-4 border-b border-gray-200 mb-8">
                    <button 
                        onClick={() => setActiveTab("pending")}
                        className={`pb-3 px-2 font-bold text-sm tracking-wide uppercase transition-colors relative ${activeTab === "pending" ? "text-[#6E39CB]" : "text-gray-400 hover:text-gray-600"}`}
                    >
                        Pending Approvals
                        {activeTab === "pending" && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#6E39CB] rounded-t-full"></div>}
                        {pendingEvents.length > 0 && activeTab !== "pending" && (
                            <span className="absolute top-0 -right-4 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                        )}
                    </button>
                    <button 
                        onClick={() => setActiveTab("all")}
                        className={`pb-3 px-2 font-bold text-sm tracking-wide uppercase transition-colors relative ${activeTab === "all" ? "text-[#6E39CB]" : "text-gray-400 hover:text-gray-600"}`}
                    >
                        Master Event List
                        {activeTab === "all" && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#6E39CB] rounded-t-full"></div>}
                    </button>
                    <button 
                        onClick={() => setActiveTab("venues")}
                        className={`pb-3 px-2 font-bold text-sm tracking-wide uppercase transition-colors relative ${activeTab === "venues" ? "text-[#6E39CB]" : "text-gray-400 hover:text-gray-600"}`}
                    >
                        Manage Venues
                        {activeTab === "venues" && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#6E39CB] rounded-t-full"></div>}
                    </button>
                </div>

                {/* --- TAB 1: PENDING APPROVALS --- */}
                {activeTab === "pending" && (
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden min-h-100">
                        {loading ? (
                            <div className="p-12 text-center text-gray-400 font-bold tracking-widest uppercase text-xs">Scanning Queues...</div>
                        ) : pendingEvents.length === 0 ? (
                            <div className="p-16 text-center">
                                <div className="text-5xl mb-4">🎉</div>
                                <h3 className="text-gray-800 font-bold text-xl mb-1">Queue is empty!</h3>
                                <p className="text-gray-400 text-sm">No events are waiting for your approval right now.</p>
                            </div>
                        ) : (
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="py-4 px-6 text-gray-500 text-[10px] font-black uppercase tracking-widest">Event Info</th>
                                        <th className="py-4 px-6 text-gray-500 text-[10px] font-black uppercase tracking-widest">Venue & Date</th>
                                        <th className="py-4 px-6 text-gray-500 text-[10px] font-black uppercase tracking-widest">Capacity</th>
                                        <th className="py-4 px-6 text-gray-500 text-[10px] font-black uppercase tracking-widest text-right">Review</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pendingEvents.map(event => (
                                        <tr key={event.event_id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                            <td className="py-4 px-6">
                                                <p className="font-bold text-gray-800">{event.title}</p>
                                                <p className="text-xs text-[#6E39CB] font-bold">Org ID: #{event.organizer_id}</p>
                                            </td>
                                            <td className="py-4 px-6">
                                                <p className="text-sm text-gray-700 font-medium">{event.venue_name}</p>
                                                <p className="text-[10px] text-gray-400">{new Date(event.date_time).toLocaleString()}</p>
                                            </td>
                                            <td className="py-4 px-6">
                                                <p className="text-sm font-bold text-gray-600">{event.total_tickets} Tickets</p>
                                            </td>
                                            <td className="py-4 px-6 flex justify-end gap-2">
                                                <button 
                                                    onClick={() => handleApprove(event.event_id)}
                                                    className="bg-green-50 text-green-600 hover:bg-green-500 hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors"
                                                >
                                                    Approve
                                                </button>
                                                <button 
                                                    onClick={() => openRejectModal(event.event_id)}
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

                {/* --- TAB 2: MASTER EVENT LIST --- */}
                {activeTab === "all" && (
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col min-h-125">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="font-bold text-gray-800">All Platform Events</h3>
                            <input 
                                type="text" 
                                placeholder="Search event title..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-4 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#6E39CB] outline-none w-64 shadow-sm"
                            />
                        </div>

                        {loading ? (
                            <div className="flex-1 flex items-center justify-center p-12 text-gray-400 font-bold tracking-widest uppercase text-xs">Loading Events...</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-white border-b border-gray-100">
                                        <tr>
                                            <th className="py-4 px-6 text-gray-400 text-[10px] font-black uppercase tracking-widest">Event</th>
                                            <th className="py-4 px-6 text-gray-400 text-[10px] font-black uppercase tracking-widest">Status</th>
                                            <th className="py-4 px-6 text-gray-400 text-[10px] font-black uppercase tracking-widest">Sales Info</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {allEvents
                                            .filter(e => e.title.toLowerCase().includes(searchTerm.toLowerCase()))
                                            .map(event => (
                                            <tr key={event.event_id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                                <td className="py-4 px-6">
                                                    <p className="font-bold text-gray-800">{event.title}</p>
                                                    <p className="text-[10px] text-gray-400">{event.venue_name}</p>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-md uppercase ${
                                                        event.status === "Approved" ? "bg-green-50 text-green-600" : 
                                                        event.status === "Pending" ? "bg-yellow-50 text-yellow-600" :
                                                        "bg-red-50 text-red-600"
                                                    }`}>
                                                        {event.status}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <p className="text-sm font-bold text-gray-700">${event.price} / ticket</p>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* --- TAB 3: MANAGE VENUES --- */}
                {activeTab === "venues" && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                            <h3 className="font-bold text-xl text-gray-800 mb-2">Create New Venue</h3>
                            <p className="text-xs text-gray-500 mb-8">Add a certified venue to the database so organizers can select it when creating events.</p>
                            
                            <form onSubmit={handleCreateVenue} className="space-y-5">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Venue Name</label>
                                    <input 
                                        type="text" 
                                        required
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#6E39CB] outline-none transition-all bg-gray-50 focus:bg-white"
                                        placeholder="e.g., Madison Square Garden"
                                        value={venueForm.name}
                                        onChange={e => setVenueForm({...venueForm, name: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">City</label>
                                    <input 
                                        type="text" 
                                        required
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#6E39CB] outline-none transition-all bg-gray-50 focus:bg-white"
                                        placeholder="e.g., New York"
                                        value={venueForm.city}
                                        onChange={e => setVenueForm({...venueForm, city: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Maximum Capacity</label>
                                    <input 
                                        type="number" 
                                        required
                                        min="1"
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#6E39CB] outline-none transition-all bg-gray-50 focus:bg-white"
                                        placeholder="e.g., 20000"
                                        value={venueForm.capacity}
                                        onChange={e => setVenueForm({...venueForm, capacity: e.target.value})}
                                    />
                                </div>
                                <button 
                                    type="submit"
                                    className="w-full bg-[#6E39CB] text-white font-bold rounded-xl px-4 py-3 hover:bg-[#5a2ca0] transition-colors shadow-md mt-4"
                                >
                                    Add Venue to Database
                                </button>
                            </form>
                        </div>
                        
                        {/* Little helper graphic/info box on the side */}
                        <div className="bg-[#f3effb] rounded-3xl p-8 flex flex-col items-center justify-center text-center border border-purple-100">
                            <div className="text-6xl mb-6">🏟️</div>
                            <h3 className="font-['bebas-neue'] text-3xl text-[#6E39CB] tracking-wide mb-2">Venue Control</h3>
                            <p className="text-gray-600 text-sm max-w-sm">
                                By restricting venue creation to Admins only, you prevent duplicate venues (like "Wembley" vs "Wembley Stadium") and maintain a clean database for your users.
                            </p>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}

export default ManageEvents;