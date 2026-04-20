# 🚀 DecisionHub

A smart decision-making web application that helps users choose the best option using a weighted scoring system.

---

## 🎯 Problem Statement

Making decisions involving multiple factors (price, performance, features, etc.) can be confusing and biased.

DecisionHub solves this by:
- Structuring decision criteria
- Assigning weights to importance
- Scoring options objectively
- Generating a ranked result

---

## 🧠 Core Idea

Final Score = Σ (Criteria Weight × Score)

This ensures:
- Transparent decision-making
- Logical comparison
- Data-driven outcomes

---

## ✨ Features

- 🔐 User Authentication (Firebase)
- 📊 Create and manage decisions
- ⚖️ Add criteria with weights (total = 100)
- 📝 Add multiple options
- 🔢 Assign scores (1–10 scale)
- 🏆 Automatic ranking of options
- 📈 Score breakdown for transparency
- 👤 User profile (name update)

---

## 🛠 Tech Stack

- Frontend: React (Vite)
- Styling: CSS / Tailwind
- Backend: Firebase (Auth + Firestore)
- Routing: React Router
- State Management: Context API + Hooks

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

## 📸 Demo Flow

1. Login / Signup  
2. Create a new decision  
3. Add criteria (with weights)  
4. Add options  
5. Assign scores (1–10)  
6. View ranked results and best option  

---

## ⚠️ Assumptions

- All criteria are treated as benefit-type (higher score = better)  
- Total weight must equal 100  

---

## 🚀 Future Improvements

- Support for cost-based criteria (e.g., price)  
- Charts / analytics  
- Collaboration features  
- Export results  

---

## 👨‍💻 Author

Durgesh Kumar

---

## 💡 Note

This project demonstrates:
- Strong React fundamentals  
- Backend integration  
- Clean architecture  
- Real-world problem solving  
