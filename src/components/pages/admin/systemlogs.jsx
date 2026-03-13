import { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../../sidenav"; // Adjust path if needed

function SystemLogs() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const token = localStorage.getItem("access_token");

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const headers = { Authorization: `Bearer ${token}` };
                // Ensure this endpoint exists in your FastAPI backend
                const response = await axios.get("http://127.0.0.1:8000/admin/logs", { headers });
                setLogs(response.data);
            } catch (error) {
                console.error("🚨 Failed to fetch system logs:", error);
            } finally {
                setLoading(false);
            }
        };

        if (token) fetchLogs();
    }, [token]);

    return (
        <div className="bg-[#F4F5F9] min-h-screen flex flex-row font-['Lato']">
            <Sidebar />

            <div className="flex-1 p-8 lg:p-12 overflow-y-auto">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h1 className="font-['bebas-neue'] font-bold text-4xl text-[#2D2D2D] tracking-wide uppercase leading-none">
                            System Logs
                        </h1>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-2">
                            Immutable audit trail of administrative actions
                        </p>
                    </div>

                    <div className="relative w-72 group">
                        <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 text-gray-400 group-focus-within:text-[#6E39CB] transition-colors">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                            </svg>
                        </span>
                        <input 
                            type="text" 
                            placeholder="Search by admin, action, or target..." 
                            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-[#6E39CB] focus:border-transparent outline-none transition-all shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden min-h-125">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-125 text-gray-400">
                            <div className="w-10 h-10 border-4 border-purple-100 border-t-[#6E39CB] rounded-full animate-spin mb-4"></div>
                            <p className="font-bold text-[10px] tracking-widest uppercase">Fetching Audit Trail...</p>
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-125 text-gray-400">
                            <div className="text-5xl mb-4">🗄️</div>
                            <h3 className="text-gray-800 font-bold text-xl mb-1">Log is empty</h3>
                            <p className="text-gray-400 text-sm">No administrative actions have been recorded yet.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="py-4 px-6 text-gray-400 text-[10px] font-black uppercase tracking-widest">Timestamp</th>
                                        <th className="py-4 px-6 text-gray-400 text-[10px] font-black uppercase tracking-widest">Administrator</th>
                                        <th className="py-4 px-6 text-gray-400 text-[10px] font-black uppercase tracking-widest">Action Performed</th>
                                        <th className="py-4 px-6 text-gray-400 text-[10px] font-black uppercase tracking-widest">Target</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logs
                                        .filter(log => 
                                            log.admin_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                            log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                            log.target_name?.toLowerCase().includes(searchTerm.toLowerCase())
                                        )
                                        .map((log, index) => (
                                        <tr key={log.log_id || index} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                            <td className="py-4 px-6 whitespace-nowrap">
                                                <p className="font-bold text-gray-700 text-sm">
                                                    {new Date(log.created_at).toLocaleDateString()}
                                                </p>
                                                <p className="text-[10px] text-gray-400">
                                                    {new Date(log.created_at).toLocaleTimeString()}
                                                </p>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className="bg-purple-50 text-[#6E39CB] text-[10px] font-black px-2.5 py-1 rounded-md uppercase">
                                                    {log.admin_name}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6">
                                                <p className="text-sm text-gray-800 font-medium">{log.action}</p>
                                            </td>
                                            <td className="py-4 px-6">
                                                <p className="text-sm font-bold text-gray-600">{log.target_name}</p>
                                                {log.details && <p className="text-[10px] text-gray-400">{log.details}</p>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default SystemLogs;