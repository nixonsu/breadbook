import Navigation from "@/src/components/Navigation";
import ToastContainer from "@/src/components/Toast";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh">
      <ToastContainer />
      <main className="mx-auto max-w-md px-4 pb-20 pt-4">{children}</main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/90 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="mx-auto max-w-md px-2 pb-[env(safe-area-inset-bottom)]">
          <Navigation />
        </div>
      </nav>
    </div>
  );
}
