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
    () =>
      criteria.reduce(
        (sum, criterion) => sum + Number(criterion.weight || 0),
        0,
      ),
    [criteria],
  );

  const requiredScoreCount = options.length * criteria.length;

  const hasCompleteSavedScores = useMemo(() => {
    if (!requiredScoreCount) return false;
    const validScores = savedScores.filter((score) => {
      const value = Number(score.value);
      return Number.isFinite(value) && value >= 1 && value <= 10;
    });
    return validScores.length >= requiredScoreCount;
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

      const nextDraftScores = {};
      optionsData.forEach((option) => {
        criteriaData.forEach((criterion) => {
          const score = scoresData.find(
            (item) =>
              item.optionId === option.id && item.criteriaId === criterion.id,
          );
          if (score) {
            nextDraftScores[`${option.id}_${criterion.id}`] = Number(
              score.value,
            );
          }
        });
      });
      setDraftScores(nextDraftScores);
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
    let isActive = true;

    loadAll()
      .then((data) => {
        if (!isActive) return;
        applyLoadedData(data);
      })
      .catch(() => {
        if (!isActive) return;
        setFeedback("Unable to load decision data.");
      })
      .finally(() => {
        if (!isActive) return;
        setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [loadAll, applyLoadedData]);

  const handleAddCriteria = async ({ name, weight }) => {
    try {
      await addCriterion({ decisionId: id, name, weight });
      const data = await loadAll();
      applyLoadedData(data);
    } catch {
      setFeedback("Could not add criteria.");
    }
  };

  const handleAddOption = async (name) => {
    try {
      await addOption({ decisionId: id, name });
      const data = await loadAll();
      applyLoadedData(data);
    } catch {
      setFeedback("Could not add option.");
    }
  };

  const handleDeleteCriterion = (criterionId) => {
    setDeleteType("criteria");
    setSelectedId(criterionId);
    setShowModal(true);
  };

  const handleDeleteOption = (optionId) => {
    setDeleteType("option");
    setSelectedId(optionId);
    setShowModal(true);
  };

  const confirmDelete = async () => {
    try {
      if (deleteType === "criteria") {
        await deleteCriterion({ decisionId: id, criterionId: selectedId });
      }

      if (deleteType === "option") {
        await deleteOption({ decisionId: id, optionId: selectedId });
      }

      const data = await loadAll();
      applyLoadedData(data);
    } catch {
      setFeedback("Delete failed.");
    } finally {
      setShowModal(false);
      setSelectedId(null);
      setDeleteType(null);
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
    if (totalWeight !== 100) {
      setFeedback("Total weight must be 100.");
      return;
    }

    const scoreEntries = [];

    for (const option of options) {
      for (const criterion of criteria) {
        const key = `${option.id}_${criterion.id}`;
        const value = Number(draftScores[key]);

        if (!value) {
          setFeedback("Fill all scores.");
          return;
        }

        scoreEntries.push({
          optionId: option.id,
          criteriaId: criterion.id,
          value,
        });
      }
    }

    try {
      await saveDecisionScores({ decisionId: id, scoreEntries });
      const data = await loadAll();
      applyLoadedData(data);
      setFeedback("Saved!");
    } catch {
      setFeedback("Save failed.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />

      <main className="mx-auto max-w-6xl space-y-6 p-6">
        <section className="bg-white p-6 rounded-xl shadow">
          <h1 className="text-xl font-bold">{decision?.title || "Decision"}</h1>
          <p>Total Weight: {totalWeight}/100</p>
        </section>

        <section className="grid md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-xl">
            <CriteriaForm onSubmit={handleAddCriteria} />
            {criteria.map((c) => (
              <div key={c.id} className="flex justify-between">
                <span>{c.name}</span>
                <button onClick={() => handleDeleteCriterion(c.id)}>
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="bg-white p-4 rounded-xl">
            <OptionForm onSubmit={handleAddOption} />
            {options.map((o) => (
              <div key={o.id} className="flex justify-between">
                <span>{o.name}</span>
                <button onClick={() => handleDeleteOption(o.id)}>Remove</button>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white p-6 rounded-xl">
          <ScoreMatrix
            options={options}
            criteria={criteria}
            draftScores={draftScores}
            onScoreChange={handleScoreChange}
            onSave={handleSaveScores}
          />
        </section>

        <section className="bg-white p-6 rounded-xl">
          <ResultsSection
            rankedOptions={rankedOptions}
            hasCompleteSavedScores={hasCompleteSavedScores}
          />

          {insights.length > 0 && (
            <div className="mt-4 bg-green-50 p-3 rounded">
              <p className="font-semibold">Why this is best:</p>
              <ul className="list-disc ml-5">
                {insights.map((i, idx) => (
                  <li key={idx}>{i}</li>
                ))}
              </ul>
            </div>
          )}
        </section>
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
