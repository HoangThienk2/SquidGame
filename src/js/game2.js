class DropCatchGame {
    constructor() {
        this.score = 0;
        this.timeLeft = 60;
        this.isPlaying = false;
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
        
        this.sounds = {
            catch: new Audio('../assets/catch.mp3'),
            special: new Audio('../assets/special.mp3'),
            combo: new Audio('../assets/combo.mp3')
        };

        this.init();
    }

    init() {
        this.startButton.addEventListener('click', () => this.startGame());
        this.soundToggle.addEventListener('click', () => this.toggleSound());
        
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                // Remove active class from all nav items
                document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
                // Add active class to clicked item
                item.classList.add('active');
                
                // Handle tab switching
                const tabName = item.querySelector('span:last-child').textContent;
                if (tabName === 'earn') {
                    // Navigate to earn page
                    window.location.href = 'earn.html';
                } else if (tabName === 'game 2') {
                    // Already on game 2 page
                    window.location.href = 'game2.html';
                }
            });
        });
    }

    startGame() {
        if (this.isPlaying) return;
        
        this.isPlaying = true;
        this.score = 0;
        this.timeLeft = 60;
        this.combo = 0;
        this.comboMultiplier = 1;
        this.speed = 2;
        
        this.updateDisplay();
        this.startButton.innerHTML = '<span class="material-icons">pause</span>';
        
        this.gameLoop();
        this.spawnLoop();
        this.timerLoop();
    }

    gameLoop() {
        if (!this.isPlaying) return;
        
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
        if (!this.isPlaying) return;
        
        this.spawnCharacter();
        const spawnDelay = Math.max(500, 2000 - (this.score * 10));
        setTimeout(() => this.spawnLoop(), spawnDelay);
    }

    timerLoop() {
        if (!this.isPlaying) return;
        
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
        if (!this.isPlaying) return;
        
        const isSpecial = character.classList.contains('blue');
        const points = isSpecial ? 5 : 1;
        
        this.score += points * this.comboMultiplier;
        this.combo++;
        
        if (this.combo >= 5) {
            this.comboMultiplier = Math.min(5, Math.floor(this.combo / 5) + 1);
            this.showComboEffect();
        }
        
        if (this.soundEnabled) {
            const sound = isSpecial ? this.sounds.special : this.sounds.catch;
            sound.currentTime = 0;
            sound.play();
        }
        
        character.classList.add('caught');
        setTimeout(() => character.remove(), 300);
        
        this.updateDisplay();
    }

    missCharacter() {
        this.combo = 0;
        this.comboMultiplier = 1;
        this.updateDisplay();
    }

    showComboEffect() {
        this.comboDisplay.classList.add('active');
        if (this.soundEnabled) {
            this.sounds.combo.currentTime = 0;
            this.sounds.combo.play();
        }
        
        setTimeout(() => {
            this.comboDisplay.classList.remove('active');
        }, 1000);
    }

    updateDisplay() {
        this.scoreDisplay.textContent = this.score;
        this.timerDisplay.textContent = this.timeLeft;
        this.comboMultiplierDisplay.textContent = this.comboMultiplier;
    }

    endGame() {
        this.isPlaying = false;
        this.startButton.innerHTML = '<span class="material-icons">play_arrow</span>';
        
        // Clear all characters
        document.querySelectorAll('.character').forEach(char => char.remove());
        
        // Show game over message
        alert(`Game Over!\nFinal Score: ${this.score}`);
    }

    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        this.soundToggle.innerHTML = `<span class="material-icons">${this.soundEnabled ? 'volume_up' : 'volume_off'}</span>`;
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DropCatchGame();
}); 