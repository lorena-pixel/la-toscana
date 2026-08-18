import {
  Navigate,
  useLocation,
} from "react-router-dom";

import {
  isDeveloperAuthenticated,
} from "../../services/authService";


function ProtectedDeveloperRoute({
  children,
}) {
  const location =
    useLocation();


  if (
    !isDeveloperAuthenticated()
  ) {
    return (
      <Navigate
        to="/developer/login"
        replace
        state={{
          from:
            location.pathname,
        }}
      />
    );
  }


  return children;
}


export default ProtectedDeveloperRoute;