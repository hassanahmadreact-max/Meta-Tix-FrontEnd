import { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../../sidenav"; 

function MyEvents() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Filters
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("ALL"); // "ALL", "Approved", "Pending", "Rejected"

    const token = localStorage.getItem("access_token");

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const headers = { Authorization: `Bearer ${token}` };
                // We use the sales endpoint because it perfectly lists all organizer events and their statuses!
                const res = await axios.get("http://127.0.0.1:8000/organizer/my-sales", { headers });
                setEvents(res.data.events || []);
            } catch (error) {
                console.error("🚨 Failed to fetch events:", error);
            } finally {
                setLoading(false);
            }
        };

        if (token) fetchEvents();
    }, [token]);

    // --- FILTERING LOGIC ---
    const filteredEvents = events.filter(event => {
        const matchesSearch = (event.name || event.title || "").toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === "ALL" || event.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    // --- HELPER TO CALCULATE CAPACITY ---
    const getCapacityData = (tiers) => {
        if (!tiers || tiers.length === 0) return { capacity: 0, sold: 0, percentage: 0 };
        
        let totalCap = 0;
        let totalSold = 0;
        
        tiers.forEach(tier => {
            totalCap += (tier.total_capacity || tier.available_quantity || 0);
            totalSold += (tier.tickets_sold || 0);
        });

        const percentage = totalCap === 0 ? 0 : Math.min(100, Math.round((totalSold / totalCap) * 100));
        
        return { capacity: totalCap, sold: totalSold, percentage };
    };

    return (
        <div className="bg-[#F4F5F9] min-h-screen flex flex-row font-['Lato'] relative">
            <Sidebar />

            <div className="flex-1 p-6 lg:p-10 overflow-y-auto">
                {/* HEADER */}
                <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-8 gap-4">
                    <div>
                        <h1 className="font-['bebas-neue'] font-bold text-4xl text-[#2D2D2D] tracking-wide uppercase leading-none">Event Portfolio</h1>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-2">Manage and track all your active listings</p>
                    </div>
                    
                    {/* CONTROLS (Search & Filter) */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                            </svg>
                            <input 
                                type="text" 
                                placeholder="Search events..." 
                                className="pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#6E39CB] outline-none shadow-sm w-full sm:w-64 transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        
                        <select 
                            className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#6E39CB] outline-none shadow-sm font-bold text-gray-600 cursor-pointer"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="ALL">All Statuses</option>
                            <option value="Approved">Live (Approved)</option>
                            <option value="Pending">In Review (Pending)</option>
                            <option value="Rejected">Rejected</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                        <div className="w-10 h-10 border-4 border-purple-100 border-t-[#6E39CB] rounded-full animate-spin mb-4"></div>
                        <p className="font-bold text-[10px] tracking-widest uppercase">Fetching Portfolio...</p>
                    </div>
                ) : filteredEvents.length === 0 ? (
                    <div className="bg-white p-16 rounded-3xl shadow-sm text-center border border-gray-100 flex flex-col items-center justify-center">
                        <div className="text-6xl mb-4 opacity-80">🎫</div>
                        <h3 className="font-['bebas-neue'] text-3xl text-gray-800 tracking-wide mb-2">No Events Found</h3>
                        <p className="text-gray-500 text-sm">You haven't created any events that match this search.</p>
                        <a href="/organizer/create" className="mt-6 bg-[#6E39CB] text-white px-6 py-3 rounded-xl font-bold text-sm shadow-md hover:bg-[#5a2ca0] transition-colors">
                            + Draft New Event
                        </a>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredEvents.map(event => {
                            const { capacity, sold, percentage } = getCapacityData(event.tiers);
                            
                            return (
                                <div key={event.event_id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all group flex flex-col">
                                    
                                    {/* Card Header (Status Color Bar) */}
                                    <div className={`h-2 w-full ${
                                        event.status === "Approved" ? "bg-green-500" : 
                                        event.status === "Pending" ? "bg-yellow-400" : "bg-red-500"
                                    }`}></div>

                                    <div className="p-6 flex flex-col flex-1">
                                        <div className="flex justify-between items-start mb-4">
                                            <h3 className="font-bold text-lg text-gray-800 group-hover:text-[#6E39CB] transition-colors line-clamp-2">
                                                {event.name || event.title}
                                            </h3>
                                            <span className={`text-[9px] font-black px-2 py-1 rounded-md uppercase whitespace-nowrap ml-3 ${
                                                event.status === "Approved" ? "bg-green-50 text-green-700 border border-green-100" : 
                                                event.status === "Pending" ? "bg-yellow-50 text-yellow-700 border border-yellow-100" : "bg-red-50 text-red-700 border border-red-100"
                                            }`}>
                                                {event.status}
                                            </span>
                                        </div>

                                        {/* Core Stats */}
                                        <div className="grid grid-cols-2 gap-4 mb-6 mt-2">
                                            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Revenue</p>
                                                <p className="font-black text-[#6E39CB] text-lg leading-none">${event.revenue?.toLocaleString() || 0}</p>
                                            </div>
                                            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Tickets Sold</p>
                                                <p className="font-black text-gray-700 text-lg leading-none">{event.tickets_sold?.toLocaleString() || 0}</p>
                                            </div>
                                        </div>

                                        <div className="mt-auto">
                                            {/* Sell-Out Progress Bar */}
                                            <div className="flex justify-between items-end mb-2">
                                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Inventory Status</p>
                                                <p className="text-xs font-black text-gray-800">{percentage}% Sold</p>
                                            </div>
                                            <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                                <div 
                                                    className={`h-2.5 rounded-full transition-all duration-1000 ${
                                                        percentage > 90 ? "bg-red-500" : 
                                                        percentage > 50 ? "bg-[#6E39CB]" : "bg-purple-300"
                                                    }`}
                                                    style={{ width: `${percentage}%` }}
                                                ></div>
                                            </div>
                                            <p className="text-[10px] text-gray-400 font-bold text-right mt-1.5">
                                                {sold} / {capacity} tickets
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

export default MyEvents;