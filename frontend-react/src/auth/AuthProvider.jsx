import React, { createContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const API_BASE = (import.meta.env.VITE_API_BASE || "http://localhost:4000").replace(/\/$/, "");
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(token ? jwtDecode(token) : null);

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
      try {
        setUser(jwtDecode(token));
      } catch (err) {
        console.error("Failed to decode token", err);
        setUser(null);
      }
    } else {
      localStorage.removeItem("token");
      setUser(null);
    }
  }, [token]);

  function logout() {
    setToken(null);
  }

  // helper to attach Authorization header
  function authFetch(input, init = {}) {
    const url = typeof input === "string" && input.startsWith("/") ? `${API_BASE}${input}` : input;
    const headers = init.headers ? init.headers : {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    return fetch(url, { ...init, headers });
  }

  return (
    <AuthContext.Provider value={{ token, setToken, user, logout, authFetch }}>
      {children}
    </AuthContext.Provider>
  );
}
