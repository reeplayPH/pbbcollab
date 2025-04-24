// Takes in name of csv and populates necessary data in table
function readFromCSV(path) {
  var rawFile = new XMLHttpRequest();
  rawFile.open("GET", path, false);
  rawFile.onreadystatechange = function() {
    if (rawFile.readyState === 4) {
      if (rawFile.status === 200 || rawFile.status == 0) {
        let allText = rawFile.responseText;
        let out = CSV.parse(allText);
        let housemates = convertCSVArrayToHousemateData(out);
        populateTable(housemates);
      }
    }
  };
  rawFile.send(null);
}

function findHousemateById(id) {
  for (let i = 0; i < housemates.length; i++) {
    if (id === housemates[i].id) { // if housemate's match
      return housemates[i];
    }
  }
  return newHousemate();
}

// If the user has saved a ranking via id, then recover it here
function getRanking() {
  var urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has("r")) {
    let rankString = atob(urlParams.get("r")) // decode the saved ranking
    let rankingIds = [];
    for (let i = 0; i < rankString.length; i += 2) {
      let housemateId = rankString.substr(i, 2); // get each id of the housemate by substringing every 2 chars
      rankingIds.push(parseInt(housemateId));
    }
    console.log(rankingIds);
    // use the retrieved rankingIds to populate ranking
    for (let i = 0; i < rankingIds.length; i++) {
      housemateId = rankingIds[i];
      if (housemateId < 0) {
        ranking[i] = newHousemate();
      } else {
        let housemate = findHousemateById(rankingIds[i])
        // let housemate = housemates[rankingIds[i]];
        housemate.selected = true;
        ranking[i] = housemate;
      }
    }
    // refresh table to show checkboxes
    rerenderTable();
    // refresh ranking to show newly inserted housemates
    rerenderRanking();
    console.log(ranking);
  }
}

// Takes in an array of housemates and converts it to js objects
// Follows this schema:
/*
housemate: {
  id: ... // position in csv used for simple recognition
  fullname: ...
  name_hangul: ...
  name_japanese: ...
  location: ...
  grade: a/b/c/d/f
  age: ...
  image: ...
  selected: false/true // whether user selected them
  evicted: false/true
  big4: false/true
}
*/
function convertCSVArrayToHousemateData(csvArrays) {
  housemates = csvArrays.map(function(housemateArray, index) {
    housemate = {};
    housemate.fullname = housemateArray[0];
    housemate.shortname = housemateArray[1];
    housemate.agency = housemateArray[2];
    housemate.location = housemateArray [3];
    housemate.agencycolor = housemateArray[4];
    housemate.age = housemateArray[5];
    housemate.evicted = housemateArray[6] === 'e'; // sets housemate to be evicted if 'e' appears in 6th col
    housemate.big4 = housemateArray[6] === 'b'; // sets housemate to top 6 if 't' appears in 6th column
    housemate.id = parseInt(housemateArray[7]) - 1; // housemate id is the original ordering of the housemates in the first csv
    housemate.image =
      housemate.fullname.replaceAll(" ", "").replaceAll("-", "") + ".png";
    return housemate;
  });
  filteredHousemates = housemates;
  return housemates;
}

// Constructor for a blank housemate
function newHousemate() {
  return {
    id: -1, // -1 denotes a blank housemate spot
    fullname: '&#8203;', // this is a blank character
    location: '&#8203;',
    age: '&#8203;',
    agencycolor: 'no',
    image: 'emptyrank.png',
  };
}

// Constructor for a blank ranking list
function newRanking() {
  // holds the ordered list of rankings that the user selects
  let ranking = new Array(7);
  for (let i = 0; i < ranking.length; i++) {
    ranking[i] = newHousemate();
  }
  return ranking;
}

// rerender method for table (search box)
// TODO: this site might be slow to rerender because it clears + adds everything each time
function rerenderTable() {
  clearTable();
  populateTable(filteredHousemates);
  // populateRanking();
}

// rerender method for ranking
function rerenderRanking() {
  clearRanking();
  populateRanking();
}

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
  // Currently just duplicates first ranking entry
  let ranking_chart = document.getElementById("ranking__pyramid");
  let rankRows = Array.from(ranking_chart.children).slice(1); // remove the title element
  // let rankEntry = rankRows[0].children[0];
  for (let i = 0; i < rowNums.length; i++) {
    let rankRow = rankRows[i];
    for (let j = 0; j < rowNums[i]; j++) {
      removeAllChildren(rankRow);
    }
  }
}

// Uses populated local data structure from readFromCSV to populate table
function populateTable(housemates) {
  // Currently just duplicates the first table entry
  let table = document.getElementById("table__entry-container");
  exampleEntry = table.children[0];
  for (let i = 0; i < housemates.length; i++) {
    // generate and insert the html for a new housemate table entry
    table.insertAdjacentHTML("beforeend", populateTableEntry(housemates[i]));
    // add the click listener to the just inserted element
    let insertedEntry = table.lastChild;
    insertedEntry.addEventListener("click", function (event) {
      tableClicked(housemates[i]);
    });
  }
}

function populateTableEntry(housemate) {
  // evicted will have value "evicted" only if housemate is evicted and showEvicted is true, otherwise this is ""
  let evicted = (showEvicted && housemate.evicted) && "evicted";
  let big4 = (showBig4 && housemate.big4) && "big4";
  const tableEntry = `
  <div class="table__entry ${evicted}">
    <div class="table__entry-icon">
      <img class="table__entry-img" src="assets/housemates/${housemate.image}" />
      <div class="table__entry-agency-color ${housemate.agencycolor.toLowerCase()}-rank-border"></div>
      ${
        big4 ? '<div class="table__entry-icon-crown"></div>' : ''
      }
      ${
        housemate.selected ? '<img class="table__entry-check" src="assets/check.png"/>' : ""
      }
    </div>
    <div class="table__entry-text">
      <span class="fullname"><strong>${housemate.fullname}</strong></span>
      <span class="shortname">(${housemate.shortname})</span>
      <span class="locationandage">${housemate.location.toUpperCase()} •
      ${housemate.age}</span>
    </div>
  </div>`;
  return tableEntry;
}

// Uses populated local data structure from getRanking to populate ranking
function populateRanking() {
  // Currently just duplicates first ranking entry
  let ranking_chart = document.getElementById("ranking__pyramid");
  let rankRows = Array.from(ranking_chart.children).slice(1); // remove the title element
  // let rankEntry = rankRows[0].children[0];
  let currRank = 1;
  for (let i = 0; i < rowNums.length; i++) {
    let rankRow = rankRows[i];
    for (let j = 0; j < rowNums[i]; j++) {
      let currHousemate = ranking[currRank-1];
      rankRow.insertAdjacentHTML("beforeend", populateRankingEntry(currHousemate, currRank))

      let insertedEntry = rankRow.lastChild;
      let dragIcon = insertedEntry.children[0].children[0]; // drag icon is just the housemate image and border
      let iconBorder = dragIcon.children[1]; // this is just the border and the recipient of dragged elements
      // only add these event listeners if a housemate exists in this slot
      if (currHousemate.id >= 0) {
        // add event listener to remove item
        insertedEntry.addEventListener("click", function (event) {
          rankingClicked(currHousemate);
        });
        // add event listener for dragging
        dragIcon.setAttribute('draggable', true);
        dragIcon.classList.add("drag-cursor");
        dragIcon.addEventListener("dragstart", createDragStartListener(currRank - 1));
      }
      // add event listeners for blank/filled ranking entries
      iconBorder.addEventListener("dragenter", createDragEnterListener());
      iconBorder.addEventListener("dragleave", createDragLeaveListener());
      iconBorder.addEventListener("dragover", createDragOverListener());
      iconBorder.addEventListener("drop", createDropListener());
      // }
      currRank++;
    }
  }
}

function populateRankingEntry(housemate, currRank) {
  let evicted = (showEvicted && housemate.evicted) && "evicted";
  let big4 = (showBig4 && housemate.big4) && "big4";
  const rankingEntry = `
  <div class="ranking__entry ${evicted}">
    <div class="ranking__entry-view">
      <div class="ranking__entry-icon">
        <img class="ranking__entry-img" src="assets/housemates/${housemate.image}" />
        <div class="ranking__entry-agency-color ${housemate.agencycolor.toLowerCase()}-rank-border" data-rankid="${currRank-1}"></div>
      </div>
      <div class="ranking__entry-icon-badge bg-${housemate.agencycolor.toLowerCase()}">${currRank}</div>
      ${
        big4 ? '<div class="ranking__entry-icon-crown"></div>' : ''
      }
    </div>
    <div class="ranking__row-text">
      <div class="fullname"><strong>${housemate.fullname}</strong></div>
      <div class="age">${housemate.age}</div>
    </div>
  </div>`;
  return rankingEntry;
}

// Event handlers for table
function tableClicked(housemate) {
  if (housemate.selected) {
    // Remove the housemate from the ranking
    let success = removeRankedHousemate(housemate);
    if (success) { // if removed successfully
      housemate.selected = !housemate.selected;
    } else {
      return;
    }
  } else {
    // Add the housemate to the ranking
    let success = addRankedHousemate(housemate);
    if (success) { // if added successfully
      housemate.selected = true;
    } else {
      return;
    }
  }
  rerenderTable();
  rerenderRanking();
}

// Event handler for ranking
function rankingClicked(housemate) {
	if (housemate.selected) {
    housemate.selected = !housemate.selected;
    // Remove the housemate from the ranking
    removeRankedHousemate(housemate);
  }
  rerenderTable();
	rerenderRanking();
}

function swapHousemates(index1, index2) {
  tempHousemate = ranking[index1];
  ranking[index1] = ranking[index2];
  ranking[index2] = tempHousemate;
  rerenderRanking();
}

// Controls alternate ways to spell housemate names
// to add new entries use the following format:
// <original>: [<alternate1>, <alternate2>, <alternate3>, etc...]
// <original> is the original name as appearing on csv
// all of it should be lower case
const alternateRomanizations = {
  'az martinez': ['az','martinez','ang miss sunuring daughter ng cebu','cebu'],
  'bianca de vera': ['bianca','devera','de vera','ang sassy unica hija ng taguig','taguig'],
  'brent manalo': ['brent','manalo','ang gentle-linong heartthrob ng tarlac','tarlac'],
  'dustin yu': ['dustin','yu','ang chinito boss-sikap ng quezon city','quezon city','qc'],
  'emilio daez': ['emilio','mio','daez','ang mr. bankable achiever ng pasig','pasig'],
  'esnyr ranollo': ['esnyr','ang son-sational viral beshie ng davao del sur','davao'],
  'josh ford': ['josh','ford','ang survicor lad ng united kingdom','united kingdom','uk'],
  'klarisse de guzman': ['klang','klarisse','ate klang','deguzman','de guzman','ang kwela soul diva ng antipolo','antipolo'],
  'michael sager': ['michael','sager','ang diligent wonder son ng marinduque','marinduque'],
  'mika salamanca': ['mica','salamanca','ang controversial ca-babe-len ng pampanga','pampanga'],
  'ralph de leon': ['ralph','deleon','de leon','saing','saing king','kaldero','ang dutiful judo-son ng cavite','cavite'],
  'river joseph': ['river','joseph','ang sporty business bro ng muntinlupa city','muntinlupa'],
  'shuvee etrata': ['shuvee','etrata','katipunera','island ate ng cebu','ang island ate ng cebu','cebu'],
  'vince maristela': ['vince','maristela','ang charming bro-next-door ng cainta','charming bro-next-door ng cainta','cainta'],
  'will ashley': ['will','ashley','ang mama''s dreambae ng cavite','cavite','nation''s son'],
  'xyriel manabat': ['xyriel','manabat','golden anaktress ng rizal','ang golden anaktress ng rizal','rizal'],
  'charlie fleming': ['charlie','fleming','ang bubbly bread teener ng cagayan de oro','teen','cagayan de oro','evicted'],
  'kira balinger': ['kira','balinger','ang hopeful belle ng cavite','cavite','evicted'],
  'ac bonifacio': ['ac','bonifacio','ang dedicated showstopper ng canada','canada','evicted'],
  'ashley ortega': ['ashley','ortega','ang independent tis-ice princess ng san juan','san juan','evicted']
};

// uses the current filter text to create a subset of housemates with matching info
function filterHousemates(event) {
  let filterText = event.target.value.toLowerCase();
  // filters housemates based on name, alternate names, location and birth year
  filteredHousemates = housemates.filter(function (housemate) {
    let initialMatch = includesIgnCase(housemate.fullname, filterText) || includesIgnCase (housemate.age, filterText) || includesIgnCase (housemate.location, filterText);
    // if alernates exists then check them as well
    let alternateMatch = false;
    let alternates = alternateRomanizations[housemate.fullname.toLowerCase()]
    if (alternates) {
      for (let i = 0; i < alternates.length; i++) {
        alternateMatch = alternateMatch || includesIgnCase(alternates[i], filterText);
      }
    }
    return initialMatch || alternateMatch;
  });
  filteredHousemates = sortedHousemates(filteredHousemates);
  rerenderTable();
}

// Checks if mainString includes a subString and ignores case
function includesIgnCase(mainString, subString) {
  return mainString.toLowerCase().includes(subString.toLowerCase());
}

// Finds the first blank spot for
function addRankedHousemate(housemate) {
  for (let i = 0; i < ranking.length; i++) {
    if (ranking[i].id === -1) { // if spot is blank denoted by -1 id
      ranking[i] = housemate;
      return true;
    }
  }
  return false;
}

function removeRankedHousemate(housemate) {
  for (let i = 0; i < ranking.length; i++) {
    if (ranking[i].id === housemate.id) { // if housemate's match
      ranking[i] = newHousemate();
      return true;
    }
  }
  return false;
}

const currentURL = "https://reeplayph.github.io/pbbcollab/";
// Serializes the ranking into a string and appends that to the current URL
function generateShareLink() {
  let shareCode = ranking.map(function (housemate) {
    let twoCharID = ("0" + housemate.id).slice(-2); // adds a zero to front of digit if necessary e.g 1 --> 01
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
  let shareBox = document.getElementById("getlink-textbox");
  shareBox.select();
  document.execCommand("copy");
}

// holds the list of all housemates
var housemates = [];
// holds the list of housemates to be shown on the table
var filteredHousemates = [];
// holds the ordered list of rankings that the user selects
var ranking = newRanking();
const rowNums = [1,2,3];
//window.addEventListener("load", function () {
  populateRanking();
  readFromCSV("./housemate_info.csv");
//});
// checks the URL for a ranking and uses it to populate ranking
getRanking();
