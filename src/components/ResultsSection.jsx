export default function ResultsSection({ rankedOptions, hasCompleteSavedScores }) {
  if (!rankedOptions.length || !hasCompleteSavedScores) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
        Save a complete score set (all options x all criteria) to view ranked results.
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-900">Results</h3>
      <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 shadow-sm transition duration-300 hover:shadow-md">
        <p className="text-sm font-semibold uppercase text-emerald-800">Best Option</p>
        <p className="mt-1 text-xl font-bold text-emerald-900">{rankedOptions[0].optionName}</p>
        <p className="text-sm text-emerald-800">Final score: {rankedOptions[0].finalScore}</p>
      </div>

      <div className="space-y-3">
        {rankedOptions.map((result, index) => (
          <div
            key={result.optionId}
            className={`rounded-xl border p-4 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md ${
              index === 0 ? "border-emerald-300 bg-emerald-50" : "border-slate-200 bg-white"
            }`}
          >
            <p className="font-semibold text-slate-900">
              #{index + 1} {result.optionName}
            </p>
            <p className="text-sm text-slate-600">Final score: {result.finalScore}</p>
            <div className="mt-3 space-y-1 text-sm text-slate-700">
              {result.breakdown.map((line) => (
                <p key={line.criteriaId}>
                  {line.criteriaName}: {line.weight} x {line.score} = {line.weightedScore}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
