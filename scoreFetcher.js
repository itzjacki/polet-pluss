chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  sendMessageBack(request, sendResponse);
  // Returns true to keep message channel open until async code resolves
  return true;
});

async function sendMessageBack(request, sendResponse) {
  wineInfo = await getWineInfo(request);
  sendResponse(wineInfo);
}

// Sends a request to get the html of the search site
async function getWineInfo(request) {
  if (request.requestType === 'vivinoScore' && request.wineName) {
    let vivinoResponse = await fetch(
      'https://www.vivino.com/search/wines?q=' + request.wineName
    )
      .then(function (response) {
        // The API call was successful!
        return response.text();
      })
      .catch(function (err) {
        // There was an error
        console.warn('Something went wrong during the Vivino data fetch:', err);
      });

    return parseTextToWineInfo(vivinoResponse);
  }
}

// Takes raw html for the whole search result page and extracts interesting data from the first result
function parseTextToWineInfo(text) {
  // Extracts the text (html) that belongs to the first search result
  // 'default-wine-card is the class used for every wine card
  // 'clearfix' is a class used at the end of search results
  const relevantResultText = text.split(/default-wine-card|clearfix/)[1];
  // Removes element that messes with the title name
  const cleanedResulttext = relevantResultText.replaceAll(
    /<mark>|<\/mark>/g,
    ''
  );

  // Extract various info from the cleaned text portion. Capture groups are used to get only

  return {
    name: findInfoFromRegEx(cleanedResulttext, /'bold'.*\n(.*)\n/),
    vintageID: findInfoFromRegEx(cleanedResulttext, /data-vintage='(\d+)'/),
    vintageScore: findInfoFromRegEx(
      cleanedResulttext,
      /average__number.*\n(\d,\d)/
    ),
    vintageRatings: findInfoFromRegEx(cleanedResulttext, /(\d+) ratings/),
    wineID: findInfoFromRegEx(cleanedResulttext, /data-wine='(\d+)'/),
    wineScore: null,
    wineRatings: null,
  };
}

// --- Functions which extract important info from the text ---

// Generic function that returns null if match not found
function findInfoFromRegEx(inputText, regex) {
  const vintageScoreMatch = regex.exec(inputText);
  if (vintageScoreMatch && 1 in vintageScoreMatch) {
    // [0] is the whole match, [1] is the regex capture group
    return vintageScoreMatch[1];
  }
  return null;
}
