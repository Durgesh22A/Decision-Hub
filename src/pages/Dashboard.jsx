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
    <div className="min-h-screen bg-slate-100 bg-gradient-to-br from-slate-100 via-indigo-50/40 to-cyan-50/40">
      <Navbar />

      <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8">
        {/* CREATE SECTION */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">Your Decisions</h1>

          <p className="mt-1 text-sm text-slate-600">
            Create and compare options with weighted scores.
          </p>

          <form
            className="mt-5 flex flex-col gap-3 sm:flex-row"
            onSubmit={handleCreateDecision}
          >
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Choose a laptop"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-300"
            />

            <button
              type="submit"
              disabled={isCreating}
              className="rounded-lg bg-indigo-600 px-5 py-2 text-white hover:bg-indigo-500 transition disabled:opacity-60"
            >
              {isCreating ? "Creating..." : "Create Decision"}
            </button>
          </form>

          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </section>

        {/* LIST */}
        <section className="space-y-3">
          {isLoading ? (
            <p className="animate-pulse text-slate-500">Loading decisions...</p>
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
              <div className="text-slate-500">
                <p className="text-3xl">📭</p>
                <p className="mt-2">No decisions yet. Create your first one.</p>
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
