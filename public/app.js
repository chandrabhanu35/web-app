// ===== CONFIG =====
const API_URL = 'http://localhost:5000/api';
let authToken = localStorage.getItem('authToken');
let currentUser = null;

// ===== AUTH FUNCTIONS =====
function showSignup() {
  document.getElementById('loginForm').classList.add('hidden');
  document.getElementById('signupForm').classList.remove('hidden');
}

function showLogin() {
  document.getElementById('signupForm').classList.add('hidden');
  document.getElementById('loginForm').classList.remove('hidden');
}

async function signup() {
  const name = document.getElementById('signupName').value.trim();
  const email = document.getElementById('signupEmail').value.trim();
  const mobile = document.getElementById('signupMobile').value.trim();
  const password = document.getElementById('signupPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  if (!name || !email || !mobile || !password) {
    alert('Please fill all fields');
    return;
  }

  if (password !== confirmPassword) {
    alert('Passwords do not match');
    return;
  }

  try {
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, mobile, password, confirmPassword })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error);

    authToken = data.token;
    currentUser = data.user;
    localStorage.setItem('authToken', authToken);
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    alert('Account created successfully!');
    showDashboard();
  } catch (error) {
    alert('Signup error: ' + error.message);
  }
}

async function login() {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  if (!email || !password) {
    alert('Please enter email and password');
    return;
  }

  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error);

    authToken = data.token;
    currentUser = data.user;
    localStorage.setItem('authToken', authToken);
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    showDashboard();
  } catch (error) {
    alert('Login error: ' + error.message);
  }
}

function logout() {
  authToken = null;
  currentUser = null;
  localStorage.removeItem('authToken');
  localStorage.removeItem('currentUser');
  
  document.getElementById('authScreen').classList.remove('hidden');
  document.getElementById('mainHeader').classList.add('hidden');
  document.getElementById('dashboardScreen').classList.add('hidden');
  document.getElementById('profileScreen').classList.add('hidden');
  
  showLogin();
}

async function showDashboard() {
  document.getElementById('authScreen').classList.add('hidden');
  document.getElementById('mainHeader').classList.remove('hidden');
  document.getElementById('dashboardScreen').classList.remove('hidden');
  document.getElementById('profileScreen').classList.add('hidden');

  document.getElementById('userName').textContent = currentUser.name;
  document.getElementById('welcomeName').textContent = currentUser.name.split(' ')[0];

  await loadUserStats();
  await loadLeaderboard();
}

async function loadUserStats() {
  try {
    const response = await fetch(`${API_URL}/user/stats`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    if (!response.ok) throw new Error('Failed to load stats');

    const data = await response.json();
    const stats = data.stats || {};

    document.getElementById('testsAttempted').textContent = stats.total_tests || 0;
    document.getElementById('avgScore').textContent = (stats.avg_score || 0).toFixed(1) + '%';
    document.getElementById('bestScore').textContent = (stats.best_score || 0).toFixed(1) + '%';
    document.getElementById('totalQuestions').textContent = stats.total_tests * 50 || 0;
    
    document.getElementById('streakCount').textContent = stats.streak_count || 0;
    document.getElementById('xpDisplay').textContent = stats.experience_points || 0;
    document.getElementById('levelDisplay').textContent = Math.floor((stats.experience_points || 0) / 1000) + 1;
  } catch (error) {
    console.error('Error loading stats:', error);
  }
}

async function loadLeaderboard() {
  try {
    const response = await fetch(`${API_URL}/quiz/leaderboard`);
    if (!response.ok) throw new Error('Failed to load leaderboard');

    const data = await response.json();
    const leaderboard = data.leaderboard || [];

    let html = '<div class="leaderboard"><ol class="leaderboard-list">';
    leaderboard.slice(0, 5).forEach((user, idx) => {
      html += `
        <li>
          <span class="rank">#${user.rank}</span>
          <div class="user">
            <div class="avatar">${user.name.charAt(0).toUpperCase()}</div>
            <span class="name">${user.name}</span>
          </div>
          <div class="score">
            <div class="score-value">${user.total_score || 0}</div>
            <div class="score-percentage">${user.tests_completed || 0} tests</div>
          </div>
        </li>
      `;
    });
    html += '</ol></div>';

    document.getElementById('leaderboard').innerHTML = html;
  } catch (error) {
    console.error('Error loading leaderboard:', error);
  }
}

// ===== QUIZ FUNCTIONS =====
let currentExamType = null;
let currentQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let selectedAnswers = [];
let startTime = null;
let timerInterval = null;

async function startExam(examType) {
  currentExamType = examType;
  currentQuestionIndex = 0;
  score = 0;
  selectedAnswers = [];
  startTime = Date.now();

  try {
    const questionCount = examType === 'government' ? 75 : 50;
    const response = await fetch(`${API_URL}/quiz/questions/${examType}?limit=${questionCount}`);
    
    if (!response.ok) throw new Error('Failed to load questions');

    const data = await response.json();
    currentQuestions = data.questions || [];

    if (currentQuestions.length === 0) {
      alert('No questions available for this exam');
      return;
    }

    const examTitles = {
      'it': 'IT Jobs & Campus Placements',
      'banking': 'Banking Exams',
      'government': 'Government Exams'
    };

    const examTimes = {
      'it': 60,
      'banking': 60,
      'government': 90
    };

    document.getElementById('examTitle').textContent = examTitles[examType];
    document.getElementById('dashboardScreen').classList.add('hidden');
    document.getElementById('quizScreen').classList.remove('hidden');

    startTimer(examTimes[examType]);
    loadQuestion();
  } catch (error) {
    alert('Error starting exam: ' + error.message);
  }
}

function startTimer(minutes) {
  let timeLeft = minutes * 60;
  const timerEl = document.getElementById('timer');

  timerInterval = setInterval(() => {
    timeLeft--;
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    timerEl.textContent = `⏱️ ${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    if (timeLeft <= 300) {
      timerEl.classList.add('warning');
    }

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      finishQuiz();
    }
  }, 1000);
}

function loadQuestion() {
  const question = currentQuestions[currentQuestionIndex];

  document.getElementById('questionCounter').textContent =
    `Question ${currentQuestionIndex + 1} of ${currentQuestions.length}`;
  const progress = ((currentQuestionIndex + 1) / currentQuestions.length) * 100;
  document.getElementById('progressFill').style.width = progress + '%';

  const metaHtml = `
    <span class="badge badge-category">${question.category}</span>
    <span class="badge badge-topic">${question.topic}</span>
    <span class="badge badge-difficulty ${question.difficulty.toLowerCase()}">${question.difficulty}</span>
  `;
  document.getElementById('questionMeta').innerHTML = metaHtml;

  document.getElementById('questionText').textContent = question.question_text;

  const labels = ['A', 'B', 'C', 'D'];
  const options = typeof question.options === 'string' ? JSON.parse(question.options) : question.options;
  const optionsHtml = options.map((option, index) =>
    `<div class="option" data-index="${index}">
      <span class="option-label">${labels[index]}</span>
      <span>${option}</span>
    </div>`
  ).join('');
  document.getElementById('optionsContainer').innerHTML = optionsHtml;

  document.getElementById('explanation').classList.remove('show');

  document.querySelectorAll('.option').forEach(opt => {
    opt.addEventListener('click', selectOption);
  });

  if (currentQuestionIndex === currentQuestions.length - 1) {
    document.getElementById('nextBtn').classList.add('hidden');
    document.getElementById('finishBtn').classList.remove('hidden');
  } else {
    document.getElementById('nextBtn').classList.remove('hidden');
    document.getElementById('finishBtn').classList.add('hidden');
  }
}

function selectOption(e) {
  if (selectedAnswers.length > currentQuestionIndex) {
    return;
  }

  const selectedIndex = parseInt(e.currentTarget.dataset.index);
  const question = currentQuestions[currentQuestionIndex];
  const options = document.querySelectorAll('.option');

  options.forEach(opt => {
    opt.classList.add('disabled');
    opt.style.cursor = 'not-allowed';
  });

  const isCorrect = selectedIndex === question.correct_answer;

  e.currentTarget.classList.add(isCorrect ? 'correct' : 'incorrect');
  if (!isCorrect) {
    options[question.correct_answer].classList.add('correct');
  }

  if (isCorrect) score++;

  selectedAnswers.push({
    questionId: question.id,
    selected: selectedIndex,
    correct: question.correct_answer,
    isCorrect: isCorrect
  });

  document.getElementById('explanation').innerHTML = `
    <h4>${isCorrect ? '✅ Correct!' : '❌ Incorrect'}</h4>
    <p><strong>Explanation:</strong> ${question.explanation}</p>
  `;
  document.getElementById('explanation').classList.add('show');
}

function nextQuestion() {
  if (selectedAnswers.length === currentQuestionIndex + 1) {
    currentQuestionIndex++;
    loadQuestion();
  } else {
    alert('Please select an answer');
  }
}

function quitQuiz() {
  if (confirm('Are you sure? Your progress will be lost.')) {
    clearInterval(timerInterval);
    backToDashboard();
  }
}

function finishQuiz() {
  if (selectedAnswers.length < currentQuestions.length) {
    alert('Please answer all questions');
    return;
  }

  clearInterval(timerInterval);
  showResults();
}

async function showResults() {
  const totalQuestions = currentQuestions.length;
  const percentage = ((score / totalQuestions) * 100).toFixed(1);
  const timeElapsed = Math.floor((Date.now() - startTime) / 1000);
  const minutes = Math.floor(timeElapsed / 60);
  const seconds = timeElapsed % 60;

  document.getElementById('quizScreen').classList.add('hidden');
  document.getElementById('resultsScreen').classList.remove('hidden');

  const examTitles = {
    'it': 'IT Jobs & Campus Placements',
    'banking': 'Banking Exams',
    'government': 'Government Exams'
  };

  document.getElementById('examTypeResult').textContent = examTitles[currentExamType];
  document.getElementById('scoreDisplay').textContent = `${score}/${totalQuestions}`;
  document.getElementById('percentageDisplay').textContent = `${percentage}%`;
  document.getElementById('timeDisplay').textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  let rating = 'Keep Practicing';
  if (percentage >= 90) rating = 'Excellent! 🏆';
  else if (percentage >= 75) rating = 'Very Good 🌟';
  else if (percentage >= 60) rating = 'Good 👍';
  else if (percentage >= 40) rating = 'Fair ⭐';
  document.getElementById('rankDisplay').textContent = rating;

  const categoryStats = {};
  selectedAnswers.forEach((ans, idx) => {
    const q = currentQuestions[idx];
    if (!categoryStats[q.category]) {
      categoryStats[q.category] = { correct: 0, total: 0 };
    }
    categoryStats[q.category].total++;
    if (ans.isCorrect) categoryStats[q.category].correct++;
  });

  let performanceHtml = '';
  for (const [category, stats] of Object.entries(categoryStats)) {
    const catPercent = ((stats.correct / stats.total) * 100).toFixed(0);
    performanceHtml += `
      <div class="performance-item">
        <span>${category}</span>
        <span><strong>${stats.correct}/${stats.total}</strong> (${catPercent}%)</span>
      </div>
    `;
  }
  document.getElementById('performanceBreakdown').innerHTML = performanceHtml;

  // Save result to database
  try {
    await fetch(`${API_URL}/quiz/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        examType: currentExamType,
        score: score,
        totalQuestions: totalQuestions,
        percentage: parseFloat(percentage),
        timeTaken: timeElapsed,
        categoryScores: categoryStats,
        answers: selectedAnswers
      })
    });
  } catch (error) {
    console.error('Error saving result:', error);
  }
}

function backToDashboard() {
  document.getElementById('resultsScreen').classList.add('hidden');
  document.getElementById('quizScreen').classList.add('hidden');
  document.getElementById('dashboardScreen').classList.remove('hidden');
  loadUserStats();
}

function retakeExam() {
  startExam(currentExamType);
  document.getElementById('resultsScreen').classList.add('hidden');
}

function editProfile() {
  alert('Edit profile feature coming soon!');
}

// ===== INITIALIZATION =====
window.addEventListener('load', async () => {
  const savedToken = localStorage.getItem('authToken');
  const savedUser = localStorage.getItem('currentUser');

  if (savedToken && savedUser) {
    authToken = savedToken;
    currentUser = JSON.parse(savedUser);
    showDashboard();
  }
});
