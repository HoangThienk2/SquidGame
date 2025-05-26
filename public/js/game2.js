class DropCatchGame {
    constructor() {
        this.score = 0;
        this.timeLeft = 60;
        this.isPlaying = false;
        this.isPaused = false;
        this.combo = 0;
        this.comboMultiplier = 1;
        this.speed = 2;
        this.soundEnabled = true;
        this.gameArea = document.getElementById('gameArea');
        this.scoreDisplay = document.getElementById('score');
        this.timerDisplay = document.getElementById('timer');
        this.comboDisplay = document.getElementById('comboDisplay');
        this.comboMultiplierDisplay = document.getElementById('comboMultiplier');
        this.startButton = document.getElementById('startGame');
        this.soundToggle = document.getElementById('soundToggle');
        
        // Initialize sounds
        this.redCatchSound = new Audio('sounds/pop-red.mp3');
        this.blueCatchSound = new Audio('sounds/pop-blue.mp3');
        this.gameOverSound = new Audio('sounds/game-over.mp3');
        this.gameStartSound = new Audio('sounds/game-start.mp3');
        
        // Set default volume for all sounds
        this.redCatchSound.volume = 0.5;
        this.blueCatchSound.volume = 0.5;
        this.gameOverSound.volume = 0.5;
        this.gameStartSound.volume = 0.5;
        
        this.init();
    }

    init() {
        this.startButton.addEventListener('click', () => this.startGame());
        this.soundToggle.addEventListener('click', () => this.toggleSound());
        
        // Back button handling
        const backButton = document.querySelector('.back-button');
        if (backButton) {
            backButton.addEventListener('click', () => {
                window.location.href = 'index.html';
            });
        }
    }

    startGame() {
        if (!this.isPlaying) {
            // Start new game
            this.isPlaying = true;
            this.isPaused = false;
            this.score = 0;
            this.timeLeft = 60;
            this.combo = 0;
            this.comboMultiplier = 1;
            this.speed = 2;
            
            // Play game start sound
            if (this.soundEnabled) {
                this.gameStartSound.currentTime = 0;
                this.gameStartSound.play().catch(error => {
                    console.log('Error playing game start sound:', error);
                });
            }
            
            this.updateDisplay();
            this.startButton.innerHTML = '<span class="material-icons">pause</span>';
            
            this.gameLoop();
            this.spawnLoop();
            this.timerLoop();
        } else {
            // Toggle pause state
            this.togglePause();
        }
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        this.startButton.innerHTML = `<span class="material-icons">${this.isPaused ? 'play_arrow' : 'pause'}</span>`;
        
        if (this.isPaused) {
            this.showPauseOverlay();
        } else {
            this.hidePauseOverlay();
            // Resume game loops
            this.gameLoop();
            this.spawnLoop();
            this.timerLoop();
        }
    }

    showPauseOverlay() {
        // Create pause overlay if it doesn't exist
        if (!this.pauseOverlay) {
            this.pauseOverlay = document.createElement('div');
            this.pauseOverlay.className = 'pause-overlay';
            this.pauseOverlay.innerHTML = `
                <div class="pause-content">
                    <h2>PAUSED</h2>
                    <p>Click anywhere to continue</p>
                </div>
            `;
            this.gameArea.appendChild(this.pauseOverlay);
            
            // Add click event to resume game
            this.pauseOverlay.addEventListener('click', () => {
                this.togglePause();
            });
        }
        this.pauseOverlay.style.display = 'flex';
    }

    hidePauseOverlay() {
        if (this.pauseOverlay) {
            this.pauseOverlay.style.display = 'none';
        }
    }

    gameLoop() {
        if (!this.isPlaying || this.isPaused) return;
        
        const characters = document.querySelectorAll('.character');
        characters.forEach(char => {
            const currentTop = parseInt(char.style.top) || 0;
            char.style.top = `${currentTop + this.speed}px`;
            
            if (currentTop > this.gameArea.clientHeight) {
                char.remove();
                this.missCharacter();
            }
        });
        
        requestAnimationFrame(() => this.gameLoop());
    }

    spawnLoop() {
        if (!this.isPlaying || this.isPaused) return;
        
        this.spawnCharacter();
        const spawnDelay = Math.max(500, 2000 - (this.score * 10));
        setTimeout(() => this.spawnLoop(), spawnDelay);
    }

    timerLoop() {
        if (!this.isPlaying || this.isPaused) return;
        
        this.timeLeft--;
        this.updateDisplay();
        
        if (this.timeLeft <= 0) {
            this.endGame();
            return;
        }
        
        setTimeout(() => this.timerLoop(), 1000);
    }

    spawnCharacter() {
        const character = document.createElement('div');
        character.className = 'character';
        character.classList.add(Math.random() < 0.2 ? 'blue' : 'red');
        
        const maxX = this.gameArea.clientWidth - 50;
        character.style.left = `${Math.random() * maxX}px`;
        character.style.top = '-50px';
        
        character.addEventListener('click', () => this.catchCharacter(character));
        
        this.gameArea.appendChild(character);
    }

    catchCharacter(character) {
        if (!this.isPlaying || this.isPaused) return;
        
        const isSpecial = character.classList.contains('blue');
        const points = isSpecial ? 5 : 1;
        const totalPoints = points * this.comboMultiplier;
        
        this.score += totalPoints;
        this.combo++;
        
        // Play appropriate catch sound
        if (this.soundEnabled) {
            const soundToPlay = isSpecial ? this.blueCatchSound : this.redCatchSound;
            soundToPlay.currentTime = 0;
            soundToPlay.play().catch(error => {
                console.log('Error playing sound:', error);
            });
        }
        
        // Create particle effect
        this.createParticleEffect(character);
        
        // Create score popup
        this.createScorePopup(character, totalPoints);
        
        if (this.combo >= 5) {
            this.comboMultiplier = Math.min(5, Math.floor(this.combo / 5) + 1);
            this.showComboEffect();
        }
        
        character.classList.add('caught');
        setTimeout(() => character.remove(), 300);
        
        this.updateDisplay();
    }

    createParticleEffect(character) {
        const rect = character.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const isSpecial = character.classList.contains('blue');
        
        // Create 12 particles
        for (let i = 0; i < 12; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            // Random size between 4 and 8 pixels
            const size = Math.random() * 4 + 4;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            
            // Random color based on character type
            const hue = isSpecial ? 240 : 0; // Blue or Red
            const saturation = 100;
            const lightness = Math.random() * 30 + 50; // 50-80%
            particle.style.backgroundColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
            
            // Random position around the character
            const angle = (i / 12) * Math.PI * 2;
            const distance = Math.random() * 30 + 20;
            const x = centerX + Math.cos(angle) * distance;
            const y = centerY + Math.sin(angle) * distance;
            
            particle.style.left = `${x}px`;
            particle.style.top = `${y}px`;
            
            document.body.appendChild(particle);
            
            // Remove particle after animation
            setTimeout(() => particle.remove(), 600);
        }
    }

    createScorePopup(character, points) {
        const rect = character.getBoundingClientRect();
        const popup = document.createElement('div');
        popup.className = 'score-popup';
        popup.textContent = `+${points}`;
        
        // Position at character center
        popup.style.left = `${rect.left + rect.width / 2}px`;
        popup.style.top = `${rect.top + rect.height / 2}px`;
        
        document.body.appendChild(popup);
        
        // Remove popup after animation
        setTimeout(() => popup.remove(), 1000);
    }

    showComboEffect() {
        const comboEffect = document.createElement('div');
        comboEffect.className = 'combo-effect';
        comboEffect.textContent = `COMBO x${this.comboMultiplier}!`;
        
        // Position in center of game area
        const gameRect = this.gameArea.getBoundingClientRect();
        comboEffect.style.left = `${gameRect.left + gameRect.width / 2}px`;
        comboEffect.style.top = `${gameRect.top + gameRect.height / 2}px`;
        
        document.body.appendChild(comboEffect);
        
        // Remove effect after animation
        setTimeout(() => comboEffect.remove(), 1000);
    }

    missCharacter() {
        this.combo = 0;
        this.comboMultiplier = 1;
        this.updateDisplay();
    }

    updateDisplay() {
        this.scoreDisplay.textContent = this.score;
        this.timerDisplay.textContent = this.timeLeft;
        this.comboMultiplierDisplay.textContent = this.comboMultiplier;
    }

    endGame() {
        this.isPlaying = false;
        this.isPaused = false;
        this.startButton.innerHTML = '<span class="material-icons">play_arrow</span>';
        this.hidePauseOverlay();
        
        // Play game over sound
        if (this.soundEnabled) {
            this.gameOverSound.currentTime = 0;
            this.gameOverSound.play().catch(error => {
                console.log('Error playing game over sound:', error);
            });
        }
        
        // Clear all characters
        document.querySelectorAll('.character').forEach(char => char.remove());
        
        // Show game over message
        alert(`Game Over!\nFinal Score: ${this.score}`);
    }

    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        this.soundToggle.innerHTML = `<span class="material-icons">${this.soundEnabled ? 'volume_up' : 'volume_off'}</span>`;
        
        // Update sound volume based on toggle state
        const volume = this.soundEnabled ? 0.5 : 0;
        this.redCatchSound.volume = volume;
        this.blueCatchSound.volume = volume;
        this.gameOverSound.volume = volume;
        this.gameStartSound.volume = volume;
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DropCatchGame();
}); 