import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import CriteriaForm from "../components/CriteriaForm";
import Navbar from "../components/Navbar";
import OptionForm from "../components/OptionForm";
import ResultsSection from "../components/ResultsSection";
import ScoreMatrix from "../components/ScoreMatrix";
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

  const totalWeight = useMemo(
    () => criteria.reduce((sum, criterion) => sum + Number(criterion.weight || 0), 0),
    [criteria],
  );
  const requiredScoreCount = options.length * criteria.length;
  const hasCompleteSavedScores = useMemo(() => {
    if (!requiredScoreCount) {
      return false;
    }
    const validScores = savedScores.filter((score) => {
      const value = Number(score.value);
      return Number.isFinite(value) && value >= 1 && value <= 10;
    });
    return validScores.length >= requiredScoreCount;
  }, [savedScores, requiredScoreCount]);
  const rankedOptions = useDecisionRanking(options, criteria, savedScores);

  const applyLoadedData = useCallback(
    ({ decisionData, criteriaData, optionsData, scoresData }) => {
      setDecision(decisionData);
      setCriteria(criteriaData);
      setOptions(optionsData);
      setSavedScores(scoresData);

      const nextDraftScores = {};
      optionsData.forEach((option) => {
        criteriaData.forEach((criterion) => {
          const score = scoresData.find(
            (item) => item.optionId === option.id && item.criteriaId === criterion.id,
          );
          if (score) {
            nextDraftScores[`${option.id}_${criterion.id}`] = Number(score.value);
          }
        });
      });
      setDraftScores(nextDraftScores);
    },
    [],
  );

  const loadAll = useCallback(async () => {
    const [decisionData, criteriaData, optionsData, scoresData] = await Promise.all([
      getDecisionById(id),
      getCriteria(id),
      getOptions(id),
      getDecisionScores(id),
    ]);
    return { decisionData, criteriaData, optionsData, scoresData };
  }, [id]);

  useEffect(() => {
    let isActive = true;
    loadAll()
      .then(({ decisionData, criteriaData, optionsData, scoresData }) => {
        if (!isActive) {
          return;
        }
        applyLoadedData({ decisionData, criteriaData, optionsData, scoresData });
      })
      .catch(() => {
        if (!isActive) {
          return;
        }
        setFeedback("Unable to load decision data. Please refresh.");
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
  }, [loadAll, applyLoadedData]);

  const handleAddCriteria = async ({ name, weight }) => {
    try {
      await addCriterion({ decisionId: id, name, weight });
      const { decisionData, criteriaData, optionsData, scoresData } = await loadAll();
      applyLoadedData({ decisionData, criteriaData, optionsData, scoresData });
    } catch {
      setFeedback("Could not add criteria. Please try again.");
    }
  };

  const handleAddOption = async (name) => {
    try {
      await addOption({ decisionId: id, name });
      const { decisionData, criteriaData, optionsData, scoresData } = await loadAll();
      applyLoadedData({ decisionData, criteriaData, optionsData, scoresData });
    } catch {
      setFeedback("Could not add option. Please try again.");
    }
  };

  const handleDeleteCriterion = async (criterionId) => {
    const confirmed = window.confirm(
      "Delete this criterion and its related scores?",
    );
    if (!confirmed) {
      return;
    }

    try {
      await deleteCriterion({ decisionId: id, criterionId });
      const { decisionData, criteriaData, optionsData, scoresData } = await loadAll();
      applyLoadedData({ decisionData, criteriaData, optionsData, scoresData });
      setFeedback("Criterion removed.");
    } catch {
      setFeedback("Could not delete criterion. Please try again.");
    }
  };

  const handleDeleteOption = async (optionId) => {
    const confirmed = window.confirm("Delete this option and its related scores?");
    if (!confirmed) {
      return;
    }

    try {
      await deleteOption({ decisionId: id, optionId });
      const { decisionData, criteriaData, optionsData, scoresData } = await loadAll();
      applyLoadedData({ decisionData, criteriaData, optionsData, scoresData });
      setFeedback("Option removed.");
    } catch {
      setFeedback("Could not delete option. Please try again.");
    }
  };

  const handleScoreChange = (key, value) => {
    const parsed = Number(value);
    if (!value) {
      setDraftScores((prev) => ({ ...prev, [key]: "" }));
      return;
    }
    if (parsed >= 1 && parsed <= 10) {
      setDraftScores((prev) => ({ ...prev, [key]: parsed }));
    }
  };

  const handleSaveScores = async () => {
    setFeedback("");
    if (totalWeight !== 100) {
      setFeedback("Total criteria weight must be exactly 100 before saving scores.");
      return;
    }

    const scoreEntries = [];
    for (const option of options) {
      for (const criterion of criteria) {
        const key = `${option.id}_${criterion.id}`;
        const value = Number(draftScores[key]);
        if (!Number.isFinite(value) || value < 1 || value > 10) {
          setFeedback("Every score must be set between 1 and 10.");
          return;
        }
        scoreEntries.push({ optionId: option.id, criteriaId: criterion.id, value });
      }
    }

    try {
      await saveDecisionScores({ decisionId: id, scoreEntries });
      setFeedback("Scores saved successfully.");
      const { decisionData, criteriaData, optionsData, scoresData } = await loadAll();
      applyLoadedData({ decisionData, criteriaData, optionsData, scoresData });
    } catch {
      setFeedback("Could not save scores. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 bg-gradient-to-br from-slate-100 via-indigo-50/40 to-emerald-50/40">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8">
        <section className="animate-fade-up rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:shadow-lg">
          <h1 className="text-2xl font-bold text-slate-900">
            {isLoading ? "Loading decision..." : decision?.title || "Decision details"}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Define your criteria, score each option, and compare outcomes transparently.
          </p>
          <p
            className={`mt-4 inline-block rounded-md px-3 py-1 text-sm font-medium ${
              totalWeight === 100 ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
            }`}
          >
            Total Weight: {totalWeight} / 100
          </p>
        </section>

        <section className="animate-fade-up grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:shadow-lg">
            <CriteriaForm onSubmit={handleAddCriteria} />
            <div className="mt-4 space-y-2">
              {criteria.map((criterion) => (
                <div
                  key={criterion.id}
                  className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100"
                >
                  <p>
                    {criterion.name} ({criterion.weight}%)
                  </p>
                  <button
                    type="button"
                    onClick={() => handleDeleteCriterion(criterion.id)}
                    className="rounded-md border border-red-200 bg-red-50 px-2 py-1 text-xs font-medium text-red-700 transition hover:bg-red-100"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:shadow-lg">
            <OptionForm onSubmit={handleAddOption} />
            <div className="mt-4 space-y-2">
              {options.map((option) => (
                <div
                  key={option.id}
                  className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100"
                >
                  <p>{option.name}</p>
                  <button
                    type="button"
                    onClick={() => handleDeleteOption(option.id)}
                    className="rounded-md border border-red-200 bg-red-50 px-2 py-1 text-xs font-medium text-red-700 transition hover:bg-red-100"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="animate-fade-up rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:shadow-lg">
          <ScoreMatrix
            options={options}
            criteria={criteria}
            draftScores={draftScores}
            onScoreChange={handleScoreChange}
            onSave={handleSaveScores}
          />
          {feedback && <p className="mt-3 text-sm text-indigo-700">{feedback}</p>}
        </section>

        <section className="animate-fade-up rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:shadow-lg">
          <ResultsSection
            rankedOptions={rankedOptions}
            hasCompleteSavedScores={hasCompleteSavedScores}
          />
        </section>
      </main>
    </div>
  );
}
