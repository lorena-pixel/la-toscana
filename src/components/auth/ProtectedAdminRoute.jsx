import {
  Navigate,
  useLocation,
} from "react-router-dom";

import {
  isAdminAuthenticated,
} from "../../services/authService";


function ProtectedAdminRoute({
  children,
}) {
  const location =
    useLocation();

  const authenticated =
    isAdminAuthenticated();

  if (!authenticated) {
    return (
      <Navigate
        to="/admin/login"
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }

  return children;
}


export default ProtectedAdminRoute;