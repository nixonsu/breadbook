"use client";

import { API_ROUTES, UI_ROUTES } from "@/src/constants/routes";
import type { Overview } from "@/src/features/overview/overview-service";
import { CaretRightIcon } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type Period = "1m" | "3m" | "1y" | "all" | "custom";

const PERIODS: { value: Period; label: string }[] = [
  { value: "1m", label: "1M" },
  { value: "3m", label: "3M" },
  { value: "1y", label: "1Y" },
  { value: "all", label: "All" },
  { value: "custom", label: "Custom" },
];

function getDefaultFinancialYear(): { from: string; to: string } {
  const today = new Date();
  const year = today.getMonth() >= 6 ? today.getFullYear() : today.getFullYear() - 1;
  return {
    from: `${year}-07-01`,
    to: `${year + 1}-06-30`,
  };
}

function fmt(n: number): string {
  return `$${Math.abs(n).toLocaleString("en-AU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtWhole(n: number): string {
  return n.toLocaleString("en-AU");
}

export default function Home() {
  const router = useRouter();
  const [period, setPeriod] = useState<Period>("1m");
  const [customFrom, setCustomFrom] = useState(() => getDefaultFinancialYear().from);
  const [customTo, setCustomTo] = useState(() => getDefaultFinancialYear().to);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOverview = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (period === "custom") {
        params.set("from", customFrom);
        params.set("to", customTo);
      } else {
        params.set("period", period);
      }
      const res = await fetch(`${API_ROUTES.OVERVIEW}?${params}`);
      if (res.ok) {
        setOverview(await res.json());
      }
    } finally {
      setLoading(false);
    }
  }, [period, customFrom, customTo]);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl font-bold italic">Overview</h1>

      {/* Period selector */}
      <div className="grid grid-cols-5 border-2 border-black">
        {PERIODS.map((p) => (
          <button
            key={p.value}
            type="button"
            onClick={() => setPeriod(p.value)}
            className={`cursor-pointer py-2.5 text-sm font-bold border-r-2 border-black last:border-r-0 transition-colors ${
              period === p.value
                ? "bg-cyan-300"
                : "bg-white hover:bg-gray-50 active:bg-gray-100"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {period === "custom" && (
        <div className="flex gap-3">
          <div className="flex-1 flex flex-col gap-1">
            <label className="text-sm font-semibold">From</label>
            <input
              type="date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              className="w-full border-black border-2 p-2.5 bg-white focus:outline-none focus:shadow-[2px_2px_0px_rgba(0,0,0,1)]"
            />
          </div>
          <div className="flex-1 flex flex-col gap-1">
            <label className="text-sm font-semibold">To</label>
            <input
              type="date"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              className="w-full border-black border-2 p-2.5 bg-white focus:outline-none focus:shadow-[2px_2px_0px_rgba(0,0,0,1)]"
            />
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-center text-gray-500 py-8">Loading...</p>
      ) : !overview ? (
        <p className="text-center text-gray-500 py-8">
          No data available yet.
        </p>
      ) : (
        <>
          {/* Balance comparison */}
          <section>
            <p className="text-sm font-bold italic text-gray-600 mb-2">
              Balances
            </p>
            <div className="border-2 border-black bg-white shadow-[4px_4px_0px_rgba(0,0,0,1)]">
              {/* Header */}
              <div className="grid grid-cols-3 px-4 py-2.5 border-b-2 border-black bg-gray-50">
                <span />
                <span className="text-xs font-bold text-center uppercase tracking-wide">
                  Expected
                </span>
                <span className="text-xs font-bold text-center uppercase tracking-wide">
                  Actual
                </span>
              </div>

              {/* Card row */}
              <div className="grid grid-cols-3 items-center px-4 py-3 border-b-2 border-black">
                <span className="text-sm font-semibold">Card</span>
                <span className="text-sm font-medium text-center">
                  {fmt(overview.expectedCardBalance)}
                </span>
                <button
                  type="button"
                  onClick={() => router.push(UI_ROUTES.CARD)}
                  className="cursor-pointer flex items-center justify-center gap-1 text-sm font-medium text-center hover:text-cyan-700 transition-colors"
                >
                  {fmt(overview.actualCardBalance)}
                  <CaretRightIcon size={14} weight="bold" />
                </button>
              </div>

              {/* Cash row */}
              <div className="grid grid-cols-3 items-center px-4 py-3 border-b-2 border-black">
                <span className="text-sm font-semibold">Cash</span>
                <span className="text-sm font-medium text-center">
                  {fmt(overview.expectedCashBalance)}
                </span>
                <button
                  type="button"
                  onClick={() => router.push(UI_ROUTES.CASH)}
                  className="cursor-pointer flex items-center justify-center gap-1 text-sm font-medium text-center hover:text-cyan-700 transition-colors"
                >
                  {fmt(overview.actualCashBalance)}
                  <CaretRightIcon size={14} weight="bold" />
                </button>
              </div>

              {/* Variance row */}
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-sm font-bold">Variance</span>
                <span
                  className={`text-base font-bold ${
                    overview.variance === 0
                      ? "text-green-600"
                      : Math.abs(overview.variance) < 10
                        ? "text-yellow-600"
                        : "text-red-600"
                  }`}
                >
                  {overview.variance >= 0 ? "" : "-"}
                  {fmt(overview.variance)}
                </span>
              </div>
            </div>
          </section>

          {/* Money flow */}
          <section>
            <p className="text-sm font-bold italic text-gray-600 mb-2">
              Money Flow
            </p>
            <div className="flex flex-col gap-3">
              {/* Money in */}
              <div className="border-2 border-black bg-white shadow-[4px_4px_0px_rgba(0,0,0,1)] p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-green-700">Money In</span>
                  <span className="font-bold text-green-700">
                    {fmt(overview.totalMoneyIn)}
                  </span>
                </div>
                <StatRow label="Card In" value={fmt(overview.totalCardIn)} />
                <StatRow label="Cash In" value={fmt(overview.totalCashIn)} />
              </div>

              {/* Money out */}
              <div className="border-2 border-black bg-white shadow-[4px_4px_0px_rgba(0,0,0,1)] p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-red-700">Money Out</span>
                  <span className="font-bold text-red-700">
                    {fmt(overview.totalMoneyOut)}
                  </span>
                </div>
                <StatRow label="Card Out" value={fmt(overview.totalCardOut)} />
                <StatRow label="Cash Out" value={fmt(overview.totalCashOut)} />
              </div>

              {/* Net profit */}
              <div className="border-2 border-black bg-white shadow-[4px_4px_0px_rgba(0,0,0,1)] p-4">
                <div className="flex justify-between items-center">
                  <span className="font-bold">Net Profit</span>
                  <span
                    className={`font-bold text-lg ${
                      overview.netProfit >= 0
                        ? "text-green-700"
                        : "text-red-700"
                    }`}
                  >
                    {overview.netProfit < 0 ? "-" : ""}
                    {fmt(overview.netProfit)}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Statistics */}
          <section>
            <p className="text-sm font-bold italic text-gray-600 mb-2">
              Statistics
            </p>
            <div className="border-2 border-black bg-white shadow-[4px_4px_0px_rgba(0,0,0,1)] p-4 flex flex-col gap-1.5">
              <StatRow
                label="Sales Revenue"
                value={fmt(overview.totalSalesRevenue)}
              />
              <StatRow
                label="Business Expenses"
                value={fmt(overview.totalBusinessExpenses)}
              />
              <StatRow
                label="Personal Expenses"
                value={fmt(overview.totalPersonalExpenses)}
              />
              <StatRow
                label="Interest Earned"
                value={fmt(overview.totalInterest)}
              />

              <div className="border-t border-gray-200 my-1" />

              <StatRow
                label="Total Sales"
                value={fmtWhole(overview.saleCount)}
              />
              <StatRow
                label="Unique Clients"
                value={fmtWhole(overview.uniqueClientCount)}
              />
              <StatRow
                label="Avg Sale Value"
                value={fmt(overview.averageSaleValue)}
              />
              <StatRow
                label="Transactions"
                value={fmtWhole(overview.transactionCount)}
              />
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-0.5">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}
