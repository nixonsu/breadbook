import { ArrowClockwiseIcon } from "@phosphor-icons/react";

export default function Spinner() {
  return (
    <div className="flex justify-center py-12">
      <ArrowClockwiseIcon
        size={36}
        weight="bold"
        className="animate-spin"
      />
    </div>
  );
}
