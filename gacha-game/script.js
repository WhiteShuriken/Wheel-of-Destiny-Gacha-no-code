import HomeView from './homeView.js';

// Ajoutez cette ligne pour exporter les objets nécessaires
export { GameState, UIUtils, NavigationController, GachaSystem };

// ====== Configuration ======
const CONFIG = {
    STARTING_COINS: 5000,
    RARITY_WEIGHTS: {
        'Common': 70,
        'Rare': 20,
        'Legendary': 10
    },
    LEVEL_THRESHOLDS: [0, 5, 15, 40, 100]
};

// ====== Data Cache Manager ======
const DataCache = {
    characters: null,
    packs: null,
    rarity: null,
    maxRetries: 3,
    retryDelay: 1000,

    async fetchWithRetry(url, retries = this.maxRetries) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log(`Successfully loaded: ${url}`);
            return data;
        } catch (error) {
            console.error(`Error fetching ${url}:`, error);
            if (retries > 0) {
                await new Promise(resolve => setTimeout(resolve, this.retryDelay));
                return this.fetchWithRetry(url, retries - 1);
            }
            throw error;
        }
    },

    async init() {
        try {
            const [characters, packs, rarity] = await Promise.all([
                this.fetchWithRetry('characters.json'),
                this.fetchWithRetry('packs.json'),
                this.fetchWithRetry('rarity.json')
            ]);

            this.characters = characters;
            this.packs = packs;
            this.rarity = rarity;

            return this.isInitialized();
        } catch (error) {
            console.error('Error initializing data:', error);
            ErrorHandler.show('Failed to load game data. Please refresh the page.');
            return false;
        }
    },

    isInitialized() {
        return !!(this.characters && this.packs && this.rarity);
    }
};

// ====== Storage Manager ======
const StorageManager = {
    memoryStorage: new Map(),
    
    isStorageAvailable() {
        try {
            if (typeof localStorage === 'undefined') return false;
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    },

    setItem(key, value) {
        try {
            if (this.isStorageAvailable()) {
                localStorage.setItem(key, JSON.stringify(value));
            } else {
                this.memoryStorage.set(key, value);
            }
        } catch (e) {
            this.memoryStorage.set(key, value);
        }
    },

    getItem(key) {
        try {
            if (this.isStorageAvailable()) {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : null;
            }
            return this.memoryStorage.get(key) || null;
        } catch (error) {
            console.warn('Storage read failed, using memory storage:', error);
            return this.memoryStorage.get(key) || null;
        }
    },

    removeItem(key) {
        try {
            if (this.isStorageAvailable()) {
                localStorage.removeItem(key);
            }
            this.memoryStorage.delete(key);
            return true;
        } catch (error) {
            console.warn('Storage remove failed:', error);
            return false;
        }
    }
};

// ====== Game State Manager ======
const GameState = {
    coins: CONFIG.STARTING_COINS,
    collectedCharacters: {},
    pullHistory: [],
    maxHistorySize: 10,
    dailyRewards: {
        lastClaimDate: null,
        claimedRewards: {
            coins: false,
            pull: false
        }
    },

    init() {
        console.log('Initializing GameState');
        const savedState = StorageManager.getItem('gameState');
        
        if (savedState) {
            this.coins = savedState.coins;
            this.collectedCharacters = savedState.collectedCharacters;
            this.pullHistory = savedState.pullHistory || [];
            // Ajout du chargement des récompenses quotidiennes
            this.dailyRewards = savedState.dailyRewards || {
                lastClaimDate: null,
                claimedRewards: {
                    coins: false,
                    pull: false
                }
            };
        }
        
        this.updateUI();
    },
    

    updateUI() {
        const coinEl = document.getElementById('coin-count');
        if (coinEl) {
            coinEl.innerText = this.coins.toLocaleString();
        }
    },

    save() {
        const state = {
            coins: this.coins,
            collectedCharacters: this.collectedCharacters,
            pullHistory: this.pullHistory,
            dailyRewards: this.dailyRewards  // Ajout de la sauvegarde des récompenses
        };
        StorageManager.setItem('gameState', state);
    },
    

    updateCharacter(character) {
        if (!this.collectedCharacters[character.name]) {
            this.collectedCharacters[character.name] = {
                ...character,
                count: 0,
                level: 1,
                xp: 0
            };
        }

        const char = this.collectedCharacters[character.name];
        char.count++;
        char.level = this.calculateLevel(char.count);
        char.xp = char.count;

        this.save();
        return char;
    },

    addToPullHistory(character) {
        this.pullHistory.unshift(character);
        if (this.pullHistory.length > this.maxHistorySize) {
            this.pullHistory = this.pullHistory.slice(0, this.maxHistorySize);
        }
        this.save();
    },

    calculateLevel(count) {
        for (let i = CONFIG.LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
            if (count >= CONFIG.LEVEL_THRESHOLDS[i]) {
                return i + 1;
            }
        }
        return 1;
    },

    spendCoins(amount) {
        if (this.coins >= amount) {
            this.coins -= amount;
            this.save();
            this.updateUI();
            return true;
        }
        return false;
    },

    canClaimDailyReward(rewardType) {
        const today = new Date().toDateString();
        const lastClaim = this.dailyRewards.lastClaimDate;
        return !lastClaim || lastClaim !== today || !this.dailyRewards.claimedRewards[rewardType];
    },

    claimDailyReward(rewardType) {
        const today = new Date().toDateString();
        this.dailyRewards.lastClaimDate = today;
        this.dailyRewards.claimedRewards[rewardType] = true;
        this.save();
    }
};



// ====== Error Handler ======
const ErrorHandler = {
    modal: null,
    message: null,

    init() {
        this.modal = document.getElementById('error-modal');
        this.message = document.getElementById('error-message');
        
        const refreshButton = document.getElementById('refresh-button');
        if (refreshButton) {
            refreshButton.addEventListener('click', () => {
                this.hide();
                location.reload();
            });
        }
    },

    show(msg) {
        if (this.modal && this.message) {
            this.message.textContent = msg;
            this.modal.style.display = 'flex';
        } else {
            console.error('Error modal elements not found');
            alert(msg);
        }
    },

    hide() {
        if (this.modal) {
            this.modal.style.display = 'none';
        }
    }
};

// ====== UI Utilities ======
const UIUtils = {
    showLoading(show = true) {
        const loadingEl = document.getElementById('loading');
        if (loadingEl) {
            loadingEl.hidden = !show;
        }
    },

    updateCoinDisplay() {
        GameState.updateUI();
    },

    setActiveNav(page) {
        document.querySelectorAll('nav button').forEach(button => {
            button.classList.remove('active');
        });

        const buttonId = `${page}Btn`;
        const activeButton = document.getElementById(buttonId);
        if (activeButton) {
            activeButton.classList.add('active');
        }
    }
};

    // Ajouter les écouteurs d'événements
document.querySelectorAll('.pull-button').forEach(button => {
    button.addEventListener('click', () => {
        const packId = button.dataset.pack;
        const count = parseInt(button.dataset.count);
        GachaSystem.performPull(packId, count);
    });
});


// ====== Gacha System ======
const GachaSystem = {
    drawCharacter(packId) {
        if (!DataCache.characters) {
            throw new Error("Character data not loaded");
        }

        // Filtrer les personnages du pack
        const packCharacters = DataCache.characters.filter(
            character => character.packId.includes(packId)
        );

        if (packCharacters.length === 0) {
            throw new Error(`No characters available for pack ID: ${packId}`);
        }

        // Sélection de la rareté
        const randomNumber = Math.random() * 100;
        let cumulativeWeight = 0;
        let selectedRarity;

        for (const [rarity, weight] of Object.entries(CONFIG.RARITY_WEIGHTS)) {
            cumulativeWeight += weight;
            if (randomNumber <= cumulativeWeight) {
                selectedRarity = rarity;
                break;
            }
        }

        // Sélection du personnage
        const charactersOfRarity = packCharacters.filter(
            char => char.rarity === selectedRarity
        );
        
        return charactersOfRarity[Math.floor(Math.random() * charactersOfRarity.length)];
    },

    async performPull(packId, count = 1) {
        try {
            // Vérification du pack
            const pack = DataCache.packs.packs.find(p => p.id === packId);
            if (!pack) {
                throw new Error('Invalid pack ID');
            }
    
            // Calcul du coût
            const cost = count === 10 ? pack.multiCost : pack.singleCost;
            
            // Vérification des fonds
            if (!GameState.spendCoins(cost)) {
                ErrorHandler.show("Not enough coins!");
                return;
            }
    
            // Préparation de l'affichage
            const pullResultDiv = document.getElementById('pullResult');
            const historyDiv = document.getElementById('pullHistory');
            pullResultDiv.innerHTML = '';
    
            // Tirage des personnages
            const pulls = [];
            for (let i = 0; i < count; i++) {
                const pulledCharacter = this.drawCharacter(packId);
                pulls.push(pulledCharacter);
                
                // Mise à jour de la collection
                GameState.updateCharacter(pulledCharacter);
                
                // Ajouter à l'historique
                GameState.addToPullHistory(pulledCharacter);
                
                // Création de l'élément visuel pour le résultat
                const characterDiv = this.createPullResultElement(pulledCharacter);
                pullResultDiv.appendChild(characterDiv);
    
                // Mise à jour de l'historique en temps réel
                if (historyDiv) {
                    // Vider l'historique actuel
                    historyDiv.innerHTML = '';
                    // Recréer l'historique avec les données à jour
                    GameState.pullHistory.forEach(char => {
                        const historyCharDiv = this.createPullResultElement(char);
                        historyDiv.appendChild(historyCharDiv);
                    });
                }
            }
    
            return pulls;
        } catch (error) {
            console.error('Error performing pull:', error);
            ErrorHandler.show('Failed to perform pull. Please try again.');
            return null;
        }
    },

createPullResultElement(character) {
    const div = document.createElement('div');
    div.className = 'collection-item';
    div.setAttribute('data-rarity', character.rarity);
    
    div.innerHTML = `
        <img src="${character.image}" alt="${character.name}"
             onerror="this.src='assets/images/icon/user-icon.png'">
        <div class="character-info">
            <h3 class="character-name">${character.name}</h3>
            <p class="character-rarity">${character.rarity}</p>
        </div>
    `;
    
    // Ajout des styles spécifiques
    div.style.background = 'transparent';
    div.style.boxShadow = 'none';
    
    return div;
}

};

// ====== Navigation Controller ======
const NavigationController = {
    init() {
        document.getElementById('homeBtn')?.addEventListener('click', () => this.showHome());
        document.getElementById('pullBtn')?.addEventListener('click', () => this.showPull());
        document.getElementById('collectionBtn')?.addEventListener('click', () => CollectionController.showCollection());
    },
    // Dans NavigationController
    async showHome() {
        const contentDiv = document.getElementById('content');
        if (!contentDiv) return;

        contentDiv.innerHTML = HomeView.generateHTML();
        HomeView.initialize();
        UIUtils.setActiveNav('home');
    },

    initializeDailyButtons() {
        const claimButtons = document.querySelectorAll('.daily-claim-btn');
        
        claimButtons.forEach((button, index) => {
            button.addEventListener('click', () => {
                // Désactiver le bouton après le clic
                button.disabled = true;
                button.textContent = 'Réclamé';
                
                // Logique pour les récompenses
                if (index === 0) { // Bonus de pièces
                    GameState.coins += 1000;
                    GameState.save();
                    UIUtils.updateCoinDisplay();
                } else if (index === 1) { // Tirage gratuit
                    // À implémenter plus tard
                    console.log('Tirage gratuit réclamé');
                }
            });
        });
    },

    generateRecentPullsHTML() {
        const recentPulls = GameState.pullHistory.slice(0, 4);
    
        if (recentPulls.length === 0) {
            return `
                <div class="empty-state">
                    <img src="assets/images/icon/pull-icon.png" alt="Empty pulls" class="empty-state-icon">
                    <p class="no-pulls-message">Aucun personnage obtenu pour le moment</p>
                    <button onclick="NavigationController.showPull()" class="empty-state-button">
                        Faire un tirage
                    </button>
                </div>
            `;
        }
    
        return recentPulls.map(character => `
            <div class="collection-item" data-rarity="${character.rarity}">
                <img src="${character.image}" alt="${character.name}" 
                     onerror="this.src='assets/images/icon/user-icon.png'">
                <div class="character-info">
                    <h3 class="character-name">${character.name}</h3>
                    <p class="character-rarity">${character.rarity}</p>
                </div>
            </div>
        `).join('');
    },

    async showPull() {
        const contentDiv = document.getElementById('content');
        if (!contentDiv) return;
    
        contentDiv.innerHTML = `
            <h1>Gacha Pull</h1>
            <div class="pack-options"></div>
            <div id="pullResult"></div>
            <div class="history-section">
                <h2>Recent Pulls</h2>
                <div id="pullHistory" class="pull-history"></div>
            </div>
        `;
    
        // Ajouter l'historique
        const historyDiv = document.getElementById('pullHistory');
        if (historyDiv && GameState.pullHistory.length > 0) {
            GameState.pullHistory.forEach(char => {
                const charElement = GachaSystem.createPullResultElement(char);
                historyDiv.appendChild(charElement);
            });
        }
    
        if (!DataCache.isInitialized()) {
            await DataCache.init();
        }
    
        this.renderPackOptions();
        UIUtils.setActiveNav('pull');
    },

renderPackOptions() {
    const packOptionsContainer = document.querySelector('.pack-options');
    if (!packOptionsContainer || !DataCache.packs) return;

    const packsHTML = DataCache.packs.packs.map(pack => `
        <div class="pull-button-container">
            <div class="pull-button-content">
                <button class="pull-button" data-pack="${pack.id}" data-count="1">
                    <img src="${pack.image}" alt="${pack.name}" class="pack-image">
                    <p class="pull-button-text">
                        Pull ${pack.name} (${pack.singleCost} <img src="assets/images/icon/coin-icon.png" alt="Coin">)
                    </p>
                </button>
            </div>
        </div>
        <div class="pull-button-container">
            <div class="pull-button-content">
                <button class="pull-button" data-pack="${pack.id}" data-count="10">
                    <img src="${pack.image}" alt="${pack.name}" class="pack-image">
                    <img src="assets/images/pack/x10.png" alt="x10" class="x10-icon">
                    <p class="pull-button-text">
                        Pull ${pack.name} x10 (${pack.multiCost} <img src="assets/images/icon/coin-icon.png" alt="Coin">)
                    </p>
                </button>
            </div>
        </div>
    `).join('');

    packOptionsContainer.innerHTML = packsHTML;

    // Ajouter les écouteurs d'événements
    document.querySelectorAll('.pull-button').forEach(button => {
        button.addEventListener('click', () => {
            const packId = button.dataset.pack;
            const count = parseInt(button.dataset.count);
            GachaSystem.performPull(packId, count);
        });
    });
}
}; 

// ====== Collection Controller ======
const CollectionController = {
    defaultSort: 'alphabetical',

    showCollection() {
        const contentDiv = document.getElementById('content');
        if (!contentDiv) return;

        const savedSort = StorageManager.getItem('collectionSort') || this.defaultSort;

        contentDiv.innerHTML = `
            <h1>Character Collection</h1>
            <div class="sort-options">
                <select id="sortBy" onchange="CollectionController.handleSort(this.value)">
                    <option value="alphabetical" ${savedSort === 'alphabetical' ? 'selected' : ''}>Sort by Name</option>
                    <option value="level" ${savedSort === 'level' ? 'selected' : ''}>Sort by Level</option>
                    <option value="rarity" ${savedSort === 'rarity' ? 'selected' : ''}>Sort by Rarity</option>
                </select>
            </div>
            <div id="collectionContent"></div>
        `;

        this.refreshCollection(savedSort);
        UIUtils.setActiveNav('collection');
    },

    handleSort(value) {
        StorageManager.setItem('collectionSort', value);
        this.refreshCollection(value);
    },

    refreshCollection(sortBy = 'alphabetical') {
        const collectionContent = document.getElementById('collectionContent');
        if (!collectionContent) return;

        // Créer un tableau de tous les personnages avec leur statut
        const allCharacters = DataCache.characters.map(char => {
            const collected = GameState.collectedCharacters[char.name];
            return collected || {
                ...char,
                count: 0,
                level: 1,
                xp: 0,
                isLocked: true
            };
        });

        const sortedCharacters = this.getSortedCharacters(allCharacters, sortBy);
        collectionContent.innerHTML = sortedCharacters.map(char => this.createCharacterCard(char)).join('');
    },

    getSortedCharacters(characters, sortBy) {
        return characters.sort((a, b) => {
            // Toujours trier les débloqués avant les verrouillés en priorité
            if (a.isLocked && !b.isLocked) return 1;
            if (!a.isLocked && b.isLocked) return -1;
            
            // Si les deux sont dans le même état (débloqués ou verrouillés), appliquer le tri sélectionné
            switch (sortBy) {
                case 'alphabetical':
                    return a.name.localeCompare(b.name);
                    
                case 'level':
                    if (!a.isLocked && !b.isLocked) {
                        const levelDiff = b.level - a.level;
                        if (levelDiff === 0) {
                            const xpDiff = b.count - a.count;
                            if (xpDiff === 0) {
                                return a.name.localeCompare(b.name);
                            }
                            return xpDiff;
                        }
                        return levelDiff;
                    }
                    return a.name.localeCompare(b.name);
                    
                case 'rarity':
                    const rarityOrder = {'Legendary': 3, 'Rare': 2, 'Common': 1};
                    const rarityDiff = rarityOrder[b.rarity] - rarityOrder[a.rarity];
                    if (rarityDiff !== 0) return rarityDiff;
                    return a.name.localeCompare(b.name);
                    
                default:
                    return 0;
            }
        });
    },

    createCharacterCard(character) {
        const nextLevel = character.level + 1;
        const currentLevelThreshold = CONFIG.LEVEL_THRESHOLDS[character.level - 1] || 0;
        const nextLevelThreshold = CONFIG.LEVEL_THRESHOLDS[character.level] || currentLevelThreshold;
        const progress = nextLevelThreshold > currentLevelThreshold 
            ? ((character.count - currentLevelThreshold) / (nextLevelThreshold - currentLevelThreshold)) * 100
            : 100;
    
        const lockedClass = character.isLocked ? 'locked' : '';
        
        return `
            <div class="collection-item ${lockedClass}" data-rarity="${character.rarity}">
                <img src="${character.image}" alt="${character.name}" 
                     onerror="this.src='assets/images/icon/user-icon.png'">
                <div class="character-info">
                    <h3 class="character-name">${character.name}</h3>
                    <p class="character-rarity">${character.rarity}</p>
                    ${character.isLocked ? `
                        <div class="locked-status">Non débloqué</div>
                    ` : `
                        <div class="character-stats">
                            <div class="stat">
                                <div class="stat-label">Level</div>
                                <div class="stat-value">${character.level}</div>
                            </div>
                        </div>
                        <div class="experience-bar-container">
                            <div class="experience-bar" style="width: ${progress}%"></div>
                        </div>
                        <div class="exp-text">
                            XP : ${character.count} (${character.count - currentLevelThreshold}/${nextLevelThreshold - currentLevelThreshold})
                        </div>
                    `}
                </div>
            </div>
        `;
    } 
};

// ====== App Initialization ======
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Initialiser les gestionnaires
        ErrorHandler.init();
        NavigationController.init();
        
        // Initialiser le cache et l'état du jeu
        const cacheInitialized = await DataCache.init();
        if (!cacheInitialized) {
            throw new Error('Failed to initialize DataCache');
        }
        
        GameState.init();
        
        // Afficher la page d'accueil
        await NavigationController.showHome();
        
    } catch (error) {
        console.error('Initialization error:', error);
        ErrorHandler.show('Failed to initialize the game. Please refresh the page.');
    }
});

// Empêcher la sélection du texte sur les boutons
document.addEventListener('mousedown', function(e) {
    if (e.target.tagName === 'BUTTON') {
        e.preventDefault();
    }
});

// Gestionnaire d'erreurs global
window.onerror = function(msg, url, line, col, error) {
    console.error('Global error:', { msg, url, line, col, error });
    ErrorHandler.show('An unexpected error occurred. Please refresh the page.');
    return false;
};
