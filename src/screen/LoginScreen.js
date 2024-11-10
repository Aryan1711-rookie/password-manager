import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "../config/firebase";
import "./LoginScreen.css";
import logo from "../assets/images/Logo-sm.png";

const LoginScreen = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        navigate('/home');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const signInWithGoogle = async () => {
    setError("");
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

  return (
    <div className="header  bg-gradient-to-b">
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="grid md:grid-cols-2 gap-8 items-center max-w-6xl mx-auto">
          {/* Left Column - Welcome Message */}
          <div className="text-center md:text-left space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold">
                <span className="text-gray-800">Welcome to </span>
                <span className="text-white">Password Manager!</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-800">
                Where you can securely store your username and password.
              </p>
            </div>

            {/* Logo placed below the text */}
            <div className="flex justify-center md:justify-start mt-6 md:mt-8">
              <img
                src={logo}
                alt="Password Manager Logo"
                className="w-32 h-32 md:w-40 md:h-40 object-contain"
              />
            </div>
          </div>

          {/* Right Column - Login Form */}
          <div className="login-container flex justify-center bg-white w-full md:p-8 space-x-9 p-4 sm:p-6 md:overflow-hidden flex-col">
  <div className="login-content w-full max-w-md p-6 space-y-10 md:overflow-hidden overflow-y-auto">
    <div className="space-y-5 text-center">
      <h2 className="text-2xl sm:text-3xl font-bold">Login</h2>
      <p className="text-base sm:text-base text-gray-500">Sign in to access your passwords</p>
    </div>

    {error && (
      <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
        {error}
      </div>
    )}

    <button
      onClick={signInWithGoogle}
      disabled={loading}
      className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-800 font-medium py-3 px-4 border border-gray-300 rounded-lg transition duration-150 disabled:opacity-50"
    >
      <img
        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
        alt="Google"
        className="w-5 h-5"
      />
      <span>Sign in with Google</span>
    </button>

    {loading && (
      <div className="text-center text-sm text-gray-500">
        Please wait...
      </div>
    )}
  </div>
</div>


        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
