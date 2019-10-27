"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

var g;
var shuffleBtn;
var pBar;
var words;
var scoreText;
var wordsHolder;
var allDice;
var intro;
var progressHolder;
var goodWords = [];
var wordcount;
var wordcountvalue;
var count,
    scrambled,
    interval = undefined;
var lastlocn = undefined;
var prevLetter;
var STANDARD_CUBES = ["AAEEGN", "ABBJOO", "ACHOPS", "AFFKPS", "AOOTTW", "CIMOTU", "DEILRX", "DELRVY", "DISTTY", "EEGHNW", "EEINSU", "EHRTVW", "EIOSST", "ELRTTY", "HIMNQU", "HLNNRZ"];
var dict = {}; // a map of adjacent dice for word checking

var workCheckMap = {
  1: [2, 5, 6],
  2: [1, 5, 6, 7, 3],
  3: [2, 6, 7, 4],
  4: [3, 7, 8],
  5: [1, 2, 6, 10, 9],
  6: [1, 2, 3, 5, 7, 9, 10, 11],
  7: [2, 3, 4, 6, 8, 10, 11, 12],
  8: [3, 4, 7, 11, 12],
  9: [5, 6, 10, 15, 13],
  10: [5, 6, 7, 9, 11, 13, 14, 15],
  11: [6, 7, 8, 10, 12, 14, 15, 16],
  12: [7, 8, 11, 15, 16],
  13: [9, 10, 14],
  14: [13, 9, 10, 11, 15],
  15: [10, 11, 12, 14, 16],
  16: [11, 12, 15]
};
var currentWord = {}; // load the dictionary

fetch('https://seeward.github.io/CODEPLANT_v1/public/media/words.json').then(function (results) {
  results.json().then(function (result) {
    dict = result;
  });
});

var shuffle = function shuffle(cubes) {
  var shuffled = cubes.map(function (eachCube) {
    // eachCube is a die with 6 sides
    // get random letter from the die between 1-6
    var rand = Math.floor(Math.random() * eachCube.length);
    return eachCube[rand] === "Q" ? "Qu" : eachCube[rand]; // if we hit Q transform to Qu like real boggle - otherwise return the letter
  });
  return shuffled;
};

var fisherYates = function fisherYates(array) {
  // we start at the end of the array
  var currentIndex = array.length,
      temporaryValue,
      randomIndex; // While there remain elements to shuffle...

  while (0 !== currentIndex) {
    // Pick a remaining element between current location and beginning
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1; // And swap it with the current element.
    // get the value of our current index

    temporaryValue = array[currentIndex]; // replace it with our new random element's value from whats left

    array[currentIndex] = array[randomIndex]; // copy the value that was at this point in the array to the random index

    array[randomIndex] = temporaryValue; // this will stop swapping when the index is at 0
  }

  return array;
};

var scoreWords = function scoreWords(all) {
  words.disabled = true; // disable text box

  var score = 0; // reset score
  // loop over each word to find its score

  if (all.length > 0) {
    all.forEach(function (eachOne) {
      if (dict[eachOne] !== 1) {
        return null;
      }

      switch (eachOne.length) {
        case 1:
          break;

        case 2:
          break;

        case 3:
          score += 1;
          break;

        case 4:
          score += 2;
          break;

        case 5:
          score += 3;
          break;

        case 6:
          score += 4;
          break;

        case 7:
          score += 5;
          break;

        case 8:
          score += 6;
          break;

        default:
          break;
      }
    });
  } // our totaled score


  return score;
};

var handleGameEnd = function handleGameEnd() {
  var score = scoreWords(goodWords);
  scoreText.innerHTML = "You earned ".concat(score, " points - well done!");
};

var randomEncouragement = function randomEncouragement() {
  var r = ['Nice job', 'Wow, You are good at this!', 'Outstanding!', 'Well Done!', 'Good One...', 'You are on a roll.', 'Keep up the great work.', 'You are a star!'];
  return r[Math.floor(Math.random() * 7)];
};

var isAdjacent = function isAdjacent(prevLetter, currLetter) {
  // get both indexs
  var prevIndex = findIndexs(prevLetter);
  var currIndex = findIndexs(currLetter); // check if they are adjacent by index

  if (prevIndex.length > 1) {} else {
    if (isAdjacentDiceFromIndex(prevIndex[0], currIndex[0])) {
      return true;
    }
  }
};

var isAdjacentDiceFromIndex = function isAdjacentDiceFromIndex(currentIndex, prevIndex) {
  console.log(workCheckMap[prevIndex + 1], prevIndex);
  var check = false;

  if (workCheckMap[prevIndex + 1]) {
    workCheckMap[prevIndex + 1].forEach(function (eachAdjacentTile) {
      if (eachAdjacentTile === currentIndex) {
        document.getElementById((currentIndex + 1).toString()).style.backgroundColor = 'red';
        check = true;
      }
    });
  }

  return check; // return workCheckMap[prevIndex].contains(currentIndex)
};

var findIndexs = function findIndexs(val) {
  var indexes = [],
      i;

  for (i = 0; i < scrambled.length; i++) {
    console.log(scrambled[i], val, i);

    if (scrambled[i].toLowerCase() === val.toLowerCase()) {
      indexes.push(i);
    }
  }

  console.log(indexes);
  return indexes;
};

var walkWord = function walkWord(word) {
  var wordAsArray = _toConsumableArray(word);

  return recursiveLoop(wordAsArray);
};

var recursiveLoop = function recursiveLoop(wordArray) {
  //console.log(wordArray)
  if (wordArray.length === 0) {
    // we are done walking the word
    //console.log('finsihed')
    return true;
  }

  var currentLetter = wordArray[0];
  scrambled.forEach(function (eachDice, i) {
    //console.log(eachDice.toLowerCase(), currentLetter.toLowerCase())
    if (eachDice.toLowerCase() === currentLetter.toLowerCase()) {
      //console.log(i)
      document.getElementById(i + 1).style.backgroundColor = 'red';
    }
  });
  wordArray.shift();
  recursiveLoop(wordArray);
};

var checkAllLetters = function checkAllLetters(word) {
  var wordArr = _toConsumableArray(word);

  wordArr.forEach(function (eachLetter) {
    var check = false;
    scrambled.forEach(function (eachDice) {
      if (eachLetter === eachDice) {
        check = true;
      }
    });
  });
};

var restart = function restart() {
  window.location.reload();
}; // starts and resets all game elements


var reset = function reset() {
  words = undefined; // DOM elements

  g = document.getElementById("game");
  pBar = document.getElementById("bar");
  intro = document.getElementById("intro");
  wordcount = document.getElementById("wordcount");
  words = document.getElementById("words");
  wordcountvalue = 0; // wordcount.innerHTML = 0
  // intro.style.display = 'none';

  words.addEventListener('keyup', function (e) {
    if (e.key === "Enter") {
      if (!dict.hasOwnProperty(words.value)) {
        scrambled.forEach(function (eachDice, i) {
          document.getElementById((i + 1).toString()).style.backgroundColor = 'black';
        });
        scoreText.innerHTML = "Not a word";
      } else {
        walkWord(words.value);

        var arrWord = _toConsumableArray(words.value);

        var checkFlag = true;
        arrWord.forEach(function (eachLetter) {
          var filterd = scrambled.filter(function (eachDice) {
            return eachDice.toLowerCase() === eachLetter.toLowerCase();
          });
          console.log(filterd);

          if (filterd.length === 0) {
            checkFlag = false;
          }
        });
        console.log(checkFlag);

        if (!checkFlag) {
          scoreText.innerHTML = "Letters used that are not on board";
          setTimeout(function () {
            scrambled.forEach(function (eachDice, i) {
              document.getElementById((i + 1).toString()).style.backgroundColor = 'black';
            });
          }, 1000);
          return;
        }

        if (true) {
          goodWords.push(words.value);
          wordcountvalue++;
          wordcount.innerHTML = wordcountvalue;
          currentWord = {};
          lastlocn = '';
          setTimeout(function () {
            scrambled.forEach(function (eachDice, i) {
              document.getElementById((i + 1).toString()).style.backgroundColor = 'black';
            });
          }, 1000);
          var html = words.value + '<br />' + wordsHolder.innerHTML;
          wordsHolder.innerHTML = html;
          scoreText.innerHTML = randomEncouragement();
        } else {
          scrambled.forEach(function (eachDice, i) {
            document.getElementById((i + 1).toString()).style.backgroundColor = 'black';
          });
          scoreText.innerHTML = "Letters not connected or not on board";
        }
      }

      words.value = '';
    }
  });
  scoreText = document.getElementById("score");
  wordsHolder = document.getElementById("wordsHolder"); // clear progress and UI

  count = 0;
  wordsHolder.innerHTML = '';
  pBar.style.width = "0%";
  pBar.style.backgroundColor = "";
  words.disabled = false;
  scoreText.innerHTML = "Find as many words as you can until time runs out.";
  words.value = ""; // check if we are in a game

  if (interval) {
    // if yes then reset everything
    clearInterval(interval);
    interval = undefined;
    reset();
    return;
  } // set up a board - shuffle dice


  var newBoardDice = shuffle(STANDARD_CUBES); // returns an array of 16 letters

  scrambled = fisherYates(newBoardDice); // scrambled the array to random blocks on the board
  // assign each dice to a div

  scrambled.forEach(function (eachDice, i) {
    document.getElementById((i + 1).toString()).innerHTML = eachDice;
    document.getElementById((i + 1).toString()).style.backgroundColor = 'black';
  }); // set up our main timer

  interval = setInterval(function () {
    if (count < 100) {
      // update progress bar width
      pBar.style.width = count + "%";

      if (count > 90) {
        // getting close to the end
        pBar.style.backgroundColor = "red";
      }
    }

    count += 1; // increment counter

    if (count >= 100) {
      // we are at the end
      pBar.style.width = "100%";
      clearInterval(interval);
      setTimeout(function () {
        handleGameEnd(); // give a few seconds before ending
      }, 1000);
    }
  }, 2500);
};