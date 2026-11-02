import axios from 'axios';
import config from '@/config';
import { useUser } from '@/lib/context/user-context';

export const api = axios.create({
  baseURL: `${config.api.url}/api/v1`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 403) {
      const code = error.response.data?.code as string | undefined;

      if (code === "ACCOUNT_SUSPENDED" || code === "ACCOUNT_DELETED") {
        const currentUser = useUser.getState().user;

        if (currentUser) {
          useUser.getState().setUser({
            ...currentUser,
            status: code === "ACCOUNT_DELETED" ? "Deleted" : "Suspended",
          });
        }

        if (!window.location.pathname.startsWith("/dashboard")) {
          window.location.href = "/dashboard";
        }
      }

      if (code === "ACCOUNT_ARCHIVED") {
        useUser.getState().setMembershipStatus("archived");

        if (!window.location.pathname.startsWith("/dashboard")) {
          window.location.href = "/dashboard";
        }
      }
    }

    return Promise.reject(error);
  },
);