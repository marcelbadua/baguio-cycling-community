import { Navbar } from "@/components/navigation/navbar";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {children}
      </main>

     

    </>
  );
}