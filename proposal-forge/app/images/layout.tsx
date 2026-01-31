import Navigation from "@/components/Navigation";

export default function ImagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-950">
      <Navigation />
      <main>{children}</main>
    </div>
  );
}
