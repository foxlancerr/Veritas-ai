import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import Signup from "./pages/SignUp";
import Login from "./pages/Login";
import HomePage from "./pages/HomePage";
import Network from "./pages/Network";
import Profile from "./pages/Profile";
import Notification from "./pages/Notification";

import { Toaster } from "react-hot-toast";

import PrivateRoute from "./layout/PrivateRoute";
import PublicRoute from "./layout/PublicRoute";
import UserContextProvider from "./context/UserContext";

const AppRoutes = () => {
  return (
    <Routes>
      {/* 🌐 Public Routes */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Route>

      {/* 🔒 Private Routes */}
      <Route element={<PrivateRoute />}>
        <Route
          element={
            <UserContextProvider>
              <Outlet />
            </UserContextProvider>
          }
        >
          <Route path="/" element={<HomePage />} />
          <Route path="/network" element={<Network />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/notifications" element={<Notification />} />
        </Route>
      </Route>
    </Routes>
  );
};

const App = () => {
  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />

      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </>
  );
};

export default App;