import { useState } from "react";

export default function CriteriaForm({ onSubmit }) {
  const [name, setName] = useState("");
  const [weight, setWeight] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    const parsedWeight = Number(weight);

    if (!name.trim()) {
      setError("Criteria name is required.");
      return;
    }
    if (!Number.isFinite(parsedWeight) || parsedWeight <= 0) {
      setError("Weight must be a positive number.");
      return;
    }

    setError("");
    await onSubmit({ name: name.trim(), weight: parsedWeight });
    setName("");
    setWeight("");
  };

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      <h3 className="text-lg font-semibold text-slate-900">Add Criteria</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Criteria name"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-0 transition duration-300 focus:border-indigo-500 focus:shadow-sm"
        />
        <input
          type="number"
          min="1"
          value={weight}
          onChange={(event) => setWeight(event.target.value)}
          placeholder="Weight"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-0 transition duration-300 focus:border-indigo-500 focus:shadow-sm"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition duration-300 hover:-translate-y-0.5 hover:bg-indigo-500 hover:shadow-md"
      >
        Add Criteria
      </button>
    </form>
  );
}
