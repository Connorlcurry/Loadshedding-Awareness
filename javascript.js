//Flashlight Function
let lastX = window.innerWidth / 2;
let lastY = window.innerHeight / 2;

function move(e) {
  let x = e.clientX || (e.touches && e.touches[0].clientX);
  let y = e.clientY || (e.touches && e.touches[0].clientY);

  if (x && y) {
    lastX = x;
    lastY = y;
  }

  document.documentElement.style.setProperty('--cursorX', lastX + 'px');
  document.documentElement.style.setProperty('--cursorY', lastY + 'px');
}

document.addEventListener('mousemove', move);
document.addEventListener('touchmove', move);

// Maintain flashlight effect even if cursor leaves screen
document.addEventListener('mouseleave', () => {
  document.documentElement.style.setProperty('--cursorX', lastX + 'px');
  document.documentElement.style.setProperty('--cursorY', lastY + 'px');
});

// Reset game function to clear localStorage if game is played again
function resetGame() {
  const rooms = ["LivingRoom", "KitchenRoom", "BedRoom"];

  rooms.forEach(room => {
    localStorage.removeItem(`${room}Score`);
    for (let i = 1; i <= 10; i++) {
      localStorage.removeItem(`${room}Clicked${i}`);
    }
  });
}

// // Asks the user if they want to leave the game and return to the home page
// document.getElementById("homeLink").addEventListener("click", function (event) {
//   const confirmLeave = confirm("Are you sure you want to leave the game and return to the home page? Your progress will be saved.");
//     if (!confirmLeave) {
//       event.preventDefault(); // Stops the navigation if user cancels
//     }
// });

// // Asks the user if they want to leave the game and go to contact page
// document.getElementById("contactLink").addEventListener("click", function (event) {
//   const confirmLeave = confirm("Are you sure you want to leave the game and return to the home page? Your progress will be saved.");
//     if (!confirmLeave) {
//       event.preventDefault(); // Stops the navigation if user cancels
//     }
// });

// // Asks the user is sure about restarting the game
// document.getElementById("restartLink").addEventListener("click", function (event) {
//   const confirmLeave = confirm("Are you sure you want to leave the game and return to the home page? Your progress will be saved.");
//     if (!confirmLeave) {
//       event.preventDefault(); // Stops the navigation if user cancels
//     }
// });

//--------------Players, New Players and Scoreboard--------------//
// Load players from localStorage or use default values.
let players = JSON.parse(localStorage.getItem('players')) || [
  { firstName: "Alex", score: 21 },
  { firstName: "Jamie", score: 17 },
  { firstName: "Luna", score: 28 },
  { firstName: "Kai", score: 24 },
  { firstName: "Riley", score: 19 }
];

// Converts players to a string and saves it to localStorage.
localStorage.setItem('players', JSON.stringify(players));

// //Form Submission and Validation
function handleStartGame(e) {
  e.preventDefault();
  resetGame();

  const fullName = document.getElementById('fullNameInput').value.trim();
  const gender = document.getElementById('genderSelect').value;

  if (fullName === '') {
    alert('Please enter your full name.');
    return;
  }

  if (gender === '') {
    alert('Please select a gender.');
    return;
  }

  const nameParts = fullName.split(' ');
  const firstName = nameParts[0];
  const surname = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

  //Creates object for the player
  const playerData = {
    firstName: firstName,
    surname: surname,
    gender: gender,
    score: 0
  };

  // Add the player to the array and save
  players.push(playerData);
  localStorage.setItem('players', JSON.stringify(players));
  localStorage.setItem('playerFirstName', firstName);
  localStorage.setItem('playerScore', 0);

  // Redirect to start the game
  window.location.href = 'Map.html';
}


//--------------Function to populate Scoreboard--------------//
function populateScoreboard() {
  try {
    const scoreboardTable = document.getElementById("scoreboardTable");

    // Avoid error if scoreboard not on this page (map, contact, etc.)
    if (!scoreboardTable) return; 

    const tableBody = scoreboardTable.querySelector("tbody");
    tableBody.innerHTML = ''; // Clear existing rows

    // Sort players by score in descending order
    const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

    // Place sorted players in the table
    sortedPlayers.forEach(player => {
      const row = document.createElement("tr");
      row.innerHTML = `<td>${player.firstName}</td><td>${player.score}</td>`;
      tableBody.appendChild(row);
    });
  } catch (error) {
    console.error("Error populating scoreboard:", error);
  }
}

// Attach form submission event
const form = document.getElementById('startGameForm');
if (form) {
  form.addEventListener('submit', handleStartGame);
}

// ----------- Update Current Player's Score from Room Scores ----------- //
function updateCurrentPlayerScore() {
  const livingScore = parseInt(localStorage.getItem('LivingRoomScore')) || 0;
  const kitchenScore = parseInt(localStorage.getItem('KitchenRoomScore')) || 0;
  const bedroomScore = parseInt(localStorage.getItem('BedRoomScore')) || 0;

  const totalScore = livingScore + kitchenScore + bedroomScore;

  // Save total score to localStorage
  localStorage.setItem('playerScore', totalScore);

  // Update player in players array
  const playerFirstName = localStorage.getItem('playerFirstName');
  if (!playerFirstName) return;

  // Find the player and update score
  const playerIndex = players.findIndex(p => p.firstName === playerFirstName);
  if (playerIndex !== -1) {
    players[playerIndex].score = totalScore;
    localStorage.setItem('players', JSON.stringify(players));
  }
}

// Run the function Populate scoreboard if on this page
updateCurrentPlayerScore(); 
populateScoreboard();

//--------------Finish Button--------------//
//Update Scoreboard when finish is pressed
document.addEventListener("DOMContentLoaded", function () {
  const finishBtn = document.getElementById("finishButton");
  if (finishBtn) {
    finishBtn.addEventListener("click", () => {
      if (typeof updateCurrentPlayerScore === "function" && typeof populateScoreboard === "function") {
        updateCurrentPlayerScore();
        populateScoreboard();
      }
    });
  }
});

//--------------Download Scoreboard as Text--------------//
document.addEventListener("DOMContentLoaded", function () {
  const downloadBtn = document.getElementById("downloadScoreBtn");

  if (downloadBtn) {
    downloadBtn.addEventListener("click", function () {
      const table = document.getElementById("scoreboardTable");
      let csvContent = "";

      const rows = table.querySelectorAll("tr");
      rows.forEach(row => {
        const cols = row.querySelectorAll("th, td");
        const rowData = Array.from(cols).map(col => `"${col.textContent.trim()}"`).join(",");
        csvContent += rowData + "\r\n";
      });

      const blob = new Blob([csvContent], { type: "text/txt;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", "scoreboard.txt");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  }
});
