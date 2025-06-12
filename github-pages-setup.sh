#!/bin/bash

echo "🐙 GitHub Pages Setup for SquidGame"
echo "==================================="

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🎯 GitHub Pages Options:${NC}"
echo "1. 🆓 GitHub Subdomain (username.github.io) - Instant"
echo "2. 🌐 Custom Domain + GitHub Pages - Professional"
echo ""

read -p "Choose option (1 or 2): " OPTION

if [ "$OPTION" = "1" ]; then
    echo ""
    echo -e "${YELLOW}📋 OPTION 1: GitHub Subdomain Setup${NC}"
    echo ""
    
    read -p "Enter your GitHub username: " GITHUB_USERNAME
    
    if [ -z "$GITHUB_USERNAME" ]; then
        echo -e "${RED}❌ GitHub username required!${NC}"
        exit 1
    fi
    
    GITHUB_DOMAIN="${GITHUB_USERNAME}.github.io"
    
    echo ""
    echo -e "${BLUE}📋 STEP 1: Create GitHub Repository${NC}"
    echo "1. Go to github.com and login"
    echo "2. Click 'New Repository'"
    echo "3. Repository name: ${GITHUB_USERNAME}.github.io"
    echo "4. Make it Public"
    echo "5. Initialize with README"
    echo "6. Click 'Create Repository'"
    echo ""
    
    echo -e "${BLUE}📋 STEP 2: Prepare SquidGame Files${NC}"
    echo "Creating GitHub Pages compatible version..."
    
    # Create GitHub Pages version
    mkdir -p github-pages
    
    # Copy and modify index.html for GitHub Pages
    cp public/index.html github-pages/index.html
    
    # Create GitHub Pages compatible API (using GitHub API or external service)
    cat > github-pages/api.js << 'GITHUB_API'
// GitHub Pages API Replacement
// Since GitHub Pages only serves static files, we'll use external services

class SquidGameAPI {
    constructor() {
        this.baseURL = 'https://api.github.com/repos/' + this.getRepoPath() + '/contents/data';
        this.token = localStorage.getItem('github_token'); // User needs to provide
    }
    
    getRepoPath() {
        // Extract repo path from current URL
        const hostname = window.location.hostname;
        if (hostname.includes('github.io')) {
            const parts = hostname.split('.');
            return parts[0] + '/' + parts[0] + '.github.io';
        }
        return 'username/username.github.io'; // fallback
    }
    
    async saveUserData(userId, data) {
        // Save to GitHub repository as JSON file
        const filename = `user_${userId}.json`;
        const content = btoa(JSON.stringify(data)); // base64 encode
        
        try {
            const response = await fetch(`${this.baseURL}/${filename}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${this.token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: `Update user data for ${userId}`,
                    content: content
                })
            });
            
            return response.ok;
        } catch (error) {
            console.error('Save error:', error);
            return false;
        }
    }
    
    async loadUserData(userId) {
        const filename = `user_${userId}.json`;
        
        try {
            const response = await fetch(`${this.baseURL}/${filename}`);
            if (response.ok) {
                const data = await response.json();
                return JSON.parse(atob(data.content)); // decode base64
            }
        } catch (error) {
            console.error('Load error:', error);
        }
        
        return null;
    }
}

// Alternative: Use external services
class ExternalAPI {
    constructor() {
        // Use services like JSONBin, Firebase, or Supabase
        this.baseURL = 'https://api.jsonbin.io/v3/b';
        this.apiKey = 'YOUR_JSONBIN_API_KEY'; // User needs to get this
    }
    
    async saveUserData(userId, data) {
        try {
            const response = await fetch(`${this.baseURL}/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Master-Key': this.apiKey
                },
                body: JSON.stringify(data)
            });
            
            return response.ok;
        } catch (error) {
            console.error('Save error:', error);
            return false;
        }
    }
    
    async loadUserData(userId) {
        try {
            const response = await fetch(`${this.baseURL}/${userId}/latest`, {
                headers: {
                    'X-Master-Key': this.apiKey
                }
            });
            
            if (response.ok) {
                const result = await response.json();
                return result.record;
            }
        } catch (error) {
            console.error('Load error:', error);
        }
        
        return null;
    }
}

// Export for use in main game
window.SquidGameAPI = SquidGameAPI;
window.ExternalAPI = ExternalAPI;
GITHUB_API
    
    # Create deployment script
    cat > github-pages/deploy.sh << 'DEPLOY_SCRIPT'
#!/bin/bash

echo "🚀 Deploying to GitHub Pages..."

# Initialize git if not already
if [ ! -d ".git" ]; then
    git init
    git remote add origin https://github.com/USERNAME/USERNAME.github.io.git
fi

# Add all files
git add .

# Commit changes
git commit -m "Deploy SquidGame to GitHub Pages - $(date)"

# Push to GitHub
git push -u origin main

echo "✅ Deployed to GitHub Pages!"
echo "🌐 Your game will be available at: https://USERNAME.github.io"
DEPLOY_SCRIPT
    
    chmod +x github-pages/deploy.sh
    
    echo ""
    echo -e "${BLUE}📋 STEP 3: Upload to GitHub${NC}"
    echo "1. Download the 'github-pages' folder"
    echo "2. Go to your repository: github.com/${GITHUB_USERNAME}/${GITHUB_USERNAME}.github.io"
    echo "3. Upload all files from 'github-pages' folder"
    echo "4. Or use git commands:"
    echo "   cd github-pages"
    echo "   git init"
    echo "   git remote add origin https://github.com/${GITHUB_USERNAME}/${GITHUB_USERNAME}.github.io.git"
    echo "   git add ."
    echo "   git commit -m 'Deploy SquidGame'"
    echo "   git push -u origin main"
    echo ""
    
    echo -e "${GREEN}🎉 GitHub Pages Setup Complete!${NC}"
    echo ""
    echo -e "${GREEN}🌐 Your SquidGame URLs:${NC}"
    echo "• https://${GITHUB_DOMAIN}"
    echo "• https://${GITHUB_DOMAIN}/index.html"
    echo ""
    
elif [ "$OPTION" = "2" ]; then
    echo ""
    echo -e "${YELLOW}📋 OPTION 2: Custom Domain + GitHub Pages${NC}"
    echo ""
    
    read -p "Enter your GitHub username: " GITHUB_USERNAME
    read -p "Enter your custom domain (e.g., squidgame.tk): " CUSTOM_DOMAIN
    
    if [ -z "$GITHUB_USERNAME" ] || [ -z "$CUSTOM_DOMAIN" ]; then
        echo -e "${RED}❌ Both GitHub username and domain required!${NC}"
        exit 1
    fi
    
    echo ""
    echo -e "${BLUE}📋 STEP 1: Get Free Domain${NC}"
    echo "Get a free domain from:"
    echo "• Freenom: ${CUSTOM_DOMAIN} (.tk, .ml, .ga, .cf)"
    echo "• No-IP: ${CUSTOM_DOMAIN} (.ddns.net)"
    echo "• DuckDNS: ${CUSTOM_DOMAIN} (.duckdns.org)"
    echo ""
    
    echo -e "${BLUE}📋 STEP 2: Create GitHub Repository${NC}"
    echo "1. Go to github.com and login"
    echo "2. Create repository: ${GITHUB_USERNAME}/${CUSTOM_DOMAIN}"
    echo "3. Make it Public"
    echo "4. Enable GitHub Pages in Settings"
    echo ""
    
    echo -e "${BLUE}📋 STEP 3: Configure Custom Domain${NC}"
    echo "In your GitHub repository:"
    echo "1. Go to Settings → Pages"
    echo "2. Custom domain: ${CUSTOM_DOMAIN}"
    echo "3. Enforce HTTPS: ✅ Enable"
    echo ""
    
    echo -e "${BLUE}📋 STEP 4: Configure DNS${NC}"
    echo "In your domain provider, add these records:"
    echo "┌─────────┬──────────────────┬─────────────────────────────────┐"
    echo "│ Type    │ Name             │ Value                           │"
    echo "├─────────┼──────────────────┼─────────────────────────────────┤"
    echo "│ A       │ @                │ 185.199.108.153                 │"
    echo "│ A       │ @                │ 185.199.109.153                 │"
    echo "│ A       │ @                │ 185.199.110.153                 │"
    echo "│ A       │ @                │ 185.199.111.153                 │"
    echo "│ CNAME   │ www              │ ${GITHUB_USERNAME}.github.io    │"
    echo "└─────────┴──────────────────┴─────────────────────────────────┘"
    echo ""
    
    # Create CNAME file for GitHub Pages
    echo "${CUSTOM_DOMAIN}" > github-pages/CNAME
    
    echo -e "${GREEN}🎉 Custom Domain Setup Complete!${NC}"
    echo ""
    echo -e "${GREEN}🌐 Your SquidGame URLs:${NC}"
    echo "• https://${CUSTOM_DOMAIN}"
    echo "• https://www.${CUSTOM_DOMAIN}"
    echo ""
    
else
    echo -e "${RED}❌ Invalid option${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Benefits of GitHub Pages:${NC}"
echo "• Free SSL certificate (auto-renew)"
echo "• Global CDN (fast worldwide)"
echo "• 99.9% uptime"
echo "• No server maintenance"
echo "• Version control with Git"
echo "• Custom domains supported"
echo ""

echo -e "${YELLOW}📝 Limitations:${NC}"
echo "• Static files only (no server-side code)"
echo "• Need external API for data storage"
echo "• 1GB storage limit"
echo "• 100GB bandwidth/month"
echo ""

echo -e "${BLUE}🔧 Alternative API Solutions:${NC}"
echo "Since GitHub Pages is static-only, use these for data:"
echo "• JSONBin.io - Free JSON storage API"
echo "• Firebase - Google's free database"
echo "• Supabase - Open source Firebase alternative"
echo "• GitHub API - Store data as repository files"
echo ""

echo -e "${BLUE}🔍 Test your site:${NC}"
if [ "$OPTION" = "1" ]; then
    echo "https://${GITHUB_DOMAIN}"
else
    echo "https://${CUSTOM_DOMAIN}"
fi 