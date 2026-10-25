import { authService } from "@/app/services";
import { useState } from "react";
import { useSelector } from "react-redux";

export function useAuth() {
  const authState = useSelector((state: any) => state.auth);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const logout = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await authService.logout();
    } catch (error) {
      setError("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };
  return {
    user: authState.user,
    isAuthenticated: authState.isAuthenticated,
    isLoading,
    logout,
    error,
  };
}
