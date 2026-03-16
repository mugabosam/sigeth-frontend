import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Default routes for each role
const ROLE_ROUTES: Record<string, string> = {
  "rooms-attendant": "/rooms-attendant/group-reservation",
  housekeeping: "/housekeeping/room-categories",
  banqueting: "/banqueting/events-lots",
};

export default function RoleBasedRedirect() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      navigate("/login", { replace: true });
      return;
    }

    if (user?.submodule) {
      const defaultRoute = ROLE_ROUTES[user.submodule] || "/rooms-attendant/group-reservation";
      navigate(defaultRoute, { replace: true });
    }
  }, [isAuthenticated, isLoading, user, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
