// UI Manager für Alvas Fantastisches Fundstück-Memory

class UI {
    static showSetupScreen() {
        document.getElementById('setup-screen').classList.remove('hidden');
        document.getElementById('game-screen').classList.add('hidden');
        document.getElementById('game-over-screen').classList.add('hidden');
        
        // Focus auf ersten Input
        document.getElementById('player1Name').focus();
    }

    static showGameScreen() {
        document.getElementById('setup-screen').classList.add('hidden');
        document.getElementById('game-screen').classList.remove('hidden');
        document.getElementById('game-over-screen').classList.add('hidden');
    }

    static showGameOverScreen() {
        document.getElementById('setup-screen').classList.add('hidden');
        document.getElementById('game-screen').classList.add('hidden');
        document.getElementById('game-over-screen').classList.remove('hidden');
        
        // Focus auf "Nochmal spielen" Button
        document.getElementById('playAgainBtn').focus();
    }

    static showMessage(message, type = 'info') {
        const messageElement = document.getElementById('game-message');
        messageElement.textContent = message;
        
        // Remove existing type classes
        messageElement.classList.remove('message-success', 'message-warning', 'message-error');
        
        // Add new type class
        if (type !== 'info') {
            messageElement.classList.add(`message-${type}`);
        }
    }

    static createLoadingSpinner() {
        const spinner = document.createElement('div');
        spinner.className = 'loading';
        spinner.setAttribute('aria-label', 'Lädt...');
        return spinner;
    }

    static animateScore(element, newScore) {
        const currentScore = parseInt(element.textContent) || 0;
        const increment = newScore > currentScore ? 1 : -1;
        let current = currentScore;
        
        const timer = setInterval(() => {
            current += increment;
            element.textContent = `${current} Punkte`;
            
            if (current === newScore) {
                clearInterval(timer);
                // Flash animation
                element.style.transform = 'scale(1.2)';
                setTimeout(() => {
                    element.style.transform = 'scale(1)';
                }, 200);
            }
        }, 50);
    }

    static createConfetti() {
        // Einfache Konfetti-Animation für Spielende
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7', '#a29bfe'];
        
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                this.createConfettiPiece(colors[Math.floor(Math.random() * colors.length)]);
            }, i * 50);
        }
    }

    static createConfettiPiece(color) {
        const confetti = document.createElement('div');
        confetti.style.cssText = `
            position: fixed;
            width: 10px;
            height: 10px;
            background: ${color};
            top: -10px;
            left: ${Math.random() * 100}vw;
            z-index: 1000;
            pointer-events: none;
            transform: rotate(${Math.random() * 360}deg);
        `;
        
        document.body.appendChild(confetti);
        
        const animation = confetti.animate([
            { 
                transform: `translateY(0) rotate(0deg)`,
                opacity: 1 
            },
            { 
                transform: `translateY(100vh) rotate(720deg)`,
                opacity: 0 
            }
        ], {
            duration: 3000 + Math.random() * 2000,
            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        });
        
        animation.addEventListener('finish', () => {
            confetti.remove();
        });
    }

    static addMuteButton() {
        const muteButton = document.createElement('button');
        muteButton.id = 'muteButton';
        muteButton.className = 'btn btn-secondary fixed top-4 right-4 z-50 p-2';
        muteButton.innerHTML = SoundManager.isSoundMuted() ? '🔇' : '🔊';
        muteButton.title = 'Ton ein/ausschalten';
        muteButton.setAttribute('aria-label', 'Ton ein/ausschalten');
        
        muteButton.addEventListener('click', () => {
            const isMuted = SoundManager.toggleMute();
            muteButton.innerHTML = isMuted ? '🔇' : '🔊';
            muteButton.title = isMuted ? 'Ton einschalten' : 'Ton ausschalten';
        });
        
        document.body.appendChild(muteButton);
    }

    static addAccessibilityFeatures() {
        // Tastaturnavigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                // ESC zum Hauptmenü
                if (window.game && window.game.gameState === 'playing') {
                    if (confirm('Möchtest du wirklich zum Hauptmenü zurückkehren?')) {
                        window.game.resetGame();
                    }
                }
            }
        });

        // Skip-Link für Barrierefreiheit
        const skipLink = document.createElement('a');
        skipLink.href = '#game-container';
        skipLink.textContent = 'Zum Spielbereich springen';
        skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:bg-white focus:p-2 focus:rounded focus:z-50';
        document.body.insertBefore(skipLink, document.body.firstChild);
    }

    static addInstructions() {
        const instructionsButton = document.createElement('button');
        instructionsButton.className = 'btn btn-tertiary fixed top-4 left-4 z-50 p-2';
        instructionsButton.innerHTML = '❓';
        instructionsButton.title = 'Spielregeln anzeigen';
        instructionsButton.setAttribute('aria-label', 'Spielregeln anzeigen');
        
        instructionsButton.addEventListener('click', () => {
            this.showInstructions();
        });
        
        document.body.appendChild(instructionsButton);
    }

    static showInstructions() {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-labelledby', 'instructions-title');
        
        modal.innerHTML = `
            <div class="bg-white rounded-lg p-6 max-w-2xl max-h-96 overflow-y-auto">
                <h2 id="instructions-title" class="text-2xl font-bold mb-4 text-pink-600">Spielregeln</h2>
                <div class="space-y-4 text-gray-700">
                    <p><strong>Ziel:</strong> Sammle möglichst viele Bildpaare und verwandle Fundstücke in zusätzliche Punkte!</p>
                    
                    <p><strong>Spielablauf:</strong></p>
                    <ul class="list-disc list-inside space-y-2 ml-4">
                        <li>Decke in deinem Zug <strong>3 Karten</strong> auf (oder weniger, falls nur noch wenige übrig sind)</li>
                        <li>Findest du ein <strong>Paar</strong>, nimmst du alle 3 Karten und darfst nochmal</li>
                        <li>Die dritte Karte wird dein <strong>"Fundstück"</strong> - bewahre es gut auf!</li>
                        <li>Findest du kein Paar, werden die Karten wieder umgedreht und der nächste Spieler ist dran</li>
                    </ul>
                    
                    <p><strong>Punktzählung:</strong></p>
                    <ul class="list-disc list-inside space-y-2 ml-4">
                        <li>Jedes gesammelte Paar = +2 Punkte</li>
                        <li>Am Spielende: Fundstücke können neue Paare bilden = +2 Punkte</li>
                        <li>Einzelne übrige Fundstücke = -1 Punkt</li>
                    </ul>
                    
                    <p><strong>Tipp:</strong> Merke dir gut, wo welche Karten liegen - und welche Fundstücke die anderen sammeln!</p>
                </div>
                <button id="closeInstructions" class="btn btn-primary mt-4 w-full">Verstanden!</button>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Schließen-Funktionen
        const closeButton = modal.querySelector('#closeInstructions');
        closeButton.focus();
        
        const closeModal = () => {
            modal.remove();
        };
        
        closeButton.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
        
        document.addEventListener('keydown', function escHandler(e) {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', escHandler);
            }
        });
    }

    static init() {
        this.addMuteButton();
        this.addAccessibilityFeatures();
        this.addInstructions();
        
        // Smooth scrolling
        document.documentElement.style.scrollBehavior = 'smooth';
        
        // Preload wichtige UI-Elemente
        this.preloadElements();
    }

    static preloadElements() {
        // Stelle sicher, dass alle wichtigen Elemente vorhanden sind
        const requiredElements = [
            'setup-screen',
            'game-screen', 
            'game-over-screen',
            'game-container',
            'player-info-container',
            'game-board',
            'game-message',
            'final-scores'
        ];
        
        requiredElements.forEach(id => {
            const element = document.getElementById(id);
            if (!element) {
                console.warn(`Wichtiges UI-Element nicht gefunden: ${id}`);
            }
        });
    }
}

// Auto-initialize UI when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    UI.init();
});

// Export for use in other modules
window.UI = UI;
