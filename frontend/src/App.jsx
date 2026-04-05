import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import UserContextProvider, { UserDataContext } from "./context/UserContext";
import Signup from "./pages/SignUp";
import Login from "./pages/Login";
import HomePage from "./pages/HomePage";
import { useContext } from "react";
import { Toaster } from "react-hot-toast";
import Network from "./pages/Network";
import Profile from "./pages/Profile";
import Notification from "./pages/Notification";

const AppRoutes = () => {
  const { userData } = useContext(UserDataContext);

  return (
    <Routes>
      <Route
        path="/signup"
        element={userData ? <Navigate to="/" /> : <Signup />}
      />
      <Route
        path="/"
        element={userData ? <HomePage /> : <Navigate to="/login" />}
      />
      <Route
        path="/login"
        element={userData ? <Navigate to="/" /> : <Login />}
      />
      <Route
        path="/network"
        element={userData ? <Network /> : <Navigate to="/login" />}
      />
      <Route
        path="/profile"
        element={userData ? <Profile /> : <Navigate to="/login" />}
      />
      <Route
        path="/notifications"
        element={userData ? <Notification /> : <Navigate to="/login" />}
      />
    </Routes>
  );
};

const App = () => {
  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />

      <AuthProvider>
        <UserContextProvider>
          <Router>
            <AppRoutes />
          </Router>
        </UserContextProvider>
      </AuthProvider>
    </>
  );
};

export default App;
