import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import CriteriaForm from "../components/CriteriaForm";
import Navbar from "../components/Navbar";
import OptionForm from "../components/OptionForm";
import ResultsSection from "../components/ResultsSection";
import ScoreMatrix from "../components/ScoreMatrix";
import ConfirmModal from "../components/ConfirmModal";
import useDecisionRanking from "../hooks/useDecisionRanking";
import {
  addCriterion,
  addOption,
  deleteCriterion,
  deleteOption,
  getCriteria,
  getDecisionById,
  getDecisionScores,
  getOptions,
  saveDecisionScores,
} from "../services/decisionService";

export default function DecisionDetails() {
  const { id } = useParams();

  const [decision, setDecision] = useState(null);
  const [criteria, setCriteria] = useState([]);
  const [options, setOptions] = useState([]);
  const [savedScores, setSavedScores] = useState([]);
  const [draftScores, setDraftScores] = useState({});
  const [feedback, setFeedback] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [deleteType, setDeleteType] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  const totalWeight = useMemo(
    () => criteria.reduce((sum, c) => sum + Number(c.weight || 0), 0),
    [criteria],
  );

  const requiredScoreCount = options.length * criteria.length;

  const hasCompleteSavedScores = useMemo(() => {
    if (!requiredScoreCount) return false;
    return savedScores.length >= requiredScoreCount;
  }, [savedScores, requiredScoreCount]);

  const rankedOptions = useDecisionRanking(options, criteria, savedScores);

  const insights = useMemo(() => {
    if (!rankedOptions.length || !criteria.length) return [];

    const best = rankedOptions[0];
    const messages = [];

    criteria.forEach((c) => {
      const scoreObj = savedScores.find(
        (s) => s.optionId === best.id && s.criteriaId === c.id,
      );

      const value = Number(scoreObj?.value || 0);

      if (value >= 8) {
        messages.push(`${c.name} is strong (${value}/10)`);
      }
    });

    return messages;
  }, [rankedOptions, criteria, savedScores]);

  const applyLoadedData = useCallback(
    ({ decisionData, criteriaData, optionsData, scoresData }) => {
      setDecision(decisionData);
      setCriteria(criteriaData);
      setOptions(optionsData);
      setSavedScores(scoresData);

      const next = {};
      optionsData.forEach((o) => {
        criteriaData.forEach((c) => {
          const score = scoresData.find(
            (s) => s.optionId === o.id && s.criteriaId === c.id,
          );
          if (score) {
            next[`${o.id}_${c.id}`] = Number(score.value);
          }
        });
      });
      setDraftScores(next);
    },
    [],
  );

  const loadAll = useCallback(async () => {
    const [decisionData, criteriaData, optionsData, scoresData] =
      await Promise.all([
        getDecisionById(id),
        getCriteria(id),
        getOptions(id),
        getDecisionScores(id),
      ]);
    return { decisionData, criteriaData, optionsData, scoresData };
  }, [id]);

  useEffect(() => {
    let active = true;

    loadAll()
      .then((data) => {
        if (!active) return;
        applyLoadedData(data);
      })
      .finally(() => setIsLoading(false));

    return () => (active = false);
  }, [loadAll, applyLoadedData]);

  const handleAddCriteria = async (data) => {
    await addCriterion({ decisionId: id, ...data });
    applyLoadedData(await loadAll());
  };

  const handleAddOption = async (name) => {
    await addOption({ decisionId: id, name });
    applyLoadedData(await loadAll());
  };

  const handleDeleteCriterion = (id) => {
    setDeleteType("criteria");
    setSelectedId(id);
    setShowModal(true);
  };

  const handleDeleteOption = (id) => {
    setDeleteType("option");
    setSelectedId(id);
    setShowModal(true);
  };

  const confirmDelete = async () => {
    if (deleteType === "criteria") {
      await deleteCriterion({ decisionId: id, criterionId: selectedId });
    }
    if (deleteType === "option") {
      await deleteOption({ decisionId: id, optionId: selectedId });
    }

    applyLoadedData(await loadAll());
    setShowModal(false);
  };

  const handleScoreChange = (key, value) => {
    const v = Number(value);
    if (v >= 1 && v <= 10) {
      setDraftScores((p) => ({ ...p, [key]: v }));
    }
  };

  const handleSaveScores = async () => {
    if (totalWeight !== 100) {
      setFeedback("Total weight must be 100");
      return;
    }

    const entries = [];

    for (const o of options) {
      for (const c of criteria) {
        const key = `${o.id}_${c.id}`;
        entries.push({
          optionId: o.id,
          criteriaId: c.id,
          value: draftScores[key],
        });
      }
    }

    await saveDecisionScores({ decisionId: id, scoreEntries: entries });
    applyLoadedData(await loadAll());
    setFeedback("Saved!");
  };

  return (
    <div className="min-h-screen bg-slate-100 bg-gradient-to-br from-slate-100 via-indigo-50/40 to-cyan-50/40">
      <Navbar />

      <main className="mx-auto max-w-6xl space-y-6 p-6">
        <section className="animate-fade-up transition hover:shadow-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">
            {decision?.title}
          </h1>

          <p
            className={`mt-2 text-sm font-medium ${totalWeight === 100 ? "text-green-600" : "text-red-500"}`}
          >
            Total Weight: {totalWeight}/100
          </p>
        </section>

        <section className="grid md:grid-cols-2 gap-6">
          <div className="animate-fade-up transition hover:shadow-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <CriteriaForm onSubmit={handleAddCriteria} />

            <div className="mt-4 space-y-2">
              {criteria.map((c) => (
                <div
                  key={c.id}
                  className="animate-fade-up transition hover:bg-slate-100 flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"
                >
                  <span className="text-sm">
                    {c.name} ({c.weight}%)
                  </span>

                  <button
                    onClick={() => handleDeleteCriterion(c.id)}
                    className="rounded-md border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-100 transition"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="animate-fade-up transition hover:shadow-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <OptionForm onSubmit={handleAddOption} />

            <div className="mt-4 space-y-2">
              {options.map((o) => (
                <div
                  key={o.id}
                  className="animate-fade-up transition hover:bg-slate-100 flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"
                >
                  <span className="text-sm">{o.name}</span>

                  <button
                    onClick={() => handleDeleteOption(o.id)}
                    className="rounded-md border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-100 transition"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="animate-fade-up transition hover:shadow-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <ScoreMatrix
            options={options}
            criteria={criteria}
            draftScores={draftScores}
            onScoreChange={handleScoreChange}
            onSave={handleSaveScores}
          />
        </section>

        <section className="animate-fade-up transition hover:shadow-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <ResultsSection
            rankedOptions={rankedOptions}
            hasCompleteSavedScores={hasCompleteSavedScores}
          />

          {insights.length > 0 && (
            <div className="animate-fade-up mt-4 rounded-lg border border-green-200 bg-green-50 p-4 transition hover:shadow-sm">
              <p className="font-semibold text-green-800">Why this is best:</p>
              <ul className="mt-2 list-disc ml-5 text-sm text-green-700">
                {insights.map((i, idx) => (
                  <li key={idx}>{i}</li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {feedback && <p className="text-sm text-green-600">{feedback}</p>}
      </main>

      <ConfirmModal
        isOpen={showModal}
        message="Delete this item?"
        onConfirm={confirmDelete}
        onCancel={() => setShowModal(false)}
      />
    </div>
  );
}
