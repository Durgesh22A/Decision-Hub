import { useNavigate } from "react-router-dom";

export default function DecisionCard({ decision, onDelete, isDeleting }) {
  const navigate = useNavigate();

  return (
    <article className="w-full rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate(`/decision/${decision.id}`)}
          className="flex-1 text-left transition"
        >
          <h3 className="text-lg font-semibold text-slate-900">
            {decision.title}
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            Click to manage criteria, options, and scores.
          </p>
        </button>

        <button
          type="button"
          disabled={isDeleting}
          onClick={() => onDelete(decision.id)}
          className="rounded-md border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-700 transition hover:bg-red-100 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isDeleting ? "Deleting..." : "Delete"}
        </button>
      </div>
    </article>
  );
}
