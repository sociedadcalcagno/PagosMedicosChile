import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading, refetch } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    refetchOnWindowFocus: true,
    staleTime: 0, // Always refetch when component mounts
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    refetch,
  };
}
