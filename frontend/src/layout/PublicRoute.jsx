// layout/PublicRoute.jsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";

const PublicRoute = () => {
  const { user, loading } = useAuthContext();

  if (loading) return <div>Loading...</div>; // optional loading state

  // If user is authenticated, redirect to home
  if (user) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default PublicRoute;