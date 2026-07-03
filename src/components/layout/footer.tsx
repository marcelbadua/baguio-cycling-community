import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t mt-10 py-8">
      <div className="mx-auto max-w-6xl px-4 flex flex-col md:flex-row justify-between items-center gap-3 text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Baguio Cycling Community</p>

        <div className="flex gap-4">
          <Link href="/privacy" className="hover:underline">
            Privacy Policy
          </Link>

          <Link href="/terms" className="hover:underline">
            Terms of Service
          </Link>

          <Link href="/contact" className="hover:underline">
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
}