const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export async function fetchData(params?: Record<string, string | number>) {
  const query = params ? "?" + new URLSearchParams(params as Record<string, string>).toString() : "";
  const res = await fetch(`${API_BASE}/data${query}`);
  if (!res.ok) throw new Error("Failed to fetch data");
  return res.json();
}

export async function fetchSummary(params?: Record<string, string | number>) {
  const query = params ? "?" + new URLSearchParams(params as Record<string, string>).toString() : "";
  const res = await fetch(`${API_BASE}/data/summary${query}`);
  if (!res.ok) throw new Error("Failed to fetch summary");
  return res.json();
}
export async function fetchForecast(body: {
  elevation: string;
  teaType: string;
  months: number;
}) {
  const res = await fetch(`${API_BASE}/forecast/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Failed to get forecast");
  return res.json();
}

export async function fetchHypothesisTest(body: {
  alpha: number;
  variables: string[];
}) {
  const res = await fetch(`${API_BASE}/hypothesis/test`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Failed to run hypothesis test");
  return res.json();
}
