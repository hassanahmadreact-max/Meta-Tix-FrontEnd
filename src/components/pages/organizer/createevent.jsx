import { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../../sidenav"; 

function CreateEvent() {
    const [venues, setVenues] = useState([]); 
    
    // Form States
    const [eventForm, setEventForm] = useState({
        title: "", description: "", venue_id: ""
    });
    
    const [schedules, setSchedules] = useState([
        { schedule_name: "Main Event", start_time: "", end_time: "" }
    ]);

    const [tiers, setTiers] = useState([
        { tier_name: "General Admission", price: "", available_quantity: "" }
    ]);

    const [venueSearchTerm, setVenueSearchTerm] = useState("");
    const [isVenueDropdownOpen, setIsVenueDropdownOpen] = useState(false);

    const token = localStorage.getItem("access_token");
    const headers = { Authorization: `Bearer ${token}` };

    // Fetch Venues on Load
    useEffect(() => {
        const fetchVenues = async () => {
            try {
                const res = await axios.get("http://127.0.0.1:8000/events/venues", { headers }); 
                setVenues(res.data);
            } catch (error) {
                console.error("🚨 Failed to fetch venues:", error);
            }
        };
        if (token) fetchVenues();
    }, [token]);

    // --- DYNAMIC FORM HANDLERS ---
    const handleAddSchedule = () => setSchedules([...schedules, { schedule_name: "", start_time: "", end_time: "" }]);
    const handleRemoveSchedule = (index) => setSchedules(schedules.filter((_, i) => i !== index));
    const handleScheduleChange = (index, field, value) => {
        const newSchedules = [...schedules];
        newSchedules[index][field] = value;
        setSchedules(newSchedules);
    };

    const handleAddTier = () => setTiers([...tiers, { tier_name: "", price: "", available_quantity: "" }]);
    const handleRemoveTier = (index) => setTiers(tiers.filter((_, i) => i !== index));
    const handleTierChange = (index, field, value) => {
        const newTiers = [...tiers];
        newTiers[index][field] = value;
        setTiers(newTiers);
    };

    // --- SUBMIT EVENT ---
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
            
            alert("Event submitted successfully! It is now pending Admin approval.");
            
            // Reset Form after success
            setEventForm({ title: "", description: "", venue_id: "" });
            setSchedules([{ schedule_name: "Main Event", start_time: "", end_time: "" }]);
            setTiers([{ tier_name: "General Admission", price: "", available_quantity: "" }]);
            setVenueSearchTerm(""); 
            
            // Redirect to dashboard (Optional: requires react-router's useNavigate if you prefer smooth routing)
            window.location.href = "/organizer-dashboard";

        } catch (error) {
            const errorDetail = error.response?.data?.detail;
            if (Array.isArray(errorDetail)) {
                const validationMessages = errorDetail.map(err => `${err.loc[err.loc.length - 1]}: ${err.msg}`);
                alert("Validation Error: " + validationMessages.join(" | "));
            } else {
                alert(errorDetail || "Failed to submit event.");
            }
        }
    };

    return (
        <div className="bg-[#F4F5F9] min-h-screen flex flex-row font-['Lato'] relative">
            <Sidebar />

            <div className="flex-1 p-8 lg:p-12 overflow-y-auto">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h1 className="font-['bebas-neue'] font-bold text-4xl text-[#2D2D2D] tracking-wide uppercase leading-none">Draft New Event</h1>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-2">Design an experience for your audience</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
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

                                {/* VENUE SELECTION */}
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

                                {/* SCHEDULES */}
                                <div className="md:col-span-2 mt-4 pt-4 border-t border-gray-100">
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="text-sm font-bold text-[#6E39CB] uppercase tracking-wider">Event Schedules</h4>
                                        <button type="button" onClick={handleAddSchedule} className="text-xs font-bold text-[#6E39CB] bg-purple-50 px-3 py-1.5 rounded-lg hover:bg-purple-100 transition-colors">+ Add Schedule</button>
                                    </div>
                                    <div className="space-y-3">
                                        {schedules.map((schedule, index) => (
                                            <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end bg-gray-50 p-4 rounded-xl relative group border border-gray-100">
                                                {schedules.length > 1 && (
                                                    <button type="button" onClick={() => handleRemoveSchedule(index)} className="absolute -top-3 -right-3 bg-white border border-red-200 text-red-500 rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-sm hover:bg-red-50 hover:text-red-600 z-10" title="Remove Schedule">
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

                                {/* TIERS */}
                                <div className="md:col-span-2 mt-4 pt-4 border-t border-gray-100">
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="text-sm font-bold text-[#6E39CB] uppercase tracking-wider">Ticket Tiers</h4>
                                        <button type="button" onClick={handleAddTier} className="text-xs font-bold text-[#6E39CB] bg-purple-50 px-3 py-1.5 rounded-lg hover:bg-purple-100 transition-colors">+ Add Tier</button>
                                    </div>
                                    <div className="space-y-3">
                                        {tiers.map((tier, index) => (
                                            <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end bg-gray-50 p-4 rounded-xl relative group border border-gray-100">
                                                {tiers.length > 1 && (
                                                    <button type="button" onClick={() => handleRemoveTier(index)} className="absolute -top-3 -right-3 bg-white border border-red-200 text-red-500 rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-sm hover:bg-red-50 hover:text-red-600 z-10" title="Remove Tier">
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
                            <button type="submit" className="w-full bg-[#6E39CB] text-white font-bold rounded-xl px-4 py-3 hover:bg-[#5a2ca0] transition-colors shadow-md mt-6">Submit for Review</button>
                        </form>
                    </div>
                    
                    <div className="bg-[#f3effb] rounded-3xl p-8 flex flex-col items-center justify-center text-center border border-purple-100 max-h-87.5 sticky top-8">
                        <div className="text-6xl mb-6">📝</div>
                        <h3 className="font-['bebas-neue'] text-3xl text-[#6E39CB] tracking-wide mb-2">Approval Process</h3>
                        <p className="text-gray-600 text-sm">To ensure platform quality, all newly created events undergo a brief review by our administrative team. You will be notified as soon as your event is approved and live for ticket sales.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CreateEvent;