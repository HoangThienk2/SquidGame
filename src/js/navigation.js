class Navigation {
    constructor() {
        this.pages = {
            'earn': document.getElementById('earn-page'),
            'game2': document.getElementById('game2-page')
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

        // Show initial page
        this.showPage(this.currentPage);
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

        // Show the selected page
        this.showPage(pageName);
    }

    showPage(pageName) {
        // Hide all pages
        Object.values(this.pages).forEach(page => {
            if (page) {
                page.style.display = 'none';
            }
        });

        // Show selected page
        const selectedPage = this.pages[pageName];
        if (selectedPage) {
            selectedPage.style.display = 'block';
            this.currentPage = pageName;
        }
    }
}

// Initialize navigation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Navigation();
}); 