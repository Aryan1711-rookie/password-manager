// Login.js
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "../config/firebase";
import './LoginForm.css';

const Login = () => {
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
    <div className="login-container">
      <form className="login-form" onSubmit={loginUser} autoComplete="off">
        <h2 className="login-title">Login</h2>
        
        {error && <p className="error-message">{error}</p>} {/* Display error message */}

        <button 
          type="button" 
          className="google-button" 
          onClick={signInWithGoogle}
          disabled={loading}
        >
          <img 
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
            alt="Google icon" 
          />
          Sign in with Google
        </button>
      </form>
    </div>
  );
};

export default Login;
