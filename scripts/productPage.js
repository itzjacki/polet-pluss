const heading = document.querySelector('h1');

if (heading && productIsWine()) {
  wineName = heading.innerText;
  insertStyle();
  insertLoadingElement();

  chrome.runtime.sendMessage(
    { requestType: 'vivinoScore', wineName: wineName },
    function (response) {
      insertScoreElement(response);
    }
  );
}

function insertStyle() {
  const style = document.createElement('style');
  style.innerHTML = `
    #score {
      border: solid black 1px;
      border-radius: 0.5rem;
      padding: 0.75rem;
      margin: -20px 0 3rem;
  }
  `;
  document.head.appendChild(style);
}

function insertLoadingElement(wineName) {
  const score = document.createElement('a');
  score.textContent = 'Loading Vivino scores...';
  score.id = 'score';

  const productDetails = document.getElementsByClassName(
    'product-details-main'
  )[0];

  (productDetails ?? heading).insertAdjacentElement('afterend', score);
}

function insertScoreElement(wineInfo) {
  const score = document.getElementById('score');
  score.setAttribute(
    'href',
    'https://www.vivino.com/search/wines?q=' + wineName
  );

  // Early exit if no result on Vivino
  console.log(wineInfo);
  if (Object.values(wineInfo).every((info) => info === null)) {
    score.innerText = 'Fant ikke vinen på vivino';
    return;
  }

  // Early exit if wine result but no scores on Vivino
  if (wineInfo.vintageScore === null || wineInfo.vintageRatings === null) {
    score.textContent = 'Årgangen har ikke blitt vurdert på Vivino';
    return;
  }

  score.textContent =
    'Vivino score: ' +
    wineInfo.vintageScore +
    ', med ' +
    wineInfo.vintageRatings +
    ' vurderinger. Navn: ' +
    wineInfo.name +
    ' | Vintage ID: ' +
    wineInfo.vintageID +
    ' | Wine ID: ' +
    wineInfo.wineID;
}

function productIsWine() {
  let categoryElement = document.getElementsByClassName(
    'product__category-name'
  );
  if (categoryElement.length >= 1) {
    const category = categoryElement[0].innerText.toLowerCase();
    const hasWineInName = category.includes('vin');
    const isLiquor = category.includes('brennevin');
    return hasWineInName && !isLiquor;
  } else if (categoryElement.length > 1) {
    console.warn(
      'Found more than 1 category sections. Found ' +
        categoryElement.length +
        ' sections.'
    );
  } else {
    console.warn('Could not find category section.');
  }
  return true;
}

/* 
TODO: 

- Bedre måte å deale med manglende vintage score
  - Lete opp wineScore? Kanskje også om det er veldig få reviews
    - Vivino viser ikke antall reviews på de med få

- Bytte Ch. med Chateau og Dom. med Domaine for å forbedre resultater?
  - Ch. Chateâu (kanskje ikke med hatt?)
  - Dom. Domaine
  - Frat. Fratelli

- Knapp som fører til hele vinen, ikke bare vintage
- Kanskje knapp som fører til selve vintage, ikke bare søk

- Styling

- Juster på ikon
*/
