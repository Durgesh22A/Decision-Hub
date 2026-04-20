import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import DecisionCard from "../components/DecisionCard";
import ConfirmModal from "../components/ConfirmModal";
import useAuth from "../hooks/useAuth";
import {
  createDecision,
  deleteDecision,
  getUserDecisions,
} from "../services/decisionService";

export default function Dashboard() {
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const [decisions, setDecisions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [deletingId, setDeletingId] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    if (!user?.uid) return;

    let isActive = true;

    getUserDecisions(user.uid)
      .then((items) => {
        if (!isActive) return;
        setDecisions(items);
      })
      .catch(() => {
        if (!isActive) return;
        setError("Unable to load decisions. Please refresh.");
      })
      .finally(() => {
        if (!isActive) return;
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

  const handleDeleteDecision = (decisionId) => {
    setSelectedId(decisionId);
    setShowModal(true);
  };

  const confirmDelete = async () => {
    try {
      setDeletingId(selectedId);
      await deleteDecision(selectedId);

      const items = await getUserDecisions(user.uid);
      setDecisions(items);
    } catch {
      setError("Unable to delete decision right now.");
    } finally {
      setDeletingId("");
      setShowModal(false);
      setSelectedId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto w-full max-w-4xl space-y-4 px-4 py-8">
        <section className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-bold text-slate-900">Your Decisions</h1>
          <p className="mt-1 text-sm text-slate-500">
            Create and compare options with weighted scores.
          </p>

          <form
            className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center"
            onSubmit={handleCreateDecision}
          >
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Choose a laptop"
              className="w-full flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />

            <button
              type="submit"
              disabled={isCreating}
              className="whitespace-nowrap rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-60"
            >
              {isCreating ? "Creating..." : "Create Decision"}
            </button>
          </form>

          {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
        </section>

        <section className="space-y-3">
          {isLoading ? (
            <p className="animate-pulse text-center text-sm text-slate-400 py-8">
              Loading decisions...
            </p>
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
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
              <div className="text-slate-400">
                <p className="text-4xl">📭</p>
                <p className="mt-3 text-sm font-medium text-slate-600">
                  No decisions yet. Create your first one.
                </p>
              </div>
            </div>
          )}
        </section>
      </main>

      <ConfirmModal
        isOpen={showModal}
        message="Delete this decision and its related scores?"
        onConfirm={confirmDelete}
        onCancel={() => setShowModal(false)}
      />
    </div>
  );
}
