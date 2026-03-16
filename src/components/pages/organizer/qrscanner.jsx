import { useState } from "react";
import axios from "axios";
import Sidebar from "../../sidenav"; 

function ScanTickets() {
    const [ticketHash, setTicketHash] = useState("");
    const [scanStatus, setScanStatus] = useState("idle"); // 'idle', 'loading', 'success', 'error'
    const [ticketData, setTicketData] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");

    const token = localStorage.getItem("access_token");

    const handleManualScan = async (e) => {
        e.preventDefault();
        if (!ticketHash.trim()) return;
        
        processTicket(ticketHash);
    };

    const processTicket = async (hash) => {
        setScanStatus("loading");
        setErrorMessage("");
        setTicketData(null);

        try {
            const headers = { Authorization: `Bearer ${token}` };
            
            // 🚨 You will need to create this endpoint in FastAPI!
            const res = await axios.post(`http://127.0.0.1:8000/organizer/scan/${hash}`, {}, { headers });
            
            setTicketData(res.data);
            setScanStatus("success");
            setTicketHash(""); // Clear input for the next person in line
            
        } catch (error) {
            setScanStatus("error");
            setErrorMessage(error.response?.data?.detail || "Invalid or unrecognized ticket.");
            setTicketHash(""); 
        }
    };

    // Helper to reset the scanner
    const resetScanner = () => {
        setScanStatus("idle");
        setTicketData(null);
        setErrorMessage("");
    };

    return (
        <div className="bg-[#F4F5F9] min-h-screen flex flex-row font-['Lato'] relative">
            <Sidebar />

            <div className="flex-1 p-6 lg:p-10 overflow-y-auto">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h1 className="font-['bebas-neue'] font-bold text-4xl text-[#2D2D2D] tracking-wide uppercase leading-none">Access Control</h1>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-2">Scan and verify attendee tickets</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl">
                    
                    {/* LEFT COLUMN: THE SCANNER */}
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                            <h3 className="font-bold text-gray-800">Live Scanner</h3>
                            <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-100">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> System Online
                            </span>
                        </div>

                        {/* Camera Placeholder */}
                        <div className="p-8 flex-1 flex flex-col items-center justify-center bg-[#1a1a24] relative overflow-hidden min-h-75">
                            {/* Scanning Laser Animation */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-green-400 shadow-[0_0_15px_rgba(74,222,128,0.8)] animate-[scan_2s_ease-in-out_infinite]"></div>
                            
                            <div className="w-48 h-48 border-2 border-dashed border-gray-500 rounded-3xl flex items-center justify-center relative">
                                <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-white rounded-tl-2xl"></div>
                                <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-white rounded-tr-2xl"></div>
                                <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-white rounded-bl-2xl"></div>
                                <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-white rounded-br-2xl"></div>
                                
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-gray-600">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
                                </svg>
                            </div>
                            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-6 text-center">Camera hardware requires HTTPS.<br/>Use manual entry for local testing.</p>
                        </div>

                        {/* Manual Entry Form */}
                        <div className="p-6 border-t border-gray-100 bg-white">
                            <form onSubmit={handleManualScan} className="flex gap-3">
                                <input 
                                    type="text" 
                                    placeholder="Enter Ticket Hash..." 
                                    className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#6E39CB] outline-none font-mono"
                                    value={ticketHash}
                                    onChange={(e) => setTicketHash(e.target.value)}
                                    autoFocus
                                />
                                <button 
                                    type="submit" 
                                    disabled={scanStatus === "loading"}
                                    className="bg-[#6E39CB] text-white px-6 py-3 rounded-xl font-bold text-sm shadow-md hover:bg-[#5a2ca0] transition-colors disabled:opacity-50"
                                >
                                    {scanStatus === "loading" ? "Verifying..." : "Verify"}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: THE RESULT TERMINAL */}
                    <div className="flex flex-col gap-6">
                        
                        {scanStatus === "idle" && (
                            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 h-full flex flex-col items-center justify-center p-12 text-center">
                                <div className="text-6xl mb-6 opacity-50">⏳</div>
                                <h3 className="font-['bebas-neue'] text-3xl text-gray-800 tracking-wide mb-2">Ready to Scan</h3>
                                <p className="text-gray-500 text-sm">Waiting for the next ticket...</p>
                            </div>
                        )}

                        {scanStatus === "success" && ticketData && (
                            <div className="bg-green-500 rounded-3xl shadow-lg border border-green-600 h-full flex flex-col p-8 text-white relative overflow-hidden transform animate-[bounceIn_0.5s_ease-out]">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-bl-full pointer-events-none"></div>
                                
                                <div className="flex items-center gap-4 mb-8 relative z-10">
                                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-green-500 shadow-md">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                                    </div>
                                    <div>
                                        <h2 className="font-['bebas-neue'] text-5xl tracking-wide leading-none">VALID TICKET</h2>
                                        <p className="text-green-100 font-bold uppercase tracking-widest text-xs mt-1">Access Granted</p>
                                    </div>
                                </div>

                                <div className="bg-green-600/50 rounded-2xl p-6 backdrop-blur-sm border border-green-400/50 relative z-10 mb-6">
                                    <div className="grid grid-cols-2 gap-y-4">
                                        <div>
                                            <p className="text-green-200 text-[10px] font-bold uppercase tracking-widest mb-1">Event</p>
                                            <p className="font-bold text-lg leading-tight">{ticketData.event_title}</p>
                                        </div>
                                        <div>
                                            <p className="text-green-200 text-[10px] font-bold uppercase tracking-widest mb-1">Tier / Section</p>
                                            <p className="font-bold text-lg leading-tight">{ticketData.tier_name}</p>
                                        </div>
                                        <div>
                                            <p className="text-green-200 text-[10px] font-bold uppercase tracking-widest mb-1">Ticket ID</p>
                                            <p className="font-mono text-sm">{ticketData.ticket_id}</p>
                                        </div>
                                        <div>
                                            <p className="text-green-200 text-[10px] font-bold uppercase tracking-widest mb-1">Status Updated</p>
                                            <p className="font-bold text-sm">Marked as Checked-In</p>
                                        </div>
                                    </div>
                                </div>

                                <button onClick={resetScanner} className="mt-auto w-full bg-white text-green-600 px-6 py-4 rounded-xl font-black text-sm shadow-md hover:bg-green-50 transition-colors uppercase tracking-widest relative z-10">
                                    Scan Next Person
                                </button>
                            </div>
                        )}

                        {scanStatus === "error" && (
                            <div className="bg-red-500 rounded-3xl shadow-lg border border-red-600 h-full flex flex-col p-8 text-white relative overflow-hidden transform animate-[shake_0.4s_ease-in-out]">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-black opacity-10 rounded-bl-full pointer-events-none"></div>
                                
                                <div className="flex items-center gap-4 mb-8 relative z-10">
                                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-red-500 shadow-md">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
                                    </div>
                                    <div>
                                        <h2 className="font-['bebas-neue'] text-5xl tracking-wide leading-none">ACCESS DENIED</h2>
                                        <p className="text-red-100 font-bold uppercase tracking-widest text-xs mt-1">Ticket Rejected</p>
                                    </div>
                                </div>

                                <div className="bg-red-600/50 rounded-2xl p-6 backdrop-blur-sm border border-red-400/50 relative z-10 mb-6 flex-1 flex flex-col items-center justify-center text-center">
                                    <p className="text-red-200 text-[10px] font-bold uppercase tracking-widest mb-2">System Reason</p>
                                    <p className="font-bold text-xl">{errorMessage}</p>
                                </div>

                                <button onClick={resetScanner} className="mt-auto w-full bg-white text-red-600 px-6 py-4 rounded-xl font-black text-sm shadow-md hover:bg-red-50 transition-colors uppercase tracking-widest relative z-10">
                                    Clear & Scan Again
                                </button>
                            </div>
                        )}
                        
                    </div>
                </div>
            </div>

            {/* Custom Animations for the Scanner */}
            <style jsx>{`
                @keyframes scan {
                    0%, 100% { top: 10%; }
                    50% { top: 90%; }
                }
                @keyframes bounceIn {
                    0% { transform: scale(0.9); opacity: 0; }
                    50% { transform: scale(1.02); opacity: 1; }
                    100% { transform: scale(1); }
                }
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-10px); }
                    50% { transform: translateX(10px); }
                    75% { transform: translateX(-10px); }
                }
            `}</style>
        </div>
    );
}

export default ScanTickets;