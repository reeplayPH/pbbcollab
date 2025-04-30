// Takes in name of csv and populates necessary data in table
function readFromCSV(path) {
  var rawFile = new XMLHttpRequest();
  rawFile.open("GET", path, false);
  rawFile.onreadystatechange = function() {
    if (rawFile.readyState === 4) {
      if (rawFile.status === 200 || rawFile.status == 0) {
        let allText = rawFile.responseText;
        let out = CSV.parse(allText);
        let trainees = convertCSVArrayToTraineeData(out);
        console.log("Trainees from CSV:", trainees); // Debugging log
        populateTable(trainees);
      }
    }
  };
  rawFile.send(null);
}

function convertCSVArrayToTraineeData(csvArrays) {
  trainees = csvArrays.map(function(traineeArray, index) {
    let trainee = {};
    trainee.fullname = traineeArray[0];
    trainee.shortname = traineeArray[1];
    trainee.agency = traineeArray[2];
    trainee.location = traineeArray[3];
    trainee.agencycolor = traineeArray[4];
    trainee.agencysp = traineeArray[4] === 'A';
    trainee.agencysm = traineeArray[4] === 'B';
    trainee.age = traineeArray[5];
    trainee.evicted = traineeArray[6] === 'e'; // sets trainee to be evicted if 'e' appears in 6th col
    trainee.big4 = traineeArray[6] === 'b'; // sets trainee to top 6 if 't' appears in 6th column
    trainee.nominated = traineeArray[6] === 'n'; // sets trainee to be nominated if 'e' appears in 6th column
    trainee.id = parseInt(traineeArray[7]) - 1; // trainee id is the original ordering of the trainees in the first csv
    trainee.image = trainee.fullname.replaceAll(" ", "").replaceAll("-", "") + ".JPG";
    return trainee;
  });
  filteredTrainees = trainees;
  console.log("Converted Trainees:", trainees); // Debugging log
  return trainees;
}

function findTraineeById(id) {
  for (let i = 0; i < trainees.length; i++) {
    if (id === trainees[i].id) { // if trainee's match
      return trainees[i];
    }
  }
  return newTrainee();
}

// If the user has saved a ranking via id, then recover it here
function getRanking() {
  var urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has("r")) {
    let rankString = atob(urlParams.get("r")); // decode the saved ranking
    let rankingIds = [];
    for (let i = 0; i < rankString.length; i += 2) {
      let traineeId = rankString.substr(i, 2); // get each id of the trainee by substringing every 2 chars
      rankingIds.push(parseInt(traineeId));
    }
    console.log(rankingIds);
    // use the retrieved rankingIds to populate ranking
    for (let i = 0; i < rankingIds.length; i++) {
      let traineeId = rankingIds[i];
      if (traineeId < 0) {
        ranking[i] = newTrainee();
      } else {
        let trainee = findTraineeById(rankingIds[i]);
        trainee.selected = true;
        ranking[i] = trainee;
      }
    }
    // refresh table to show checkboxes
    rerenderTable();
    // refresh ranking to show newly inserted trainees
    if (trainee.agencysp) {
      rerenderRanking2();
    } else {
      rerenderRanking();
    }
    console.log(ranking);
  }
}

window.onload = function() {
  document.getElementById('clickMenu').style.display = 'none'; // Ensure menu is hidden on page load

  document.getElementById('.display-options-icon').addEventListener('click', function() {
    var menu = document.getElementById('clickMenu');
    if (menu.style.display === 'none') {
      menu.style.display = 'block';
    } else {
      menu.style.display = 'none';
    }
  });
};

function toggleMenu() {
  var menu = document.getElementById('clickMenu');
  if (menu.style.display === 'none') {
    menu.style.display = 'block';
  } else {
    menu.style.display = 'none';
  }
}

// Optional: Close the menu if clicked outside
/*window.onclick = function(event) {
  if (!event.target.matches('.display-options-icon')) {
    var menus = document.getElementsByClassName('click-menu');
    for (var i = 0; i < menus.length; i++) {
      var openMenu = menus[i];
      if (openMenu.style.display === 'block') {
        openMenu.style.display = 'none';
      }
    }
  }
}*/

function removeAllChildren(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

// Clears out the table
function clearTable() {
  let table = document.getElementById("table__entry-container");
  removeAllChildren(table);
}

// Clears out the ranking
function clearRanking() {
  let ranking_chart = document.getElementById("ranking__pyramid");
  let rankRows = Array.from(ranking_chart.children).slice(1); // remove the title element
  for (let i = 0; i < rowNums.length; i++) {
    let rankRow = rankRows[i];
    for (let j = 0; j < rowNums[i]; j++) {
      removeAllChildren(rankRow);
    }
  }
}

// Clears out the ranking
function clearRanking2() {
  let ranking_chart2 = document.getElementById("ranking__pyramid2");
  let rankRows2 = Array.from(ranking_chart2.children).slice(1); // remove the title element
  for (let i = 0; i < rowNums.length; i++) {
    let rankRow2 = rankRows2[i];
    for (let j = 0; j < rowNums[i]; j++) {
      removeAllChildren(rankRow2);
    }
  }
}

// Function to populate ranking
function populateRanking() {
  let selectedA = 0;
  let ranking_chart = document.getElementById("ranking__pyramid");
  let rankRows = Array.from(ranking_chart.children).slice(1); // remove the title element

  for (let i = 0; i < trainees.length; i++) {
    if (trainees[i].agencycolor === 'A' && selectedA < 4) {
      let rankRow = rankRows[selectedA];
      let rankEntry = document.createElement("div");
      rankEntry.className = "rank-entry";
      rankEntry.innerHTML = trainees[i].fullname;
      rankRow.appendChild(rankEntry);
      selectedA++;
    }
  }
}

// Function to populate ranking2
function populateRanking2() {
  let selectedB = 0;
  let ranking_chart2 = document.getElementById("ranking__pyramid2");
  let rankRows2 = Array.from(ranking_chart2.children).slice(1); // remove the title element

  for (let i = 0; i < trainees.length; i++) {
    if (trainees[i].agencycolor === 'B' && selectedB < 4) {
      let rankRow2 = rankRows2[selectedB];
      let rankEntry2 = document.createElement("div");
      rankEntry2.className = "rank-entry";
      rankEntry2.innerHTML = trainees[i].fullname;
      rankRow2.appendChild(rankEntry2);
      selectedB++;
    }
  }
}

// Uses populated local data structure from readFromCSV to populate table
function populateTable(trainees) {
  let table = document.getElementById("table__entry-container");
  let exampleEntry = table.children[0];
  for (let i = 0; i < trainees.length; i++) {
    table.insertAdjacentHTML("beforeend", populateTableEntry(trainees[i]));
    let insertedEntry = table.lastChild;
    insertedEntry.addEventListener("click", function (event) {
      tableClicked(trainees[i]);
    });
  }
}

function populateTableEntry(trainee) {
  let evicted = (showEvicted && trainee.evicted) ? "evicted" : "";
  let big4 = (showBig4 && trainee.big4) ? "big4" : "";
  let nominated = (showNominated && trainee.nominated) ? "nominated" : "";
  const tableEntry = `
  <div class="table__entry ${evicted}">
    <div class="table__entry-icon">
      <img class="table__entry-img" src="assets/housemates/${trainee.image}" />
      <div class="table__entry-icon-border ${trainee.agencycolor.toLowerCase()}-rank-border"></div>
      ${big4 ? '<div class="table__entry-icon-crown"></div>' : ''}
      ${nominated ? '<div class="table__entry-nominated"></div>' : ''}
      ${trainee.selected ? '<img class="table__entry-check" src="assets/check.png"/>' : ""}
    </div>
    <div class="table__entry-text">
      <span class="fullname"><strong>${trainee.fullname}</strong></span>
      <span class="agency">(${trainee.agency})</span>
      <span class="ageandlocation">${trainee.age} • ${trainee.location.toUpperCase()}</span>
    </div>
  </div>`;
  return tableEntry;
}

// Uses populated local data structure from getRanking to populate ranking
function populateRankingEntry(trainee, currRank) {
  let evicted = (showEvicted && trainee.evicted) ? "evicted" : "";
  let big4 = (showBig4 && trainee.big4) ? "big4" : "";
  let nominated = (showNominated && trainee.nominated) ? "nominated" : "";
  let RankTag = "BIG WINNER";
  if (currRank != 1) {
    RankTag = currRank.toString(); 
  }
  const rankingEntry = `
  <div class="ranking__entry ${evicted}">
    <div class="ranking__entry-view">
      <div class="ranking__entry-icon">
        <img class="ranking__entry-img" src="assets/housemates/${trainee.image}" />
        <div class="ranking__entry-icon-border ${trainee.agencycolor.toLowerCase()}-rank-border" data-rankid="${currRank-1}"></div>
      </div>
      <div class="ranking__entry-icon-badge bg-${trainee.agencycolor.toLowerCase()}">${RankTag}</div>
      ${big4 ? '<div class="ranking__entry-icon-crown"></div>' : ''}
      ${nominated ? '<div class="ranking__entry-nominated"></div>' : ''}
    </div>
    <div class="ranking__row-text">
      <div class="name"><strong>${trainee.shortname.toUpperCase()}</strong></div>
      <div class="year">${trainee.age}</div>
    </div>
  </div>`;
  return rankingEntry;
}

// Event handlers for table
function tableClicked(trainee) {
  if (trainee.selected) {
    // Remove the trainee from the ranking
    let success = removeRankedTrainee(trainee);
    if (success) { // if removed successfully
      trainee.selected = !trainee.selected;
    } else {
      return;
    }
  } else {
    // Add the trainee to the ranking
    let success = addRankedTrainee(trainee);
    if (success) { // if added successfully
      trainee.selected = true;
    } else {
      return;
    }
  }
  rerenderTable();
  if (trainee.agencysm) {
    rerenderRanking();
  } else if (trainee.agencysp) {
    rerenderRanking2();
  }
}

// Event handler for ranking
function rankingClicked(trainee) {
  if (trainee.selected) {
    trainee.selected = !trainee.selected;
    // Remove the trainee from the ranking
    removeRankedTrainee(trainee);
  }
  rerenderTable();
  rerenderRanking();
}

// Event handler for ranking
function rankingClicked2(trainee) {
  if (trainee.selected) {
    trainee.selected = !trainee.selected;
    // Remove the trainee from the ranking
    removeRankedTrainee(trainee);
  }
  rerenderTable();
  rerenderRanking2();
}

function swapTrainees(index1, index2) {
  let tempTrainee = ranking[index1];
  ranking[index1] = ranking[index2];
  ranking[index2] = tempTrainee;
  rerenderRanking();
}

function swapTrainees2(index1, index2) {
  let tempTrainee = ranking[index1];
  ranking[index1] = ranking[index2];
  ranking[index2] = tempTrainee;
  rerenderRanking2();
}

// Controls alternate ways to spell trainee names
const alternateRomanizations = {
  'az martinez': ['az','martinez','ang miss sunuring daughter ng cebu','cebu','sparkle','kapuso'],
  'bianca de vera': ['bianca','devera','de vera','ang sassy unica hija ng taguig','taguig','star magic','kapamilya'],
  'brent manalo': ['brent','manalo','ang gentle-linong heartthrob ng tarlac','tarlac','star magic','kapamilya'],
  'dustin yu': ['dustin','yu','ang chinito boss-sikap ng quezon city','quezon city','qc','sparkle','kapuso'],
  'emilio daez': ['emilio','mio','daez','ang mr. bankable achiever ng pasig','pasig','star magic','kapamilya'],
  'esnyr ranollo': ['esnyr','ang son-sational viral beshie ng davao del sur','davao','star magic','kapamilya'],
  'josh ford': ['josh','ford','ang survicor lad ng united kingdom','united kingdom','uk','sparkle','kapuso'],
  'klarisse de guzman': ['klang','klarisse','ate klang','deguzman','de guzman','ang kwela soul diva ng antipolo','antipolo','star magic','kapamilya'],
  'michael sager': ['michael','sager','ang diligent wonder son ng marinduque','marinduque','sparkle','kapuso'],
  'mika salamanca': ['mica','salamanca','ang controversial ca-babe-len ng pampanga','pampanga','sparkle','kapuso'],
  'ralph de leon': ['ralph','deleon','de leon','saing','saing king','kaldero','ang dutiful judo-son ng cavite','cavite','star magic','kapamilya'],
  'river joseph': ['river','joseph','ang sporty business bro ng muntinlupa city','muntinlupa','star magic','kapamilya'],
  'shuvee etrata': ['shuvee','etrata','katipunera','island ate ng cebu','ang island ate ng cebu','cebu','sparkle','kapuso'],
  'vince maristela': ['vince','maristela','ang charming bro-next-door ng cainta','cainta','sparkle','kapuso'],
  'will ashley': ['will','ashley','ang mamas dreambae ng cavite','cavite','nations son','sparkle','kapuso'],
  'xyriel manabat': ['xyriel','manabat','ang golden anaktress ng rizal','rizal','star magic','kapamilya'],
  'charlie fleming': ['charlie','fleming','ang bubbly bread teener ng cagayan de oro','teen','cagayan de oro','evicted','sparkle','kapuso'],
  'kira balinger': ['kira','balinger','ang hopeful belle ng cavite','cavite','evicted','star magic','kapamilya'],
  'ac bonifacio': ['ac','bonifacio','ang dedicated showstopper ng canada','canada','evicted','star magic','kapamilya'],
  'ashley ortega': ['ashley','ortega','ang independent tis-ice princess ng san juan','san juan','evicted','sparkle','kapuso']
};

// uses the current filter text to create a subset of trainees with matching info
function filterTrainees(event) {
  let filterText = event.target.value.toLowerCase();
  // filters trainees based on name, alternate names, location and birth year
  filteredTrainees = trainees.filter(function (trainee) {
    let initialMatch = includesIgnCase(trainee.fullname, filterText) || includesIgnCase(trainee.age, filterText) || includesIgnCase(trainee.location, filterText);
    // if alternates exist then check them as well
    let alternateMatch = false;
    let alternates = alternateRomanizations[trainee.fullname.toLowerCase()];
    if (alternates) {
      for (let i = 0; i < alternates.length; i++) {
        alternateMatch = alternateMatch || includesIgnCase(alternates[i], filterText);
      }
    }
    return initialMatch || alternateMatch;
  });
  filteredTrainees = sortedTrainees(filteredTrainees);
  rerenderTable();
}

// Checks if mainString includes a subString and ignores case
function includesIgnCase(mainString, subString) {
  return mainString.toLowerCase().includes(subString.toLowerCase());
}

// Finds the first blank spot for
function addRankedTrainee(trainee) {
  for (let i = 0; i < ranking.length; i++) {
    if (ranking[i].id === -1) { // if spot is blank denoted by -1 id
      ranking[i] = trainee;
      return true;
    }
  }
  return false;
}

function removeRankedTrainee(trainee) {
  for (let i = 0; i < ranking.length; i++) {
    if (ranking[i].id === trainee.id) { // if trainee's match
      ranking[i] = newTrainee();
      return true;
    }
  }
  return false;
}

const currentURL = "https://pbbcollab.github.io/";
// Serializes the ranking into a string and appends that to the current URL
function generateShareLink() {
  let shareCode = ranking.map(function (trainee) {
    let twoCharID = ("0" + trainee.id).slice(-2); // adds a zero to front of digit if necessary e.g 1 --> 01
    return twoCharID;
  }).join("");
  console.log(shareCode);
  shareCode = btoa(shareCode);
  shareURL = currentURL + "?r=" + shareCode;
  showShareLink(shareURL);
}

function showShareLink(shareURL) {
  let shareBox = document.getElementById("getlink-textbox");
  shareBox.value = shareURL;
  document.getElementById("getlink-textbox").style.display = "block";
  document.getElementById("copylink-button").style.display = "block";
}

function copyLink() {
 .getElementById("getlink-textbox");
  shareBox.select();
  document.execCommand("copy");
}

// holds the list of all trainees
var trainees = [];
// holds the list of trainees to be shown on the table
var filteredTrainees = [];
// holds the ordered list of rankings that the user selects
var ranking = newRanking();
const rowNums = [1, 1, 1, 1];

// Initialize the application
window.addEventListener("load", function () {
  populateRanking();
  readFromCSV("./housemate_info.csv");
  // checks the URL for a ranking and uses it to populate ranking
  getRanking();
});
