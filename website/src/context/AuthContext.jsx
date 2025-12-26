import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");

  const [role, setRole] = useState("");

  const [projectsdetail, setProjectsdetail] = useState(() => {
    try {
      const stored = localStorage.getItem("projectsdetail");
      return stored ? JSON.parse(stored) : null;
    } catch (err) {
      console.error("Error reading projectsdetail from localStorage", err);
      return null;
    }
  });


  useEffect(() => {
    try {
      if (projectsdetail) {
        localStorage.setItem("projectsdetail", JSON.stringify(projectsdetail));
      } else {
        localStorage.removeItem("projectsdetail");
      }
    } catch (err) {
      console.error("Error writing projectsdetail to localStorage", err);
    }
  }, [projectsdetail]);


  useEffect(() => {
    const verifyUser = async () => {
      try {
        const res = await fetch("http://localhost:3000/verify", {
          credentials: "include",
        });
        if (!res.ok) return;

        const data = await res.json();
        if (data.success) {
          setIsLoggedIn(true);
          setEmail(data.email);
          setUsername(data.username);
          setRole(data.role);
          console.log(data.username);
        }
      } catch (err) {
        console.error("Verification error", err);
      } finally {
        setLoading(false);
      }
    };

    verifyUser();
    verifyUser();
  }, []);

  const logout = async () => {
    try {
      const response = await fetch("http://localhost:3000/logout", {
        method: "Delete",
        credentials: "include",
      });
      const data = await response.json();
      if (data.success) {
        setIsLoggedIn(false);
        setUsername("");
        setRole("");
        setEmail("");
        // Clear any other state if necessary
      } else {
        console.error("Logout failed:", data.message);
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        email,
        isLoggedIn,
        loading,
        username,
        role,
        setEmail,
        setIsLoggedIn,
        setLoading,
        setUsername,
        setRole,
        projectsdetail,
        setProjectsdetail,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
