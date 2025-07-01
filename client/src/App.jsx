/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "./App.css";

import LoginPage from "./Pages/LoginPage";
import RegisterPage from "./Pages/RegisterPage";
import { AuthProvider } from "./Authorisation/AuthProvider";
import NavBar from "./components/Navbar";
import TermSheetUploadPortal from "./Pages/TermSheetUploadPortal";
import TermSheetValidationDisplay from "./Pages/model";
import BillExtractor from "./Pages/BillExtraction";

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <ToastContainer />
        <BrowserRouter>
          {/* <NavBar id="black" /> */}
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/validate" element={<TermSheetValidationDisplay />} />
            {/* <Route path="/extract" element={<PDFTextExtractor />} /> */}

            <Route path="/upload" element={<TermSheetUploadPortal />} />

            <Route path="/" element={<TermSheetUploadPortal />} />
            <Route path="/bill-extraction" element={<BillExtractor />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </div>
  );
}

export default App;
