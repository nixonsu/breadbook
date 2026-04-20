export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-dvh overflow-hidden bg-background flex flex-col items-center justify-center px-4">
      {children}
    </div>
  );
}
