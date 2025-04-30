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
        populateTable(trainees);
      }
    }
  };
  rawFile.send(null);
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
    let rankString = atob(urlParams.get("r")) // decode the saved ranking
    let rankingIds = [];
    for (let i = 0; i < rankString.length; i += 2) {
      let traineeId = rankString.substr(i, 2); // get each id of the trainee by substringing every 2 chars
      rankingIds.push(parseInt(traineeId));
    }
    console.log(rankingIds);
    // use the retrieved rankingIds to populate ranking
    for (let i = 0; i < rankingIds.length; i++) {
      traineeId = rankingIds[i];
      if (traineeId < 0) {
        ranking[i] = newTrainee();
      } else {
        let trainee = findTraineeById(rankingIds[i])
        // let trainee = trainees[rankingIds[i]];
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
    /*rerenderRanking();*/
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
  /*if (menu.style.display === 'block') {
    menu.style.display = 'none';
  } else {
    menu.style.display = 'block';
  }*/
        if (menu.style.display === 'none') {
            menu.style.display = 'block';
        } else {
            menu.style.display = 'none';
        }
}

// Optional: Close the menu if clicked outside
/*window.onclick = function(event) {
   (!event.target.matches('.display-options-icon')) {
    var menus = document.getElementsByClassName('click-menu');
    for (var i = 0; i < menus.length; i++) {
      var openMenu = menus[i];
      if (openMenu.style.display === 'block') {
        openMenu.style.display = 'none';
      }
    }
  }
}*/

function convertCSVArrayToTraineeData(csvArrays) {
  trainees = csvArrays.map(function(traineeArray, index) {
    trainee = {};
    trainee.fullname = traineeArray[0];
    trainee.shortname = traineeArray[1];
    trainee.agency = traineeArray[2];
    trainee.location = traineeArray [3];
    trainee.agencycolor = traineeArray[4];
    trainee.agencysp = traineeArray[4] === 'A';
    trainee.agencysm = traineeArray[4] === 'B';
    trainee.age = traineeArray[5];
    trainee.evicted = traineeArray[6] === 'e'; // sets trainee to be evicted if 'e' appears in 6th col
    trainee.big4 = traineeArray[6] === 'b'; // sets trainee to top 6 if 't' appears in 6th column
    trainee.nominated = traineeArray[6] === 'n'; // sets trainee to be nominated if 'e' appears in 6th column
    trainee.id = parseInt(traineeArray[7]) - 1; // trainee id is the original ordering of the trainees in the first csv
    trainee.image =
      trainee.fullname.replaceAll(" ", "").replaceAll("-", "") + ".JPG";
    return trainee;
  });
  filteredTrainees = trainees;
  return trainees;
}

// Constructor for a blank trainee
function newTrainee() {
  return {
    id: -1, // -1 denotes a blank trainee spot
    fullname: '&#8203;', // this is a blank character 
    shortname: '&#8203;',
    location: '&#8203;',
    age: '&#8203;',
    agencycolor: 'no',
    image: 'emptyrank.png',
  };
}

// Constructor for a blank ranking list
function newRanking() {
  // holds the ordered list of rankings that the user selects
  let ranking = new Array(8);
  for (let i = 0; i < ranking.length; i++) {
    ranking[i] = newTrainee();
  }
  return ranking;
}

// rerender method for table (search box)
// TODO: this site might be slow to rerender because it clears + adds everything each time
function rerenderTable() {
  clearTable();
  populateTable(filteredTrainees);
  // populateRanking();
}

// rerender method for ranking (KAPAMILYA)
function rerenderRanking() {
  clearRanking();
  populateRanking();
  /*clearRanking2();
  populateRanking2();*/
}

// rerender method for ranking (KAPUSO)
function rerenderRanking2() {
  clearRanking2();
  populateRanking2();
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

// Clears out the ranking
function clearRanking2() {
  // Currently just duplicates first ranking entry
  let ranking_chart2 = document.getElementById("ranking__pyramid2");
  let rankRows2 = Array.from(ranking_chart2.children).slice(1); // remove the title element
  // let rankEntry = rankRows[0].children[0];
  for (let i = 0; i < rowNums.length; i++) {
    let rankRow2 = rankRows2[i];
    for (let j = 0; j < rowNums[i]; j++) {
      removeAllChildren(rankRow2);
    }
  }
}

// Uses populated local data structure from readFromCSV to populate table
function populateTable(trainees) {
  // Currently just duplicates the first table entry
  let table = document.getElementById("table__entry-container");
  exampleEntry = table.children[0];
  for (let i = 0; i < trainees.length; i++) {
    // generate and insert the html for a new trainee table entry
    table.insertAdjacentHTML("beforeend", populateTableEntry(trainees[i]));
    // add the click listener to the just inserted element
    let insertedEntry = table.lastChild;
    insertedEntry.addEventListener("click", function (event) {
      tableClicked(trainees[i]);
    });
  }
}

function populateTableEntry(trainee) {
  // evicted will have value "evicted" only if trainee is evicted and showEvicted is true, otherwise this is ""
  let evicted = (showEvicted && trainee.evicted) && "evicted";
  let big4 = (showBig4 && trainee.big4) && "big4";
  let nominated = (showNominated && trainee.nominated) && "nominated";
  const tableEntry = `
  <div class="table__entry ${evicted}">
    <div class="table__entry-icon">
      <img class="table__entry-img" src="assets/housemates/${trainee.image}" />
      <div class="table__entry-icon-border ${trainee.agencycolor.toLowerCase()}-rank-border"></div>
      ${
        big4 ? '<div class="table__entry-icon-crown"></div>' : ''
      }
      ${
        nominated ? '<div class="table__entry-nominated"></div>' : ''
      }
      ${
        trainee.selected ? '<img class="table__entry-check" src="assets/check.png"/>' : ""
      }
    </div>
    <div class="table__entry-text">
      <span class="fullname"><strong>${trainee.fullname}</strong></span>
      <span class="agency">(${trainee.agency})</span>
      <span class="ageandlocation">${trainee.age} •
      ${trainee.location.toUpperCase()}</span>
    </div>
  </div>`;
  return tableEntry;
}

// Uses populated local data structure from getRanking to populate ranking
function populateRanking() {
  // Currently just duplicates first ranking entry
  let ranking_chart = document.getElementById("ranking__pyramid");
  let ranking_chart2 = document.getElementById("ranking__pyramid2");
  let rankRows = Array.from(ranking_chart.children).slice(1); // remove the title element
  let rankRows2 = Array.from(ranking_chart2.children).slice(1); 
  // let rankEntry = rankRows[0].children[0];
  let currRank = 1;
  let sp = 1;
  let sm = 1;
  for (let i = 0; i < rowNums.length;) {
    let rankRow = rankRows[sm-1];
    let rankRow2 = rankRows2[sp-1];
    for (let j = 0; j < rowNums[i]; j++) {
      let currTrainee = ranking[currRank-1];
      if (currTrainee.agencysm) {
	      rankRow.insertAdjacentHTML("beforeend", populateRankingEntry(currTrainee, sm))
		      
	      let insertedEntry = rankRow.lastChild;
	      let dragIcon = insertedEntry.children[0].children[0]; // drag icon is just the trainee image and border
	      let iconBorder = dragIcon.children[1]; // this is just the border and the recipient of dragged elements
	      // only add these event listeners if a trainee exists in this slot
	      if (currTrainee.id >= 0) {
		      // add event listener to remove item
		      insertedEntry.addEventListener("click", function (event) {
			      rankingClicked(currTrainee);
		      });
		      // add event listener for dragging
		      dragIcon.setAttribute('draggable', true);
		      dragIcon.classList.add("drag-cursor");
		      dragIcon.addEventListener("dragstart", createDragStartListener(sm - 1));
	      }
	      // add event listeners for blank/filled ranking entries
	      iconBorder.addEventListener("dragenter", createDragEnterListener());
	      iconBorder.addEventListener("dragleave", createDragLeaveListener());
	      iconBorder.addEventListener("dragover", createDragOverListener());
	      iconBorder.addEventListener("drop", createDropListener());
	      sm++;
	      currRank++;
      } else if (currTrainee.agencysp){
	      rankRow2.insertAdjacentHTML("beforeend", populateRankingEntry(currTrainee, sp))
		      
	      let insertedEntry2 = rankRow2.lastChild;
	      let dragIcon2 = insertedEntry2.children[0].children[0]; // drag icon is just the trainee image and borde
	      let iconBorder2 = dragIcon2.children[1]; // this is just the border and the recipient of dragged elements
	      // only add these event listeners if a trainee exists in this slot
	      if (currTrainee.id >= 0) {
		      // add event listener to remove item
		      insertedEntry2.addEventListener("click", function (event) {
			      rankingClicked2(currTrainee);
		      });
		      // add event listener for dragging
		      dragIcon2.setAttribute('draggable', true);
		      dragIcon2.classList.add("drag-cursor");
		      dragIcon2.addEventListener("dragstart", createDragStartListener(sp - 1));
	      }
	      // add event listeners for blank/filled ranking entries
	      iconBorder2.addEventListener("dragenter", createDragEnterListener());
	      iconBorder2.addEventListener("dragleave", createDragLeaveListener());
	      iconBorder2.addEventListener("dragover", createDragOverListener());
	      iconBorder2.addEventListener("drop", createDropListener());
	      sp++;
	      currRank++;
      } else {
	      rankRow.insertAdjacentHTML("beforeend", populateRankingEntry(currTrainee, currRank))
	      rankRow2.insertAdjacentHTML("beforeend", populateRankingEntry(currTrainee, currRank))
		      
	      /*let insertedEntry = rankRow.lastChild;
	      let dragIcon = insertedEntry.children[0].children[0]; // drag icon is just the trainee image and border
	      let iconBorder = dragIcon.children[1]; // this is just the border and the recipient of dragged elements
	      // only add these event listeners if a trainee exists in this slot
	      if (currTrainee.id >= 0) {
		      // add event listener to remove item
		      insertedEntry.addEventListener("click", function (event) {
			      rankingClicked(currTrainee);
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
	      iconBorder.addEventListener("drop", createDropListener());*/
	      
	      currRank++;
	      sm++;
	      sp++;
      }
	    if (sm < sp) {
		    i=sp-2;
	    } else {
		    i=sm-2;
	    }
    }
  }
}

function populateRankingEntry(trainee, currRank) {
  let evicted = (showEvicted && trainee.evicted) && "evicted";
  let big4 = (showBig4 && trainee.big4) && "big4";
  let nominated = (showNominated && trainee.nominated) && "nominated";
  let RankTag = "BIG WINNER"
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
      ${
        big4 ? '<div class="ranking__entry-icon-crown"></div>' : ''
      }
      ${
        nominated ? '<div class="ranking__entry-nominated"></div>' : ''
      }
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
	tempTrainee = ranking[index1];
	ranking[index1] = ranking[index2];
	ranking[index2] = tempTrainee;
	rerenderRanking();
}

function swapTrainees2(index1, index2) {
	tempTrainee = ranking[index1];
	ranking[index1] = ranking[index2];
	ranking[index2] = tempTrainee;
	rerenderRanking2();
}

// Controls alternate ways to spell trainee names
// to add new entries use the following format:
// <original>: [<alternate1>, <alternate2>, <alternate3>, etc...]
// <original> is the original name as appearing on csv
// all of it should be lower case
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
    let initialMatch = includesIgnCase(trainee.fullname, filterText) || includesIgnCase (trainee.age, filterText) || includesIgnCase (trainee.location, filterText);
    // if alernates exists then check them as well
    let alternateMatch = false;
    let alternates = alternateRomanizations[trainee.fullname.toLowerCase()]
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
  let shareBox = document.getElementById("getlink-textbox");
  shareBox.select();
  document.execCommand("copy");
}

// holds the list of all trainees
var trainees = [];
// holds the list of trainees to be shown on the table
var filteredTrainees = [];
// holds the ordered list of rankings that the user selects
var ranking = newRanking();
const rowNums = [1,1,1,1];
//window.addEventListener("load", function () {
  populateRanking();
  readFromCSV("./housemate_info.csv");
//});
// checks the URL for a ranking and uses it to populate ranking
getRanking();
