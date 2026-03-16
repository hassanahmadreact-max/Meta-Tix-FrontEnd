import { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../../sidenav"; 

function ManageEvents() {
    const [activeTab, setActiveTab] = useState("pending"); // "pending", "all", "create", "venues"
    
    // Data States
    const [pendingEvents, setPendingEvents] = useState([]);
    const [allEvents, setAllEvents] = useState([]);
    const [venues, setVenues] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Rejection Modal States
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [selectedEventId, setSelectedEventId] = useState(null);
    const [rejectReason, setRejectReason] = useState("");

    // Form States
    const [venueForm, setVenueForm] = useState({ name: "", city: "", capacity: "" });
    const [eventForm, setEventForm] = useState({
        title: "", 
        description: "", 
        venue_id: ""
    });

    // 🚨 NEW: Dynamic Schedules State!
    const [schedules, setSchedules] = useState([
        { schedule_name: "Main Event", start_time: "", end_time: "" }
    ]);

    // Dynamic Tiers State
    const [tiers, setTiers] = useState([
        { tier_name: "General Admission", price: "", available_quantity: "" }
    ]);

    const [venueSearchTerm, setVenueSearchTerm] = useState("");
    const [isVenueDropdownOpen, setIsVenueDropdownOpen] = useState(false);

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
                const res = await axios.get("http://127.0.0.1:8000/events/all_events", { headers });
                setAllEvents(res.data);
            } else if (activeTab === "create") {
                const res = await axios.get("http://127.0.0.1:8000/events/venues", { headers }); 
                setVenues(res.data);
            }
        } catch (error) {
            console.error("🚨 Failed to fetch data:", error);
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

    // --- DYNAMIC SCHEDULE HANDLERS ---
    const handleAddSchedule = () => {
        setSchedules([...schedules, { schedule_name: "", start_time: "", end_time: "" }]);
    };

    const handleRemoveSchedule = (index) => {
        setSchedules(schedules.filter((_, i) => i !== index));
    };

    const handleScheduleChange = (index, field, value) => {
        const newSchedules = [...schedules];
        newSchedules[index][field] = value;
        setSchedules(newSchedules);
    };

    // --- DYNAMIC TIER HANDLERS ---
    const handleAddTier = () => {
        setTiers([...tiers, { tier_name: "", price: "", available_quantity: "" }]);
    };

    const handleRemoveTier = (index) => {
        setTiers(tiers.filter((_, i) => i !== index));
    };

    const handleTierChange = (index, field, value) => {
        const newTiers = [...tiers];
        newTiers[index][field] = value;
        setTiers(newTiers);
    };

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
                { reason: rejectReason }, { headers }
            );
            alert("Event rejected.");
            setIsRejectModalOpen(false);
            fetchData();
        } catch (error) {
            alert(error.response?.data?.detail || "Failed to reject event.");
        }
    };

    const handleCancelEvent = async (eventId) => {
        if(!window.confirm("Are you sure you want to CANCEL this event? This action cannot be undone and will affect all ticket holders.")) return;
        
        try {
            await axios.patch(`http://127.0.0.1:8000/events/cancel/${eventId}`, {}, { headers });
            alert("Event has been cancelled.");
            fetchData();
        } catch (error) {
            alert(error.response?.data?.detail || "Failed to cancel event.");
        }
    };

    const handleCreateVenue = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                name: venueForm.name,
                city: venueForm.city,
                total_capacity: parseInt(venueForm.capacity, 10) 
            };

            await axios.post("http://127.0.0.1:8000/admin/create_venue", payload, { headers });
            alert("Venue created successfully!");
            setVenueForm({ name: "", city: "", capacity: "" }); 
            
        } catch (error) {
            const errorDetail = error.response?.data?.detail;
            
            if (Array.isArray(errorDetail)) {
                const validationMessages = errorDetail.map(err => `${err.loc[err.loc.length - 1]}: ${err.msg}`);
                alert("Validation Error: " + validationMessages.join(" | "));
            } else {
                alert(errorDetail || "Failed to create venue.");
            }
        }
    };

    const handleCreateEvent = async (e) => {
        e.preventDefault();
        
        if (!eventForm.venue_id) return alert("Please select a venue from the dropdown.");
        if (schedules.length === 0) return alert("You must create at least one schedule.");
        if (tiers.length === 0) return alert("You must create at least one ticket tier.");

        try {
            const payload = {
                title: eventForm.title,
                description: eventForm.description,
                venue_id: parseInt(eventForm.venue_id, 10),
                schedules: schedules.map(sch => ({
                    schedule_name: sch.schedule_name,
                    start_time: new Date(sch.start_time).toISOString(),
                    end_time: new Date(sch.end_time).toISOString()
                })),
                tiers: tiers.map(tier => ({
                    tier_name: tier.tier_name,
                    current_price: parseFloat(tier.price),
                    available_quantity: parseInt(tier.available_quantity, 10)
                }))
            };
            
            await axios.post("http://127.0.0.1:8000/events/create_event", payload, { headers });
            
            alert("Platform Event created successfully!");
            
            setEventForm({ title: "", description: "", venue_id: "" });
            setSchedules([{ schedule_name: "Main Event", start_time: "", end_time: "" }]);
            setTiers([{ tier_name: "General Admission", price: "", available_quantity: "" }]);
            setVenueSearchTerm(""); 
            setActiveTab("all"); 
            fetchData(); 

        } catch (error) {
            const errorDetail = error.response?.data?.detail;
            if (Array.isArray(errorDetail)) {
                const validationMessages = errorDetail.map(err => `${err.loc[err.loc.length - 1]}: ${err.msg}`);
                alert("Validation Error: " + validationMessages.join(" | "));
            } else {
                alert(errorDetail || "Failed to create event.");
            }
        }
    };

    return (
        <div className="bg-[#F4F5F9] min-h-screen flex flex-row font-['Lato'] relative">
            <Sidebar />

            {/* --- REJECTION MODAL --- */}
            {isRejectModalOpen && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-gray-100">
                        <h3 className="font-bold text-2xl text-gray-800 mb-2">Reject Event</h3>
                        <p className="text-sm text-gray-500 mb-6">Please provide a reason. This will be sent to the organizer.</p>
                        <textarea 
                            className="w-full border border-gray-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-red-500 outline-none resize-none h-32 mb-6 bg-gray-50"
                            placeholder="e.g., Missing image, violates TOS..."
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                        ></textarea>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setIsRejectModalOpen(false)} className="px-5 py-2.5 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors text-sm">Cancel</button>
                            <button onClick={handleRejectSubmit} className="px-5 py-2.5 rounded-xl font-bold bg-red-500 text-white hover:bg-red-600 transition-colors shadow-sm text-sm">Confirm Rejection</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex-1 p-8 lg:p-12 overflow-y-auto">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h1 className="font-['bebas-neue'] font-bold text-4xl text-[#2D2D2D] tracking-wide uppercase leading-none">Event Operations</h1>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-2">Manage inventory, venues, and approvals</p>
                    </div>
                </div>

                {/* --- TABS --- */}
                <div className="flex gap-4 border-b border-gray-200 mb-8 overflow-x-auto custom-scrollbar pb-1">
                    <button onClick={() => setActiveTab("pending")} className={`pb-3 px-2 font-bold text-sm tracking-wide uppercase transition-colors relative whitespace-nowrap ${activeTab === "pending" ? "text-[#6E39CB]" : "text-gray-400 hover:text-gray-600"}`}>
                        Pending Approvals
                        {activeTab === "pending" && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#6E39CB] rounded-t-full"></div>}
                        {pendingEvents.length > 0 && activeTab !== "pending" && <span className="absolute top-0 -right-4 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>}
                    </button>
                    <button onClick={() => setActiveTab("all")} className={`pb-3 px-2 font-bold text-sm tracking-wide uppercase transition-colors relative whitespace-nowrap ${activeTab === "all" ? "text-[#6E39CB]" : "text-gray-400 hover:text-gray-600"}`}>
                        Master Event List
                        {activeTab === "all" && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#6E39CB] rounded-t-full"></div>}
                    </button>
                    <button onClick={() => setActiveTab("create")} className={`pb-3 px-2 font-bold text-sm tracking-wide uppercase transition-colors relative whitespace-nowrap ${activeTab === "create" ? "text-[#6E39CB]" : "text-gray-400 hover:text-gray-600"}`}>
                        Create Event
                        {activeTab === "create" && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#6E39CB] rounded-t-full"></div>}
                    </button>
                    <button onClick={() => setActiveTab("venues")} className={`pb-3 px-2 font-bold text-sm tracking-wide uppercase transition-colors relative whitespace-nowrap ${activeTab === "venues" ? "text-[#6E39CB]" : "text-gray-400 hover:text-gray-600"}`}>
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
                                                <p className="text-[10px] text-gray-400">ID: {event.event_id}</p>
                                            </td>
                                            <td className="py-4 px-6 flex justify-end gap-2">
                                                <button onClick={() => handleApprove(event.event_id)} className="bg-green-50 text-green-600 hover:bg-green-500 hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors">Approve</button>
                                                <button onClick={() => openRejectModal(event.event_id)} className="bg-red-50 text-red-600 hover:bg-red-500 hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors">Reject</button>
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
                            <input type="text" placeholder="Search event title..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-4 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#6E39CB] outline-none w-64 shadow-sm" />
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
                                            <th className="py-4 px-6 text-gray-400 text-[10px] font-black uppercase tracking-widest text-right">Emergency Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {allEvents.filter(e => e.title?.toLowerCase().includes(searchTerm.toLowerCase())).map(event => (
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
                                                <td className="py-4 px-6 text-right">
                                                    {event.status === "Approved" && (
                                                        <button 
                                                            onClick={() => handleCancelEvent(event.event_id)}
                                                            className="text-red-500 border border-red-200 hover:bg-red-50 hover:border-red-300 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm"
                                                        >
                                                            Force Cancel
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

                {/* --- TAB 3: CREATE EVENT (ADMIN OVERRIDE) --- */}
                {activeTab === "create" && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                            <h3 className="font-bold text-xl text-gray-800 mb-2">Publish Platform Event</h3>
                            <p className="text-xs text-gray-500 mb-8">Events created by an Admin bypass the approval queue and go live instantly.</p>
                            
                            <form onSubmit={handleCreateEvent} className="space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Event Title</label>
                                        <input type="text" required className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#6E39CB] outline-none bg-gray-50 focus:bg-white" value={eventForm.title} onChange={e => setEventForm({...eventForm, title: e.target.value})} />
                                    </div>
                                    
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Description</label>
                                        <textarea required rows="3" className="w-full border border-gray-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-[#6E39CB] outline-none resize-none bg-gray-50 focus:bg-white" value={eventForm.description} onChange={e => setEventForm({...eventForm, description: e.target.value})}></textarea>
                                    </div>

                                    <div className="md:col-span-2 relative">
                                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Venue Selection</label>
                                        <input 
                                            type="text" 
                                            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#6E39CB] outline-none bg-gray-50 focus:bg-white transition-all shadow-sm"
                                            placeholder="Search by venue name or city..."
                                            value={venueSearchTerm}
                                            onChange={(e) => {
                                                setVenueSearchTerm(e.target.value);
                                                setIsVenueDropdownOpen(true);
                                                setEventForm({...eventForm, venue_id: ""}); 
                                            }}
                                            onFocus={() => setIsVenueDropdownOpen(true)}
                                        />
                                        {isVenueDropdownOpen && <div className="fixed inset-0 z-10" onClick={() => setIsVenueDropdownOpen(false)}></div>}
                                        {isVenueDropdownOpen && (
                                            <div className="absolute z-20 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl max-h-48 overflow-y-auto custom-scrollbar">
                                                {venues.filter(v => v.name.toLowerCase().includes(venueSearchTerm.toLowerCase()) || v.city.toLowerCase().includes(venueSearchTerm.toLowerCase())).length === 0 ? (
                                                    <div className="p-4 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">No venues found</div>
                                                ) : (
                                                    venues.filter(v => v.name.toLowerCase().includes(venueSearchTerm.toLowerCase()) || v.city.toLowerCase().includes(venueSearchTerm.toLowerCase())).map(v => (
                                                        <div key={v.venue_id} className="px-4 py-3 hover:bg-purple-50 cursor-pointer border-b border-gray-50 last:border-none" onClick={() => {
                                                            setEventForm({...eventForm, venue_id: v.venue_id});
                                                            setVenueSearchTerm(`${v.name} (${v.city})`);
                                                            setIsVenueDropdownOpen(false);
                                                        }}>
                                                            <p className="font-bold text-sm text-gray-800">{v.name}</p>
                                                            <p className="text-[10px] text-[#6E39CB] font-black uppercase tracking-wider mt-0.5">{v.city} • Cap: {v.total_capacity}</p>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* 🚨 THE NEW DYNAMIC SCHEDULES SECTION */}
                                    <div className="md:col-span-2 mt-4 pt-4 border-t border-gray-100">
                                        <div className="flex justify-between items-center mb-4">
                                            <h4 className="text-sm font-bold text-[#6E39CB] uppercase tracking-wider">
                                                Event Schedules
                                            </h4>
                                            <button 
                                                type="button" 
                                                onClick={handleAddSchedule}
                                                className="text-xs font-bold text-[#6E39CB] bg-purple-50 px-3 py-1.5 rounded-lg hover:bg-purple-100 transition-colors"
                                            >
                                                + Add Schedule
                                            </button>
                                        </div>

                                        <div className="space-y-3">
                                            {schedules.map((schedule, index) => (
                                                <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end bg-gray-50 p-4 rounded-xl relative group border border-gray-100">
                                                    
                                                    {schedules.length > 1 && (
                                                        <button 
                                                            type="button" 
                                                            onClick={() => handleRemoveSchedule(index)}
                                                            className="absolute -top-3 -right-3 bg-white border border-red-200 text-red-500 rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-sm hover:bg-red-50 hover:text-red-600 z-10"
                                                            title="Remove Schedule"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
                                                        </button>
                                                    )}

                                                    <div className="md:col-span-4">
                                                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Schedule Name</label>
                                                        <input type="text" required className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#6E39CB] outline-none bg-white" placeholder="e.g. Day 1, Main Show" value={schedule.schedule_name} onChange={e => handleScheduleChange(index, 'schedule_name', e.target.value)} />
                                                    </div>
                                                    <div className="md:col-span-4">
                                                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Start Time</label>
                                                        <input type="datetime-local" required className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#6E39CB] outline-none bg-white" value={schedule.start_time} onChange={e => handleScheduleChange(index, 'start_time', e.target.value)} />
                                                    </div>
                                                    <div className="md:col-span-4">
                                                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">End Time</label>
                                                        <input type="datetime-local" required className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#6E39CB] outline-none bg-white" value={schedule.end_time} onChange={e => handleScheduleChange(index, 'end_time', e.target.value)} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* 🚨 THE DYNAMIC TIERS SECTION */}
                                    <div className="md:col-span-2 mt-4 pt-4 border-t border-gray-100">
                                        <div className="flex justify-between items-center mb-4">
                                            <h4 className="text-sm font-bold text-[#6E39CB] uppercase tracking-wider">
                                                Ticket Tiers
                                            </h4>
                                            <button 
                                                type="button" 
                                                onClick={handleAddTier}
                                                className="text-xs font-bold text-[#6E39CB] bg-purple-50 px-3 py-1.5 rounded-lg hover:bg-purple-100 transition-colors"
                                            >
                                                + Add Tier
                                            </button>
                                        </div>

                                        <div className="space-y-3">
                                            {tiers.map((tier, index) => (
                                                <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end bg-gray-50 p-4 rounded-xl relative group border border-gray-100">
                                                    
                                                    {tiers.length > 1 && (
                                                        <button 
                                                            type="button" 
                                                            onClick={() => handleRemoveTier(index)}
                                                            className="absolute -top-3 -right-3 bg-white border border-red-200 text-red-500 rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-sm hover:bg-red-50 hover:text-red-600 z-10"
                                                            title="Remove Tier"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
                                                        </button>
                                                    )}

                                                    <div className="md:col-span-5">
                                                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Tier Name</label>
                                                        <input type="text" required className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#6E39CB] outline-none bg-white" placeholder="e.g. VIP, Early Bird" value={tier.tier_name} onChange={e => handleTierChange(index, 'tier_name', e.target.value)} />
                                                    </div>
                                                    <div className="md:col-span-3">
                                                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Price ($)</label>
                                                        <input type="number" step="0.01" min="0" required className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#6E39CB] outline-none bg-white" placeholder="0.00" value={tier.price} onChange={e => handleTierChange(index, 'price', e.target.value)} />
                                                    </div>
                                                    <div className="md:col-span-4">
                                                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Quantity</label>
                                                        <input type="number" min="1" required className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#6E39CB] outline-none bg-white" placeholder="100" value={tier.available_quantity} onChange={e => handleTierChange(index, 'available_quantity', e.target.value)} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <button type="submit" className="w-full bg-[#6E39CB] text-white font-bold rounded-xl px-4 py-3 hover:bg-[#5a2ca0] transition-colors shadow-md mt-6">Publish Event Instantly</button>
                            </form>
                        </div>
                    </div>
                )}

                {/* --- TAB 4: MANAGE VENUES --- */}
                {activeTab === "venues" && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                            <h3 className="font-bold text-xl text-gray-800 mb-2">Create New Venue</h3>
                            <p className="text-xs text-gray-500 mb-8">Add a certified venue to the database so organizers can select it when creating events.</p>
                            
                            <form onSubmit={handleCreateVenue} className="space-y-5">
                                <div><label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Venue Name</label><input type="text" required className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#6E39CB] outline-none bg-gray-50 focus:bg-white" value={venueForm.name} onChange={e => setVenueForm({...venueForm, name: e.target.value})} /></div>
                                <div><label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">City</label><input type="text" required className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#6E39CB] outline-none bg-gray-50 focus:bg-white" value={venueForm.city} onChange={e => setVenueForm({...venueForm, city: e.target.value})} /></div>
                                <div><label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Maximum Capacity</label><input type="number" min="1" required className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#6E39CB] outline-none bg-gray-50 focus:bg-white" value={venueForm.capacity} onChange={e => setVenueForm({...venueForm, capacity: e.target.value})} /></div>
                                <button type="submit" className="w-full bg-[#6E39CB] text-white font-bold rounded-xl px-4 py-3 hover:bg-[#5a2ca0] transition-colors shadow-md mt-4">Add Venue to Database</button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ManageEvents;