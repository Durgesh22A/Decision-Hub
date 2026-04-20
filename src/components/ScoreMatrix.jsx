export default function ScoreMatrix({
  options,
  criteria,
  draftScores,
  onScoreChange,
  onSave,
}) {
  if (!options.length || !criteria.length) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
        Add at least one criterion and one option to start scoring.
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-900">Assign Scores (1-10)</h3>
      <div className="space-y-4">
        {options.map((option) => (
          <div
            key={option.id}
            className="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm transition duration-300 hover:border-indigo-200 hover:shadow-md"
          >
            <h4 className="mb-3 text-base font-semibold text-slate-900">{option.name}</h4>
            <div className="grid gap-3 sm:grid-cols-2">
              {criteria.map((criterion) => {
                const key = `${option.id}_${criterion.id}`;
                return (
                  <label key={criterion.id} className="text-sm text-slate-700">
                    <span className="mb-1 block">
                      {criterion.name} ({criterion.weight}%)
                    </span>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={draftScores[key] ?? ""}
                      onChange={(event) => onScoreChange(key, event.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition duration-300 focus:border-indigo-500 focus:shadow-sm"
                    />
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={onSave}
        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition duration-300 hover:-translate-y-0.5 hover:bg-emerald-500 hover:shadow-md"
      >
        Save Scores
      </button>
    </section>
  );
}
