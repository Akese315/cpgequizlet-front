import React, { useState, useEffect, useRef } from 'react';

// --- CONFIGURATION DES DONNÉES (À REMPLIR PAR L'UTILISATEUR) ---
// Vous pouvez copier/coller vos données dans ce format.
const QUIZ_DATA = [
  {
    id: 1,
    question: "Quelle est la relation fondamentale de la dynamique pour une translation ?",
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=400", // Optionnel
    options: [
      "$\\sum \\vec{F} = m \\cdot \\vec{a}$",
      "$\\sum \\vec{M} = J \\cdot \\alpha$",
      "$E = m \\cdot c^2$",
      "$P = U \\cdot I$"
    ],
    correctAnswer: 0,
    explanation: "La deuxième loi de Newton lie la somme des forces extérieures à l'accélération."
  },
  {
    id: 2,
    question: "Calculez la résistance équivalente de deux résistances $R_1 = 10\\Omega$ et $R_2 = 10\\Omega$ en parallèle.",
    options: [
      "$20 \\Omega$",
      "$5 \\Omega$",
      "$100 \\Omega$"
    ],
    correctAnswer: 1,
    explanation: "En parallèle, $1/R_{eq} = 1/R_1 + 1/R_2$."
  },
  {
    id: 3,
    question: "Dans un système asservi, que permet de mesurer le capteur ?",
    image: "", // Pas d'image pour cette question
    options: [
      "La consigne",
      "L'erreur",
      "La grandeur de sortie",
      "La commande"
    ],
    correctAnswer: 2,
    explanation: "Le capteur mesure la valeur réelle en sortie pour la comparer à la consigne."
  }
];

// --- COMPOSANT PRINCIPAL ---
export default function App() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const quizRef = useRef(null);

  // Injection de KaTeX pour le rendu LaTeX
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js';
    script.async = true;
    script.onload = () => {
      const autoRenderScript = document.createElement('script');
      autoRenderScript.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/contrib/auto-render.min.js';
      autoRenderScript.onload = renderMath;
      document.head.appendChild(autoRenderScript);
    };
    document.head.appendChild(script);
  }, []);

  const renderMath = () => {
    if (window.renderMathInElement && quizRef.current) {
      window.renderMathInElement(quizRef.current, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '$', right: '$', display: false }
        ],
        throwOnError: false
      });
    }
  };

  useEffect(() => {
    renderMath();
  }, [currentQuestion, showResult, isAnswered]);

  const handleOptionClick = (index) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);
    if (index === QUIZ_DATA[currentQuestion].correctAnswer) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    const nextQuestion = currentQuestion + 1;
    if (nextQuestion < QUIZ_DATA.length) {
      setCurrentQuestion(nextQuestion);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setShowResult(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    setShowResult(false);
    setSelectedOption(null);
    setIsAnswered(false);
  };

  const progress = ((currentQuestion + 1) / QUIZ_DATA.length) * 100;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 font-sans text-slate-800" ref={quizRef}>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-indigo-700 mb-2">Sciences de l'Ingénieur</h1>
          <p className="text-slate-500">Révisions & Quiz - Préparation Bac / CPGE</p>
        </header>

        {!showResult ? (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
            {/* Progress Bar */}
            <div className="h-2 bg-slate-100">
              <div 
                className="h-full bg-indigo-500 transition-all duration-300" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>

            <div className="p-6 md:p-8">
              <div className="flex justify-between items-center mb-6">
                <span className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                  Question {currentQuestion + 1} / {QUIZ_DATA.length}
                </span>
                <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium">
                  Score: {score}
                </span>
              </div>

              {/* Question Content */}
              <div className="mb-8">
                <h2 className="text-xl md:text-2xl font-semibold mb-6 leading-relaxed">
                  {QUIZ_DATA[currentQuestion].question}
                </h2>

                {QUIZ_DATA[currentQuestion].image && (
                  <div className="mb-6 rounded-lg overflow-hidden border border-slate-200">
                    <img 
                      src={QUIZ_DATA[currentQuestion].image} 
                      alt="Illustration question" 
                      className="w-full h-auto max-h-64 object-contain bg-white"
                      onError={(e) => e.target.style.display = 'none'}
                    />
                  </div>
                )}
              </div>

              {/* Options */}
              <div className="grid gap-3">
                {QUIZ_DATA[currentQuestion].options.map((option, index) => {
                  let buttonClass = "w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center ";
                  
                  if (!isAnswered) {
                    buttonClass += "border-slate-100 hover:border-indigo-200 hover:bg-indigo-50 text-slate-700";
                  } else {
                    if (index === QUIZ_DATA[currentQuestion].correctAnswer) {
                      buttonClass += "border-emerald-500 bg-emerald-50 text-emerald-800";
                    } else if (index === selectedOption) {
                      buttonClass += "border-rose-500 bg-rose-50 text-rose-800";
                    } else {
                      buttonClass += "border-slate-100 text-slate-400 opacity-50";
                    }
                  }

                  return (
                    <button
                      key={index}
                      onClick={() => handleOptionClick(index)}
                      disabled={isAnswered}
                      className={buttonClass}
                    >
                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-white border border-inherit flex items-center justify-center mr-4 font-bold">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className="text-lg">{option}</span>
                    </button>
                  );
                })}
              </div>

              {/* Feedback Section */}
              {isAnswered && (
                <div className="mt-8 p-4 rounded-xl bg-slate-50 border border-slate-200 animate-in fade-in slide-in-from-bottom-2">
                  <p className="font-bold text-slate-700 mb-1">
                    {selectedOption === QUIZ_DATA[currentQuestion].correctAnswer ? "✨ Correct !" : "❌ Incorrect"}
                  </p>
                  <p className="text-slate-600 italic">
                    {QUIZ_DATA[currentQuestion].explanation}
                  </p>
                  <button
                    onClick={handleNext}
                    className="mt-4 w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                  >
                    {currentQuestion + 1 === QUIZ_DATA.length ? "Voir les résultats" : "Question suivante"}
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center border border-slate-100">
            <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold mb-2">Quiz Terminé !</h2>
            <p className="text-slate-500 mb-6">Excellent travail, voici votre score :</p>
            <div className="text-6xl font-black text-indigo-600 mb-8">
              {score} <span className="text-2xl text-slate-400">/ {QUIZ_DATA.length}</span>
            </div>
            <p className="mb-8 text-slate-600">
              {score === QUIZ_DATA.length ? "Parfait ! Vous maîtrisez le sujet." : "Continuez vos efforts de révision !"}
            </p>
            <button
              onClick={resetQuiz}
              className="inline-flex items-center px-6 py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-900 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Recommencer le quiz
            </button>
          </div>
        )}
      </div>
    </div>
  );
}