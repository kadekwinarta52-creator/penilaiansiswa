import React, { useState } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import StudentManagement from "./components/StudentManagement";
import SubjectManagement from "./components/SubjectManagement";
import GradeInput from "./components/GradeInput";
import GradeReport from "./components/GradeReport";
import Dashboard from "./components/Dashboard";

function App() {
  const [activeMenu, setActiveMenu] = useState("dashboard");

  return (
    <div className="App">
      <BrowserRouter>
        <div className="flex min-h-screen bg-gray-100">
          <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
          <div className="flex-1 flex flex-col">
            <Header />
            <main className="flex-1 p-6">
              {activeMenu === "dashboard" && <Dashboard />}
              {activeMenu === "students" && <StudentManagement />}
              {activeMenu === "subjects" && <SubjectManagement />}
              {activeMenu === "grades" && <GradeInput />}
              {activeMenu === "reports" && <GradeReport />}
            </main>
          </div>
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;