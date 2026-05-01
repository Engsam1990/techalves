import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const AdminIndex = () => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/admin/login" replace />;
  if (user.role === "super_admin") return <Navigate to="/admin/super-admin" replace />;
  return <Navigate to="/admin/dashboard" replace />;
};

export default AdminIndex;
