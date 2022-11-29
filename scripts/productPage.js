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
    #score-info-card {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      background-color: #E9EAEB;
      border-radius: 0.75rem;
      width: fit-content;
      height: 8rem;
      margin: -3rem 0 3rem 0rem;
      transition: all 0.25s ease-in-out;
      overflow: hidden;
    }
    .score-info-card--loading{
      max-width: 8rem;
      text-align: center;
      display: grid;
      align-items: center;
      justify-content: center;
    }
    .score-info-card--loading div{
      height: 8rem;
    }
    .score-info-card--loading img{
      max-height: 100%;
    }
    .score-info-card--loaded{
      max-width: 35rem;
    }
    .score-info-card--loaded > div {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .score-info-card__info{
      grid-column: 1 / -1;
      padding: 1.5rem;
      color: #334d51;
    }
    .score-info-card__info > span{
      font-size: 1.5em;
      font-family: Vinmonopolet Ingress, serif;
      font-weight: 400;
      padding-right: 0.4rem;
    }
    .score-info-card__link{
      display: inline-block;
      text-decoration: none;
      font-size: 0.8em;
      border: 1px solid #B3B3B3;
      border-bottom: none;
      text-align: center;
      padding: 0.5rem;
    }
    .score-info-card__link:focus{
      border-bottom: none;
    }
    .score-info-card__link:hover{
      background-color: #F0F2F2;
      border-bottom: none;
    }
    .score-info-card__link:first-of-type {
      border-radius: 0 0 0 0.75rem;
      border-right: none;
      border-left: none;
    }
    .score-info-card__link:last-of-type {
      border-radius: 0 0 0.75rem 0;
      border-right: none;
      border-left: none;
    }
  `;
  document.head.appendChild(style);
}

function insertLoadingElement(wineName) {
  const scoreInfoCard = document.createElement('div');
  // Important that no unsanitized potential user input/vivino info is inserted here
  scoreInfoCard.innerHTML = `
    <div class="score-info-card__info">
      <img alt="Laster inn vurderinger fra Vivino..." src=${chrome.runtime.getURL(
        'images/spinner.gif'
      )}>
    </div>`;
  scoreInfoCard.id = 'score-info-card';
  scoreInfoCard.className = 'score-info-card--loading';

  const productDetails = document.getElementsByClassName(
    'product-details-main'
  )[0];

  (productDetails ?? heading).insertAdjacentElement('afterend', scoreInfoCard);
  // innerHTML should be xss-safe after this point
}

function insertScoreElement(wineInfo) {
  const scoreInfoCard = document.getElementById('score-info-card');
  scoreInfoCard.className = 'score-info-card--loaded';

  // Early exit if no result on Vivino
  if (Object.values(wineInfo).every((info) => info === null)) {
    scoreInfoCard.innerHTML = `
    <div class="score-info-card__info">
      Fant ikke vinen på Vivino
    </div>
    <a class="score-info-card__link" target="_blank" href="https://www.vivino.com/search/wines?q=${wineName}">Søkeresultat</a>
  `;
    return;
  }

  // Early exit if wine result but no scores on Vivino
  if (wineInfo.vintageScore === null || wineInfo.vintageRatings === null) {
    scoreInfoCard.innerHTML = `
    <div class="score-info-card__info">
      Årgangen har ikke nok vurderinger
    </div>
    <a class="score-info-card__link" target="_blank" href="https://www.vivino.com/wines/${wineInfo.vintageID}">Årgang</a>
    <a class="score-info-card__link" target="_blank" href="https://www.vivino.com/w/${wineInfo.wineID}">Vin</a>
    <a class="score-info-card__link" target="_blank" href="https://www.vivino.com/search/wines?q=${wineName}">Søkeresultat</a>
  `;
    return;
  }

  scoreInfoCard.innerHTML = `
    <div class="score-info-card__info">
      <span>${wineInfo.vintageScore}</span> basert på <b>${wineInfo.vintageRatings}</b> vurderinger
    </div>
    <a class="score-info-card__link" target="_blank" href="https://www.vivino.com/wines/${wineInfo.vintageID}">Årgang</a>
    <a class="score-info-card__link" target="_blank" href="https://www.vivino.com/w/${wineInfo.wineID}">Vin</a>
    <a class="score-info-card__link" target="_blank" href="https://www.vivino.com/search/wines?q=${wineName}">Søkeresultat</a>
  `;
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
      'Polet+ found more than 1 category sections. Found ' +
        categoryElement.length +
        ' sections.'
    );
  } else {
    console.warn('Polet+ could not find category section.');
  }
  return true;
}
