import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import DecisionCard from "../components/DecisionCard";
import useAuth from "../hooks/useAuth";
import {
  createDecision,
  deleteDecision,
  getUserDecisions,
} from "../services/decisionService";

export default function Dashboard() {
  const { user, userName, updateUserName } = useAuth();
  const [title, setTitle] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [error, setError] = useState("");
  const [profileMessage, setProfileMessage] = useState("");
  const [decisions, setDecisions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdatingName, setIsUpdatingName] = useState(false);
  const [deletingId, setDeletingId] = useState("");

  useEffect(() => {
    if (!user?.uid) {
      return;
    }
    let isActive = true;
    getUserDecisions(user.uid)
      .then((items) => {
        if (!isActive) {
          return;
        }
        setDecisions(items);
      })
      .catch(() => {
        if (!isActive) {
          return;
        }
        setError("Unable to load decisions. Please refresh.");
      })
      .finally(() => {
        if (!isActive) {
          return;
        }
        setIsLoading(false);
      });
    return () => {
      isActive = false;
    };
  }, [user?.uid]);

  const handleCreateDecision = async (event) => {
    event.preventDefault();
    setError("");
    if (!title.trim()) {
      setError("Decision title is required.");
      return;
    }
    try {
      setIsCreating(true);
      await createDecision({ title, userId: user.uid });
      setTitle("");
      const items = await getUserDecisions(user.uid);
      setDecisions(items);
    } catch {
      setError("Unable to create decision right now. Try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleProfileUpdate = async (event) => {
    event.preventDefault();
    setProfileMessage("");
    const normalizedName = (nameInput || userName || "").trim();
    if (!normalizedName) {
      setProfileMessage("Name is required.");
      return;
    }
    try {
      setIsUpdatingName(true);
      await updateUserName(normalizedName);
      setNameInput("");
      setProfileMessage("Name updated successfully.");
    } catch {
      setProfileMessage("Unable to update name right now.");
    } finally {
      setIsUpdatingName(false);
    }
  };

  const handleDeleteDecision = async (decisionId) => {
    setError("");
    const confirmed = window.confirm(
      "Delete this decision and all related criteria, options, and scores?",
    );
    if (!confirmed) {
      return;
    }
    try {
      setDeletingId(decisionId);
      await deleteDecision(decisionId);
      const items = await getUserDecisions(user.uid);
      setDecisions(items);
    } catch {
      setError("Unable to delete decision right now. Try again.");
    } finally {
      setDeletingId("");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 bg-gradient-to-br from-slate-100 via-indigo-50/40 to-cyan-50/40">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8">
        <section className="animate-fade-up rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:shadow-lg">
          <h2 className="text-lg font-semibold text-slate-900">Profile</h2>
          <p className="mt-1 text-sm text-slate-600">Set how your name appears across the app.</p>
          <form className="mt-4 flex flex-col gap-3 sm:flex-row" onSubmit={handleProfileUpdate}>
            <input
              type="text"
              value={nameInput}
              onChange={(event) => setNameInput(event.target.value)}
              placeholder={userName || "Your name"}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition duration-300 focus:border-indigo-500 focus:shadow-sm"
            />
            <button
              type="submit"
              disabled={isUpdatingName}
              className="rounded-lg bg-slate-900 px-5 py-2 font-medium text-white transition duration-300 hover:-translate-y-0.5 hover:bg-slate-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isUpdatingName ? "Saving..." : "Save Name"}
            </button>
          </form>
          {profileMessage && <p className="mt-2 text-sm text-indigo-700">{profileMessage}</p>}
        </section>

        <section className="animate-fade-up rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:shadow-lg">
          <h1 className="text-2xl font-bold text-slate-900">Your Decisions</h1>
          <p className="mt-1 text-sm text-slate-600">Create and compare options with weighted scores.</p>
          <form className="mt-5 flex flex-col gap-3 sm:flex-row" onSubmit={handleCreateDecision}>
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Choose a laptop"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition duration-300 focus:border-indigo-500 focus:shadow-sm"
            />
            <button
              type="submit"
              disabled={isCreating}
              className="rounded-lg bg-indigo-600 px-5 py-2 font-medium text-white transition duration-300 hover:-translate-y-0.5 hover:bg-indigo-500 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isCreating ? "Creating..." : "Create Decision"}
            </button>
          </form>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </section>

        <section className="animate-fade-up space-y-3">
          {isLoading ? (
            <p className="text-sm text-slate-600">Loading decisions...</p>
          ) : decisions.length ? (
            decisions.map((decision) => (
              <DecisionCard
                key={decision.id}
                decision={decision}
                onDelete={handleDeleteDecision}
                isDeleting={deletingId === decision.id}
              />
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
              <p className="text-slate-700">No decisions yet. Create your first decision above.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
