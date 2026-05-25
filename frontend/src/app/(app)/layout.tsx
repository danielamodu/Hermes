export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex-1 flex flex-col w-full">
      <main className="flex-1 flex flex-col relative w-full">
        {children}
      </main>
    </div>
  );
}
