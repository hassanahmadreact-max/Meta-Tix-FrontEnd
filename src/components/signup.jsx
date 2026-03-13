import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Signup() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const [agreeTerms, setAgreeTerms] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreeTerms) {
      alert("You must agree to the Terms of Services and Privacy Policy to sign up.");
      return;
    }
    try{
        // 1. Standard JSON payload (no URLSearchParams needed!)
        const payload = {
            name: username,
            email: email,
            password: password
        };

        // 2. Axios automatically converts objects to JSON for you
        const response = await axios.post("http://127.0.0.1:8000/auth/registeration", payload);
        
        
        console.log("Welcome!", response.data);
        navigate("/login");
    }   
    catch (error) {
        console.error("🚨 FULL ERROR OBJECT:", error);
        if (error.response) {
            // This translates the [object Object] into readable text!
            const detailedError = JSON.stringify(error.response.data.detail, null, 2);
            console.log("FASTAPI COMPLAINTS:", detailedError);
            alert("Backend said:\n" + detailedError);
        } else if (error.request) {
            alert("No response from backend! Is Uvicorn running?");
        } else {
            alert("React Code Error: " + error.message);
        }
    }
  }



 return (
           <div className="flex flex-row justify-between w-full">

            <div className="px-38.75 py-51.25 flex flex-col gap-5">
            <div>
            <h1 className="text-4xl font-bold ">Signup</h1>
            <p>Get started with us</p>
            </div>
            <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
                <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} className="w-82.5 h-11.5 top-18.75 rounded-lg rotate-0 opacity-100 p-2 bg-[#F4F5F9] border border-[#DBDCDE]" />
                <input type="text" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-82.5 h-11.5 top-18.75 rounded-lg rotate-0 opacity-100 p-2 bg-[#F4F5F9] border border-[#DBDCDE]" />
                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-82.5 h-11.5 top-18.75 rounded-lg rotate-0 opacity-100 p-2 bg-[#F4F5F9] border border-[#DBDCDE]" />
                <div>
                    <p className="font-['Lato'] font-normal text-[12.64px] leading-[100%] tracking-[0%]">
                        <input type="checkbox" name="terms" id="" className="mr-2" onChange={(e) => setAgreeTerms(e.target.checked)}/>
                        You are agreeing to the Terms of Services and Privacy Policy
                    </p>
                </div>
                <button type="submit" className="w-82.5 h-11.5 top-80.75 rounded-lg rotate-0 opacity-100 bg-[#6E39CB] font-['Lato'] font-medium text-[16px] leading-[100%] tracking-[0%] text-center text-[#FFFFFF]">Sign Up</button>
            </form>
            <div className="flex flex-row items-center gap-2">
                <p className="font-['Lato'] font-normal text-[12.64px] leading-[100%] tracking-[0%]">Already have an account?</p>
                <span>
                    <button className="text-[#6E39CB] font-['Lato'] font-normal text-[12.64px] leading-[100%] tracking-[0%]" onClick={() => navigate('/')}>
                        Login
                    </button>
                </span>
            </div>
            </div>

            <div className="w-154.75 h-196 my-5 mr-5 rounded-[15px] rotate-0 opacity-100 bg-[#6E39CB]">
                  <div className="w-93.5 h-36 top-31 left-15 ml-15 mt-31 rotate-0 opacity-100">
                    <h1 className="font-['Lato'] font-bold text-[40px] leading-[100%] tracking-[0%] text-[#FFFFFF]">Very good works are waiting for you Sign up Now</h1>
                  </div>
                 <img src="/src/assets/signup/woman.png" alt="haha"  className="relative top-25.75 left-35 rotate-0 opacity-100"/>
            </div>
        </div>
    )
}
export default Signup;