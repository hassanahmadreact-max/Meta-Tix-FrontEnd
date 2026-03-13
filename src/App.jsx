import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./components/login";
import Signup from "./components/signup";
// import Sidebar from "./components/sidenav"; <-- REMOVED!
import Footer from "./components/footer"; 
import LandingPage from "./components/landing page";
import BookingPage from "./components/pages/client/booking page";
import ProtectedRoute from "./components/sharedcomps/protectedroutes";
import Profile from "./components/pages/client/profile";
import Cart from "./components/pages/client/checkout";
import MyTickets from "./components/pages/client/my_tickets";
import AdminDashboard from "./components/pages/admin/admin-dashboard";
import ManageUsers from "./components/pages/admin/manageuser";
import ManageEvents from "./components/pages/admin/manageevents";
import SystemLogs from "./components/pages/admin/systemlogs";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* 🟢 CLIENT ROUTES (Only Clients) */}
        <Route element={<ProtectedRoute allowedRoles={["Customer"]} />}>
            <Route path="/BookingPage" element={<BookingPage />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/checkout" element={<Cart />} />
            <Route path="/mytickets" element={<MyTickets />} />
        </Route>

        {/* 🔵 ORGANIZER ROUTES (Only Organizers) */}
        <Route element={<ProtectedRoute allowedRoles={["Organizer"]} />}>
            {/* <Route path="/organizer-dashboard" element={<OrganizerDashboard />} /> */}
            {/* <Route path="/create-event" element={<CreateEvent />} /> */}
        </Route>

        {/* 🔴 ADMIN ROUTES (Only Admins) */}
        <Route element={<ProtectedRoute allowedRoles={["Admin"]} />}>
             <Route path="/admin-dashboard" element={<AdminDashboard />} /> 
             <Route path="admin/users" element={<ManageUsers />} /> 
             <Route path="admin/events" element={<ManageEvents />} /> 
             <Route path="admin/logs" element={<SystemLogs />} /> 
        </Route>
        
        {/* 🟣 SHARED ROUTES */}
        <Route element={<ProtectedRoute allowedRoles={["Admin", "Organizer"]} />}>
            {/* <Route path="/sales-reports" element={<Reports />} /> */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;