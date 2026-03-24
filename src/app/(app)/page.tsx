"use client";

import { User } from "@/generated/prisma/client";
import FetchContent from "@/src/components/FetchContent";
import { API_ROUTES, UI_ROUTES } from "@/src/constants/routes";
import type { BalanceSummary } from "@/src/features/overview/overview-service";
import { useFetch } from "@/src/hooks/useFetch";
import {
  getFollowUpMessage,
  getTimeOfDayMessage as getGreetingMessage,
  getTimeOfDay,
} from "@/src/utils/messages";
import { CaretRightIcon } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useState } from "react";

function fmt(n: number): string {
  return `$${Math.abs(n).toLocaleString("en-AU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function Home() {
  const router = useRouter();
  const [greetingMessage, setGreetingMessage] = useState("");
  const [followUpMessage, setFollowUpMessage] = useState("");
  /** `undefined` = loading; `null` = failed; otherwise loaded user */
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch(API_ROUTES.ME);
        setUser(await res.json());
      } catch {
        setUser(null);
      }
    }
    loadUser();
  }, []);

  /* Random copy must not run during SSR (hydration mismatch). Only when user is loaded. */
  /* eslint-disable react-hooks/set-state-in-effect -- intentional client-only greeting init */
  useLayoutEffect(() => {
    if (!user) return;
    const tod = getTimeOfDay();
    const name = user.firstName.trim() || "there";
    setGreetingMessage(getGreetingMessage(tod, name));
    setFollowUpMessage(getFollowUpMessage(tod));
  }, [user]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const { data: balanceSummary, loading } = useFetch<BalanceSummary>(
    API_ROUTES.BALANCE_SUMMARY,
  );

  return (
    <div className="flex flex-col gap-5">
      {user ? (
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold leading-tight">
            {greetingMessage || "\u00a0"}
          </h1>
          {followUpMessage ? (
            <p className="text-sm text-gray-500 leading-snug">
              {followUpMessage}
            </p>
          ) : null}
        </div>
      ) : null}

      <FetchContent data={balanceSummary} loading={loading}>
        {(data) => {
          const expectedTotalBalance =
            data.expectedCardBalance + data.expectedCashBalance;
          const actualTotalBalance =
            data.actualCardBalance + data.actualCashBalance;

          return (
            <section>
              <p className="text-sm font-bold italic text-gray-600 mb-2">
                Balances
              </p>
              <div className="border-2 border-black bg-white shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                <div className="grid grid-cols-3 px-4 py-2.5 border-b-2 border-black bg-gray-50">
                  <span />
                  <span className="text-xs font-bold text-center uppercase tracking-wide">
                    Expected
                  </span>
                  <span className="text-xs font-bold text-center uppercase tracking-wide">
                    Actual
                  </span>
                </div>

                <div className="grid grid-cols-3 items-center px-4 py-3 border-b-2 border-black">
                  <span className="text-sm font-semibold">Card</span>
                  <span className="text-sm font-medium text-center">
                    {fmt(data.expectedCardBalance)}
                  </span>
                  <button
                    type="button"
                    onClick={() => router.push(UI_ROUTES.CARD)}
                    className="cursor-pointer flex items-center justify-center gap-1 text-sm font-medium text-center hover:text-cyan-700 transition-colors"
                  >
                    {fmt(data.actualCardBalance)}
                    <CaretRightIcon size={14} weight="bold" />
                  </button>
                </div>

                <div className="grid grid-cols-3 items-center px-4 py-3 border-b-2 border-black">
                  <span className="text-sm font-semibold">Cash</span>
                  <span className="text-sm font-medium text-center">
                    {fmt(data.expectedCashBalance)}
                  </span>
                  <button
                    type="button"
                    onClick={() => router.push(UI_ROUTES.CASH)}
                    className="cursor-pointer flex items-center justify-center gap-1 text-sm font-medium text-center hover:text-cyan-700 transition-colors"
                  >
                    {fmt(data.actualCashBalance)}
                    <CaretRightIcon size={14} weight="bold" />
                  </button>
                </div>

                <div className="grid grid-cols-3 items-center px-4 py-3 border-b-2 border-black bg-gray-50">
                  <span className="text-sm font-bold">Total</span>
                  <span className="text-sm font-bold text-center">
                    {fmt(expectedTotalBalance)}
                  </span>
                  <span className="text-sm font-bold text-center">
                    {fmt(actualTotalBalance)}
                  </span>
                </div>

                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm font-bold">Variance</span>
                  <span
                    className={`text-base font-bold ${
                      data.variance >= 0
                        ? "text-green-600"
                        : Math.abs(data.variance) < 10
                          ? "text-yellow-600"
                          : "text-red-600"
                    }`}
                  >
                    {data.variance >= 0 ? "+" : "-"}
                    {fmt(data.variance)}
                  </span>
                </div>
              </div>
            </section>
          );
        }}
      </FetchContent>
    </div>
  );
}
