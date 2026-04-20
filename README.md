# 🚀 DecisionHub

A smart decision-making web application that helps users choose the best option using a structured, weighted scoring system.

---

## 🎯 Problem Statement

Real-life decisions often involve multiple factors like price, performance, features, and usability. Most people rely on intuition, which leads to biased or inconsistent outcomes.

DecisionHub solves this by transforming decision-making into a **structured, data-driven process**.

---

## 💡 Solution

DecisionHub allows users to:

- Define decision criteria
- Assign importance using weights
- Score each option objectively
- Automatically compute and rank results

---

## 🧠 Core Concept

Final Score = Σ (Criteria Weight × Score)

This ensures:

- Transparent reasoning
- Logical comparison
- Consistent and unbiased decisions

---

## ✨ Key Features

- 🔐 Authentication (Firebase Auth)
- 📊 Create and manage multiple decisions
- ⚖️ Add criteria with weighted importance (must total 100)
- 📝 Add multiple options to compare
- 🔢 Assign scores (scale of 1–10)
- 🏆 Automatic ranking of options
- 📈 Detailed score breakdown
- 💡 Insight explanation (why the best option wins)
- 👤 User profile management

---

## 🧱 Tech Stack

- Frontend: React (Vite)
- Styling: Tailwind CSS
- Backend: Firebase (Auth + Firestore)
- Routing: React Router
- State Management: Context API + Hooks

---

## 🏗 Architecture Highlights

- Modular folder structure (components, pages, services, hooks)
- Separation of concerns (UI, logic, data)
- Reusable components
- Custom hook for ranking logic
- Clean global state using Context API

---

## 📂 Project Structure

```
src/
  components/
  pages/
  context/
  services/
  hooks/
```

---

## 🔐 Environment Variables

Create a `.env` file in root:

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

---

## ⚙️ Setup Instructions

```bash
npm install
npm run dev
```

---

## 🎥 Demo Flow

1. Login / Signup
2. Create a new decision
3. Add criteria (with weights)
4. Add options
5. Assign scores (1–10)
6. View ranked results
7. Understand why the best option was selected

---

## ⚠️ Assumptions

- All criteria are benefit-type (higher score = better)
- Total weight must equal 100
- Scores must be between 1–10

---

## 🚀 Future Improvements

- Support cost-based criteria (e.g., price)
- Charts / analytics
- AI-powered insights
- Collaboration features
- Export results

---

## 👨‍💻 Author

Durgesh Kumar

---

## 📌 Note

This project demonstrates:

- Strong React fundamentals
- Backend integration
- Clean architecture
- Real-world problem solving
