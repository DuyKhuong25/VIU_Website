import React, { createContext, useState, useContext, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        try {
            if (token) {
                const decodedToken = jwtDecode(token);
                if (decodedToken.exp * 1000 < Date.now()) { logout(); }
            } else { setUser(null); }
        } catch { logout(); }
        finally { setLoading(false); }
    }, [token]);

    const login = (accessToken, userData) => {
        console.log("userData in login:", userData);
        const fullUserData = {
            id: userData.id,
            username: userData.username,
            email: userData.email,
            fullName: userData.fullName,
            roles: userData.roles.map(r => r),
        };
        localStorage.setItem('token', accessToken);
        localStorage.setItem('user', JSON.stringify(fullUserData));
        setToken(accessToken);
        setUser(fullUserData);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
    };

    const value = { token, user, loading, login, logout };
    return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);