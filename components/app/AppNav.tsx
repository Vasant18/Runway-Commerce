import { auth, signOut } from "@/lib/auth";

// Slim authed header for app pages (not the landing). Server component.
export default async function AppNav() {
  const session = await auth();
  const role = (session?.user as any)?.role as string | undefined;
  const name = session?.user?.name ?? "";
  return (
    <nav className="cb-appnav">
      <a className="cb-appnav-brand" href="/dashboard">CROSSBORDER</a>
      <div className="cb-appnav-links">
        <a href="/dashboard">Dashboard</a>
        <a href="/trips">Trips</a>
        <a href="/requests">Requests</a>
        <a href="/orders">Orders</a>
        {role === "OPS" && <a href="/ops" className="cb-appnav-ops">Ops</a>}
      </div>
      <div className="cb-appnav-user">
        <span className="cb-appnav-name">{name.split(" ")[0]}</span>
        <form action={async () => { "use server"; await signOut({ redirectTo: "/" }); }}>
          <button className="cb-appnav-out" type="submit">Sign out</button>
        </form>
      </div>
    </nav>
  );
}
