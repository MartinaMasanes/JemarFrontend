import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../authContext/AuthContext";

const RoleProtected = ({ allowedRoles }) => {
  const { role } = useContext(AuthContext);

  if (allowedRoles.includes(role)) {
    return <Outlet />;
  }

  return <Navigate to="/notallowed" replace />;
};

export default RoleProtected;
