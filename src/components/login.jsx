import { useState } from 'react'
import axios from 'axios'
import { useNavigate,useLocation } from 'react-router-dom'

function Login() {
    const [passwordVisible, setPasswordVisible] = useState(false)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const navigate = useNavigate();
    const location = useLocation();
    const destination = location.state?.from || '/dashboard'; 
    
    // State for the Forgot Password modal
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [resetEmail, setResetEmail] = useState("")

    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible)
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("SENDING TO BACKEND -> Email:", email, " | Password:", password);
        
        try {
            const params = new URLSearchParams();
            params.append("username", email); 
            params.append("password", password);

            // 1. Get the Token
            const response = await axios.post("http://127.0.0.1:8000/auth/login", params, {
                headers: { "Content-Type": "application/x-www-form-urlencoded" }
            });
            const token = response.data.access_token;
            localStorage.setItem("access_token", token);
            
            // 🚨 2. GET USER PROFILE (Crucial for RBAC!)
            // Note: Change "/users/me" to whatever your FastAPI profile endpoint is named
            const profileResponse = await axios.get("http://127.0.0.1:8000/users/me", {
                headers: { Authorization: `Bearer ${token}` }
            });

            // 3. Save Role and Name to Local Storage
            const role = profileResponse.data.role; // Make sure your backend sends "role"
            localStorage.setItem("user_role", role);
            localStorage.setItem("user_name", profileResponse.data.name);

            // 4. Smart Routing based on the Role
            if (role === "Admin") {
                navigate("/admin-dashboard");
            } else if (role === "Organizer") {
                navigate("/organizer-dashboard");
            } else {
                navigate("/BookingPage"); // Clients go here
            }
            
        } catch (error) {
            console.error("🚨 FULL ERROR OBJECT:", error);
            if (error.response) {
                alert("Backend said: " + error.response.data.detail);
            } else if (error.request) {
                alert("No response from backend! Is Uvicorn running?");
            } else {
                alert("React Code Error: " + error.message);
            }
        }
    }

    const handleResetPassword = () => {
        console.log("Sending reset link to:", resetEmail);
        // Add your axios call here for the forgot password endpoint
        setIsModalOpen(false);
        setResetEmail("");
    }

  return (
    <div className="flex flex-row justify-between w-full relative">
        <div className="w-154.75 h-196 my-5 ml-5 rounded-[15px] rotate-0 opacity-100 bg-[#6E39CB]">
            <div className="w-93.5 h-36 top-31 left-15 ml-15 mt-31 rotate-0 opacity-100">
                <h1 className="font-['Lato'] font-bold text-[40px] leading-[100%] tracking-[0%] text-[#FFFFFF]">Very good works are waiting for you Sign up Now</h1>
            </div>
          <img src="/src/assets/signup/woman.png" alt="haha"  className="relative top-25.75 left-35 rotate-0 opacity-100"/>
        </div>
        
        {/* right side form */}
        <div className="px-38.75 py-51.25 flex flex-col gap-5" >
            <div className="flex flex-col gap-6">
                <h1 className="text-4xl font-bold">Login</h1>
                <p>Welcome back! Please enter your details</p>
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <input type="text" placeholder="Email" className="w-82.5 h-11.5 top-18.75 rounded-lg rotate-0 opacity-100 p-2 bg-[#F4F5F9] border border-[#DBDCDE]" value={email} onChange={(e) => setEmail(e.target.value)}/>
                    
                    <div className="relative w-full">
                        <input type={passwordVisible ? "text" : "password"} placeholder="Password" className="w-82.5 h-11.5 top-18.75 rounded-lg rotate-0 opacity-100 p-2 bg-[#F4F5F9] border border-[#DBDCDE]" value={password} onChange={(e) => setPassword(e.target.value)}/>
                        <button type="button" onClick={togglePasswordVisibility} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </button>
                    </div>

                    {/* Added type="button" and onClick to open the modal */}
                    <button type="button" onClick={() => setIsModalOpen(true)} className="text-[#6E39CB] font-['Lato'] font-normal text-[12.64px] leading-[100%] tracking-[0%] text-left">Forgot Password?</button>
                    
                    <button type="submit" className="w-82.5 h-11.5 top-80.75 rounded-lg rotate-0 opacity-100 bg-[#6E39CB] font-['Lato'] font-medium text-[16px] leading-[100%] tracking-[0%] text-center text-[#FFFFFF]">Sign in</button>
                </form>
            </div>

            <div className="flex flex-row gap-2 items-center justify-center">
                <span className="font-['Lato'] font-normal text-[12.64px] leading-[100%] tracking-[0%]">Don't have an account?</span>
                <button className="text-[#6E39CB] font-['Lato'] font-normal text-[12.64px] leading-[100%] tracking-[0%]" onClick={() => navigate('/signup')}>
                    Sign Up Now
                </button>
            </div>
        </div>

        {/* Forgot Password Modal Overlay */}
        {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center  bg-opacity-40 backdrop-blur-sm">
                <div className="bg-white p-8 rounded-[15px] shadow-xl flex flex-col gap-4 w-96 relative">
                    <h2 className="text-2xl font-bold font-['Lato'] text-gray-800">Reset Password</h2>
                    <p className="font-['Lato'] text-sm text-gray-600">
                        Enter your email address and we will send you instructions to reset your password.
                    </p>
                    
                    <input 
                        type="email" 
                        placeholder="Enter your email" 
                        className="w-full h-11.5 mt-2 rounded-lg p-3 bg-[#F4F5F9] border border-[#DBDCDE] focus:outline-none focus:border-[#6E39CB]"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                    />

                    <div className="flex flex-row justify-end gap-3 mt-4">
                        <button 
                            type="button" 
                            onClick={() => setIsModalOpen(false)} 
                            className="px-4 py-2 rounded-lg border border-[#DBDCDE] font-['Lato'] font-medium text-gray-600 hover:bg-gray-100"
                        >
                            Cancel
                        </button>
                        <button 
                            type="button" 
                            onClick={handleResetPassword} 
                            className="px-4 py-2 rounded-lg bg-[#6E39CB] font-['Lato'] font-medium text-[#FFFFFF] hover:bg-opacity-90"
                        >
                            Send Link
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  )
}

export default Login;