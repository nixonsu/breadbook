import z from "zod";

export const reconciliationSchema = z.object({
  startPeriod: z.iso.date({ error: "Please select a start period" }),
  endPeriod: z.iso.date({ error: "Please select an end period" }),
  expectedCash: z
    .number({ error: "Expected cash must be a number" })
    .min(0, "Expected cash must be greater than 0"),
  expectedCard: z
    .number({ error: "Expected card must be a number" })
    .min(0, "Expected card must be greater than 0"),
  actualCash: z
    .number({ error: "Actual cash must be a number" })
    .min(0, "Actual cash must be greater than 0"),
  actualCard: z
    .number({ error: "Actual card must be a number" })
    .min(0, "Actual card must be greater than 0"),
});
