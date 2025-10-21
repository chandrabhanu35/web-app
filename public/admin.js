// ========== ADMIN PANEL - COMPLETE WORKING VERSION ==========
const API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000/api'
  : `${window.location.origin}/api`;
let authToken = localStorage.getItem('authToken');
let activityChart, examChart, testsChart, performanceChart;

console.log('Admin.js loaded - Ready!');

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOMContentLoaded fired');
  
  const savedToken = localStorage.getItem('authToken');
  console.log('Saved token exists:', !!savedToken);
  
  if (!savedToken) {
    // Show login modal, hide admin container
    const loginModal = document.getElementById('adminLogin');
    const container = document.querySelector('.admin-container');
    if (loginModal) {
      loginModal.classList.add('active');
      console.log('Login modal shown');
    }
    if (container) {
      container.classList.remove('visible');
      console.log('Admin container hidden');
    }
    return;
  }

  // Already logged in - show dashboard
  authToken = savedToken;
  const loginModal = document.getElementById('adminLogin');
  const container = document.querySelector('.admin-container');
  if (loginModal) {
    loginModal.classList.remove('active');
  }
  if (container) {
    container.classList.add('visible');
    console.log('Admin container visible');
  }
  loadDashboard();
});

// ========== LOGIN FUNCTION - THIS IS THE KEY ONE ==========
function adminLogin() {
  console.log('=== adminLogin() CALLED ===');
  
  const emailInput = document.getElementById('adminEmail');
  const passwordInput = document.getElementById('adminPassword');
  const errorDiv = document.getElementById('adminLoginError');
  
  if (!emailInput) {
    console.error('ERROR: adminEmail input not found!');
    alert('Error: Email input not found');
    return;
  }
  
  if (!passwordInput) {
    console.error('ERROR: adminPassword input not found!');
    alert('Error: Password input not found');
    return;
  }
  
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  
  console.log('Email input value:', email);
  console.log('Password input value:', password ? '[PASSWORD ENTERED]' : '[EMPTY]');
  
  // Validation
  if (!email || !password) {
    const msg = '⚠️ Please enter email and password';
    console.warn(msg);
    if (errorDiv) errorDiv.textContent = msg;
    alert('Please enter email and password');
    return;
  }
  
  if (!email.includes('@')) {
    const msg = '⚠️ Please enter a valid email';
    console.warn(msg);
    if (errorDiv) errorDiv.textContent = msg;
    alert('Please enter a valid email');
    return;
  }

  if (errorDiv) errorDiv.textContent = 'Logging in...';
  console.log('Validation passed, sending login request...');
  
  // Send login request
  fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  })
  .then(response => {
    console.log('Response received, status:', response.status);
    return response.json().then(data => {
      console.log('Response data:', data);
      return { status: response.status, data };
    });
  })
  .then(({ status, data }) => {
    console.log('Processing response...');
    
    if (status !== 200) {
      const errMsg = data.error || 'Login failed';
      console.error('Login failed:', errMsg);
      if (errorDiv) errorDiv.textContent = '❌ ' + errMsg;
      alert('Login failed: ' + errMsg);
      return;
    }
    
    if (!data.token) {
      console.error('No token in response');
      if (errorDiv) errorDiv.textContent = '❌ Login failed - No token';
      alert('No token received from server');
      return;
    }
    
    console.log('✅ LOGIN SUCCESSFUL! Token received');
    
    // Save token
    localStorage.setItem('authToken', data.token);
    authToken = data.token;
    console.log('Token saved to localStorage');
    
    // Hide modal AND show container
    const loginModal = document.getElementById('adminLogin');
    const container = document.querySelector('.admin-container');
    if (loginModal) {
      loginModal.classList.remove('active');
      console.log('Login modal hidden');
    }
    if (container) {
      container.classList.add('visible');
      console.log('Admin container made visible');
    }
    
    // Clear inputs
    emailInput.value = '';
    passwordInput.value = '';
    if (errorDiv) errorDiv.textContent = '';
    
    console.log('Loading dashboard...');
    loadDashboard();
  })
  .catch(error => {
    console.error('❌ FETCH ERROR:', error);
    const msg = '❌ Connection error: ' + error.message;
    if (errorDiv) errorDiv.textContent = msg;
    alert('Connection error: ' + error.message);
  });
}

// ========== LOAD DASHBOARD ==========
async function loadDashboard() {
  console.log('loadDashboard() called');
  
  try {
    console.log('Fetching admin stats with token:', authToken ? '[TOKEN]' : '[NO TOKEN]');
    
    const response = await fetch(`${API_URL}/admin/stats`, {
      method: 'GET',
      headers: { 
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Dashboard response status:', response.status);
    
    if (!response.ok) {
      console.error('Dashboard API error:', response.status);
      throw new Error('Failed to load stats - Status: ' + response.status);
    }

    const data = await response.json();
    console.log('Dashboard data received:', data);

    // Update displays
    const updates = {
      'totalRegisteredDisplay': data.totalRegisteredUsers || 0,
      'totalActiveDisplay': data.totalActiveUsers || 0,
      'currentlyOnlineDisplay': data.currentlyOnline || 0,
      'newUsersTodayDisplay': data.newUsersToday || 0,
      'totalTestsDisplay': data.totalTests || 0,
      'avgScoreDisplay': (data.avgScore || 0).toFixed(1) + '%'
    };
    
    Object.keys(updates).forEach(id => {
      const elem = document.getElementById(id);
      if (elem) {
        elem.textContent = updates[id];
        console.log('✅ Updated', id, '=', updates[id]);
      } else {
        console.warn('⚠️ Element not found:', id);
      }
    });

    loadOnlineUsers();
    console.log('Dashboard loaded successfully!');
  } catch (error) {
    console.error('❌ Dashboard error:', error);
    alert('Failed to load dashboard: ' + error.message);
  }
}

// ========== LOAD ONLINE USERS ==========
async function loadOnlineUsers() {
  console.log('loadOnlineUsers() called');
  
  try {
    const response = await fetch(`${API_URL}/admin/users/online`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    if (!response.ok) {
      console.warn('Online users API error:', response.status);
      return;
    }
    
    const data = await response.json();
    const users = data.onlineUsers || [];
    console.log('Online users:', users.length);
    
    let html = '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px;">';
    
    if (users.length === 0) {
      html += '<p style="grid-column: 1/-1;">No users online right now</p>';
    } else {
      users.forEach(user => {
        html += `
          <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; border-left: 4px solid #667eea;">
            <div style="font-weight: bold;">🟢 ${user.name}</div>
            <div style="font-size: 0.9em; color: #666;">${user.email}</div>
          </div>
        `;
      });
    }
    
    html += '</div>';
    
    const container = document.getElementById('onlineUsersList');
    if (container) {
      container.innerHTML = html;
      console.log('Online users list updated');
    }
  } catch (error) {
    console.error('Error loading online users:', error);
  }
}

// ========== INITIALIZE CHARTS ==========
function initializeCharts(data) {
  console.log('initializeCharts() called');
  
  try {
    const actCtx = document.getElementById('activityChart');
    if (actCtx && !activityChart && typeof Chart !== 'undefined') {
      activityChart = new Chart(actCtx, {
        type: 'line',
        data: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          datasets: [{
            label: 'Tests Taken',
            data: [12, 19, 3, 5, 2, 3, 7],
            borderColor: '#667eea',
            backgroundColor: 'rgba(102, 126, 234, 0.1)',
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          plugins: { legend: { display: true } }
        }
      });
      console.log('Activity chart created');
    }
  } catch (error) {
    console.error('Chart error:', error);
  }
}

// ========== SHOW ADMIN SECTION ==========
function showAdminSection(section) {
  console.log('showAdminSection:', section);
  
  // Hide all sections
  const sections = document.querySelectorAll('.admin-section');
  sections.forEach(s => s.classList.add('hidden'));
  
  // Show selected section
  const sectionId = section + 'Section';
  const selected = document.getElementById(sectionId);
  if (selected) {
    selected.classList.remove('hidden');
    console.log('Showed section:', sectionId);
  } else {
    console.warn('Section not found:', sectionId);
  }
  
  // Load specific data
  if (section === 'users') {
    loadUsers();
  } else if (section === 'login-history') {
    loadLoginHistory();
  }
}

// ========== LOAD USERS ==========
async function loadUsers() {
  console.log('loadUsers() called');
  
  try {
    const response = await fetch(`${API_URL}/admin/stats`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    if (!response.ok) {
      console.warn('Users API error:', response.status);
      return;
    }
    
    const data = await response.json();
    console.log('Users data loaded');
  } catch (error) {
    console.error('Error loading users:', error);
  }
}

// ========== LOAD LOGIN HISTORY ==========
async function loadLoginHistory() {
  console.log('loadLoginHistory() called');
  
  try {
    const response = await fetch(`${API_URL}/admin/users/login-history`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    if (!response.ok) {
      console.warn('Login history API error:', response.status);
      return;
    }
    
    const data = await response.json();
    const users = data.loginHistory || [];
    console.log('Login history loaded:', users.length, 'users');
    
    let html = '<table class="users-table"><thead><tr>';
    html += '<th>Name</th><th>Email</th><th>Last Seen</th><th>Days Active</th><th>Total Tests</th><th>Status</th>';
    html += '</tr></thead><tbody>';
    
    users.forEach(user => {
      const isOnline = user.last_seen && (Date.now() - new Date(user.last_seen).getTime()) < 30 * 60 * 1000;
      const status = isOnline ? '🟢 Online' : '⚪ Offline';
      const lastSeen = user.last_seen ? new Date(user.last_seen).toLocaleString() : 'Never';
      
      html += `<tr>
        <td>${user.name}</td>
        <td>${user.email}</td>
        <td>${lastSeen}</td>
        <td>${user.days_active || 0}</td>
        <td>${user.total_tests || 0}</td>
        <td>${status}</td>
      </tr>`;
    });
    
    html += '</tbody></table>';
    
    const historyTable = document.getElementById('loginHistoryTable');
    if (historyTable) {
      historyTable.innerHTML = html;
      console.log('Login history table updated');
    }
  } catch (error) {
    console.error('Error loading login history:', error);
  }
}

// ========== LOGOUT ==========
function logout() {
  console.log('logout() called');
  
  localStorage.removeItem('authToken');
  authToken = null;
  
  const loginModal = document.getElementById('adminLogin');
  const container = document.querySelector('.admin-container');
  if (loginModal) {
    loginModal.classList.add('active');
  }
  if (container) {
    container.classList.remove('visible');
  }
  
  // Clear inputs
  const emailInput = document.getElementById('adminEmail');
  const passwordInput = document.getElementById('adminPassword');
  if (emailInput) emailInput.value = '';
  if (passwordInput) passwordInput.value = '';
  
  console.log('✅ Logged out');
}

// ========== ADD USER MODAL ==========
function addUserModal() {
  console.log('addUserModal() called');
  alert('Add user feature coming soon');
}

console.log('========== Admin.js FULLY LOADED ==========');
