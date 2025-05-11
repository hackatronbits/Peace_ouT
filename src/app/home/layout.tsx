import "./styles.css";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="home-layout">{children}</div>;
}
