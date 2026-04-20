import { useState } from "react";

export default function OptionForm({ onSubmit }) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!name.trim()) {
      setError("Option name is required.");
      return;
    }

    setError("");
    await onSubmit(name.trim());
    setName("");
  };

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      <h3 className="text-lg font-semibold text-slate-900">Add Option</h3>
      <input
        type="text"
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="Option name"
        className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-0 transition duration-300 focus:border-indigo-500 focus:shadow-sm"
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition duration-300 hover:-translate-y-0.5 hover:bg-indigo-500 hover:shadow-md"
      >
        Add Option
      </button>
    </form>
  );
}
