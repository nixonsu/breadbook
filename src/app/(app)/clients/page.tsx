"use client";

import { Client } from "@/generated/prisma/client";
import { API_ROUTES } from "@/src/constants/routes";
import { useEffect, useState } from "react";

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    async function fetchClients() {
      const res = await fetch(API_ROUTES.CLIENTS);
      const clients = await res.json();
      setClients(clients);
    }

    fetchClients();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold">Clients</h1>
      <p className="text-gray-600 dark:text-gray-400">
        This is where you would see your clients.
      </p>
      <div className="mt-8 flex flex-col gap-4">
        {clients.map((client) => (
          <div
            key={client.id}
            className="rounded border p-4 shadow-sm transition hover:shadow-md"
          >
            <h2 className="text-lg font-semibold">
              {client.firstName} {client.lastName}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">{client.email}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
