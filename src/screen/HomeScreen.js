import React, { useCallback, useState, useEffect, useRef } from "react";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../config/firebase";
import { ref, set, push, remove, get, query, orderByChild } from "firebase/database";
import CryptoJS from 'crypto-js';
import { Lock, Copy, Trash2, LogOut, Eye, EyeOff, RefreshCw, Save, Key, Check } from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const HomeScreen = () => {
    const [length, setLength] = useState(8);
    const [numberAllow, setNumberAllow] = useState(true);
    const [charAllow, setCharAllow] = useState(true);
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const [savedCredentials, setSavedCredentials] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState({});
    const [copied, setCopied] = useState("");
   // const [category, setCategory] = useState("other");
    const navigate = useNavigate();
    const passwordRef = useRef(null);

    const getEncryptionKey = () => {
        const user = auth.currentUser;
        return user ? CryptoJS.SHA256(user.uid).toString() : null;
    };

    const encryptPassword = (plainPassword) => {
        const key = getEncryptionKey();
        if (!key) return null;
        return CryptoJS.AES.encrypt(plainPassword, key).toString();
    };

    const decryptPassword = (encryptedPassword) => {
        const key = getEncryptionKey();
        if (!key) return null;
        const bytes = CryptoJS.AES.decrypt(encryptedPassword, key);
        return bytes.toString(CryptoJS.enc.Utf8);
    };

    const fetchPasswords = async () => {
        try {
            setLoading(true);
            const user = auth.currentUser;
            if (!user) {
                alert("Please log in first");
                navigate('/');
                return;
            }

            const passwordsRef = ref(db, `passwords/${user.uid}`);
            const passwordsQuery = query(passwordsRef, orderByChild('createdAt'));

            const snapshot = await get(passwordsQuery);
            const passwords = [];

            if (snapshot.exists()) {
                snapshot.forEach((childSnapshot) => {
                    const data = childSnapshot.val();
                    const decryptedPassword = decryptPassword(data.password);
                    passwords.push({
                        id: childSnapshot.key,
                        ...data,
                        password: decryptedPassword
                    });
                });
            }

            setSavedCredentials(passwords);
        } catch (error) {
            alert("Error fetching passwords: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const passwordGenerator = useCallback(() => {
        let pass = "";
        let str = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
        if (numberAllow) str += "0123456789";
        if (charAllow) str += "@#$%^&*!~`*/+-={}[];:.,";
        for (let i = 1; i <= length; i++) {
            let char = Math.floor(Math.random() * str.length);
            pass += str.charAt(char);
        }
        setPassword(pass);
        setPassword("");
    }, [length, numberAllow, charAllow]);

    const copyPasswordToClip = useCallback(async (passwordToCopy = password, id = 'generator') => {
        try {
            await navigator.clipboard.writeText(passwordToCopy);
            setCopied(id);
            setTimeout(() => setCopied(""), 2000);
        } catch (err) {
            alert('Failed to copy password');
        }
    }, [password]);

  /*  useEffect(() => {
        passwordGenerator();
    }, [length, numberAllow, charAllow, passwordGenerator]);*/

    const handleChange = (e) => {
        setUsername(e.target.value);
    };

    const handleSave = async () => {
        if (username.trim() === "") {
            alert("Please enter a username");
            return;
        }

        if (savedCredentials.some(cred => cred.username === username.trim())) {
            alert("Username already exists!");
            return;
        }

        try {
            const user = auth.currentUser;
            if (!user) {
                alert("Please log in first");
                navigate('/');
                return;
            }

            const encryptedPassword = encryptPassword(password);
            if (!encryptedPassword) {
                alert("Error encrypting password");
                return;
            }

            const newCredential = {
                username: username.trim(),
                password: encryptedPassword,
               // category: category,
                userId: user.uid,
                createdAt: new Date().toISOString()
            };

            const newPasswordRef = push(ref(db, `passwords/${user.uid}`));
            await set(newPasswordRef, newCredential);

            await fetchPasswords();
            setUsername("");
            passwordGenerator();
            toast.success("Credential saved successfully");
        } catch (error) {
            toast.error("Error saving credential: " + error.message);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this credential?')) {
            try {
                const user = auth.currentUser;
                await remove(ref(db, `passwords/${user.uid}/${id}`));
                await fetchPasswords();
            } catch (error) {
                alert("Error deleting credential: " + error.message);
            }
        }
    };

    const clearAllCredentials = async () => {
        if (window.confirm('Are you sure you want to delete all saved credentials?')) {
            try {
                const user = auth.currentUser;
                await remove(ref(db, `passwords/${user.uid}`));
                setSavedCredentials([]);
            } catch (error) {
                alert("Error clearing credentials: " + error.message);
            }
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/');
        } catch (error) {
            alert("Failed to log out: " + error.message);
        }
    };

    const togglePasswordVisibility = (id) => {
        setShowPassword(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 md:p-6">
            <div className="w-full sm:max-w-6xl mx-auto mb-8">

                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white rounded-xl p-4 shadow-lg">
                    <div className="flex items-center gap-3">
                        <Lock className="w-8 h-8 text-blue-600" />
                        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Password Manager
                        </h1>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <button
                            onClick={fetchPasswords}
                            className="flex-1 sm:flex-none bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center justify-center gap-2"
                        >
                            <RefreshCw className="w-4 h-4" />
                            <span className="hidden sm:inline">Refresh</span>
                        </button>
                        <button
                            onClick={handleLogout}
                            className="flex-1 sm:flex-none bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors duration-200 flex items-center justify-center gap-2"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="hidden sm:inline">Logout</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-xl mx-auto mb-8">
                <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
                    <div className="space-y-4">
                        <div className="relative">
                            <input
                                type="text"
                                value={username}
                                className="w-full py-3 px-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                                placeholder="Enter username..."
                                onChange={handleChange}
                                autoFocus
                            />
                        </div>

                        <div className="relative">
                            <input
                                type={showPassword['generator'] ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full py-3 px-4 pr-24 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                placeholder="your password..."
                                //readOnly
                                ref={passwordRef}
                            />

                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
                                <button
                                    onClick={() => togglePasswordVisibility('generator')}
                                    className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                                >
                                    {showPassword['generator'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                                <button
                                    onClick={() => copyPasswordToClip(password, 'generator')}
                                    className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                                >
                                    {copied === 'generator' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="flex justify-between items-center gap-2">
                            <button
                                onClick={passwordGenerator}
                                className="w-full sm:w-auto bg-gray-100 px-4 py-2 rounded-lg border hover:border-blue-400 transition-all duration-200 flex items-center gap-2 justify-center text-gray-500"
                            >
                                <Key className="w-4 h-4" />
                                Generate
                            </button>
                            <button
                                onClick={handleSave}
                                className="w-full sm:w-auto bg-blue-500 px-4 py-2 rounded-lg text-white hover:bg-blue-600 transition-colors duration-200 flex items-center gap-2 justify-center"
                            >
                                <Save className="w-4 h-4" />
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto mb-8 ">
                <div className="bg-white rounded-xl shadow-lg p-6 space-y-6 overflow-hidden">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold text-gray-800">Saved Credentials</h2>
                        <button
                            onClick={clearAllCredentials}
                            className="bg-red-100 text-red-500 px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-red-200 transition-colors"
                        >
                            Clear All
                        </button>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                    ) : savedCredentials.length > 0 ? (
                        <ul className="space-y-4 overflow-hidden">
                            {savedCredentials.map((cred) => (
                                <li key={cred.id} className="p-4 bg-gray-50 rounded-lg border flex items-center justify-between">
                                    <div className="overflow-x-auto whitespace-nowrap w-full md:overflow-x-auto">
                                        <p className="font-semibold text-gray-700">{cred.username}</p>
                                        <p className="text-gray-600 text-sm break-all">
                                            {showPassword[cred.id] ? cred.password : "*".repeat(cred.password.length)}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => togglePasswordVisibility(cred.id)}
                                            className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                                        >
                                            {showPassword[cred.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                        <button
                                            onClick={() => copyPasswordToClip(cred.password, cred.id)}
                                            className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                                        >
                                            {copied === cred.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(cred.id)}
                                            className="p-2 text-red-500 hover:text-red-700 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-600 text-center">No credentials saved.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HomeScreen;
