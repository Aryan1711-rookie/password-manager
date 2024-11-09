import React, { useCallback, useState, useEffect, useRef } from "react";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../config/firebase";
import { 
  ref,
  set,
  push,
  remove,
  get,
  query,
  orderByChild
} from "firebase/database";
import CryptoJS from 'crypto-js';
const HomeScreen = () => {
    const [length, setLength] = useState(8);
    const [numberAllow, setNumberAllow] = useState(true);
    const [charAllow, setCharAllow] = useState(true);
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const [savedCredentials, setSavedCredentials] = useState([]);
    const [loading, setLoading] = useState(false);

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
    // Fetch passwords from Firebase
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
                  // Decrypt the password before adding to state
                  const decryptedPassword = decryptPassword(data.password);
                  passwords.push({
                      id: childSnapshot.key,
                      ...data,
                      password: decryptedPassword // Replace encrypted password with decrypted one
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
    }, [length, numberAllow, charAllow]);

    const copyPasswordToClip = useCallback(async (passwordToCopy = password) => {
      try {
        await navigator.clipboard.writeText(passwordToCopy);
        alert('Password copied to clipboard!');
      } catch (err) {
        alert('Failed to copy password');
      }
    }, [password]);

    useEffect(() => {
      passwordGenerator();
    }, [length, numberAllow, charAllow, passwordGenerator]);
    
    const handleChange = (e) => {
      setUsername(e.target.value);
    };



    const handleSave = async () => {
      if (username.trim() === "") {
          alert("Please enter a username");
          return;
      }

      // Check for duplicate username
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

          // Encrypt the password before saving
          const encryptedPassword = encryptPassword(password);
          if (!encryptedPassword) {
              alert("Error encrypting password");
              return;
          }

          const newCredential = {
              username: username.trim(),
              password: encryptedPassword,  // Store the encrypted password
              userId: user.uid,
              createdAt: new Date().toISOString()
          };

          // Create a new reference with an auto-generated key
          const newPasswordRef = push(ref(db, `passwords/${user.uid}`));
          await set(newPasswordRef, newCredential);
          
          await fetchPasswords(); // Refresh the list
          setUsername("");
          passwordGenerator();
      } catch (error) {
          alert("Error saving credential: " + error.message);
      }
  };

    const handleDelete = async (id) => {
      if (window.confirm('Are you sure you want to delete this credential?')) {
        try {
          const user = auth.currentUser;
          await remove(ref(db, `passwords/${user.uid}/${id}`));
          await fetchPasswords(); // Refresh the list
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

    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <div className="flex justify-between items-center mb-4 px-8">
                <h1 className="text-4xl text-gray-800">Password Manager</h1>
                <div className="flex gap-4">
                    <button
                        onClick={fetchPasswords}
                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                    >
                        Show Passwords
                    </button>
                    <button
                        onClick={handleLogout}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-red-600"
                    >
                        Logout
                    </button>
                </div>
            </div>

            <div className="w-full max-w-md mx-auto shadow-md rounded-lg px-4 py-3 mb-8 bg-white">
                <div className="flex flex-col gap-4">
                    <div className="flex shadow rounded-lg overflow-hidden">
                        <input
                            type="text"
                            value={username}
                            className="outline-none w-full py-2 px-3 border"
                            placeholder="Enter username..."
                            onChange={handleChange}
                            autoFocus
                        />
                    </div>

                    <div className="flex shadow rounded-lg overflow-hidden">
                        <input
                            type="text"
                            value={password}
                            className="outline-none w-full py-2 px-3 border"
                            placeholder="Generated password..."
                            readOnly
                            ref={passwordRef}
                        />
                        <button 
                            className="outline-none bg-blue-500 text-white px-4 hover:bg-blue-600"
                            onClick={() => copyPasswordToClip()}
                        >
                            Copy
                        </button>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-x-2">
                            <input
                                type="range"
                                min={6}
                                max={100}
                                value={length}
                                className="cursor-pointer"
                                onChange={(e) => setLength(e.target.value)}
                            />
                            <label>Length: {length}</label>
                        </div>
                        <div className="flex items-center gap-x-2">
                            <input
                                type="checkbox"
                                checked={numberAllow}
                                onChange={() => setNumberAllow(prev => !prev)}
                            />
                            <label>Numbers</label>
                        </div>
                        <div className="flex items-center gap-x-2">
                            <input
                                type="checkbox"
                                checked={charAllow}
                                onChange={() => setCharAllow(prev => !prev)}
                            />
                            <label>Characters</label>
                        </div>
                    </div>

                    <button
                        className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600"
                        onClick={handleSave}
                    >
                        Save Credentials
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-4">Loading...</div>
            ) : (
                savedCredentials.length > 0 && (
                    <div className="w-full max-w-2xl mx-auto">
                        <div className="bg-white shadow-md rounded-lg overflow-hidden">
                            <div className="p-4 border-b flex justify-between items-center">
                                <h2 className="text-lg font-semibold">Saved Credentials</h2>
                                <button
                                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                                    onClick={clearAllCredentials}
                                >
                                    Clear All
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-gray-700">Username</th>
                                            <th className="px-4 py-3 text-left text-gray-700">Password</th>
                                            <th className="px-4 py-3 text-left text-gray-700">Created</th>
                                            <th className="px-4 py-3 text-center text-gray-700">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {savedCredentials.map((cred) => (
                                            <tr key={cred.id} className="border-t hover:bg-gray-50">
                                                <td className="px-4 py-3">{cred.username}</td>
                                                <td className="px-4 py-3 font-mono">{cred.password}</td>
                                                <td className="px-4 py-3 text-sm text-gray-600">
                                                    {new Date(cred.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <div className="flex gap-2 justify-center">
                                                        <button
                                                            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                                                            onClick={() => copyPasswordToClip(cred.password)}
                                                        >
                                                            Copy
                                                        </button>
                                                        <button
                                                            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                                                            onClick={() => handleDelete(cred.id)}
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )
            )}
        </div>
    );
}

export default HomeScreen;