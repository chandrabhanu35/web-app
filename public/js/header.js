const header = document.querySelector('.header');

if (header) {
    header.innerHTML = `
        <div class="header-content">
            <a href="/" class="logo">
                <span>🎯</span>
                <span>AptitudePro</span>
            </a>
            <nav class="nav-links">
                <a href="/" class="nav-link">Home</a>
                <a href="/dashboard" class="nav-link">Dashboard</a>
                <a href="/practice" class="nav-link">Practice</a>
                <a href="/leaderboard" class="nav-link">Leaderboard</a>
                <a href="/profile" class="nav-link">Profile</a>
            </nav>
        </div>
    `;

    // Highlight active page
    const currentPath = window.location.pathname;
    const links = document.querySelectorAll('.nav-link');
    links.forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        }
    });
}