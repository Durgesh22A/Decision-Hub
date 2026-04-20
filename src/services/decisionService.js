import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import { db } from "./firebase";

const decisionsRef = collection(db, "decisions");
const criteriaRef = collection(db, "criteria");
const optionsRef = collection(db, "options");
const scoresRef = collection(db, "scores");

function getTimestampMillis(value) {
  if (!value) {
    return 0;
  }
  if (typeof value.toMillis === "function") {
    return value.toMillis();
  }
  if (typeof value.seconds === "number") {
    return value.seconds * 1000 + Math.floor((value.nanoseconds || 0) / 1000000);
  }
  return 0;
}

export async function createDecision({ title, userId }) {
  return addDoc(decisionsRef, {
    title: title.trim(),
    userId,
    createdAt: serverTimestamp(),
  });
}

export async function getUserDecisions(userId) {
  const decisionsQuery = query(decisionsRef, where("userId", "==", userId));
  const snapshot = await getDocs(decisionsQuery);
  return snapshot.docs
    .map((item) => ({ id: item.id, ...item.data() }))
    .sort((a, b) => getTimestampMillis(b.createdAt) - getTimestampMillis(a.createdAt));
}

export async function getDecisionById(decisionId) {
  const snapshot = await getDoc(doc(db, "decisions", decisionId));
  if (!snapshot.exists()) {
    return null;
  }
  return { id: snapshot.id, ...snapshot.data() };
}

export async function addCriterion({ decisionId, name, weight }) {
  return addDoc(criteriaRef, {
    decisionId,
    name: name.trim(),
    weight,
    createdAt: serverTimestamp(),
  });
}

export async function getCriteria(decisionId) {
  const criteriaQuery = query(criteriaRef, where("decisionId", "==", decisionId));
  const snapshot = await getDocs(criteriaQuery);
  return snapshot.docs
    .map((item) => ({ id: item.id, ...item.data() }))
    .sort((a, b) => getTimestampMillis(a.createdAt) - getTimestampMillis(b.createdAt));
}

export async function addOption({ decisionId, name }) {
  return addDoc(optionsRef, {
    decisionId,
    name: name.trim(),
    createdAt: serverTimestamp(),
  });
}

export async function getOptions(decisionId) {
  const optionsQuery = query(optionsRef, where("decisionId", "==", decisionId));
  const snapshot = await getDocs(optionsQuery);
  return snapshot.docs
    .map((item) => ({ id: item.id, ...item.data() }))
    .sort((a, b) => getTimestampMillis(a.createdAt) - getTimestampMillis(b.createdAt));
}

export async function saveDecisionScores({ decisionId, scoreEntries }) {
  const updates = scoreEntries.map((entry) =>
    setDoc(doc(db, "scores", `${decisionId}_${entry.optionId}_${entry.criteriaId}`), {
      decisionId,
      optionId: entry.optionId,
      criteriaId: entry.criteriaId,
      value: entry.value,
      updatedAt: serverTimestamp(),
    }),
  );
  await Promise.all(updates);
}

export async function getDecisionScores(decisionId) {
  const scoresQuery = query(scoresRef, where("decisionId", "==", decisionId));
  const snapshot = await getDocs(scoresQuery);
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
}

export async function deleteDecision(decisionId) {
  const [criteriaSnapshot, optionsSnapshot, scoresSnapshot] = await Promise.all([
    getDocs(query(criteriaRef, where("decisionId", "==", decisionId))),
    getDocs(query(optionsRef, where("decisionId", "==", decisionId))),
    getDocs(query(scoresRef, where("decisionId", "==", decisionId))),
  ]);

  const deletions = [
    ...criteriaSnapshot.docs.map((item) => deleteDoc(item.ref)),
    ...optionsSnapshot.docs.map((item) => deleteDoc(item.ref)),
    ...scoresSnapshot.docs.map((item) => deleteDoc(item.ref)),
    deleteDoc(doc(db, "decisions", decisionId)),
  ];

  await Promise.all(deletions);
}

export async function deleteCriterion({ decisionId, criterionId }) {
  const decisionScores = await getDecisionScores(decisionId);
  const relatedScoreIds = decisionScores
    .filter((score) => score.criteriaId === criterionId)
    .map((score) => score.id);

  const deletions = [
    deleteDoc(doc(db, "criteria", criterionId)),
    ...relatedScoreIds.map((scoreId) => deleteDoc(doc(db, "scores", scoreId))),
  ];
  await Promise.all(deletions);
}

export async function deleteOption({ decisionId, optionId }) {
  const decisionScores = await getDecisionScores(decisionId);
  const relatedScoreIds = decisionScores
    .filter((score) => score.optionId === optionId)
    .map((score) => score.id);

  const deletions = [
    deleteDoc(doc(db, "options", optionId)),
    ...relatedScoreIds.map((scoreId) => deleteDoc(doc(db, "scores", scoreId))),
  ];
  await Promise.all(deletions);
}
