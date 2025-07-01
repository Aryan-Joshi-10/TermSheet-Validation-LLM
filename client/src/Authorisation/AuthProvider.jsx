/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import { createContext, useState, useEffect } from "react";
import axios from "axios";
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [isAdmin, setIsAdmin] = useState(false);

  const login = (token, user, name, profilePicture) => {
    localStorage.setItem("token", token);
    localStorage.setItem("loggedInUser", name);
    localStorage.setItem(
      "profilePicture",
      profilePicture ||
        "https://flowbite.com/docs/images/people/profile-picture-3.jpg"
    );
    setToken(token);
    setUser(user);
    setIsAuthenticated(true);
  };

  const Admicheck = () => {
    useEffect(() => {
      const name = localStorage.getItem("loggedInUser");

      if (name === "Suraj Gitte") {
        setIsAdmin(true);
      }
    }, []);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("profilePicture");
    setToken("");
    setUser(null);
    setIsAuthenticated(false);
  };

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const response = await axios.get(
            "https://termsheet-validation-api.onrender.com/auth/verify",
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          if (response.data.user) {
            setUser(response.data.user);
            setIsAuthenticated(true);
          } else {
            logout();
          }
        } catch (error) {
          console.error("Token verification failed:", error);
          logout();
        }
      }
    };
    verifyToken();
  }, []);

  Admicheck();

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, login, logout, isAdmin }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
