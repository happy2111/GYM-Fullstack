import { Navigate } from "react-router-dom";
import { observer } from "mobx-react-lite";
import authStore from "../store/authStore";

const AdminRoute = observer(({ children }) => {
  if (!authStore.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (authStore.user?.role !== "admin") {
    return <Navigate to="/login" replace />;
  }

  return children;
});

export default AdminRoute;
