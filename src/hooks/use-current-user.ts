"use client";

import { useState } from "react";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "@prisma/client";

type CurrentUserData = {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  error: Error | null;
  refetch?: () => Promise<void>;
};

export function useCurrentUser(): CurrentUserData {
  // Authentication disabled for frontend design purposes
  // Return mock user data
  const [isLoading] = useState(false);
  const [error] = useState<Error | null>(null);

  // Mock user for design purposes
  const mockUser: any = {
    id: "mock-user-id",
    email: "demo@boringautomation.com",
    user_metadata: {
      full_name: "Demo User",
    },
  };

  const mockProfile: any = {
    id: "mock-profile-id",
    userId: "mock-user-id",
    firstName: "Demo",
    lastName: "User",
    avatarUrl: null,
    role: "USER",
  };

  return {
    user: mockUser,
    profile: mockProfile,
    isLoading,
    error,
    refetch: async () => {},
  };
}
