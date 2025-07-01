/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
import NavBar from "../components/Navbar";
import { Link, useNavigate } from "react-router-dom";
import React, { useState, useContext, useEffect } from "react";
import "react-toastify/dist/ReactToastify.css";
import { handleError, handleSuccess } from "../utils";
import AuthContext from "../Authorisation/AuthProvider";

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState(null);
  const { login, isAuthenticated } = useContext(AuthContext);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors(null);

    try {
      const url = "https://termsheet-validation-api.onrender.com/auth/login";
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();
      console.log(result);

      if (!response.ok) {
        const errorMessage = result.message || "Login failed";
        setErrors({ apiError: errorMessage });
        handleError(errorMessage);
        return;
      }

      const { token: jwtToken, user } = result;
      if (user) {
        const { name, profilePicture } = user;
        handleSuccess("Login successful!");

        login(jwtToken, user, name, profilePicture);
        navigate("/");
      } else {
        throw new Error("User data not found in response.");
      }
    } catch (err) {
      const errorMessage = err.message || "An unexpected error occurred.";
      setErrors({ apiError: errorMessage });
      handleError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="h-[100vh] flex items-center justify-center">
        <div className="bg-slate-50 bg-opacity-60 p-8 rounded shadow-md w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                className="block text-black text-sm font-bold mb-2"
                htmlFor="email"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                autoFocus
                className="bg-transparent shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mb-6">
              <label
                className="block text-black text-sm font-bold mb-2"
                htmlFor="password"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                className="bg-transparent shadow appearance-none border rounded w-full py-2 px-3 text-black mb-3 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="flex items-center justify-center">
              <button
                type="submit"
                className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-black-500">
              Don't have an account?{" "}
              <Link to="/register" className="text-blue-700 cursor-pointer">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default LoginPage;
