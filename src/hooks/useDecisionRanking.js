import { useMemo } from "react";

export default function useDecisionRanking(options, criteria, savedScores) {
  return useMemo(() => {
    if (!options.length || !criteria.length) {
      return [];
    }

    const scoreMap = new Map(
      savedScores.map((score) => [`${score.optionId}_${score.criteriaId}`, score.value]),
    );

    return options
      .map((option) => {
        const breakdown = criteria.map((criterion) => {
          const score = Number(scoreMap.get(`${option.id}_${criterion.id}`) ?? 0);
          const weightedScore = Number(criterion.weight) * score;
          return {
            criteriaId: criterion.id,
            criteriaName: criterion.name,
            weight: Number(criterion.weight),
            score,
            weightedScore,
          };
        });

        const finalScore = breakdown.reduce(
          (total, line) => total + line.weightedScore,
          0,
        );

        return {
          optionId: option.id,
          optionName: option.name,
          finalScore,
          breakdown,
        };
      })
      .sort((a, b) => b.finalScore - a.finalScore);
  }, [options, criteria, savedScores]);
}
