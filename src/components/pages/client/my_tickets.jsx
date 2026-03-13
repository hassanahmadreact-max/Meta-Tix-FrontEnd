import { useState, useEffect } from "react";
import axios from "axios";
import { QRCodeCanvas } from "qrcode.react";
import { jsPDF } from "jspdf";
import Sidebar from "../../sidenav";

function MyTickets() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // State to track which orders are expanded to show all tickets
    const [expandedOrders, setExpandedOrders] = useState({});
    
    const token = localStorage.getItem("access_token");

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const response = await axios.get("http://127.0.0.1:8000/booking/my_tickets", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setBookings(response.data);
            } catch (error) {
                console.error("🚨 Failed to fetch tickets:", error);
            } finally {
                setLoading(false);
            }
        };

        if (token) fetchTickets();
    }, [token]);

    // Function to toggle an order open/closed
    const toggleOrderExpand = (bookingId) => {
        setExpandedOrders(prev => ({
            ...prev,
            [bookingId]: !prev[bookingId]
        }));
    };

    // The PDF Generator (Unchanged)
    const downloadTicketPDF = (ticket, booking) => {
        const pdf = new jsPDF("landscape", "mm", [200, 100]);

        pdf.setFillColor(255, 255, 255);
        pdf.rect(0, 0, 200, 100, "F");

        pdf.setFillColor(110, 57, 203);
        pdf.rect(0, 0, 8, 100, "F");

        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(24);
        pdf.setTextColor(45, 45, 45);
        pdf.text(booking.event?.title || "Event Ticket", 15, 25);

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(12);
        pdf.setTextColor(110, 57, 203);
        pdf.text(`Venue: ${booking.event?.venue_name || "TBA"}`, 15, 40);

        pdf.setTextColor(100, 100, 100);
        pdf.text(`Order: #${booking.booking_id}`, 15, 60);
        pdf.text(`Ticket ID: #${ticket.ticket_id}`, 15, 68);
        pdf.text(`Seat: ${ticket.seat_identifier || "General Admission"}`, 15, 76);
        
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(110, 57, 203);
        pdf.text(`STATUS: ${ticket.status.toUpperCase()}`, 15, 88);

        pdf.setDrawColor(200, 200, 200);
        pdf.setLineDash([2, 2], 0);
        pdf.line(140, 5, 140, 95);

        const qrCanvas = document.getElementById(`qr-${ticket.ticket_id}`);
        if (qrCanvas) {
            const qrImage = qrCanvas.toDataURL("image/png");
            pdf.addImage(qrImage, "PNG", 148, 25, 40, 40);
        }

        pdf.setFont("courier", "normal");
        pdf.setFontSize(8);
        pdf.setTextColor(150, 150, 150);
        const shortHash = ticket.qr_code_hash.substring(0, 15) + "...";
        pdf.text(shortHash, 168, 70, { align: "center" });

        pdf.save(`Ticket_${ticket.ticket_id}.pdf`);
    };

    return (
        <div className="bg-[#F4F5F9] min-h-screen flex flex-row font-['Lato']">
            <Sidebar />

            <div className="w-full flex-1 p-4 pt-24 md:p-10 lg:p-16 overflow-y-auto">
                
                <div className="flex items-center gap-3 mb-6 md:mb-8">
                    <div className="bg-white p-2.5 rounded-xl shadow-sm border border-gray-200 text-[#6E39CB]">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 0 0-2.25-2.25H15a3 3 0 1 1-6 0H5.25A2.25 2.25 0 0 0 3 12m18 0v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 9m18 0V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v3" />
                        </svg>
                    </div>
                    <h1 className="font-['bebas-neue'] font-bold text-3xl md:text-4xl text-[#2D2D2D] tracking-wide translate-y-0.5">
                        My Digital Wallet
                    </h1>
                </div>

                {loading ? (
                    <div className="flex items-center gap-3 text-[#6E39CB] text-lg font-bold py-10">
                        <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        Loading your tickets...
                    </div>
                ) : bookings.length === 0 ? (
                    <div className="bg-white p-8 md:p-16 rounded-3xl shadow-sm text-center border border-gray-200 flex flex-col items-center">
                        <div className="bg-gray-50 p-6 rounded-full mb-6 text-gray-300 border-2 border-dashed border-gray-200">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 0 1 0 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 0 1 0-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375Z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">No tickets found</h2>
                        <p className="text-gray-500 mb-8 max-w-md">You haven't purchased any tickets yet. Check out our events page to find your next experience!</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-10 md:gap-12">
                        {bookings.map((booking) => {
                            const isExpanded = expandedOrders[booking.booking_id];
                            const ticketsToShow = isExpanded ? booking.tickets : booking.tickets.slice(0, 3);
                            
                            // 🚨 THE FIX: Get total tickets so we can dynamically hide them on mobile
                            const totalTickets = booking.tickets.length;

                            return (
                                <div key={booking.booking_id} className="relative">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 mb-4">
                                        <h3 className="text-gray-500 font-bold uppercase tracking-wider text-sm md:text-base">
                                            Order #{booking.booking_id} <span className="hidden sm:inline">•</span> <br className="sm:hidden" /> {booking.status}
                                        </h3>
                                        <span className="w-fit text-xs font-bold bg-gray-200 text-gray-600 px-3 py-1 rounded-full">
                                            {booking.tickets.length} Tickets
                                        </span>
                                    </div>

                                    <div className="flex flex-col gap-6">
                                        {/* 🚨 Grab the index so we know which ticket we are rendering */}
                                        {ticketsToShow.map((ticket, index) => (
                                            <div 
                                                key={ticket.ticket_id} 
                                                /* 🚨 THE CSS MAGIC:
                                                  If not expanded and it's the 2nd/3rd ticket: 
                                                  - Apply "hidden" on mobile.
                                                  - Apply "md:flex" so they STILL show on desktop!
                                                */
                                                className={`bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden max-w-4xl transition-all duration-300 md:flex-row ${
                                                    !isExpanded && index > 0 ? "hidden md:flex" : "flex flex-col"
                                                }`}
                                            >
                                                {/* LEFT SIDE: Event Details */}
                                                <div className="flex-1 p-5 md:p-8 relative bg-white">
                                                    {/* Desktop Cutout */}
                                                    <div className="absolute top-1/2 -right-3 w-6 h-6 bg-[#F4F5F9] rounded-full transform -translate-y-1/2 border-l border-gray-200 z-10 hidden md:block"></div>
                                                    {/* Mobile Cutout */}
                                                    <div className="absolute -bottom-3 left-1/2 w-6 h-6 bg-[#F4F5F9] rounded-full transform -translate-x-1/2 border-t border-gray-200 z-10 md:hidden"></div>
                                                    
                                                    <div className="bg-[#e0d4f7] text-[#6E39CB] text-xs font-bold px-3 py-1 rounded-full w-fit mb-3 md:mb-4 uppercase">
                                                        {ticket.status} TICKET
                                                    </div>
                                                    
                                                   <h2 className="font-['bebas-neue'] text-3xl md:text-4xl text-[#2D2D2D] mb-2 leading-none">
                                                        {booking.event?.title || "Unknown Event"}
                                                    </h2>

                                                    <div className="text-gray-500 mb-2 md:mb-6 space-y-1 text-sm md:text-base">
                                                        <p className="font-bold text-[#6E39CB]">📍 {booking.event?.venue_name || "TBA"}</p>
                                                        <p>Ticket ID: #{ticket.ticket_id}</p>
                                                        <p>Seat: {ticket.seat_identifier || "General Admission"}</p>
                                                    </div>
                                                </div>

                                                {/* RIGHT SIDE: QR Code Stub */}
                                                <div className="w-full md:w-64 bg-gray-50 p-6 md:p-8 flex flex-col items-center justify-center border-t-2 md:border-t-0 md:border-l-2 border-dashed border-gray-300 relative">
                                                    {/* Desktop Cutout */}
                                                    <div className="absolute top-1/2 -left-3 w-6 h-6 bg-[#F4F5F9] rounded-full transform -translate-y-1/2 border-r border-gray-200 z-10 hidden md:block"></div>
                                                    {/* Mobile Cutout */}
                                                    <div className="absolute -top-3 left-1/2 w-6 h-6 bg-[#F4F5F9] rounded-full transform -translate-x-1/2 border-b border-gray-200 z-10 md:hidden"></div>
                                                    
                                                    <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-100 mb-3 md:mb-4">
                                                        <QRCodeCanvas id={`qr-${ticket.ticket_id}`} value={ticket.qr_code_hash} size={120} />
                                                    </div>
                                                    
                                                    <p className="text-[10px] md:text-xs text-gray-400 font-mono text-center break-all w-full mb-4">
                                                        {ticket.qr_code_hash.substring(0, 15)}...
                                                    </p>

                                                    <button 
                                                        onClick={() => downloadTicketPDF(ticket, booking)}
                                                        className="w-full bg-[#6E39CB] text-white py-3 md:py-2 rounded-lg font-bold hover:bg-[#5a2ca0] transition-colors shadow-sm text-sm flex justify-center items-center gap-2"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                                                        </svg>
                                                        Download PDF
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* 🚨 THE BUTTON LOGIC FIX */}
                                    {/* Show button on ALL screens if total > 3. Show ONLY ON MOBILE if total is 2 or 3! */}
                                    {totalTickets > 1 && (
                                        <div className={`mt-6 justify-center max-w-4xl ${totalTickets > 3 ? "flex" : "flex md:hidden"}`}>
                                            <button 
                                                onClick={() => toggleOrderExpand(booking.booking_id)}
                                                className="flex justify-center items-center gap-2 w-full sm:w-auto bg-white border border-gray-200 text-[#6E39CB] px-8 py-3 sm:py-2 rounded-xl sm:rounded-full font-bold shadow-sm hover:bg-purple-50 transition-colors"
                                            >
                                                {isExpanded ? (
                                                    <>
                                                        Show Less
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" /></svg>
                                                    </>
                                                ) : (
                                                    <>
                                                        View all {totalTickets} tickets
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" /></svg>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

export default MyTickets;