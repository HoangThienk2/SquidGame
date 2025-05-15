class Navigation {
    constructor() {
        this.pages = {
            'earn': 'earn.html',
            'game 2': 'game2.html',
            'exchange': 'exchange.html',
            'boost': 'boost.html',
            'point': 'point.html',
            'help': 'help.html'
        };
        this.currentPage = 'earn';
        this.init();
    }

    init() {
        // Add navigation event listeners
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                const pageName = item.querySelector('span:last-child').textContent.trim();
                this.navigateTo(pageName);
            });
        });

        // Set initial active state based on current page
        this.setActiveState();
    }

    navigateTo(pageName) {
        // Update active state in navigation
        document.querySelectorAll('.nav-item').forEach(nav => {
            const navPageName = nav.querySelector('span:last-child').textContent.trim();
            if (navPageName === pageName) {
                nav.classList.add('active');
            } else {
                nav.classList.remove('active');
            }
        });

        // Navigate to the selected page
        const targetPage = this.pages[pageName];
        if (targetPage) {
            // Add page transition effect
            const pageTransition = document.getElementById('page-transition');
            pageTransition.classList.add('active');

            // After transition animation, change page
            setTimeout(() => {
                window.location.href = targetPage;
            }, 500);
        }
    }

    setActiveState() {
        // Get current page from URL
        const currentPath = window.location.pathname;
        const currentPage = currentPath.split('/').pop().replace('.html', '');
        
        // Set active state for current page
        document.querySelectorAll('.nav-item').forEach(nav => {
            const navPageName = nav.querySelector('span:last-child').textContent.trim();
            if (navPageName === currentPage || 
                (currentPage === 'index' && navPageName === 'earn')) {
                nav.classList.add('active');
            } else {
                nav.classList.remove('active');
            }
        });
    }
}

// Initialize navigation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Navigation();
}); 