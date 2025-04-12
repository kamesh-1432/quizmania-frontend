import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import Confetti from 'react-confetti';
import { AuthContext } from '../context/AuthContext';

const QuizPage = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(30);
  const [showConfetti, setShowConfetti] = useState(false);

  // ... (fetchQuiz, useEffect, handleAnswer, handleTimeout)

  const calculateScore = async (finalAnswers) => {
    const calculatedScore = finalAnswers.reduce((acc, ans, i) => 
      ans && ans === quiz.questions[i].correctAnswer ? acc + 1 : acc, 0);
    setScore(calculatedScore);
    toast.success(`Quiz completed! Score: ${calculatedScore}/${quiz.questions.length}`);
    if (calculatedScore / quiz.questions.length >= 0.8) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/scores', {
        quizId,
        score: calculatedScore,
        totalQuestions: quiz.questions.length,
      }, {
        headers: { 'x-auth-token': token },
      });
      toast.success('Score saved!');
    } catch (err) {
      toast.error('Failed to save score');
    }
  };

  if (score !== null) {
    return (
      <div className="container my-5 text-center">
        {showConfetti && <Confetti />}
        <h2 className="mb-4">Quiz Completed!</h2>
        <p className="display-4">Score: {score}/{quiz.questions.length}</p>
        <button
          className="btn btn-primary mt-3 me-2"
          onClick={() => navigate('/quizzes')}
        >
          Back to Quizzes
        </button>
        <button
          className="btn btn-secondary mt-3"
          onClick={() => navigate('/profile')}
        >
          View Profile
        </button>
      </div>
    );
  }

  const question = quiz.questions[currentQuestion];

  return (
    <motion.div
      className="container my-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-center mb-4">{quiz.title || 'Quiz'}</h2>
      <div className="progress mb-4">
        <div
          className="progress-bar bg-primary"
          style={{ width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%` }}
        >
          {currentQuestion + 1}/{quiz.questions.length}
        </div>
      </div>
      <div className="text-center mb-4">
        <p className={`text-${timeLeft <= 10 ? 'danger' : 'primary'}`}>
          Time Left: {timeLeft}s
        </p>
      </div>
      <motion.div
        className="card shadow-sm"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        <div className="card-body">
          <h5 className="card-title">
            Question {currentQuestion + 1} of {quiz.questions.length}
          </h5>
          <p className="card-text">{question.questionText || 'No question'}</p>
          <div className="d-flex flex-column">
            {question.options && question.options.length > 0 ? (
              question.options.map((option, index) => (
                <motion.button
                  key={index}
                  className="btn btn-outline-primary mb-2"
                  onClick={() => handleAnswer(option)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {option}
                </motion.button>
              ))
            ) : (
              <p>No options available</p>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default QuizPage;