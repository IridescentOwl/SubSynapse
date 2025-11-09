import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../AuthContext";

export default function AdminRoute() {
  const { user } = useAuth();
  return user?.role === "admin" ? <Outlet /> : <Navigate to="/dashboard" replace />;
}
