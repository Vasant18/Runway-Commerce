"use client";
import { useSession } from "next-auth/react";

function NavArrow() {
  return (
    <svg className="nav-thin-arrow" fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 11 10">
      <path fillRule="evenodd" clipRule="evenodd" d="M4.08954 0H5.60221L10.5 4.99998L5.60174 10H4.08906L8.45709 5.55531L0.5 5.55531V4.4442L8.45709 4.4442L4.08954 0Z" fill="#192227" />
    </svg>
  );
}

export default function AuthNavLink() {
  const { data: session } = useSession();
  const user = session?.user;
  if (user) {
    const first = (user.name ?? "traveler").trim().split(/\s+/)[0];
    return (
      <a className="nav-link" href="/dashboard"><NavArrow /> {first}</a>
    );
  }
  return (
    <a className="nav-link" href="/login"><NavArrow /> Log In</a>
  );
}
