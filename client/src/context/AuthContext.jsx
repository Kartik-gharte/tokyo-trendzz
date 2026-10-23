import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

const API_URL = "/api/auth";

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        try {
            const savedUser = localStorage.getItem("tokyo_trendz_user");

            return savedUser ? JSON.parse(savedUser) : null;
        } catch (error) {
            console.error("User loading error:", error);
            return null;
        }
    });

    const [token, setToken] = useState(() => {
        return localStorage.getItem("tokyo_trendz_token") || null;
    });

    const [loading, setLoading] = useState(false);

    async function register(name, email, password) {
        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name,
                    email,
                    password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Registration failed");
            }

            localStorage.setItem(
                "tokyo_trendz_user",
                JSON.stringify(data.user)
            );

            localStorage.setItem(
                "tokyo_trendz_token",
                data.token
            );

            setUser(data.user);
            setToken(data.token);

            return data;
        } finally {
            setLoading(false);
        }
    }

    async function login(email, password) {
        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email,
                    password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Login failed");
            }

            localStorage.setItem(
                "tokyo_trendz_user",
                JSON.stringify(data.user)
            );

            localStorage.setItem(
                "tokyo_trendz_token",
                data.token
            );

            setUser(data.user);
            setToken(data.token);

            return data;
        } finally {
            setLoading(false);
        }
    }

    function logout() {
        localStorage.removeItem("tokyo_trendz_user");
        localStorage.removeItem("tokyo_trendz_token");

        setUser(null);
        setToken(null);
    }

    const isAuthenticated = !!user && !!token;

    const value = {
        user,
        token,
        loading,
        isAuthenticated,
        register,
        login,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}