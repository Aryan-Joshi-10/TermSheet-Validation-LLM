/* eslint-disable no-unused-vars */
import { useState, useEffect, useContext } from "react";
import NavBar from "../components/Navbar";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { handleError, handleSuccess } from "../utils";
import "react-toastify/dist/ReactToastify.css";
import AuthContext from "../Authorisation/AuthProvider";

function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    contact: "",
    address: "",
    age: "",
    gender: "",
    profilePicture: null,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { isAuthenticated } = useContext(AuthContext);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setFormData({ ...formData, profilePicture: file });
    } else {
      handleError("Please select a valid image file.");
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Name is required.";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email address is invalid.";
    }

    if (!formData.password) {
      newErrors.password = "Password is required.";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long.";
    }

    if (!formData.contact.trim()) {
      newErrors.contact = "Contact number is required.";
    } else if (!/^\d{10}$/.test(formData.contact)) {
      newErrors.contact = "Contact number must be exactly 10 digits.";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Address is required.";
    }

    if (!formData.age.trim()) {
      newErrors.age = "Age is required.";
    } else if (isNaN(formData.age) || formData.age < 0 || formData.age > 120) {
      newErrors.age = "Age must be a valid number between 0 and 120.";
    }

    if (!formData.gender) {
      newErrors.gender = "Gender is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    const url = "https://termsheet-validation-api.onrender.com/auth/signup";

    const formDataToSend = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key !== "confirmPassword") {
        formDataToSend.append(key, formData[key]);
      }
    });

    axios
      .post(url, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        if (response.status === 201) {
          handleSuccess("Registration successful!");
          navigate("/login");
        } else {
          handleError(response.data.message || "Registration failed");
        }
      })
      .catch((err) => {
        if (err.response) {
          handleError("Error Response:", err.response.data);
          if (err.response.status === 409) {
            handleError("User already exists. Please try logging in.");
          } else {
            const errorMessage =
              err.response.data.message || "Registration failed";
            handleError(errorMessage);
          }
        } else {
          handleError("Error Message:", err.message);
          handleError("An error occurred during registration.");
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <>
      <div className="h-auto mt-24 flex items-center justify-center ">
        <div className="bg-slate-50 bg-opacity-60 p-8 rounded shadow-md my-4 w-full max-w-2xl">
          <h2 className="text-2xl font-bold mb-6 text-center">Registration</h2>

          <form onSubmit={handleSubmit} encType="multipart/form-data">
            {[
              {
                label: "Full Name",
                id: "name",
                type: "text",
                placeholder: "Enter your full name",
              },
              {
                label: "Email",
                id: "email",
                type: "email",
                placeholder: "Enter your email",
              },
              {
                label: "Password",
                id: "password",
                type: "password",
                placeholder: "Enter your password",
              },
              {
                label: "Confirm Password",
                id: "confirmPassword",
                type: "password",
                placeholder: "Confirm your password",
              },
              {
                label: "Contact Number",
                id: "contact",
                type: "tel",
                placeholder: "Enter your contact number",
              },
              {
                label: "Address",
                id: "address",
                type: "text",
                placeholder: "Enter your address",
              },
              {
                label: "Age",
                id: "age",
                type: "text",
                placeholder: "Enter your age",
              },
            ].map(({ label, id, type, placeholder }) => (
              <div className="mb-4" key={id}>
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor={id}
                >
                  {label}
                </label>
                <input
                  type={type}
                  id={id}
                  name={id}
                  value={formData[id]}
                  onChange={handleChange}
                  className="bg-transparent shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder={placeholder}
                  required
                />
                {errors[id] && (
                  <span className="text-red-500 text-sm">{errors[id]}</span>
                )}
              </div>
            ))}

            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="profilePicture"
              >
                Profile Picture
              </label>
              <input
                type="file"
                id="profilePicture"
                name="profilePicture"
                accept="image/*"
                onChange={handleFileChange}
                className="bg-transparent shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>

            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="gender"
              >
                Gender
              </label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="bg-transparent shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              {errors.gender && (
                <span className="text-red-500 text-sm">{errors.gender}</span>
              )}
            </div>

            <div className="flex items-center justify-center">
              <button
                type="submit"
                className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={loading}
              >
                {loading ? "Registering..." : "Register"}
              </button>
            </div>

            <div className="mt-6 text-center">
              Already have an account?
              <Link to="/Login" className="text-blue-700 cursor-pointer">
                Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default RegisterPage;
