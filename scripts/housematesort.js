// File holds lots of sorting logic for the filter checkboxes

// always initially sort by id
var activeCompares = [idCompare]
var showEvicted = false;
var showBig4 = false;
var showNominated = false;

// This a compare by id on the trainees and guarantees stability of the sort
function idCompare(trainee1, trainee2) {
  if (trainee1.id < trainee2.id) {
    return -1;
  }
  else if (trainee1.id > trainee2.id) {
    return 1;
  }
  return 0;
}

// compare by whether trainee is evicted and put evicted at bottom
function evictedAtBottomCompare(trainee1, trainee2) {
  if (trainee1.evicted && !trainee2.evicted) {
    return 1;
  }
  else if (!trainee1.evicted && trainee2.evicted) {
    return -1;
  }
  return 0;
}

// uses all compares in the activeCompare to return a final -1 or 1 or 0
function combinedCompare(trainee1, trainee2) {
  let finalCompare = 0;
  for (let compareFunc of activeCompares) {
    let result = compareFunc(trainee1, trainee2);
    if (result != 0) {
      finalCompare = result;
    }
  }
  return finalCompare;
}

// returns a list of sorted trainees based on the active compares
function sortedTrainees(trainees) {
  let sortedTrainees = trainees.slice();
  sortedTrainees.sort(combinedCompare);
  return sortedTrainees;
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

function showNominatedClick(event) {
  let checkbox = event.target;
  if (checkbox.checked) {
    showNominated = true;
  } else {
    showNominated = false;
  }
  rerenderTable();
  rerenderRanking();
}

// sort and rerender the table after applying sorting changes
function sortRenderTable() {
  filteredTrainees = sortedTrainees(filteredTrainees);
  rerenderTable();
}
