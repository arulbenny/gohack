"use client";

import { useEffect, useState } from "react";

type Issue = {
  id: number;
  title: string;
  description: string;
  category: string;
  status: string;
  upvotes: number;
};

export default function AdminPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [filter, setFilter] = useState("All");

  const fetchIssues = async () => {
    const res = await fetch("/api/issues");
    const data = await res.json();
    setIssues(data);
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  const updateStatus = async (id: number, status: string) => {
    await fetch(`/api/issues/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });

    fetchIssues();
  };

  const filteredIssues =
    filter === "All"
      ? issues
      : issues.filter((i) => i.category === filter);

  return (
    <div style={{ padding: "40px" }}>
      <h1>Admin Dashboard</h1>

      {/* FILTER */}
      <select onChange={(e) => setFilter(e.target.value)}>
        <option value="All">All</option>
        <option value="Hostel">Hostel</option>
        <option value="Mess">Mess</option>
        <option value="Academics">Academics</option>
        <option value="Safety">Safety</option>
      </select>

      {/* ISSUES */}
      {filteredIssues.map((issue) => (
        <div
          key={issue.id}
          style={{
            border: "1px solid black",
            margin: "10px 0",
            padding: "10px",
          }}
        >
          <h3>{issue.title}</h3>
          <p>{issue.description}</p>

          <p>Status: {issue.status}</p>
          <p>Category: {issue.category}</p>

          <button onClick={() => updateStatus(issue.id, "Pending")}>
            Pending
          </button>

          <button onClick={() => updateStatus(issue.id, "In Progress")}>
            In Progress
          </button>

          <button onClick={() => updateStatus(issue.id, "Resolved")}>
            Resolved
          </button>
        </div>
      ))}
    </div>
  );
}