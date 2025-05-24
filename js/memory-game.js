// Alvas Fantastisches Fundstück-Memory - Main Game Logic

class MemoryGame {
    constructor() {
        this.players = [];
        this.cards = [];
        this.currentPlayerIndex = 0;
        this.flippedCards = [];
        this.canFlip = true;
        this.gameState = 'setup'; // setup, playing, finished
        this.showOriginalFundstuecke = false; // Einstellung für Fundstück-Darstellung
        this.isSinglePlayer = false; // Einzelspieler-Modus
        
        this.initializeEventListeners();
        // Load persisted settings and state
        GamePersistence.loadSettings(this);
        GamePersistence.promptResume(this);
    }    initializeEventListeners() {
        document.getElementById('startGameBtn').addEventListener('click', () => this.startGame());
        document.getElementById('resetGameBtn').addEventListener('click', () => this.resetGame());
        document.getElementById('playAgainBtn').addEventListener('click', () => this.resetGame());
        
        // Spielmodus-Auswahl Event Listener
        document.querySelectorAll('#gameModeButtons .btn-mode').forEach(button => {
            button.addEventListener('click', (e) => {
                document.querySelectorAll('#gameModeButtons .btn-mode').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                this.togglePlayerSetup(e.target.dataset.value === 'singleplayer');
                // Save settings immediately when user changes game mode
                this.saveCurrentSettings();
            });
        });

        // Schwierigkeitsgrad-Auswahl Event Listener
        document.querySelectorAll('#difficultyButtons .btn-difficulty').forEach(button => {
            button.addEventListener('click', (e) => {
                document.querySelectorAll('#difficultyButtons .btn-difficulty').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                // Save settings immediately when user changes difficulty
                this.saveCurrentSettings();
            });
        });

        // Fundstücke checkbox Event Listener
        document.getElementById('showOriginalFundstuecke').addEventListener('change', () => {
            // Save settings immediately when user changes checkbox
            this.saveCurrentSettings();
        });

        // Player name Event Listeners
        document.getElementById('player1Name').addEventListener('input', () => {
            this.saveCurrentSettings();
        });
        document.getElementById('player2Name').addEventListener('input', () => {
            this.saveCurrentSettings();
        });
    }

    startGame() {
        const selectedGameModeButton = document.querySelector('#gameModeButtons .btn-mode.active');
        const gameMode = selectedGameModeButton ? selectedGameModeButton.dataset.value : 'multiplayer';
        
        const player1Name = document.getElementById('player1Name').value.trim() || 'Alva';
        const player2Name = document.getElementById('player2Name').value.trim() || 'Papa/Mama';

        const selectedDifficultyButton = document.querySelector('#difficultyButtons .btn-difficulty.active');
        const cardSetsCount = selectedDifficultyButton ? parseInt(selectedDifficultyButton.dataset.value) : 6;
        
        const showOriginalFundstuecke = document.getElementById('showOriginalFundstuecke').checked;

        this.isSinglePlayer = gameMode === 'singleplayer';
        this.showOriginalFundstuecke = showOriginalFundstuecke;
        
        if (this.isSinglePlayer) {
            this.setupSinglePlayer(player1Name);
        } else {
            this.setupPlayers(player1Name, player2Name);
        }
        
        this.setupCards(cardSetsCount);
        this.gameState = 'playing';
        
        UI.showGameScreen();
        this.renderGame();
        this.setCurrentPlayerMessage();
        
        SoundManager.playSound('gameStart');
        GamePersistence.saveSettings(this);
        GamePersistence.saveGameState(this);
    }

    setupPlayers(name1, name2) {
        this.players = [
            {
                id: 1,
                name: name1,
                score: 0,
                collectedPairs: [],
                collectedFundstuecke: []
            },
            {
                id: 2,
                name: name2,
                score: 0,
                collectedPairs: [],
                collectedFundstuecke: []
            }
        ];
        this.currentPlayerIndex = 0;
    }

    setupSinglePlayer(name) {
        this.players = [
            {
                id: 1,
                name: name,
                score: 0,
                collectedPairs: [],
                collectedFundstuecke: []
            }
        ];
        this.currentPlayerIndex = 0;
    }

    setupCards(cardSetsCount) {
        // Create pairs of cards - cardSetsCount is the number of pairs we want
        const selectedVariants = this.shuffleArray([...ALL_IMAGE_VARIANTS]).slice(0, cardSetsCount);
        this.cards = [];
        
        selectedVariants.forEach(variant => {
            // Create two identical cards for each variant (this creates the pairs)
            this.cards.push({
                ...variant,
                cardUid: `${variant.id}-1`,
                isFlipped: false,
                isMatched: false
            });
            this.cards.push({
                ...variant,
                cardUid: `${variant.id}-2`,
                isFlipped: false,
                isMatched: false
            });
        });
        
        this.cards = this.shuffleArray(this.cards);
        console.log(`Spiel erstellt mit ${cardSetsCount} Paaren = ${this.cards.length} Karten total`);
    }

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    renderGame() {
        this.renderGameBoard();
        this.renderPlayerInfo();
    }

    renderGameBoard() {
        const gameBoard = document.getElementById('game-board');
        gameBoard.innerHTML = '';
        
        // Responsive grid layout based on screen size and number of cards
        const numCards = this.cards.length;
        const screenWidth = window.innerWidth;
        
        let gridClass = 'game-board grid';
        
        // Optimized grid for different screen sizes and card counts
        if (screenWidth <= 480) { // Mobile
            if (numCards <= 12) {
                gridClass += ' grid-cols-3';
            } else if (numCards <= 24) {
                gridClass += ' grid-cols-4';
            } else {
                gridClass += ' grid-cols-4';
            }
        } else if (screenWidth <= 768) { // Tablet
            if (numCards <= 16) {
                gridClass += ' grid-cols-4';
            } else if (numCards <= 24) {
                gridClass += ' grid-cols-4';
            } else if (numCards <= 36) {
                gridClass += ' grid-cols-6';
            } else {
                gridClass += ' grid-cols-6';
            }
        } else if (screenWidth <= 1024) { // Large Tablet
            if (numCards <= 16) {
                gridClass += ' grid-cols-4';
            } else if (numCards <= 24) {
                gridClass += ' grid-cols-6';
            } else {
                gridClass += ' grid-cols-6';
            }
        } else { // Desktop
            if (numCards <= 16) {
                gridClass += ' grid-cols-4';
            } else if (numCards <= 24) {
                gridClass += ' grid-cols-6';
            } else {
                gridClass += ' grid-cols-8';
            }
        }
        
        gameBoard.className = gridClass;

        this.cards.forEach((cardData, index) => {
            const cardElement = this.createCardElement(cardData, index);
            gameBoard.appendChild(cardElement);
        });
    }

    createCardElement(cardData, index) {
        const cardElement = document.createElement('div');
        cardElement.className = 'card relative';
        cardElement.dataset.cardIndex = index;
        cardElement.setAttribute('tabindex', '0');
        cardElement.setAttribute('role', 'button');
        cardElement.setAttribute('aria-label', `Karte ${index + 1}`);

        if (cardData.isMatched) {
            cardElement.classList.add('is-matched'); 
        }

        cardElement.innerHTML = `
            <div class="card-inner">
                <div class="card-face card-back">
                    <span class="text-2xl">🎮</span>
                </div>
                <div class="card-face card-front">
                    <span class="text-3xl">${cardData.display}</span>
                </div>
            </div>
        `;

        if (cardData.isFlipped && !cardData.isMatched) {
            cardElement.classList.add('is-flipped');
        }

        cardElement.addEventListener('click', () => this.handleCardClick(cardElement, cardData));
        cardElement.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.handleCardClick(cardElement, cardData);
            }
        });

        return cardElement;
    }

    renderPlayerInfo() {
        const container = document.getElementById('player-info-container');
        container.innerHTML = '';
        
        if (this.isSinglePlayer) {
            container.className = 'player-info-container flex justify-center items-start gap-4 p-4';
        } else {
            container.className = 'player-info-container flex justify-between items-start gap-4 p-4';
        }

        this.players.forEach((player, index) => {
            const playerDiv = document.createElement('div');
            playerDiv.id = `player-info-${player.id}`;
            
            if (this.isSinglePlayer) {
                playerDiv.className = 'player-info text-center max-w-md w-full';
            } else {
                playerDiv.className = 'player-info text-center flex-1 min-w-0';
            }
            
            const isActive = index === this.currentPlayerIndex;
            if (isActive) {
                playerDiv.classList.add('player-active');
            }

            const nameDisplay = this.isSinglePlayer ? 
                `<h2 class="text-2xl font-bold mb-3 text-blue-600">${player.name}</h2>` :
                `<h3 class="text-xl font-bold mb-2">${player.name}</h3>`;
                
            const scoreDisplay = this.isSinglePlayer ?
                `<div class="player-score mb-4 text-3xl font-bold text-green-600">${player.score} Punkte</div>` :
                `<div class="player-score mb-2">${player.score} Punkte</div>`;

            playerDiv.innerHTML = `
                ${nameDisplay}
                ${scoreDisplay}
                <div class="text-sm ${this.isSinglePlayer ? 'space-y-3' : ''}">
                    <div class="mb-1">Paare: ${player.collectedPairs.length}</div>
                    <div class="flex flex-wrap justify-center gap-1 mb-2">
                        ${player.collectedPairs.map(pair => 
                            `<span class="collected-item-icon">${pair[0].display}</span>`
                        ).join('')}
                    </div>
                    <div class="mb-1">Fundstücke: ${player.collectedFundstuecke.length}</div>
                    <div class="flex flex-wrap justify-center gap-1">
                        ${player.collectedFundstuecke.map(item => 
                            `<span class="collected-item-icon">${this.getFundstueckDisplay(item)}</span>`
                        ).join('')}
                    </div>
                </div>
            `;

            container.appendChild(playerDiv);
        });
    }

    handleCardClick(cardElement, cardData) {
        if (!this.canFlip || cardData.isFlipped || cardData.isMatched) {
            return;
        }

        if (this.flippedCards.length >= GAME_CONFIG.MAX_FLIPPED_CARDS) {
            return;
        }

        if (this.flippedCards.some(fc => fc.element === cardElement)) {
            return;
        }

        this.flipCard(cardElement, cardData);
    }

    flipCard(cardElement, cardData) {
        SoundManager.playSound('flip');
        
        cardElement.classList.add('is-flipped');
        cardData.isFlipped = true;
        
        this.flippedCards.push({
            element: cardElement,
            data: cardData
        });

        const remainingCards = this.getRemainingCardsCount();
        const cardsToFlip = Math.min(GAME_CONFIG.MAX_FLIPPED_CARDS, remainingCards);

        if (this.flippedCards.length === cardsToFlip) {
            this.canFlip = false;
            setTimeout(() => this.evaluateFlippedCards(), GAME_CONFIG.CARD_FLIP_DELAY);
        }
    }

    getRemainingCardsCount() {
        return this.cards.filter(card => !card.isMatched).length;
    }

    evaluateFlippedCards() {
        const result = this.checkForPairs();
        
        if (result.foundPair) {
            this.handlePairFound(result.pairCards, result.fundstueckCard);
        } else {
            this.handleNoPairFound();
        }
    }

    checkForPairs() {
        const flippedData = this.flippedCards.map(fc => fc.data);
        
        if (flippedData.length === 3) {
            const [c1, c2, c3] = flippedData;
            
            if (c1.id === c2.id) {
                return { foundPair: true, pairCards: [c1, c2], fundstueckCard: c3 };
            } else if (c1.id === c3.id) {
                return { foundPair: true, pairCards: [c1, c3], fundstueckCard: c2 };
            } else if (c2.id === c3.id) {
                return { foundPair: true, pairCards: [c2, c3], fundstueckCard: c1 };
            }
        } else if (flippedData.length === 2) {
            const [c1, c2] = flippedData;
            if (c1.id === c2.id) {
                return { foundPair: true, pairCards: [c1, c2], fundstueckCard: null };
            }
        }
        
        return { foundPair: false, pairCards: [], fundstueckCard: null };
    }

    handlePairFound(pairCards, fundstueckCard) {
        const currentPlayer = this.players[this.currentPlayerIndex];
        
        SoundManager.playSound('pair');
        
        // Konfetti-Effekt auslösen
        const pairElements = this.flippedCards.filter(fc => 
            pairCards.some(pc => pc.cardUid === fc.data.cardUid)
        );
        if (pairElements.length > 0) {
            Confetti.celebrate(pairElements[0].element);
        }
        
        // Add pair to player's collection
        currentPlayer.collectedPairs.push(pairCards);
        currentPlayer.score += 2; // 2 points per pair
        
        // Add Fundstück if present
        if (fundstueckCard) {
            currentPlayer.collectedFundstuecke.push(fundstueckCard);
            SoundManager.playSound('fundstueck');
        }

        // Mark cards as matched and hide them with animation
        this.flippedCards.forEach(fc => {
            fc.data.isMatched = true;
            fc.element.classList.add('is-matched');
            fc.element.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
            fc.element.style.opacity = '0';
            fc.element.style.transform = 'scale(0.8)';
            fc.element.style.pointerEvents = 'none';
        });

        // Clear flipped cards
        this.flippedCards = [];
        
        // Check if game should end
        const gameEndCheck = this.checkForGameEnd();
        if (gameEndCheck.shouldEnd) {
            setTimeout(() => {
                this.endGame(gameEndCheck.reason);
                GamePersistence.saveGameState(this);
            }, GAME_CONFIG.TURN_TRANSITION_DELAY);
        } else {
            // Player gets another turn
            this.renderPlayerInfo();
            this.setCurrentPlayerMessage();
            this.canFlip = true;
            GamePersistence.saveGameState(this);
        }
    }

    handleNoPairFound() {
        SoundManager.playSound('noMatch');
        
        // Flip cards back after delay
        setTimeout(() => {
            this.flippedCards.forEach(fc => {
                fc.element.classList.remove('is-flipped');
                fc.data.isFlipped = false;
            });
            this.flippedCards = [];
            
            // Check if game should end after failed attempt
            const gameEndCheck = this.checkForGameEnd();
            if (gameEndCheck.shouldEnd) {
                this.endGame(gameEndCheck.reason);
                GamePersistence.saveGameState(this);
            } else {
                this.switchToNextPlayer();
                GamePersistence.saveGameState(this);
            }
        }, GAME_CONFIG.TURN_TRANSITION_DELAY);
    }

    switchToNextPlayer() {
        if (!this.isSinglePlayer) {
            this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
        }
        this.renderPlayerInfo();
        this.setCurrentPlayerMessage();
        this.canFlip = true;
        GamePersistence.saveGameState(this);
    }

    setCurrentPlayerMessage() {
        const remainingCards = this.getRemainingCardsCount();
        const cardsToFlip = Math.min(GAME_CONFIG.MAX_FLIPPED_CARDS, remainingCards);
        const currentPlayer = this.players[this.currentPlayerIndex];
        
        let message;
        if (this.isSinglePlayer) {
            message = `${currentPlayer.name}, wähle ${cardsToFlip} Karte${cardsToFlip !== 1 ? 'n' : ''} aus!`;
        } else {
            message = `${currentPlayer.name} ist dran! Wähle ${cardsToFlip} Karte${cardsToFlip !== 1 ? 'n' : ''}.`;
        }
        
        document.getElementById('game-message').textContent = message;
    }

    endGame(reason = 'all_matched') {
        this.gameState = 'finished';
        this.canFlip = false;
        
        // Process Fundstücke
        this.processFundstuecke();
        
        SoundManager.playSound('gameOver');
        UI.showGameOverScreen();
        this.displayFinalScores(reason);
    }

    processFundstuecke() {
        // Speichere verbleibende Karten für Anzeige im Hinweis, aber teile sie NICHT zu
        this.remainingCards = this.cards.filter(card => !card.isMatched);
        
        this.players.forEach(player => {
            // Try to form pairs from Fundstücke
            const fundstueckeGroups = {};
            
            player.collectedFundstuecke.forEach(item => {
                if (!fundstueckeGroups[item.id]) {
                    fundstueckeGroups[item.id] = [];
                }
                fundstueckeGroups[item.id].push(item);
            });
            
            // Form pairs and calculate remaining singles
            Object.values(fundstueckeGroups).forEach(group => {
                const pairs = Math.floor(group.length / 2);
                const singles = group.length % 2;
                
                // Add pairs to score
                player.score += pairs * 2;
                
                // Subtract singles from score
                player.score -= singles;
            });
        });
    }

    displayFinalScores(reason = 'all_matched') {
        const finalScoresDiv = document.getElementById('final-scores');
        finalScoresDiv.innerHTML = '';

        // Zeige Hinweis bei vorzeitigem Spielende
        if (reason === 'no_pairs_possible') {
            const endReasonDiv = document.createElement('div');
            endReasonDiv.className = 'mb-6 p-4 bg-yellow-100 border-2 border-yellow-400 rounded-lg';
            
            const remainingCardsDisplay = this.remainingCards && this.remainingCards.length > 0 
                ? this.remainingCards.map(card => card.display).join(' ')
                : '';
            
            let endMessage;
            if (this.isSinglePlayer) {
                endMessage = `
                    <h3 class="text-xl font-bold text-yellow-800 mb-2">🎯 Spiel beendet!</h3>
                    <p class="text-yellow-700 mb-2">
                        Super gemacht! Es sind nur noch einzelne Karten übrig - keine Paare mehr möglich.
                    </p>
                `;
            } else {
                endMessage = `
                    <h3 class="text-xl font-bold text-yellow-800 mb-2">⚠️ Spiel automatisch beendet</h3>
                    <p class="text-yellow-700 mb-2">
                        Es sind nur noch einzelne Karten übrig - keine Paare mehr möglich!
                    </p>
                `;
            }
            
            endReasonDiv.innerHTML = `
                <div class="text-center">
                    ${endMessage}
                    ${remainingCardsDisplay ? `
                        <div class="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-300">
                            <p class="text-yellow-800 font-semibold mb-2">Diese Karten waren noch übrig:</p>
                            <div class="text-2xl">${remainingCardsDisplay}</div>
                            <p class="text-sm text-yellow-600 mt-1">Diese Karten sind aus dem Spiel!</p>
                        </div>
                    ` : ''}
                </div>
            `;
            finalScoresDiv.appendChild(endReasonDiv);
        }

        // Sort players by score
        const sortedPlayers = [...this.players].sort((a, b) => b.score - a.score);
        
        sortedPlayers.forEach((player, index) => {
            const playerScoreDiv = document.createElement('div');
            playerScoreDiv.className = 'mb-4 p-4 bg-white rounded-lg shadow';
            
            const position = index === 0 ? '🏆' : index === 1 ? '🥈' : '🥉';
            
            playerScoreDiv.innerHTML = `
                <h3 class="text-xl font-bold mb-2">${position} ${player.name}</h3>
                <div class="score-highlight mb-2">Endpunktzahl: ${player.score}</div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <h4 class="font-semibold mb-1">Gesammelte Paare (${player.collectedPairs.length}):</h4>
                        <div class="flex flex-wrap gap-1">
                            ${player.collectedPairs.map(pair => 
                                `<span class="final-display-icon">${pair[0].display}</span>`
                            ).join('')}
                        </div>
                    </div>
                    <div>
                        <h4 class="font-semibold mb-1">Fundstücke (${player.collectedFundstuecke.length}):</h4>
                        <div class="flex flex-wrap gap-1">
                            ${player.collectedFundstuecke.map(item => 
                                `<span class="final-display-icon">${item.display}</span>`
                            ).join('')}
                        </div>
                    </div>
                </div>
            `;
            
            finalScoresDiv.appendChild(playerScoreDiv);
        });

        // Add winner announcement
        if (sortedPlayers.length > 0) {
            const winner = sortedPlayers[0];
            const isATie = sortedPlayers.length > 1 && sortedPlayers[1].score === winner.score;
            
            const winnerDiv = document.createElement('div');
            winnerDiv.className = 'text-center mt-6 p-4 bg-gradient-to-r from-yellow-300 to-yellow-500 rounded-lg';
            
            if (this.isSinglePlayer) {
                winnerDiv.innerHTML = `
                    <h2 class="text-2xl font-bold text-yellow-900">
                        🎉 Fantastisch gespielt, ${winner.name}! 🎉
                    </h2>
                    <p class="text-yellow-800 font-semibold mt-2">
                        Du hast ${winner.score} Punkt${winner.score !== 1 ? 'e' : ''} erreicht!
                    </p>
                `;
            } else {
                winnerDiv.innerHTML = `
                    <h2 class="text-2xl font-bold text-yellow-900">
                        ${isATie ? '🎉 Unentschieden! 🎉' : `🎊 ${winner.name} gewinnt! 🎊`}
                    </h2>
                `;
            }
            
            finalScoresDiv.appendChild(winnerDiv);
        }
    }    resetGame() {
        this.gameState = 'setup';
        this.players = [];
        this.cards = [];
        this.currentPlayerIndex = 0;
        this.flippedCards = [];
        this.canFlip = true;
        this.showOriginalFundstuecke = false;
        this.isSinglePlayer = false;
        this.remainingCards = [];
        
        // Clear only the game state, but keep settings
        GamePersistence.clearSavedGameState();
        
        // Load and apply saved settings instead of resetting to defaults
        GamePersistence.loadSettings(this);
        
        UI.showSetupScreen();
    }

    // Hilfsfunktion für Fundstück-Darstellung
    getFundstueckDisplay(item) {
        return this.showOriginalFundstuecke ? item.display : '🎁';
    }

    // Prüft, ob noch Paare gebildet werden können
    canFormPairs() {
        const remainingCards = this.cards.filter(card => !card.isMatched);
        const cardCounts = {};
        
        // Zähle wie viele Karten von jedem Typ noch übrig sind
        remainingCards.forEach(card => {
            cardCounts[card.id] = (cardCounts[card.id] || 0) + 1;
        });
        
        // Prüfe ob mindestens ein Typ 2 oder mehr Karten hat
        return Object.values(cardCounts).some(count => count >= 2);
    }

    // Prüft ob das Spiel automatisch beendet werden sollte
    checkForGameEnd() {
        const remainingCards = this.getRemainingCardsCount();
        
        // Spiel ist beendet wenn keine Karten mehr da sind
        if (remainingCards === 0) {
            return { shouldEnd: true, reason: 'all_matched' };
        }
        
        // Spiel ist beendet wenn keine Paare mehr möglich sind
        if (!this.canFormPairs()) {
            return { shouldEnd: true, reason: 'no_pairs_possible' };
        }
        
        return { shouldEnd: false, reason: null };
    }    // Spielmodus umschalten zwischen Einzel- und Zweispielermodus
    togglePlayerSetup(isSinglePlayer) {
        const player2Setup = document.getElementById('player2Setup');
        if (isSinglePlayer) {
            player2Setup.style.display = 'none';
            player2Setup.classList.add('hidden');
        } else {
            player2Setup.style.display = 'block';
            player2Setup.classList.remove('hidden');
        }
    }

    // Helper method to save current settings from form
    saveCurrentSettings() {
        const selectedGameModeButton = document.querySelector('#gameModeButtons .btn-mode.active');
        const selectedDifficultyButton = document.querySelector('#difficultyButtons .btn-difficulty.active');
        
        if (selectedGameModeButton && selectedDifficultyButton) {
            const settings = {
                player1Name: document.getElementById('player1Name').value.trim(),
                player2Name: document.getElementById('player2Name').value.trim(),
                gameMode: selectedGameModeButton.dataset.value,
                difficulty: selectedDifficultyButton.dataset.value,
                showOriginalFundstuecke: document.getElementById('showOriginalFundstuecke').checked
            };
            localStorage.setItem('memoryGameSettings', JSON.stringify(settings));
        }
    }
}
