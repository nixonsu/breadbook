"use client";

import Button from "@/src/components/Button";
import Card from "@/src/components/Card";
import Input from "@/src/components/Input";
import { API_ROUTES } from "@/src/constants/api-routes";
import { Balances } from "@/src/features/balances/balances";
import { ArrowFatLeftIcon } from "@phosphor-icons/react";
import { useEffect, useState } from "react";

export default function CardBalancePage() {
  const [balances, setBalances] = useState<Balances | null>(null);
  const [cardBalanceInput, setCardBalanceInput] = useState<number | null>(null);

  useEffect(() => {
    async function fetchBalances() {
      const res = await fetch(API_ROUTES.BALANCES);
      const balances = await res.json();
      setBalances(balances);
    }

    fetchBalances();
  }, []);

  const handleSubmit = async () => {
    await fetch(API_ROUTES.BALANCES_CARD, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ total: cardBalanceInput }),
    });

    const res = await fetch(API_ROUTES.BALANCES);
    const updatedBalances = await res.json();
    setBalances(updatedBalances);
  };

  return (
    <div>
      <div className="w-full">
        {/* Back button */}
        <div className="absolute top-4 left-4">
          <ArrowFatLeftIcon
            onClick={() => window.history.back()}
            weight="fill"
            size={36}
          />
        </div>

        {balances && (
          <div className="flex flex-col items-center gap-12 mt-48">
            <Card className="w-full text-center">
              <h1>
                <b>card balance: ${balances.cardBalance.total}</b>
              </h1>
            </Card>

            <Input
              value={cardBalanceInput?.toString() || ""}
              type="number"
              placeholder="Lemme see that money"
              onChange={(value) => setCardBalanceInput(parseFloat(value) || 0)}
              className="w-1/4"
            />

            <Button color="lime" className="w-1/4" onClick={handleSubmit}>
              <b>save</b>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
