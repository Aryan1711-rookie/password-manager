import React, { useRef, useState, useEffect } from 'react';
import './LoginScreen.css';
import { useNavigate} from "react-router-dom";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "../config/firebase";

const LoginScreen = () => {
  const loginFormRef = useRef(null);


  const [loading, setLoading] = useState(false);  
  const [error, setError] = useState("");  // State to handle error messages
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        navigate('/home');
      }
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, [navigate]);
  
  // Google sign in
  const signInWithGoogle = async () => {
    setError(""); // Clear any previous errors
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      console.log("Google sign in successful:", result.user);
      navigate("/home");
    } catch (error) {
      setError("Failed to sign in with Google: " + error.message);
      console.error("Google sign in error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  // Email/Password Login
  const loginUser = async (e) => {
    e.preventDefault();
    setError(""); // Clear any previous errors
    setLoading(true);

    // Replace these with actual email and password fields
    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("Email/Password sign in successful:", userCredential.user);
      navigate("/home");
    } catch (error) {
      setError("Failed to sign in: " + error.message);
      console.error("Email/Password sign in error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="header">
        
      <div className="title text-center mt-6">
        <span className="welcome">Welcome to, </span>
        <span className="portal">Password Manager!</span><br/>
        <span className="welcome text-2xl mt-4 text-gray-700">
        where you can securely store, </span>
        <span className="portal text-2xl text-gray-700">
           your username and password.
        </span>
      </div>

        

        
        <div
          className="w-full max-w-md mx-auto mt-8 bg-white p-6 rounded-lg shadow-md"
          ref={loginFormRef}
        >
          <form className="space-y-4" onSubmit={loginUser} autoComplete="off">
            <h2 className="text-2xl font-semibold text-center">Login</h2>

            {error && <p className="text-red-500 text-center">{error}</p>}

            <div className="flex justify-center mt-4">
              <button
                type="button"
                className="flex items-center justify-center w-full py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition duration-300 disabled:opacity-50"
                onClick={signInWithGoogle}
                disabled={loading}
              >
                <img
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  alt="Google icon"
                  className="w-6 h-6 mr-2"
                />
                <span>Sign in with Google</span>
              </button>
            </div>
          </form>
        </div>
    
    </div>


      
      
    </>
  );
};

export default LoginScreen;