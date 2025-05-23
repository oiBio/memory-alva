// Alvas Fantastisches Fundstück-Memory - Game Logic

// Game Configuration
const GAME_CONFIG = {
    MAX_FLIPPED_CARDS: 3,
    CARD_FLIP_DELAY: 500,
    TURN_TRANSITION_DELAY: 1000,
    MIN_PLAYERS: 2,
    MAX_PLAYERS: 4
};

// All available image variants
const ALL_IMAGE_VARIANTS = [
    { motif: "Tier", variantName: "Hund", id: "dog", display: "🐶" },
    { motif: "Tier", variantName: "Katze", id: "cat", display: "🐱" },
    { motif: "Tier", variantName: "Maus", id: "mouse", display: "🐭" },
    { motif: "Tier", variantName: "Frosch", id: "frog", display: "🐸" },
    { motif: "Tier", variantName: "Löwe", id: "lion", display: "🦁" },
    { motif: "Tier", variantName: "Panda", id: "panda", display: "🐼" },
    { motif: "Tier", variantName: "Elefant", id: "elephant", display: "🐘" },
    { motif: "Tier", variantName: "Affe", id: "monkey", display: "🐵" },
    { motif: "Tier", variantName: "Bär", id: "bear", display: "🐻" },
    
    { motif: "Frucht", variantName: "Apfel", id: "apple", display: "🍎" },
    { motif: "Frucht", variantName: "Banane", id: "banana", display: "🍌" },
    { motif: "Frucht", variantName: "Kirsche", id: "cherry", display: "🍒" },
    { motif: "Frucht", variantName: "Erdbeere", id: "strawberry", display: "🍓" },
    { motif: "Frucht", variantName: "Orange", id: "orange", display: "🍊" },
    { motif: "Frucht", variantName: "Traube", id: "grape", display: "🍇" },
    { motif: "Frucht", variantName: "Ananas", id: "pineapple", display: "🍍" },
    { motif: "Frucht", variantName: "Wassermelone", id: "watermelon", display: "🍉" },
    { motif: "Frucht", variantName: "Pfirsich", id: "peach", display: "🍑" },
    
    { motif: "Fahrzeug", variantName: "Auto", id: "car", display: "🚗" },
    { motif: "Fahrzeug", variantName: "Bus", id: "bus", display: "🚌" },
    { motif: "Fahrzeug", variantName: "Zug", id: "train", display: "🚂" },
    { motif: "Fahrzeug", variantName: "Flugzeug", id: "plane", display: "✈️" },
    { motif: "Fahrzeug", variantName: "Schiff", id: "ship", display: "🚢" },
    { motif: "Fahrzeug", variantName: "Rakete", id: "rocket", display: "🚀" },
    { motif: "Fahrzeug", variantName: "Fahrrad", id: "bike", display: "🚲" },
    { motif: "Fahrzeug", variantName: "Motorrad", id: "motorcycle", display: "🏍️" },
    { motif: "Fahrzeug", variantName: "Helikopter", id: "helicopter", display: "🚁" }
];

class MemoryGame {
    constructor() {
        this.players = [];
        this.cards = [];
        this.currentPlayerIndex = 0;
        this.flippedCards = [];
        this.canFlip = true;
        this.gameState = 'setup'; // setup, playing, finished
        
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        document.getElementById('startGameBtn').addEventListener('click', () => this.startGame());
        document.getElementById('resetGameBtn').addEventListener('click', () => this.resetGame());
        document.getElementById('playAgainBtn').addEventListener('click', () => this.resetGame());
    }

    startGame() {
        const player1Name = document.getElementById('player1Name').value.trim() || 'Spieler 1';
        const player2Name = document.getElementById('player2Name').value.trim() || 'Spieler 2';
        const cardSetsCount = parseInt(document.getElementById('cardSetsCount').value) || 6;

        this.setupPlayers(player1Name, player2Name);
        this.setupCards(cardSetsCount);
        this.gameState = 'playing';
        
        UI.showGameScreen();
        this.renderGame();
        this.setCurrentPlayerMessage();
        
        SoundManager.playSound('gameStart');
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
    }    setupCards(cardSetsCount) {
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
        
        // Adjust grid based on number of cards
        const numCards = this.cards.length;
        if (numCards <= 16) {
            gameBoard.className = 'game-board grid grid-cols-4';
        } else if (numCards <= 24) {
            gameBoard.className = 'game-board grid grid-cols-6';
        } else {
            gameBoard.className = 'game-board grid grid-cols-6';
        }

        this.cards.forEach((cardData, index) => {
            const cardElement = this.createCardElement(cardData, index);
            gameBoard.appendChild(cardElement);
        });
    }    createCardElement(cardData, index) {
        const cardElement = document.createElement('div');
        cardElement.className = 'card h-20 md:h-24 relative'; // Ensure 'relative' is here if .card-face is 'absolute'
        cardElement.dataset.cardIndex = index;
        cardElement.setAttribute('tabindex', '0');
        cardElement.setAttribute('role', 'button');
        cardElement.setAttribute('aria-label', `Karte ${index + 1}`);

        // Verstecke matched Karten komplett und stelle sicher, dass sie gedreht sind
        if (cardData.isMatched) {
            // cardElement.style.opacity = '0'; // Handled by .is-matched class
            // cardElement.style.pointerEvents = 'none'; // Handled by .is-matched class
            cardElement.classList.add('is-matched'); 
        }

        cardElement.innerHTML = `
            <div class="card-face card-back">
                <span class="text-2xl">🎮</span>
            </div>
            <div class="card-face card-front">
                <span class="text-3xl">${cardData.display}</span>
            </div>
        `;

        // Apply flip state if card is flipped (and not already handled by isMatched)
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

        this.players.forEach((player, index) => {
            const playerDiv = document.createElement('div');
            playerDiv.id = `player-info-${player.id}`;
            playerDiv.className = 'player-info text-center flex-1 min-w-0';
            
            const isActive = index === this.currentPlayerIndex;
            if (isActive) {
                playerDiv.classList.add('player-active');
            }

            playerDiv.innerHTML = `
                <h3 class="text-xl font-bold mb-2">${player.name}</h3>
                <div class="player-score mb-2">${player.score} Punkte</div>
                <div class="text-sm">
                    <div class="mb-1">Paare: ${player.collectedPairs.length}</div>
                    <div class="flex flex-wrap justify-center gap-1 mb-2">
                        ${player.collectedPairs.map(pair => 
                            `<span class="collected-item-icon">${pair[0].display}</span>`
                        ).join('')}
                    </div>
                    <div class="mb-1">Fundstücke: ${player.collectedFundstuecke.length}</div>
                    <div class="flex flex-wrap justify-center gap-1">
                        ${player.collectedFundstuecke.map(item => 
                            `<span class="collected-item-icon">🎁</span>`
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
        
        cardElement.classList.add('is-flipped'); // Alte Methode wiederhergestellt
        // cardElement.style.transform = 'rotateY(180deg)'; // Neue Methode entfernt
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
            // Sanfte Animation zum Verschwinden
            fc.element.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
            fc.element.style.opacity = '0';
            // fc.element.style.transform = 'scale(0.8)'; // Alte Methode
            fc.element.style.transform = 'rotateY(180deg) scale(0.8)'; // Neue Methode: gedreht und skaliert
            fc.element.style.pointerEvents = 'none';
        });
        
        // Clear flipped cards
        this.flippedCards = [];
        
        // Check if game is finished
        if (this.getRemainingCardsCount() === 0) {
            setTimeout(() => this.endGame(), GAME_CONFIG.TURN_TRANSITION_DELAY);
        } else {
            // Player gets another turn
            this.renderPlayerInfo();
            this.setCurrentPlayerMessage();
            this.canFlip = true;
        }
    }    handleNoPairFound() {
        SoundManager.playSound('noMatch');
        
        // Flip cards back after delay
        setTimeout(() => {
            this.flippedCards.forEach(fc => {
                fc.element.classList.remove('is-flipped'); // Alte Methode wiederhergestellt
                // fc.element.style.transform = 'rotateY(0deg)'; // Neue Methode entfernt
                fc.data.isFlipped = false;
            });
            this.flippedCards = [];
            this.switchToNextPlayer();
        }, GAME_CONFIG.TURN_TRANSITION_DELAY);
    }

    switchToNextPlayer() {
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
        this.renderPlayerInfo();
        this.setCurrentPlayerMessage();
        this.canFlip = true;
    }

    setCurrentPlayerMessage() {
        const remainingCards = this.getRemainingCardsCount();
        const cardsToFlip = Math.min(GAME_CONFIG.MAX_FLIPPED_CARDS, remainingCards);
        const currentPlayer = this.players[this.currentPlayerIndex];
        
        const message = `${currentPlayer.name} ist dran! Wähle ${cardsToFlip} Karte${cardsToFlip !== 1 ? 'n' : ''}.`;
        document.getElementById('game-message').textContent = message;
    }

    endGame() {
        this.gameState = 'finished';
        this.canFlip = false;
        
        // Process Fundstücke
        this.processFundstuecke();
        
        SoundManager.playSound('gameOver');
        UI.showGameOverScreen();
        this.displayFinalScores();
    }

    processFundstuecke() {
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

    displayFinalScores() {
        const finalScoresDiv = document.getElementById('final-scores');
        finalScoresDiv.innerHTML = '';

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
            winnerDiv.innerHTML = `
                <h2 class="text-2xl font-bold text-yellow-900">
                    ${isATie ? '🎉 Unentschieden! 🎉' : `🎊 ${winner.name} gewinnt! 🎊`}
                </h2>
            `;
            
            finalScoresDiv.appendChild(winnerDiv);
        }
    }

    resetGame() {
        this.gameState = 'setup';
        this.players = [];
        this.cards = [];
        this.currentPlayerIndex = 0;
        this.flippedCards = [];
        this.canFlip = true;
        
        UI.showSetupScreen();
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.game = new MemoryGame();
});
