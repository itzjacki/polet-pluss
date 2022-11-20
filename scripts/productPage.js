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
      margin: -3rem 0 3rem;
      width: fit-content;
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
      border: none;
      border-top: 1px solid #B3B3B3;
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
      border-right: 1px solid #B3B3B3;
      border-radius: 0 0 0 0.75rem;
    }
    .score-info-card__link:last-of-type {
      border-left: 1px solid #B3B3B3;
      border-radius: 0 0 0.75rem 0;
    }
  `;
  document.head.appendChild(style);
}

function insertLoadingElement(wineName) {
  const scoreInfoCard = document.createElement('div');
  scoreInfoCard.textContent = 'Loading Vivino scores...';
  scoreInfoCard.id = 'score-info-card';

  const productDetails = document.getElementsByClassName(
    'product-details-main'
  )[0];

  (productDetails ?? heading).insertAdjacentElement('afterend', scoreInfoCard);
}

function insertScoreElement(wineInfo) {
  const scoreInfoCard = document.getElementById('score-info-card');
  
  scoreInfoCard.setAttribute(
    'href',
    'https://www.vivino.com/search/wines?q=' + wineName
  );

  // Early exit if no result on Vivino
  console.log(wineInfo);
  if (Object.values(wineInfo).every((info) => info === null)) {
    scoreInfoCard.innerText = 'Fant ikke vinen på vivino';
    return;
  }

  // Early exit if wine result but no scores on Vivino
  if (wineInfo.vintageScore === null || wineInfo.vintageRatings === null) {
    scoreInfoCard.innerText = 'Årgangen har ikke blitt vurdert på Vivino';
    return;
  }

  scoreInfoCard.innerHTML = `
    <div class="score-info-card__info">
      <span>${wineInfo.vintageScore}</span> basert på <b>${wineInfo.vintageRatings}</b> vurderinger
    </div>
    <a class="score-info-card__link" href="https://www.vivino.com/wines/${wineInfo.vintageID}">Årgang</a>
    <a class="score-info-card__link" href="https://www.vivino.com/w/${wineInfo.wineID}">Vin</a>
    <a class="score-info-card__link" href="https://www.vivino.com/search/wines?q=${wineName}">Søkeresultat</a>
  `
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

- Styling på loading
  - Kan ha det sånn at det samme elementet starter med en mindre size, 
    og vokser kjapt til sin fulle størrelse når det har loada?
- Styling på tilfeller der info ikke finnes

- Juster på ikon

- Cleanup på console logs osv
- CSS cleanup
*/
