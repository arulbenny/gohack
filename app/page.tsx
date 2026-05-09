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

export default function Home() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("General");

  // FETCH ISSUES
  const fetchIssues = async () => {
    const res = await fetch("/api/issues");
    const data = await res.json();

    // sort by upvotes (trending first)
    const sorted = data.sort(
      (a: Issue, b: Issue) => b.upvotes - a.upvotes
    );

    setIssues(sorted);
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  // ADD ISSUE
  const addIssue = async () => {
    if (!title || !description) return;

    await fetch("/api/issues", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        description,
        category,
        status: "Pending",
        upvotes: 0,
      }),
    });

    setTitle("");
    setDescription("");
    setCategory("General");

    fetchIssues();
  };

  // UPVOTE
  const upvote = async (id: number) => {
    await fetch(`/api/issues/${id}`, {
      method: "PATCH",
    });

    fetchIssues();
  };

  return (
    <div style={{ padding: "40px", fontFamily: "Arial" }}>
      <h1>CampusVoice</h1>

      {/* FORM */}
      <div style={{ marginBottom: "20px" }}>
        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ display: "block", marginBottom: "10px" }}
        />

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ display: "block", marginBottom: "10px" }}
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{ display: "block", marginBottom: "10px" }}
        >
          <option value="General">General</option>
          <option value="Hostel">Hostel</option>
          <option value="Mess">Mess</option>
          <option value="Academics">Academics</option>
          <option value="Safety">Safety</option>
        </select>

        <button onClick={addIssue}>
          Submit Issue
        </button>
      </div>

      {/* ISSUES LIST */}
      {issues.map((issue) => (
        <div
          key={issue.id}
          style={{
            border: "1px solid black",
            padding: "10px",
            marginBottom: "10px",
          }}
        >
          <h3>{issue.title}</h3>
          <p>{issue.description}</p>

          <p>
            Category: <b>{issue.category}</b>
          </p>

          <p>
            Status: <b>{issue.status}</b>
          </p>

          <p>
            Upvotes: <b>{issue.upvotes}</b>
          </p>

          <button onClick={() => upvote(issue.id)}>
            Upvote
          </button>
        </div>
      ))}
    </div>
  );
}