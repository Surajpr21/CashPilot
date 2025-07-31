import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./components/landingPage/LandingPage";
import LoginPage from "./components/Login/LoginPage";
import Dashboard from "./components/Dashboard/Dashboard"; // (Create this as a placeholder or full UI later)

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  );
}