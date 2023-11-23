// fetch json data
let dictionary;
let targetWords;

fetch('json/dictionary.json')
  .then(response => {
    if (!response.ok) {
      throw new Error('Failed to load dictionary.json');
    }
    return response.json();
  })
  .then(data => {
    dictionary = data;
  })
  .catch(error => console.error(error));

fetch('json/targetWords.json')
  .then(response => {
    if (!response.ok) {
      throw new Error('Failed to load targetWords.json');
    }
    return response.json();
  })
  .then(data => {
    targetWords = data;
    generateRandomWord();
  })
  .catch(error => console.error(error));

// generate word
let targetWord;
function generateRandomWord() {
    const randomIndex = Math.floor(Math.random() * targetWords.length);
    targetWord = targetWords[randomIndex];
    console.log(targetWord);
}

// keypress event
function startGame(event) {
    const pressedKey = event.key.toUpperCase();
    keyPress(pressedKey);
}

document.addEventListener("keypress", startGame);

function stopGame(event) {
    document.removeEventListener("keypress", startGame);

    document.querySelectorAll('.key').forEach(function(button) {
        button.removeEventListener('click')
    });
}

// keypress function
const tileGrid = document.querySelector(".tile-grid");
const tiles = document.querySelectorAll(".tile");

let letterArray = [[], [], [], [], [], []];   
let currentRow = 0;

function keyPress(key) {
    const selectedTile = tileGrid.querySelector(":not([data-letter])");

    if (selectedTile) {
        const previousTile = selectedTile.previousElementSibling;

        if (/^[A-Z]$/.test(key) && letterArray[currentRow][4] == undefined) {
            handleLetterInput(key, selectedTile);
        } else if (key == "BACKSPACE" && letterArray[currentRow][0] != undefined) {
            handleBackspaceInput(previousTile);
        } else if (key == "ENTER" && letterArray[currentRow][4] != undefined) {
            handleEnterInput();
        }
    } else {
        const previousTile = Array.from(tileGrid.children).slice(-1)[0];
        if (key == "BACKSPACE" && letterArray[currentRow][0] != undefined) {
            handleBackspaceInput(previousTile);
        } else if (key == "ENTER" && letterArray[currentRow][4] != undefined) {
            handleEnterInput();
        }
    }
}

// handle letter input
function handleLetterInput(key, selectedTile) {
    selectedTile.dataset.letter = key.toLowerCase();
    selectedTile.textContent = key;
    selectedTile.dataset.state = "active";

    selectedTile.style.scale = "1.1";
    setTimeout(function() {
        selectedTile.style.scale = "1";
    }, 50);

    letterArray[currentRow].push(key);
}

// handle backspace input
function handleBackspaceInput(previousTile) {
    previousTile.removeAttribute("data-letter");
    previousTile.textContent = "";
    previousTile.removeAttribute("data-state");

    letterArray[currentRow].pop();
}

// handle enter input
let wordLettersTiles = Array.from(tileGrid.children).slice(currentRow * 5, (currentRow + 1) * 5);

function handleEnterInput() {
    wordLettersTiles = Array.from(tileGrid.children).slice(currentRow * 5, (currentRow + 1) * 5);
    let word = ""; 

    for (let i = 0; i < 5; i++) {
        word += letterArray[currentRow][i].toLowerCase();
    }

    wordLettersTiles.forEach(tile => {
        tile.classList.remove("shake");
    });  

    if (wordIsValid(word)) {
        handleGame(word);
        setTimeout(function() {
            handleKeyboard(word);
        }, 1000);
    } else {
        wordLettersTiles.forEach(tile => {
            tile.classList.add("shake");
            setTimeout(function() {
                tile.classList.remove("shake");
            }, 250);
        });  
    }
}

// check if word is in dictionary
function wordIsValid(word) {
    return dictionary.includes(word);
}

// handle game logic
function handleGame(word) {
    let correctCount = 0;
    let wrongCount = 0;

    function processLetter(index) {
        if (index == word.length) {
            currentRow += 1;
            return;
        }

        wordLettersTiles[index].style.transform = "rotateX(180deg)";
        setTimeout(function () {
            wordLettersTiles[index].style.transform = "rotateX(0)";

            if (targetWord[index] === word[index]) {
                wordLettersTiles[index].dataset.state = "correct";
                correctCount++;
            } else if (targetWord.includes(word[index])) {
                wordLettersTiles[index].dataset.state = "wrong-location";
                wrongCount++;
            } else {
                wordLettersTiles[index].dataset.state = "wrong";
                wrongCount++;
            }

            handleWin(correctCount)
            processLetter(index + 1);
        }, 175);
    }

    processLetter(0);
}

// handle game win
function handleWin(correctCount) {
    if (correctCount == targetWord.length) {
        stopGame();
    }
}

// handle keyboard
function handleKeyboard(word) {
    for (let i = 0; i < word.length; i++) {
        const keys = document.querySelectorAll(".key");
        keys.forEach(function(key) {
            if (word[i].toUpperCase() == key.dataset.key && word[i] == targetWord[i]) {
                key.classList.add("correct");
            } else if (word.toUpperCase().includes(key.dataset.key) && targetWord.toUpperCase().includes(key.dataset.key)) {
                key.classList.add("wrong-location");
            } else if (word[i].toUpperCase() == key.dataset.key){
                key.classList.add("wrong");
            }
        });
    }
}

// event listeners for each key
document.querySelectorAll('.key').forEach(function(button) {
    button.addEventListener('click', function() {
        const selectedTile = tileGrid.querySelector(":not([data-letter])");
        let key = button.dataset.key;

        if (letterArray[currentRow][4] == undefined) {
            handleLetterInput(key, selectedTile);
        }
    });
});

// event listener for enter
document.querySelector('.key[data-enter]').addEventListener('click', function() {
    if (key == "ENTER" && letterArray[currentRow][4] != undefined) {
        handleEnterInput();
    }
});

// event listener for backspace
document.querySelector('.key[data-delete]').addEventListener('click', function() {
    const selectedTile = tileGrid.querySelector(":not([data-letter])");
    const previousTile = selectedTile.previousElementSibling;

    if (letterArray[currentRow][0] != undefined) {
        handleBackspaceInput(previousTile);
    }
});