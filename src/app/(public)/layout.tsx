import Link from "next/link";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur sticky top-0 z-50">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="font-bold text-lg">
            Baguio Cycling Community
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm hover:text-primary transition-colors"
            >
              Login
            </Link>

            <Link
              href="/signup"
              className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground"
            >
              Join Free
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      
    </div>
  );
}