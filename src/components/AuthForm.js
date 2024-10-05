import React, { useState } from "react";
import { auth } from "../firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore"; 
import './AuthForm.css';
import { db } from "../firebase";

const AuthForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true); // Switch between login/signup
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(""); // Error state

  // Handle sign-up or login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Start loading
    setError(""); // Clear previous errors

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        console.log("Logged in successfully!");
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        console.log("Account created successfully!");

        // Save the user's email to Firestore
        const user = userCredential.user;
        await setDoc(doc(db, "Users", user.uid), {
          email: user.email,
        });
      }
    } catch (err) {
      handleAuthError(err); // Handle the Firebase error
    } finally {
      setLoading(false); // End loading
    }
  };

  // Custom error handler based on Firebase error codes
  const handleAuthError = (error) => {
    console.log(error)
    switch (error.code) {
      case "auth/invalid-email":
        setError("Invalid email address format.");
        break;
      case "auth/user-disabled":
        setError("This account has been disabled.");
        break;
      case "auth/missing-password":
        setError("Missing password field");
        break;
      case "auth/user-not-found":
        setError("No account found with this email.");
        break;
      case "auth/invalid-credential":
        setError("Invalid credentials. Please check your email and password.");
        break;
      case "auth/email-already-in-use":
        setError("This email is already in use.");
        break;
      case "auth/weak-password":
        setError("Password should be at least 6 characters.");
        break;
      default:
        setError("An unknown error occurred. Please try again.");
    }
  };

  // Handle form mode toggle (Login <-> Sign Up)
  const toggleFormMode = () => {
    setIsLogin(!isLogin);
    setError(""); // Clear the error when switching modes
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>{isLogin ? "Login" : "Sign Up"}</h2>
        <form onSubmit={handleSubmit}>
          {error && <p className="auth-error">{error}</p>} {/* Show error if any */}
          <div className="input-container">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="auth-input"
              disabled={loading} // Disable input if loading
            />
          </div>
          <div className="input-container">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="auth-input"
              disabled={loading} // Disable input if loading
            />
          </div>
          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? "Please wait..." : isLogin ? "Login" : "Sign Up"}
          </button>
        </form>
        <button
          className="switch-auth-mode"
          onClick={toggleFormMode} // Reset error on mode switch
          disabled={loading} // Disable switch if loading
        >
          {isLogin ? "Create an account" : "Already have an account? Log in"}
        </button>
      </div>
    </div>
  );
};

export default AuthForm;
