import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";
import { intakeApi } from "@/lib/api";
import { Spinner } from "@/components/ui/spinner";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireIntake?: boolean;
}

export function ProtectedRoute({ children, requireIntake = false }: ProtectedRouteProps) {
  const token = apiClient.getToken();
  const location = useLocation();
  const [checkingIntake, setCheckingIntake] = useState(requireIntake);
  const [intakeComplete, setIntakeComplete] = useState<boolean | null>(null);

  useEffect(() => {
    const checkIntake = async () => {
      if (!requireIntake || location.pathname === "/app/intake") {
        setCheckingIntake(false);
        return;
      }

      try {
        const status = await intakeApi.checkComplete();
        setIntakeComplete(status.is_complete);
        if (!status.is_complete) {
          // Redirect to intake if not complete
          return;
        }
      } catch (err) {
        // If error, assume intake not complete
        setIntakeComplete(false);
      } finally {
        setCheckingIntake(false);
      }
    };

    if (token && requireIntake) {
      checkIntake();
    } else {
      setCheckingIntake(false);
    }
  }, [token, requireIntake, location.pathname]);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (checkingIntake) {
    return (
      <div className="w-screen h-screen bg-[#0F1419] flex items-center justify-center">
        <Spinner className="w-8 h-8 text-[#00FF88]" />
      </div>
    );
  }

  if (requireIntake && intakeComplete === false && location.pathname !== "/app/intake") {
    return <Navigate to="/app/intake" replace />;
  }

  return <>{children}</>;
}

