import { useState, useEffect } from "react";
import axios from "axios";
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer, Cell,
    PieChart, Pie, Legend
} from "recharts";
import Sidebar from "../../sidenav"; 

function OrganizerDashboard() {
    const [salesData, setSalesData] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // States for the Event Sidebar
    const [selectedEventId, setSelectedEventId] = useState("ALL"); 
    const [eventSearchTerm, setEventSearchTerm] = useState("");

    const token = localStorage.getItem("access_token");

    useEffect(() => {
        const fetchSales = async () => {
            try {
                const headers = { Authorization: `Bearer ${token}` };
                const res = await axios.get("http://127.0.0.1:8000/organizer/my-sales", { headers });
                setSalesData(res.data);
            } catch (error) {
                console.error("🚨 Failed to fetch sales data:", error);
            } finally {
                setLoading(false);
            }
        };

        if (token) fetchSales();
    }, [token]);

    // --- DYNAMIC DATA CRUNCHING ---
    const getFilteredData = () => {
        if (!salesData || !salesData.events) return { revenue: 0, tickets: 0, capacity: 0, title: "Loading...", status: "", eventsToChart: [] };

        if (selectedEventId === "ALL") {
            return {
                revenue: salesData.total_revenue,
                tickets: salesData.total_tickets_sold,
                capacity: 0, // We don't show capacity on the global view
                title: "Global Portfolio Overview",
                status: `${salesData.total_events_created || 0} Total Events`,
                eventsToChart: salesData.events
            };
        }

        const specificEvent = salesData.events.find(e => e.event_id === selectedEventId);
        if (!specificEvent) return { revenue: 0, tickets: 0, capacity: 0, title: "Event Not Found", status: "", eventsToChart: [] };

        // 🚨 NEW: Actually calculate the total capacity for this specific event!
        const totalCapacity = specificEvent.tiers?.reduce((acc, tier) => acc + (tier.total_capacity || tier.available_quantity || 0), 0) || 0;

        return {
            revenue: specificEvent.revenue,
            tickets: specificEvent.tickets_sold,
            capacity: totalCapacity,
            title: specificEvent.name || specificEvent.title,
            status: specificEvent.status,
            eventsToChart: [specificEvent] 
        };
    };

    const dashboardView = getFilteredData();

    // Pulls tier data for the graphs based on the currently filtered events
    const getTierAnalytics = (eventsToChart) => {
        const tierStats = {};
        
        eventsToChart.forEach(event => {
            if (event.tiers) {
                event.tiers.forEach(tier => {
                    if (!tierStats[tier.tier_name]) {
                        tierStats[tier.tier_name] = { name: tier.tier_name, Sold: 0, Capacity: 0, Revenue: 0 };
                    }
                    const sold = tier.tickets_sold || 0;
                    const cap = tier.total_capacity || tier.available_quantity || 0; 
                    const price = tier.price || tier.current_price || 0;

                    tierStats[tier.tier_name].Sold += sold;
                    tierStats[tier.tier_name].Capacity += cap;
                    tierStats[tier.tier_name].Revenue += (sold * price);
                });
            }
        });

        const colors = ['#6E39CB', '#F59E0B', '#10B981', '#3B82F6', '#EC4899', '#8B5CF6'];
        
        return Object.values(tierStats).map((t, index) => ({
            ...t,
            Unsold: Math.max(0, t.Capacity - t.Sold),
            color: colors[index % colors.length]
        })).sort((a, b) => b.Sold - a.Sold);
    };

    const tierData = getTierAnalytics(dashboardView.eventsToChart);

    // --- UI HELPERS ---
    const StatCard = ({ title, value, prefix = "", suffix = "" }) => (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-center h-full hover:shadow-md transition-all hover:-translate-y-1">
            <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mb-1">{title}</p>
            <p className="text-3xl lg:text-4xl font-['bebas-neue'] text-[#6E39CB] tracking-wide break-all leading-none mt-1">
                {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
            </p>
        </div>
    );

    const CustomTooltip = ({ active, payload, label, prefix = "" }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-gray-800 text-white p-4 rounded-xl shadow-xl text-sm border border-gray-700">
                    <p className="font-bold text-gray-400 uppercase tracking-wider text-[10px] mb-2 border-b border-gray-600 pb-2">{label}</p>
                    {payload.map((entry, index) => (
                        <p key={index} className="font-bold flex items-center gap-2 mt-1">
                            <span className="w-2 h-2 rounded-full block" style={{ backgroundColor: entry.color }}></span>
                            {entry.name}: <span className="font-black text-white ml-auto">{prefix}{entry.value.toLocaleString()}</span>
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-[#F4F5F9] min-h-screen flex flex-row font-['Lato'] relative">
            <Sidebar />

            <div className="flex-1 p-6 lg:p-10 overflow-y-auto">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h1 className="font-['bebas-neue'] font-bold text-4xl text-[#2D2D2D] tracking-wide uppercase leading-none">Sales Analytics</h1>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-2">Track performance across your empire</p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                        <div className="w-10 h-10 border-4 border-purple-100 border-t-[#6E39CB] rounded-full animate-spin mb-4"></div>
                        <p className="font-bold text-[10px] tracking-widest uppercase">Syncing Dashboard...</p>
                    </div>
                ) : !salesData ? (
                    <div className="bg-white p-12 rounded-3xl shadow-sm text-center border border-gray-100">
                        <div className="text-5xl mb-4">📊</div>
                        <h3 className="font-bold text-gray-800 text-xl">Dashboard Offline</h3>
                        <p className="text-gray-500 text-sm mt-2">Could not retrieve sales data. Please check your connection.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        
                        {/* LEFT COLUMN: THE EVENT SELECTOR SIDEBAR */}
                        <div className="lg:col-span-1 flex flex-col gap-4">
                            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 flex flex-col h-175">
                                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-[#6E39CB]"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z" /></svg>
                                    Your Events
                                </h3>
                                
                                <input 
                                    type="text" 
                                    placeholder="Search events..." 
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#6E39CB] outline-none mb-4"
                                    value={eventSearchTerm}
                                    onChange={(e) => setEventSearchTerm(e.target.value)}
                                />

                                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-2">
                                    {/* The "All Events" Master Button */}
                                    <button 
                                        onClick={() => setSelectedEventId("ALL")}
                                        className={`w-full text-left px-4 py-3 rounded-xl transition-all font-bold text-sm flex items-center justify-between ${
                                            selectedEventId === "ALL" ? "bg-[#6E39CB] text-white shadow-md" : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                                        }`}
                                    >
                                        Global Overview
                                        {selectedEventId === "ALL" && <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>}
                                    </button>

                                    <div className="w-full h-px bg-gray-100 my-2"></div>

                                    {/* The List of Specific Events */}
                                    {salesData.events?.filter(e => (e.name || e.title || "").toLowerCase().includes(eventSearchTerm.toLowerCase())).map(event => (
                                        <button 
                                            key={event.event_id}
                                            onClick={() => setSelectedEventId(event.event_id)}
                                            className={`w-full text-left px-4 py-3 rounded-xl transition-all flex flex-col gap-1 ${
                                                selectedEventId === event.event_id ? "bg-purple-50 border border-purple-200" : "bg-white border border-gray-50 hover:bg-gray-50 hover:border-gray-200"
                                            }`}
                                        >
                                            <span className={`font-bold text-sm truncate ${selectedEventId === event.event_id ? "text-[#6E39CB]" : "text-gray-700"}`}>
                                                {event.name || event.title}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase ${
                                                    event.status === "Approved" ? "bg-green-100 text-green-700" : 
                                                    event.status === "Pending" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"
                                                }`}>
                                                    {event.status}
                                                </span>
                                                <span className="text-[10px] text-gray-400 font-bold">${event.revenue.toLocaleString()}</span>
                                            </div>
                                        </button>
                                    ))}
                                    
                                    {salesData.events?.length === 0 && (
                                        <p className="text-center text-xs text-gray-400 italic py-4">No events found.</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: THE ANALYTICS COMMAND CENTER */}
                        <div className="lg:col-span-3 flex flex-col gap-6">
                            
                            {/* Dynamic Header & Top Stats */}
                            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-linear-to-bl from-purple-100 to-transparent opacity-50 rounded-bl-full pointer-events-none"></div>
                                <h2 className="text-2xl font-bold text-gray-800 relative z-10 mb-1">{dashboardView.title}</h2>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest relative z-10 mb-6 border-b border-gray-100 pb-4">
                                    {selectedEventId === "ALL" ? "Combined platform performance" : `Event Status: ${dashboardView.status}`}
                                </p>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                                    <StatCard title="Generated Revenue" value={dashboardView.revenue} prefix="$" />
                                    <StatCard title="Tickets Moved" value={dashboardView.tickets} />
                                    
                                    {/* 🚨 THE FIX: Showing Active Events for "ALL", and Total Capacity for specific events! */}
                                    <StatCard 
                                        title={selectedEventId === "ALL" ? "Active Events" : "Total Capacity"} 
                                        value={selectedEventId === "ALL" ? dashboardView.status.replace(/[^0-9]/g, '') : dashboardView.capacity} 
                                    />
                                </div>
                            </div>

                            {/* GRAPHS AREA */}
                            {tierData.length === 0 ? (
                                <div className="bg-white p-12 rounded-3xl shadow-sm text-center border border-gray-100 flex flex-col items-center justify-center h-64">
                                    <div className="text-4xl mb-3 opacity-50">🎫</div>
                                    <h3 className="font-bold text-gray-800">No Tier Data Found</h3>
                                    <p className="text-gray-500 text-xs mt-1">There are no tickets sold for this selection yet.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                    
                                    {/* GRAPH 1: VOLUME BAR CHART */}
                                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col h-87.5">
                                        <h3 className="font-bold text-gray-800 text-sm mb-1">Volume: Tickets Sold by Tier</h3>
                                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-6">Which pass is the most popular?</p>
                                        <div className="flex-1 w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={tierData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 700 }} dy={10} />
                                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 10 }} />
                                                    <ChartTooltip cursor={{ fill: '#f9fafb' }} content={<CustomTooltip />} />
                                                    <Bar dataKey="Sold" radius={[4, 4, 0, 0]}>
                                                        {tierData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    {/* GRAPH 2: REVENUE PIE CHART */}
                                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col h-87.5">
                                        <h3 className="font-bold text-gray-800 text-sm mb-1">Impact: Revenue Share by Tier</h3>
                                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-2">Where is the actual money coming from?</p>
                                        <div className="flex-1 w-full flex items-center justify-center">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie data={tierData} dataKey="Revenue" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5}>
                                                        {tierData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                                    </Pie>
                                                    <ChartTooltip content={<CustomTooltip prefix="$" />} />
                                                    <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', color: '#4B5563' }} />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    {/* GRAPH 3: SELL-THROUGH STACKED BAR */}
                                    <div className="xl:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col h-75">
                                        <h3 className="font-bold text-gray-800 text-sm mb-1">Inventory: Sold vs. Unsold Capacity</h3>
                                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-4">Are you pricing out your audience or selling out too fast?</p>
                                        <div className="flex-1 w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={tierData} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f3f4f6" />
                                                    <XAxis type="number" hide />
                                                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#4B5563', fontSize: 10, fontWeight: 700 }} width={100} />
                                                    <ChartTooltip cursor={{ fill: '#f9fafb' }} content={<CustomTooltip />} />
                                                    <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '10px' }} />
                                                    <Bar dataKey="Sold" stackId="a" fill="#6E39CB" radius={[0, 0, 0, 0]} barSize={20} />
                                                    <Bar dataKey="Unsold" stackId="a" fill="#E5E7EB" radius={[0, 4, 4, 0]} barSize={20} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default OrganizerDashboard;