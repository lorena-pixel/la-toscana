import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

import ProtectedAdminRoute from "../components/auth/ProtectedAdminRoute";
import ProtectedDeveloperRoute from "../components/auth/ProtectedDeveloperRoute";

import Home from "../pages/public/Home";
import Menu from "../pages/public/Menu";
import Booking from "../pages/public/Booking";
import AboutPage from "../pages/public/AboutPage";
import Contact from "../pages/public/Contact";
import NotFound from "../pages/public/NotFound";

import AdminLogin from "../pages/admin/AdminLogin";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminReservations from "../pages/admin/AdminReservations";
import AdminTables from "../pages/admin/AdminTables";
import AdminTableLayout from "../pages/admin/AdminTableLayout";
import AdminCustomers from "../pages/admin/AdminCustomers";
import AdminWalkIns from "../pages/admin/AdminWalkIns";
import AdminMenu from "../pages/admin/AdminMenu";
import AdminCash from "../pages/admin/AdminCash";
import AdminStatistics from "../pages/admin/AdminStatistics";
import AdminSettings from "../pages/admin/AdminSettings";

import DeveloperLogin from "../pages/developer/DeveloperLogin";
import DeveloperDashboard from "../pages/developer/DeveloperDashboard";
import DeveloperDiagnostics from "../pages/developer/DeveloperDiagnostics";
import DeveloperBackups from "../pages/developer/DeveloperBackups";
import DeveloperMaintenance from "../pages/developer/DeveloperMaintenance";
import DeveloperLogs from "../pages/developer/DeveloperLogs";
import DeveloperSettings from "../pages/developer/DeveloperSettings";


function AppContent() {
  const location =
    useLocation();


  const isAdmin =
    location.pathname.startsWith(
      "/admin"
    );


  const isDeveloper =
    location.pathname.startsWith(
      "/developer"
    );


  const hidePublicLayout =
    isAdmin ||
    isDeveloper;


  const protectAdmin = (
    component
  ) => (
    <ProtectedAdminRoute>
      {component}
    </ProtectedAdminRoute>
  );


  const protectDeveloper = (
    component
  ) => (
    <ProtectedDeveloperRoute>
      {component}
    </ProtectedDeveloperRoute>
  );


  return (
    <>

      {!hidePublicLayout && (
        <Navbar />
      )}


      <Routes>

        {/* =========================
            WEB PÚBLICA
        ========================= */}

        <Route
          path="/"
          element={<Home />}
        />


        <Route
          path="/carta"
          element={<Menu />}
        />


        <Route
          path="/reservas"
          element={<Booking />}
        />


        <Route
          path="/nosotros"
          element={<AboutPage />}
        />


        <Route
          path="/contacto"
          element={<Contact />}
        />


        {/* =========================
            LOGIN ADMIN
        ========================= */}

        <Route
          path="/admin/login"
          element={<AdminLogin />}
        />


        {/* =========================
            ADMIN PROTEGIDO
        ========================= */}

        <Route
          path="/admin"
          element={protectAdmin(
            <AdminDashboard />
          )}
        />


        <Route
          path="/admin/reservas"
          element={protectAdmin(
            <AdminReservations />
          )}
        />


        <Route
          path="/admin/mesas"
          element={protectAdmin(
            <AdminTables />
          )}
        />


        <Route
          path="/admin/distribuir-mesas"
          element={protectAdmin(
            <AdminTableLayout />
          )}
        />


        <Route
          path="/admin/clientes"
          element={protectAdmin(
            <AdminCustomers />
          )}
        />


        <Route
          path="/admin/entrada-directa"
          element={protectAdmin(
            <AdminWalkIns />
          )}
        />


        <Route
          path="/admin/carta"
          element={protectAdmin(
            <AdminMenu />
          )}
        />


        <Route
          path="/admin/caja"
          element={protectAdmin(
            <AdminCash />
          )}
        />


        <Route
          path="/admin/estadisticas"
          element={protectAdmin(
            <AdminStatistics />
          )}
        />


        <Route
          path="/admin/configuracion"
          element={protectAdmin(
            <AdminSettings />
          )}
        />


        {/* =========================
            LOGIN DEVELOPER
        ========================= */}

        <Route
          path="/developer/login"
          element={
            <DeveloperLogin />
          }
        />


        {/* =========================
            DEVELOPER PROTEGIDO
        ========================= */}

        <Route
          path="/developer"
          element={protectDeveloper(
            <DeveloperDashboard />
          )}
        />


        <Route
          path="/developer/diagnostico"
          element={protectDeveloper(
            <DeveloperDiagnostics />
          )}
        />


        <Route
          path="/developer/backups"
          element={protectDeveloper(
            <DeveloperBackups />
          )}
        />


        <Route
          path="/developer/mantenimiento"
          element={protectDeveloper(
            <DeveloperMaintenance />
          )}
        />


        <Route
          path="/developer/logs"
          element={protectDeveloper(
            <DeveloperLogs />
          )}
        />


        <Route
          path="/developer/configuracion"
          element={protectDeveloper(
            <DeveloperSettings />
          )}
        />


        {/* =========================
            404
        ========================= */}

        <Route
          path="*"
          element={<NotFound />}
        />

      </Routes>


      {!hidePublicLayout && (
        <Footer />
      )}

    </>
  );
}


function AppRouter() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}


export default AppRouter;