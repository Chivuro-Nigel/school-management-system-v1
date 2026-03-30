import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/login";
import StudentDash from "./pages/student-dash";
import StudentResults from "./pages/student-results";
import MarkEntry from "./pages/teacher-dash";
import AdminDash from "./pages/admin-dash";
import Students from "./components/students";
import Teachers from "./components/teachers_management";
import Settings from "./components/settings";
import SetUpPassword from "./components/setUpPasswords";
import UpcomingEvents from "./components/upcomingevents";
import UpcomingEventsManagement from "./components/upcomingevents_management";
import AcademicManagement from "./components/acadmics";
import ResetPassword from "./components/resetpassword";
import { useAuth } from "./components/AuthContext";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" />;

  // If they are logged in but haven't changed their password,
  // lock them into the setup page.
  if (user && !user.has_changed_password) {
    return <Navigate to="/set-password" />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* SEMI-PUBLIC: Accessible to logged in users only, 
            but NOT protected by the "has_changed_password" check 
            to avoid infinite loops */}
        <Route path="/set-password" element={<SetUpPassword />} />
        <Route path="/upcoming-events" element={<UpcomingEvents />} />
        <Route path="/academics-management" element={<AcademicManagement />} />
        <Route
          path="/upcoming-events-management"
          element={<UpcomingEventsManagement />}
        />

        {/* PROTECTED ROUTES: Wrapped in the logic above */}
        <Route
          path="/admin-dash"
          element={
            <ProtectedRoute>
              <AdminDash />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student-dash"
          element={
            <ProtectedRoute>
              <StudentDash />
            </ProtectedRoute>
          }
        />

        <Route
          path="/results"
          element={
            <ProtectedRoute>
              <StudentResults />
            </ProtectedRoute>
          }
        />

        <Route
          path="/teacher-dash"
          element={
            <ProtectedRoute>
              <MarkEntry />
            </ProtectedRoute>
          }
        />

        <Route
          path="/Teacher-Management"
          element={
            <ProtectedRoute>
              <Teachers />
            </ProtectedRoute>
          }
        />

        <Route
          path="/Student-Management"
          element={
            <ProtectedRoute>
              <Students />
            </ProtectedRoute>
          }
        />

        <Route
          path="/Settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />

        {/* Catch-all for mistakes */}
        <Route path="*" element={<div>404 Page Not Found</div>} />
      </Routes>
    </Router>
  );
}

export default App;
