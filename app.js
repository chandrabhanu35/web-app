// User data storage
let currentUser = null;
let users = JSON.parse(localStorage.getItem('aptitude_users') || '{}');
let userHistory = JSON.parse(localStorage.getItem('user_history') || '{}');

// Quiz state
let currentExamType = null;
let currentQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let selectedAnswers = [];
let startTime = null;
let timerInterval = null;

// ===== AUTH FUNCTIONS =====
function showSignup() {
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('signupForm').classList.remove('hidden');
}

function showLogin() {
    document.getElementById('signupForm').classList.add('hidden');
    document.getElementById('loginForm').classList.remove('hidden');
}

function signup() {
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const mobile = document.getElementById('signupMobile').value.trim();
    const password = document.getElementById('signupPassword').value;

    if (!name || !email || !mobile || !password) {
        alert('Please fill all fields');
        return;
    }

    if (users[email]) {
        alert('Email already registered. Please login.');
        return;
    }

    users[email] = {
        name: name,
        email: email,
        mobile: mobile,
        password: password,
        joinDate: new Date().toISOString()
    };

    localStorage.setItem('aptitude_users', JSON.stringify(users));
    alert('Account created successfully! Please login.');
    showLogin();
    
    // Clear form
    document.getElementById('signupName').value = '';
    document.getElementById('signupEmail').value = '';
    document.getElementById('signupMobile').value = '';
    document.getElementById('signupPassword').value = '';
}

function login() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
        alert('Please enter email and password');
        return;
    }

    const user = users[email];
    if (!user || user.password !== password) {
        alert('Invalid credentials. Please try again.');
        return;
    }

    currentUser = email;
    localStorage.setItem('current_user', email);
    showDashboard();
}

function logout() {
    currentUser = null;
    localStorage.removeItem('current_user');
    document.getElementById('authScreen').classList.remove('hidden');
    document.getElementById('mainHeader').classList.add('hidden');
    document.getElementById('dashboardScreen').classList.add('hidden');
    
    // Clear auth forms
    document.getElementById('loginEmail').value = '';
    document.getElementById('loginPassword').value = '';
    
    showLogin();
}

function showDashboard() {
    document.getElementById('authScreen').classList.add('hidden');
    document.getElementById('mainHeader').classList.remove('hidden');
    document.getElementById('dashboardScreen').classList.remove('hidden');
    
    const user = users[currentUser];
    document.getElementById('userName').textContent = user.name;
    
    updateUserStats();
}

function updateUserStats() {
    const history = userHistory[currentUser] || [];
    const testsAttempted = history.length;
    const totalScore = history.reduce((sum, test) => sum + test.percentage, 0);
    const avgScore = testsAttempted > 0 ? (totalScore / testsAttempted).toFixed(1) : 0;
    const bestScore = testsAttempted > 0 ? Math.max(...history.map(t => t.percentage)).toFixed(1) : 0;
    const totalQuestions = history.reduce((sum, test) => sum + test.totalQuestions, 0);

    document.getElementById('testsAttempted').textContent = testsAttempted;
    document.getElementById('avgScore').textContent = avgScore + '%';
    document.getElementById('bestScore').textContent = bestScore + '%';
    document.getElementById('totalQuestions').textContent = totalQuestions;
}

// ===== EXAM FUNCTIONS =====
function startExam(examType) {
    currentExamType = examType;
    
    // Filter questions by exam type
    let examQuestions = questionBank.filter(q => q.examType === examType);
    
    // Randomly select questions (50 for IT/Banking, 75 for Government)
    const questionCount = examType === 'government' ? 75 : 50;
    currentQuestions = shuffleArray(examQuestions).slice(0, Math.min(questionCount, examQuestions.length));
    
    // Reset state
    currentQuestionIndex = 0;
    score = 0;
    selectedAnswers = [];
    startTime = Date.now();
    
    // Set exam title and time
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
    
    // Show quiz screen
    document.getElementById('dashboardScreen').classList.add('hidden');
    document.getElementById('quizScreen').classList.remove('hidden');
    
    // Start timer
    startTimer(examTimes[examType]);
    
    // Load first question
    loadQuestion();
}

function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
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
    
    // Update counter and progress
    document.getElementById('questionCounter').textContent = 
        `Question ${currentQuestionIndex + 1} of ${currentQuestions.length}`;
    const progress = ((currentQuestionIndex + 1) / currentQuestions.length) * 100;
    document.getElementById('progressFill').style.width = progress + '%';
    
    // Load question meta
    const metaHtml = `
        <span class="badge badge-category">${question.category}</span>
        <span class="badge badge-topic">${question.topic}</span>
        <span class="badge badge-difficulty ${question.difficulty.toLowerCase()}">${question.difficulty}</span>
    `;
    document.getElementById('questionMeta').innerHTML = metaHtml;
    
    // Load question text
    document.getElementById('questionText').textContent = question.question;
    
    // Load options
    const labels = ['A', 'B', 'C', 'D'];
    const optionsHtml = question.options.map((option, index) => 
        `<div class="option" data-index="${index}">
            <span class="option-label">${labels[index]}</span>
            <span>${option}</span>
        </div>`
    ).join('');
    document.getElementById('optionsContainer').innerHTML = optionsHtml;
    
    // Hide explanation
    document.getElementById('explanation').classList.remove('show');
    
    // Add click handlers
    document.querySelectorAll('.option').forEach(opt => {
        opt.addEventListener('click', selectOption);
    });
    
    // Show/hide buttons
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
    
    const isCorrect = selectedIndex === question.correctAnswer;
    
    e.currentTarget.classList.add(isCorrect ? 'correct' : 'incorrect');
    if (!isCorrect) {
        options[question.correctAnswer].classList.add('correct');
    }
    
    if (isCorrect) score++;
    
    selectedAnswers.push({
        questionId: question.id,
        selected: selectedIndex,
        correct: question.correctAnswer,
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
        alert('Please select an answer before moving to the next question.');
    }
}

function quitQuiz() {
    if (confirm('Are you sure you want to quit? Your progress will be lost.')) {
        clearInterval(timerInterval);
        backToDashboard();
    }
}

function finishQuiz() {
    if (selectedAnswers.length < currentQuestions.length) {
        alert('Please answer all questions before finishing.');
        return;
    }
    
    clearInterval(timerInterval);
    showResults();
}

function showResults() {
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
    
    // Performance rating
    let rating = 'Keep Practicing';
    if (percentage >= 90) rating = 'Excellent! 🏆';
    else if (percentage >= 75) rating = 'Very Good 🌟';
    else if (percentage >= 60) rating = 'Good 👍';
    else if (percentage >= 40) rating = 'Fair ⭐';
    document.getElementById('rankDisplay').textContent = rating;
    
    // Category breakdown
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
    
    // Save to history
    if (!userHistory[currentUser]) {
        userHistory[currentUser] = [];
    }
    userHistory[currentUser].push({
        examType: currentExamType,
        score: score,
        totalQuestions: totalQuestions,
        percentage: parseFloat(percentage),
        timeElapsed: timeElapsed,
        date: new Date().toISOString()
    });
    localStorage.setItem('user_history', JSON.stringify(userHistory));
}

function backToDashboard() {
    document.getElementById('resultsScreen').classList.add('hidden');
    document.getElementById('quizScreen').classList.add('hidden');
    document.getElementById('dashboardScreen').classList.remove('hidden');
    updateUserStats();
}

function retakeExam() {
    startExam(currentExamType);
    document.getElementById('resultsScreen').classList.add('hidden');
}

// ===== INITIALIZATION =====
window.addEventListener('load', function() {
    const savedUser = localStorage.getItem('current_user');
    if (savedUser && users[savedUser]) {
        currentUser = savedUser;
        showDashboard();
    }
});
