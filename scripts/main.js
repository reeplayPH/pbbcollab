document.addEventListener("DOMContentLoaded", async function () {
  console.log("Page loaded. Initializing...");

  try {
    // Step 1: Initialize blank rankings
    ranking = newRanking();
    console.log("Initialized rankings:", ranking);

    // Step 2: Fetch any saved rankings from the URL
    console.log("Fetching saved rankings (if any)...");
    getRanking();

    // Step 3: Fetch CSV and populate the table
    console.log("Fetching CSV data...");
    await readFromCSV("./housemate_info.csv");
    console.log("CSV data successfully loaded and table populated.");

    // Step 4: Populate the ranking pyramids
    console.log("Populating ranking pyramids...");
    populateRanking();
    console.log("Ranking pyramids populated successfully.");

  } catch (error) {
    console.error("An error occurred during initialization:", error);
  }
});

// Constructor for a blank ranking list
function newRanking() {
  // Holds the ordered list of rankings that the user selects
  let ranking = new Array(8); // Adjust size as needed
  for (let i = 0; i < ranking.length; i++) {
    ranking[i] = newHousemate();
  }
  console.log("Created a new blank ranking:", ranking);
  return ranking;
}

// Enhanced readFromCSV to handle errors gracefully
async function readFromCSV(path) {
  try {
    const response = await fetch(path);
    if (response.ok) {
      const allText = await response.text();
      const csvData = CSV.parse(allText);
      const housemates = convertCSVArrayToHousemateData(csvData);
      populateTable(housemates);
      console.log("Table data populated:", housemates);
    } else {
      console.error("Failed to fetch CSV. HTTP Status:", response.status);
    }
  } catch (error) {
    console.error("Error fetching or parsing the CSV file:", error);
  }
}

// Enhanced populateRanking function
function populateRanking() {
  console.log("Populating ranking pyramids...");

  // Clear existing rankings
  clearRanking();
  clearRanking2();

  // Get the rows for each pyramid
  let rankRowsA = Array.from(document.getElementById("ranking__pyramid").children).slice(1); // Rows for "A"
  let rankRowsB = Array.from(document.getElementById("ranking__pyramid2").children).slice(1); // Rows for "B"

  let rankCounterA = 0; // Counter for agency "A" housemates
  let rankCounterB = 0; // Counter for agency "B" housemates

  ranking.forEach((housemate, index) => {
    console.log(`Processing housemate at index ${index}:`, housemate);

    // Use a blank housemate if the slot is empty
    if (housemate.id === -1) {
      housemate = newHousemate();
    }

    // Check if the housemate belongs to agency "A" or "B" and populate the respective pyramid
    if (housemate.agencysm && rankCounterA < 4) {
      addHousemateToRank(rankRowsA[rankCounterA], housemate, rankCounterA + 1, rankingClicked);
      rankCounterA++;
    } else if (housemate.agencysp && rankCounterB < 4) {
      addHousemateToRank(rankRowsB[rankCounterB], housemate, rankCounterB + 1, rankingClicked2);
      rankCounterB++;
    }
  });

  // Fill remaining slots with blank housemates
  while (rankCounterA < 4) {
    addHousemateToRank(rankRowsA[rankCounterA], newHousemate(), rankCounterA + 1, rankingClicked);
    rankCounterA++;
  }
  while (rankCounterB < 4) {
    addHousemateToRank(rankRowsB[rankCounterB], newHousemate(), rankCounterB + 1, rankingClicked2);
    rankCounterB++;
  }

  console.log("Finished populating ranking pyramids.");
}

// Enhanced readFromCSV to handle errors gracefully
async function readFromCSV(path) {
  try {
    const response = await fetch(path);
    if (response.ok) {
      const allText = await response.text();
      const csvData = CSV.parse(allText);
      const housemates = convertCSVArrayToHousemateData(csvData);
      populateTable(housemates);
      console.log("Table data populated:", housemates);
    } else {
      console.error("Failed to fetch CSV. HTTP Status:", response.status);
    }
  } catch (error) {
    console.error("Error fetching or parsing the CSV file:", error);
  }
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
        let rankString = atob(urlParams.get("r")); // Decode the saved ranking
        let rankingIds = [];
        for (let i = 0; i < rankString.length; i += 2) {
            let housemateId = rankString.substr(i, 2); // Get each housemate ID by substringing every 2 chars
            rankingIds.push(parseInt(housemateId));
        }
        console.log("Retrieved ranking IDs:", rankingIds);

        // Use the retrieved ranking IDs to populate the rankings
        for (let i = 0; i < rankingIds.length; i++) {
            let housemateId = rankingIds[i];
            if (housemateId < 0) {
                ranking[i] = newHousemate(); // Use a blank housemate if ID is invalid
            } else {
                let housemate = findHousemateById(housemateId);
                housemate.selected = true; // Mark the housemate as selected
                ranking[i] = housemate;
            }
        }

        // Refresh the table to show updated checkboxes
        rerenderTable();

        // Refresh the ranking pyramids
        clearRanking(); // Clear Pyramid A
        clearRanking2(); // Clear Pyramid B
        ranking.forEach(housemate => {
            if (housemate.agencysp) {
                rerenderRanking2(); // Re-render Pyramid B
            } else {
                rerenderRanking(); // Re-render Pyramid A
            }
        });

        console.log("Updated rankings:", ranking);
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

function convertCSVArrayToHousemateData(csvArrays) {
  try {
    housemates = csvArrays.map(function (housemateArray, index) {
      if (housemateArray.length < 8) {
        console.warn(`Skipping invalid CSV row at index ${index}:`, housemateArray);
        return newHousemate(); // Fallback to a blank housemate
      }
      housemate = {};
      housemate.fullname = housemateArray[0];
      housemate.shortname = housemateArray[1];
      housemate.agency = housemateArray[2];
      housemate.location = housemateArray[3];
      housemate.agencycolor = housemateArray[4];
      housemate.agencysm = housemateArray[4] === 'A';
      housemate.agencysp = housemateArray[4] === 'B';
      housemate.age = housemateArray[5];
      housemate.evicted = housemateArray[6] === 'e'; // Evicted flag
      housemate.big4 = housemateArray[6] === 'b'; // Top 4 flag
      housemate.nominated = housemateArray[6] === 'n'; // Nominated flag
      housemate.id = parseInt(housemateArray[7]) - 1; // Housemate ID
      housemate.image = housemate.fullname.replaceAll(" ", "").replaceAll("-", "") + ".JPG";
      return housemate;
    });
    filteredHousemates = housemates;
    return housemates;
  } catch (error) {
    console.error("Error converting CSV data to housemate objects:", error);
    return [];
  }
}

// Constructor for a blank housemate
function newHousemate() {
  const housemate = {
    id: -1,
    fullname: '&#8203;',
    shortname: '&#8203;',
    location: '&#8203;',
    age: '&#8203;',
    agencycolor: 'no',
    image: 'emptyrank.png',
  };
  console.log("Created new housemate:", housemate);
  return housemate;
}

// rerender method for table (search box)
// TODO: this site might be slow to rerender because it clears + adds everything each time
function rerenderTable() {
  clearTable();
  populateTable(filteredHousemates);
  // populateRanking();
}
/*function rerenderTable() {
    clearTable(); // Clear the table
    // Rebuild the table using the updated state of filteredHousemates
    filteredHousemates.forEach(housemate => {
        // Ensure the 'selected' state is honored during rendering
        console.log(`Rerendering housemate: ${housemate.fullname}, selected: ${housemate.selected}`);
    });
    populateTable(filteredHousemates);
}*/

// rerender method for ranking
function rerenderRanking(rankingArray) {
    if (rankingArray === rankingA) {
        clearRanking();
        populateRanking(rankingArray, "ranking__pyramid", rankingClicked);
    } else if (rankingArray === rankingB) {
        clearRanking2();
        populateRanking(rankingArray, "ranking__pyramid2", rankingClicked2);
    }
}

// rerender method for ranking (KAPUSO)
function rerenderRanking2() {
  clearRanking2();
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

// Enhanced clearRanking function
function clearRanking() {
  let ranking_chart = document.getElementById("ranking__pyramid");
  if (!ranking_chart) {
    console.error("Ranking pyramid A not found in DOM.");
    return;
  }
  let rankRows = Array.from(ranking_chart.children).slice(1); // Remove the title element
  rankRows.forEach(row => removeAllChildren(row));
  console.log("Cleared rankings for pyramid A.");
}

function clearRanking2() {
  let ranking_chart2 = document.getElementById("ranking__pyramid2");
  if (!ranking_chart2) {
    console.error("Ranking pyramid B not found in DOM.");
    return;
  }
  let rankRows2 = Array.from(ranking_chart2.children).slice(1); // Remove the title element
  rankRows2.forEach(row => removeAllChildren(row));
  console.log("Cleared rankings for pyramid B.");
}

function removeAllChildren(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
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
    console.log(`Rendering table entry for housemate: ${housemate.fullname}, selected: ${housemate.selected}`);
    let evicted = (showEvicted && housemate.evicted) ? "evicted" : "";
    let big4 = (showBig4 && housemate.big4) ? "big4" : "";
    let nominated = (showNominated && housemate.nominated) ? "nominated" : "";

    const tableEntry = `
    <div class="table__entry ${evicted}">
        <div class="table__entry-icon">
            <img class="table__entry-img" src="assets/housemates/${housemate.image}" />
            <div class="table__entry-icon-border ${housemate.agencycolor.toLowerCase()}-rank-border"></div>
            ${big4 ? '<div class="table__entry-icon-crown"></div>' : ''}
            ${nominated ? '<div class="table__entry-nominated"></div>' : ''}
            ${
                housemate.selected
                    ? '<img class="table__entry-check" src="assets/check.png"/>'
                    : '<!-- No check icon -->'
            }
        </div>
        <div class="table__entry-text">
            <span class="fullname"><strong>${housemate.fullname}</strong></span>
            <span class="agency">(${housemate.agency})</span>
            <span class="ageandlocation">${housemate.age} • ${housemate.location.toUpperCase()}</span>
        </div>
    </div>`;
    return tableEntry;
}

// Uses populated local data structure from getRanking to populate ranking
/*function populateRanking() {
  // Clear the current rankings
  clearRanking();
  clearRanking2();

  let rankRowsA = Array.from(document.getElementById("ranking__pyramid").children).slice(1); // rows for "A"
  let rankRowsB = Array.from(document.getElementById("ranking__pyramid2").children).slice(1); // rows for "B"

  let rankCounterA = 0; // Counter for agencysm (A) housemates
  let rankCounterB = 0; // Counter for agencysp (B) housemates

  for (let i = 0; i < ranking.length; i++) {
    let currentHousemate = ranking[i];

    if (currentHousemate.id === -1) {
      // If the current slot is blank, populate it with a new blank housemate
      currentHousemate = newHousemate();
    }

    if (currentHousemate.agencysm && rankCounterA < 4) {
      // Add housemate to "A" pyramid
      let rankRow = rankRowsA[rankCounterA];
      rankRow.insertAdjacentHTML("beforeend", populateRankingEntry(currentHousemate, rankCounterA + 1));

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
		      dragIcon.addEventListener("dragstart", createDragStartListener(sm - 1));
	      }
      // Add event listeners for blank/filled ranking entries
      iconBorder.addEventListener("dragenter", createDragEnterListener());
      iconBorder.addEventListener("dragleave", createDragLeaveListener());
      iconBorder.addEventListener("dragover", createDragOverListener());
      iconBorder.addEventListener("drop", createDropListener());

      rankCounterA++;
    } else if (currentHousemate.agencysp && rankCounterB < 4) {
      // Add housemate to "B" pyramid
      let rankRow = rankRowsB[rankCounterB];
      rankRow.insertAdjacentHTML("beforeend", populateRankingEntry(currentHousemate, rankCounterB + 1));

      let insertedEntry = rankRow.lastChild;
      let dragIcon = insertedEntry.children[0].children[0]; // drag icon is just the housemate image and border
      let iconBorder = dragIcon.children[1]; // this is just the border and the recipient of dragged elements
	      // only add these event listeners if a housemate exists in this slot
	      if (currHousemate.id >= 0) {
		      // add event listener to remove item
		      insertedEntry.addEventListener("click", function (event) {
			      rankingClicked2(currHousemate);
		      });
		      // add event listener for dragging
		      dragIcon.setAttribute('draggable', true);
		      dragIcon.classList.add("drag-cursor");
		      dragIcon.addEventListener("dragstart", createDragStartListener(sm - 1));
	      }
      // Add event listeners for blank/filled ranking entries
      iconBorder.addEventListener("dragenter", createDragEnterListener());
      iconBorder.addEventListener("dragleave", createDragLeaveListener());
      iconBorder.addEventListener("dragover", createDragOverListener());
      iconBorder.addEventListener("drop", createDropListener());

      rankCounterB++;
    }
  }
}*/

function addHousemateToRank(rankRow, housemate, rank, clickHandler, rankingArray) {
    // Add housemate entry to the ranking row
    rankRow.insertAdjacentHTML("beforeend", populateRankingEntry(housemate, rank));

    let insertedEntry = rankRow.lastChild;
    let dragIcon = insertedEntry.children[0].children[0]; // Drag icon (housemate image and border)
    let iconBorder = dragIcon.children[1]; // Recipient of dragged elements

    if (housemate.id >= 0) {
        // Add click event listener to remove housemate
        insertedEntry.addEventListener("click", function () {
            clickHandler(housemate);
        });

        // Add drag-and-drop functionality
        dragIcon.setAttribute("draggable", true);
        dragIcon.classList.add("drag-cursor");
        dragIcon.addEventListener("dragstart", function (event) {
            event.dataTransfer.setData("text/plain", rank - 1); // Pass current rank as data
            event.dataTransfer.setData("pyramid", rankRow.closest(".ranking__pyramid").id); // Pass pyramid ID
            console.log(`Drag started for housemate: ${housemate.fullname}, pyramid: ${rankRow.closest(".ranking__pyramid").id}`);
        });
    }

    // Add event listeners for drag-and-drop on the icon border
    iconBorder.addEventListener("dragenter", createDragEnterListener());
    iconBorder.addEventListener("dragleave", createDragLeaveListener());
    iconBorder.addEventListener("dragover", createDragOverListener());
    iconBorder.addEventListener("drop", function (event) {
        event.preventDefault();
        const draggedRank = parseInt(event.dataTransfer.getData("text/plain"), 10);
        const sourcePyramidId = event.dataTransfer.getData("pyramid");
        const targetPyramidId = rankRow.closest(".ranking__pyramid").id;

        console.log(`Drop event: draggedRank = ${draggedRank}, sourcePyramidId = ${sourcePyramidId}, targetPyramidId = ${targetPyramidId}`);

        if (sourcePyramidId !== targetPyramidId) {
            console.warn("Cannot drop housemate into a different pyramid.");
            return;
        }

        // Swap housemates within the same pyramid
        swapHousemates(draggedRank, rank - 1, rankingArray);
    });
}

// Uses populated local data structure from getRanking to populate ranking
function populateRankingEntry(housemate, currRank) {
  let evicted = (showEvicted && housemate.evicted) ? "evicted" : "";
  let big4 = (showBig4 && housemate.big4) ? "big4" : "";
  let nominated = (showNominated && housemate.nominated) ? "nominated" : "";
  let RankTag = "BIG WINNER";
  if (currRank != 1) {
    RankTag = currRank.toString(); 
  }
  const rankingEntry = `
  <div class="ranking__entry ${evicted}">
    <div class="ranking__entry-view">
      <div class="ranking__entry-icon">
        <img class="ranking__entry-img" src="assets/housemates/${housemate.image}" />
        <div class="ranking__entry-icon-border ${housemate.agencycolor.toLowerCase()}-rank-border" data-rankid="${currRank-1}"></div>
      </div>
      <div class="ranking__entry-icon-badge bg-${housemate.agencycolor.toLowerCase()}">${RankTag}</div>
      ${big4 ? '<div class="ranking__entry-icon-crown"></div>' : ''}
      ${nominated ? '<div class="ranking__entry-nominated"></div>' : ''}
    </div>
    <div class="ranking__row-text">
      <div class="name"><strong>${housemate.shortname.toUpperCase()}</strong></div>
      <div class="year">${housemate.age}</div>
    </div>
  </div>`;
  return rankingEntry;
}

// Event handlers for table
function tableClicked(housemate) {
    console.log(`Housemate clicked: ${housemate.fullname}, selected: ${housemate.selected}`);

    // Count the number of selected housemates for each agency
    const selectedAgencySMCount = ranking.filter(t => t.agencysm && t.selected).length;
    const selectedAgencySPCount = ranking.filter(t => t.agencysp && t.selected).length;

    if (housemate.selected) {
        // Deselect the housemate and remove them from the ranking
        let success = removeRankedHousemate(housemate);
        if (success) {
            housemate.selected = false; // Update state
            console.log(`Housemate ${housemate.fullname} deselected.`);
        } else {
            console.warn(`Failed to remove housemate ${housemate.fullname} from the rankings.`);
            return;
        }
    } else {
        // Check if adding this housemate exceeds the limit for their agency
        if (housemate.agencysm && selectedAgencySMCount >= 4) {
            alert("You can only select up to 4 Kapamilya Housemantes for Kapamilya Big 4.");
            return;
        }
        if (housemate.agencysp && selectedAgencySPCount >= 4) {
            alert("You can only select up to 4 Kapuso Housemates for Kapuso Big 4.");
            return;
        }

        // Select the housemate and add them to the ranking
        let success = addRankedHousemate(housemate);
        if (success) {
            housemate.selected = true; // Update state
            console.log(`Housemate ${housemate.fullname} selected.`);
        } else {
            console.warn(`Failed to add housemate ${housemate.fullname} to the rankings.`);
            return;
        }
    }

    // Re-render the table to reflect changes
    rerenderTable();

    // Re-render the appropriate ranking pyramid
    if (housemate.agencysm) {
        rerenderRanking(rankingA); // For Pyramid A (Agency SM)
    } else if (housemate.agencysp) {
        rerenderRanking(rankingB); // For Pyramid B (Agency SP)
    }
}

// Event handler for ranking
function rankingClicked(housemate) {
    console.log(`Ranking clicked for Pyramid A: ${housemate.fullname}, selected: ${housemate.selected}`);

    if (housemate.selected) {
        // Deselect the housemate and remove them from the ranking
        let success = removeRankedHousemate(housemate);
        if (success) {
            housemate.selected = false; // Update state
            console.log(`Housemate ${housemate.fullname} removed from Pyramid A.`);
        } else {
            console.warn(`Failed to remove housemate ${housemate.fullname} from Pyramid A.`);
            return;
        }
    }

    // Re-render the table and Pyramid A
    rerenderTable();
    rerenderRanking(rankingA); // Ensure it uses the correct ranking array for Pyramid A
}

// Event handler for ranking
function rankingClicked2(housemate) {
    console.log(`Ranking clicked for Pyramid B: ${housemate.fullname}, selected: ${housemate.selected}`);

    if (housemate.selected) {
        // Deselect the housemate and remove them from the ranking
        let success = removeRankedHousemate(housemate);
        if (success) {
            housemate.selected = false; // Update state
            console.log(`Housemate ${housemate.fullname} removed from Pyramid B.`);
        } else {
            console.warn(`Failed to remove housemate ${housemate.fullname} from Pyramid B.`);
            return;
        }
    }

    // Re-render the table and Pyramid B
    rerenderTable();
    rerenderRanking2();
}

function swapHousemates(index1, index2, rankingArray) {
    const tempHousemate = rankingArray[index1];
    rankingArray[index1] = rankingArray[index2];
    rankingArray[index2] = tempHousemate;
    rerenderRanking(rankingArray);
}

// Controls alternate ways to spell housemate names
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
/*function addRankedHousemate(housemate) {
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
}*/

function addRankedHousemate(housemate) {
    // Check if the housemate is already in the ranking
    if (ranking.some(rankedHousemate => rankedHousemate.id === housemate.id)) {
        console.warn(`Housemate ${housemate.fullname} is already ranked and cannot be added again.`);
        return false; // Prevent duplicate addition
    }

    // Find the first blank spot (id === -1) and add the housemate
    for (let i = 0; i < ranking.length; i++) {
        if (ranking[i].id === -1) { // Blank spot
            ranking[i] = housemate;
            housemate.selected = true; // Mark housemate as selected
            console.log(`Housemate ${housemate.fullname} added to ranking at position ${i + 1}.`);
            rerenderTable(); // Ensure table updates to reflect selection
            return true;
        }
    }

    console.warn("No empty slots available in the ranking to add the housemate.");
    return false; // No empty slots available
}

function removeRankedHousemate(housemate) {
    for (let i = 0; i < ranking.length; i++) {
        if (ranking[i].id === housemate.id) { // Match found
            ranking[i] = newHousemate(); // Replace with a blank housemate
            housemate.selected = false; // Reset housemate's selected state
            console.log(`Housemate ${housemate.fullname} removed from ranking at position ${i + 1}.`);
            return true;
        }
    }

    console.warn(`Housemate ${housemate.fullname} is not in the ranking and cannot be removed.`);
    return false; // Housemate not found in the ranking
}

const currentURL = "https://reeplay.github.io/pbbcollab/";
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

async function copyLink() {
  try {
    const shareBox = document.getElementById("getlink-textbox");
    await navigator.clipboard.writeText(shareBox.value);
    alert("Link copied to clipboard!");
  } catch (err) {
    console.error("Failed to copy text:", err);
  }
}

// holds the list of all housemates
var housemates = [];
// holds the list of housemates to be shown on the table
var filteredHousemates = [];
// holds the ordered list of rankings that the user selects
var rankingA = new Array(4).fill(newHousemate()); // For Pyramid A
var rankingB = new Array(4).fill(newHousemate()); // For Pyramid B
const rowNums = [1,1,1,1];
//window.addEventListener("load", function () {
  populateRanking();
  readFromCSV("./housemate_info.csv");
//});
// checks the URL for a ranking and uses it to populate ranking
getRanking();
