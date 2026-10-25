import { apiClient } from "./axios.config";

export const authService = {
  logout: async () => {
    try {
      await apiClient.post("/auth/logout");
    } catch (error) {
      console.error("Logout failed", error);
    }
  },
  refreshToken: async (refreshToken: string) => {
    if (!refreshToken) return null;
    try {
      const response = await apiClient.post<{ accessToken: string }>(
        "/auth/refresh",
        { refreshToken },
      );
      return response.data.accessToken;
    } catch (error) {
      console.error("Refresh token failed", error);
      return null;
    }
  },
};
