import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import DashboardLayout from "./pages/dashboard/DashboardLayout";
import ChildDetailPage from "./pages/dashboard/ChildDetailPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route 
          path="/dashboard" 
          element={
            <DashboardLayout>
              <DashboardPage />
            </DashboardLayout>
          } 
        />
        <Route 
          path="/dashboard/children/:id" 
          element={
            <DashboardLayout>
              <ChildDetailPage />
            </DashboardLayout>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
