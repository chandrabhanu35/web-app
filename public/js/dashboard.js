// Real-time stats management
let ws = null;

function initializeWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws?token=${authToken}`;
    
    ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === 'stats_update') {
            updateDashboardStats(data.data);
        }
    };

    ws.onclose = () => {
        // Attempt to reconnect after 5 seconds
        setTimeout(initializeWebSocket, 5000);
    };
}

function updateDashboardStats(stats) {
    // Update performance metrics
    document.getElementById('testsAttempted').textContent = stats.total_tests || 0;
    document.getElementById('avgScore').textContent = (stats.avg_score || 0).toFixed(1) + '%';
    document.getElementById('bestScore').textContent = (stats.best_score || 0).toFixed(1) + '%';
    document.getElementById('totalQuestions').textContent = stats.total_questions_solved || 0;
    
    // Update streak and XP
    document.getElementById('streakCount').textContent = stats.streak_count || 0;
    document.getElementById('xpDisplay').textContent = stats.experience_points || 0;
    document.getElementById('levelDisplay').textContent = Math.floor((stats.experience_points || 0) / 1000) + 1;

    // Update category performance
    if (stats.category_performance) {
        updateCategoryPerformance(stats.category_performance);
    }

    // Update recent activity
    if (stats.recent_activity && stats.recent_activity.length > 0) {
        updateRecentActivity(stats.recent_activity);
    }
}

function updateCategoryPerformance(performance) {
    const container = document.getElementById('categoryPerformance');
    if (!container) return;

    let html = '<div class="category-performance">';
    
    for (const [category, stats] of Object.entries(performance)) {
        const percentage = ((stats.correct / stats.total) * 100).toFixed(1);
        html += `
            <div class="category-item">
                <div class="category-header">
                    <span class="category-name">${category}</span>
                    <span class="category-score">${percentage}%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${percentage}%"></div>
                </div>
                <div class="category-details">
                    ${stats.correct}/${stats.total} correct
                </div>
            </div>
        `;
    }
    
    html += '</div>';
    container.innerHTML = html;
}

function updateRecentActivity(activities) {
    const container = document.getElementById('recentActivity');
    if (!container) return;

    let html = '<div class="recent-activity">';
    
    activities.forEach(activity => {
        const date = new Date(activity.created_at).toLocaleDateString();
        html += `
            <div class="activity-item">
                <div class="activity-header">
                    <span class="exam-type">${activity.exam_type}</span>
                    <span class="activity-date">${date}</span>
                </div>
                <div class="activity-score">
                    Score: ${activity.percentage}%
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

// Experience points and level system
const XP_REWARDS = {
    COMPLETE_TEST: 100,
    CORRECT_ANSWER: 10,
    STREAK_BONUS: 50,
    PERFECT_SCORE: 200
};

function calculateXPGain(result) {
    let xp = XP_REWARDS.COMPLETE_TEST;
    
    // XP for correct answers
    xp += result.score * XP_REWARDS.CORRECT_ANSWER;
    
    // Perfect score bonus
    if (result.score === result.totalQuestions) {
        xp += XP_REWARDS.PERFECT_SCORE;
    }
    
    // Streak bonus
    if (currentUser.streak_count > 0) {
        xp += XP_REWARDS.STREAK_BONUS;
    }
    
    return xp;
}

// Enhanced exam preparation
function updateExamInfo(examType) {
    const examInfoContainer = document.getElementById(`${examType}Info`);
    if (!examInfoContainer) return;

    // Get user's performance in this exam type
    fetch(`${API_URL}/user/exam-stats/${examType}`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
    })
    .then(response => response.json())
    .then(data => {
        const stats = data.stats;
        examInfoContainer.innerHTML = `
            <div class="exam-stats">
                <div class="stat-item">
                    <span class="stat-label">Best Score</span>
                    <span class="stat-value">${stats.best_score || 0}%</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Attempts</span>
                    <span class="stat-value">${stats.attempts || 0}</span>
                </div>
                <div class="progress-indicator">
                    <div class="progress-bar">
                        <div class="progress-fill" 
                             style="width: ${stats.completion_rate || 0}%">
                        </div>
                    </div>
                    <span class="progress-label">
                        ${stats.completion_rate || 0}% Complete
                    </span>
                </div>
            </div>
        `;
    })
    .catch(console.error);
}

// Initialize dashboard with real-time updates
window.addEventListener('load', () => {
    const savedToken = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('currentUser');

    if (savedToken && savedUser) {
        authToken = savedToken;
        currentUser = JSON.parse(savedUser);
        showDashboard();
        initializeWebSocket();
        
        // Update exam type information
        ['it', 'banking', 'government'].forEach(updateExamInfo);
    }
});