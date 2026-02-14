"use client";

import { API_ROUTES } from "@/src/constants/api-routes";
import { User } from "@/src/features/users/user-model";
import { useEffect, useState } from "react";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    async function fetchUser() {
      const res = await fetch(API_ROUTES.ME);
      const user = await res.json();
      setUser(user);
    }

    fetchUser();
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <div className="rounded-lg bg-white p-8 shadow-lg dark:bg-zinc-800">
        <h1 className="mb-4 text-2xl font-bold text-gray-800 dark:text-gray-200">
          Welcome to the Home Page!
        </h1>
        {user ? (
          <p className="text-gray-600 dark:text-gray-400">
            Hello, {user.firstName}! Your email is {user.email}.
          </p>
        ) : (
          <p className="text-gray-600 dark:text-gray-400">
            Loading user data...
          </p>
        )}
      </div>
    </div>
  );
}
