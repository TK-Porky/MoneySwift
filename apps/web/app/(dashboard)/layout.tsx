export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section>
      <nav>Dashboard Navigation</nav>
      {children}
    </section>
  );
}
