let coins = 5000000;
const collectedCharacters = {};

const rarityWeights = { //Drop Taux
    'Common': 70,
    'Rare': 20,
    'Legendary': 10
};

let characters = [];

function updateCoinDisplay() {
    document.getElementById('coin-count').innerText = coins;
}

function drawCharacter() {
    if (characters.length === 0) {
        console.error("Character data not loaded yet.");
        return null;
    }
    const randomNumber = Math.random() * 100;
    let cumulativeWeight = 0;
    let selectedRarity;

    for (const rarity in rarityWeights) {
        cumulativeWeight += rarityWeights[rarity];
        if (randomNumber <= cumulativeWeight) {
            selectedRarity = rarity;
            break;
        }
    }

    const charactersOfRarity = characters.filter(char => char.rarity === selectedRarity);
    const randomIndex = Math.floor(Math.random() * charactersOfRarity.length);
    return charactersOfRarity[randomIndex];
}

function showHome() {
    document.getElementById('content').innerHTML = '<h1>Welcome to the Wheel of Destiny Gacha!</h1><p>Check out the latest news and updates here.</p>';
    setActiveNav('home');
    updateCoinDisplay();
}

function showPull() {
    console.log("showPull function called");
    document.getElementById('content').innerHTML = `
        <h1>Gacha Pull</h1>
        <div class="pack-options">
            <button id="pullButtonSingle" class="pack-button" disabled>
                <img src="assets/images/pack/pack-s1-Genesis.jpg" alt="Pack Genesis">
                <div class="pull-button-text">Pack Genesis (300 Coins)</div>
            </button>
            <button id="pullButtonMultiple" class="pack-button" disabled>
                <div class="pull-button-content">
                   <img src="assets/images/pack/pack-s1-Genesis.jpg" alt="Pack Genesis" class="pack-image">
                    <img src="assets/images/pack/x10.png" alt="x10" class="x10-icon">
                </div>
                <div class="pull-button-text">Pack Genesis (X10) (2700 Coins)</div>
            </button>
        </div>
        <div id="pullResult"></div>
    `;
    setActiveNav('pull');
    updateCoinDisplay();
    const pullButtonSingle = document.getElementById('pullButtonSingle');
    const pullButtonMultiple = document.getElementById('pullButtonMultiple');

    const loadCharacterData = () => {
        fetch('characters.json')
            .then(response => response.json())
            .then(data => {
                characters = data;
                pullButtonSingle.disabled = false;
                pullButtonMultiple.disabled = false;
                console.log("Character data loaded successfully");
            })
            .catch(error => {
                console.error("Error loading character data:", error);
            });
    };

    if (pullButtonSingle && pullButtonMultiple) {
        loadCharacterData();
        pullButtonSingle.addEventListener('click', performPull);
        pullButtonMultiple.addEventListener('click', () => performMultiplePulls(10));
    }
}

function performMultiplePulls(count) {
    if (coins >= 2700) {
        coins -= 2700;
        updateCoinDisplay();
        document.getElementById('pullResult').innerText = ''; // Clear previous results
        for (let i = 0; i < count; i++) {
            const pulledCharacter = drawCharacter();
            if (pulledCharacter) {
                const resultElement = document.createElement('p');
                resultElement.innerText = `Pulled: ${pulledCharacter.name} (${pulledCharacter.rarity})`;
                document.getElementById('pullResult').appendChild(resultElement);

                updateCollectedCharacters(pulledCharacter);
            }
        }
    } else {
        document.getElementById('pullResult').innerText = "Not enough coins!";
    }
}

function performPull() {
    if (coins >= 300) {
        coins -= 300;
        updateCoinDisplay();
        const pulledCharacter = drawCharacter();
        if (pulledCharacter) {
            console.log("Pulled character:", pulledCharacter);
            document.getElementById('pullResult').innerText = `You drew: ${pulledCharacter.name} (${pulledCharacter.rarity})`;
            updateCollectedCharacters(pulledCharacter);
        }
    } else {
        document.getElementById('pullResult').innerText = "Not enough coins!";
    }
}

function updateCollectedCharacters(pulledCharacter) {
    if (collectedCharacters[pulledCharacter.name]) {
        collectedCharacters[pulledCharacter.name].count++;
        console.log("Character count updated:", collectedCharacters[pulledCharacter.name]);
    } else {
        collectedCharacters[pulledCharacter.name] = { ...pulledCharacter, count: 1 };
        console.log("Character added to collection:", collectedCharacters[pulledCharacter.name]);
    }

    // Calculate level
    const drawCount = collectedCharacters[pulledCharacter.name].count;
    let level = 1;
    if (drawCount >= 100) {
        level = 5;
    } else if (drawCount >= 40) {
        level = 4;
    } else if (drawCount >= 15) {
        level = 3;
    } else if (drawCount >= 5) {
        level = 2;
    }
    collectedCharacters[pulledCharacter.name].level = level;
    collectedCharacters[pulledCharacter.name].xp = drawCount;
}

function performPull() {
    if (coins >= 300) {
        coins -= 300;
        updateCoinDisplay();
        const pulledCharacter = drawCharacter();
        if (pulledCharacter) {
            console.log("Pulled character:", pulledCharacter);
            document.getElementById('pullResult').innerText = `You drew: ${pulledCharacter.name} (${pulledCharacter.rarity})`;

            // Update collected characters
            if (collectedCharacters[pulledCharacter.name]) {
                collectedCharacters[pulledCharacter.name].count++;
                console.log("Character count updated:", collectedCharacters[pulledCharacter.name]);
            } else {
                collectedCharacters[pulledCharacter.name] = { ...pulledCharacter, count: 1 };
                console.log("Character added to collection:", collectedCharacters[pulledCharacter.name]);
            }

            // Calculate level
            const drawCount = collectedCharacters[pulledCharacter.name].count;
            let level = 1;
            if (drawCount >= 100) {
                level = 5;
            } else if (drawCount >= 40) {
                level = 4;
            } else if (drawCount >= 15) {
                level = 3;
            } else if (drawCount >= 5) {
                level = 2;
            }
            collectedCharacters[pulledCharacter.name].level = level;
            collectedCharacters[pulledCharacter.name].xp = drawCount;
        }
    } else {
        document.getElementById('pullResult').innerText = "Not enough coins!";
    }
}

function updateCollectionDisplay(sortBy) {
    let collectionHTML = '';
    let sortedCharacters = Object.entries(collectedCharacters);

    if (sortBy === 'alphabetical') {
        sortedCharacters.sort(([, a], [, b]) => a.name.localeCompare(b.name));
    } else if (sortBy === 'level') {
        sortedCharacters.sort(([, a], [, b]) => {
            if (b.level !== a.level) {
                return b.level - a.level;
            }
            return b.xp - a.xp;
        });
    } else if (sortBy === 'rarity') {
        const rarityOrder = { 'Common': 1, 'Rare': 2, 'Legendary': 3 };
        sortedCharacters.sort(([, a], [, b]) => rarityOrder[b.rarity] - rarityOrder[a.rarity]);
    }

    if (sortedCharacters.length === 0) {
        collectionHTML += '<p>No characters collected yet.</p>';
    } else {
        for (const [characterName, character] of sortedCharacters) {
            const levelThresholds = [0, 5, 15, 40, 100];
            const nextLevelDraws = levelThresholds[character.level];
            const progress = character.level < 5 ? (character.count - levelThresholds[character.level - 1]) / (nextLevelDraws - levelThresholds[character.level - 1]) * 100 : 100;

            const currentXP = character.count;
            let level = 1;
            if (character.count >= 100) {
                level = 5;
            } else if (character.count >= 40) {
                level = 4;
            } else if (character.count >= 15) {
                level = 3;
            } else if (character.count >= 5) {
                level = 2;
            }
            const nextLevelXP = level < 5 ? levelThresholds[character.level] : currentXP;
            const remainingXP = level < 5 ? nextLevelXP - currentXP : 0;

            collectionHTML += `<div class="character-icon">
                <img src="${character.image}" alt="${character.name}">
                <div class="character-info">
                    <p class="character-name">${character.name}</p>
                    <p class="character-rarity">${character.rarity}</p>
                    <p>Level ${character.level} (XP: ${currentXP}/${nextLevelXP})</p>
                    <div class="experience-bar-container">
                        <div class="experience-bar" style="width: ${progress}%"></div>
                    </div>
                </div>
            </div>`;
        }
    }
    document.getElementById('collection-content').innerHTML = collectionHTML;
}

function showCollection() {
    console.log("showCollection called");
    document.getElementById('content').innerHTML = `
        <h1>Character Collection</h1>
        <div class="sort-options">
            <label for="sortBy">Sort By:</label>
            <select id="sortBy">
                <option value="alphabetical">Alphabetical (A-Z)</option>
                <option value="level">Level</option>
                <option value="rarity">Rarity</option>
            </select>
        </div>
        <div id="collection-content"></div>
    `;
    setActiveNav('collection');

    const sortBySelect = document.getElementById('sortBy');
    sortBySelect.addEventListener('change', () => {
        updateCollectionDisplay(sortBySelect.value);
    });

    updateCollectionDisplay('alphabetical'); // Initial sort
}

function setActiveNav(page) {
    const navButtons = document.querySelectorAll('nav button');
    navButtons.forEach(button => button.classList.remove('active'));
    const activeButton = document.querySelector(`nav button[onclick="show${page.charAt(0).toUpperCase() + page.slice(1)}()"]`);
    if (activeButton) {
        activeButton.classList.add('active');
    }
}

// Show the home page by default
showHome();
updateCoinDisplay();
