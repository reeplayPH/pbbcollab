// File holds lots of sorting logic for the filter checkboxes

// always initially sort by id
var activeCompares = [idCompare];
var showEvicted = false;
var showBig4 = false;

// This a compare by id on the housemates and guarantees stability of the sort
function idCompare(housemate1, housemate2) {
  if (housemate1.id < housemate2.id) {
    return -1;
  }
  else if (housemate1.id > housemate2.id) {
    return 1;
  }
  return 0;
}

// compare by whether housemate is evicted and put evicted at bottom
function evictedAtBottomCompare(housemate1, housemate2) {
  if (housemate1.evicted && !housemate2.evicted) {
    return 1;
  }
  else if (!housemate1.evicted && housemate2.evicted) {
    return -1;
  }
  return 0;
}

// uses all compares in the activeCompare to return a final -1 or 1 or 0
function combinedCompare(housemate1, housemate2) {
  let finalCompare = 0;
  for (let compareFunc of activeCompares) {
    let result = compareFunc(housemate1, housemate2);
    if (result != 0) {
      finalCompare = result;
    }
  }
  return finalCompare;
}

// returns a list of sorted housemates based on the active compares
function sortedHousemates(housemates) {
  let sortedHousemates = housemates.slice();
  sortedHousemates.sort(combinedCompare);
  return sortedHousemates;
}

// Event handler for when user checks show evicted
function showEvictedClick(event) {
  console.log(event);
  let checkbox = event.target;
  if (checkbox.checked) {
    activeCompares.push(evictedAtBottomCompare);
    showEvicted = true;
  } else {
    // remove the show evicted compare
    let i = activeCompares.indexOf(evictedAtBottomCompare)
    if (i >= 0) activeCompares.splice(i, 1);
    showEvicted = false;
  }
  sortRenderTable();
  rerenderRanking();
}

function showBig4Click(event) {
  let checkbox = event.target;
  if (checkbox.checked) {
    showBig4 = true;
  } else {
    showBig4 = false;
  }
  rerenderTable();
  rerenderRanking();
}

// sort and rerender the table after applying sorting changes
function sortRenderTable() {
  filteredHousemates = sortedHousemates(filteredHousemates);
  rerenderTable();
}
