"use client";

// Filter/sort/search sidebar for the browse pages. Plain GET form: submitting
// writes the controls into the URL's searchParams, and the server component
// re-filters via Prisma — shareable, bookmarkable, zero client state.

import { useRef } from "react";

export type BrowseFacets = {
  airlines?: string[];
  categories?: string[];
  countries: string[];
};

export type BrowseCurrent = Record<string, string | undefined>;

const SORTS: Record<"trips" | "requests", { value: string; label: string }[]> = {
  trips: [
    { value: "new", label: "Newest" },
    { value: "depart", label: "Departing soon" },
    { value: "kg", label: "Most spare capacity" },
    { value: "rating", label: "Traveler rating" },
  ],
  requests: [
    { value: "new", label: "Newest" },
    { value: "reward", label: "Highest reward" },
    { value: "price", label: "Lowest product price" },
    { value: "rating", label: "Buyer rating" },
  ],
};

export default function BrowseControls({ kind, facets, current }: {
  kind: "trips" | "requests";
  facets: BrowseFacets;
  current: BrowseCurrent;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const submit = () => formRef.current?.requestSubmit();
  return (
    <form ref={formRef} method="get" className="cb-browse-controls" aria-label="Filter and sort">
      <div className="cb-browse-field">
        <label className="cb-browse-label" htmlFor="bc-q">Search</label>
        <input
          id="bc-q" className="cb-browse-input" type="search" name="q"
          placeholder={kind === "trips" ? "Airline, airport, country…" : "Product, category…"}
          defaultValue={current.q ?? ""}
        />
      </div>
      <div className="cb-browse-field">
        <label className="cb-browse-label" htmlFor="bc-sort">Sort by</label>
        <select id="bc-sort" className="cb-browse-input" name="sort" defaultValue={current.sort ?? "new"} onChange={submit}>
          {SORTS[kind].map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>
      {kind === "trips" && facets.airlines && (
        <div className="cb-browse-field">
          <label className="cb-browse-label" htmlFor="bc-airline">Airline</label>
          <select id="bc-airline" className="cb-browse-input" name="airline" defaultValue={current.airline ?? ""} onChange={submit}>
            <option value="">All airlines</option>
            {facets.airlines.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
      )}
      {kind === "requests" && facets.categories && (
        <div className="cb-browse-field">
          <label className="cb-browse-label" htmlFor="bc-category">Category</label>
          <select id="bc-category" className="cb-browse-input" name="category" defaultValue={current.category ?? ""} onChange={submit}>
            <option value="">All categories</option>
            {facets.categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      )}
      <div className="cb-browse-field">
        <label className="cb-browse-label" htmlFor="bc-from">{kind === "trips" ? "From" : "Origin"}</label>
        <select id="bc-from" className="cb-browse-input" name="from" defaultValue={current.from ?? ""} onChange={submit}>
          <option value="">Anywhere</option>
          {facets.countries.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div className="cb-browse-field">
        <label className="cb-browse-label" htmlFor="bc-to">{kind === "trips" ? "To" : "Destination"}</label>
        <select id="bc-to" className="cb-browse-input" name="to" defaultValue={current.to ?? ""} onChange={submit}>
          <option value="">Anywhere</option>
          {facets.countries.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      {kind === "trips" && (
        <div className="cb-browse-field">
          <label className="cb-browse-label" htmlFor="bc-minkg">Min spare kg</label>
          <input id="bc-minkg" className="cb-browse-input" type="number" name="minkg" min="0" step="1" placeholder="Any" defaultValue={current.minkg ?? ""} />
        </div>
      )}
      {kind === "requests" && (
        <div className="cb-browse-field">
          <label className="cb-browse-label" htmlFor="bc-minreward">Min reward (major units)</label>
          <input id="bc-minreward" className="cb-browse-input" type="number" name="minreward" min="0" step="1" placeholder="Any" defaultValue={current.minreward ?? ""} />
        </div>
      )}
      <button className="cb-browse-apply" type="submit">Apply filters</button>
      <a className="cb-browse-clear" href={`/${kind}`}>Clear all</a>
    </form>
  );
}
