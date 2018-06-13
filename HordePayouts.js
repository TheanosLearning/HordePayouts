let calculate = document.getElementById('calculate');
$('#failedWaves').selectable();

populateWaveOptions($('#startingWave'), 1);
populateFailedWaves($('#failedWaves'));
populateWaveOptions($('#highestWaveCompleted'), 50);

calculate.addEventListener('click', function() {
  let difficulty = $('#difficulty').val();
  let startingWave = parseInt($('#startingWave').val());
  let failedWaves = Array.from($('#failedWaves').find('.ui-selected')).map(failedWave => failedWave.value);
  console.log(failedWaves);
  let highestWaveCompleted = parseInt($('#highestWaveCompleted').val());
  getHordePayouts(difficulty, startingWave, failedWaves, highestWaveCompleted);
});

function getHordePayouts(difficulty, startingWave, failedWaves, highestWaveCompleted) {
  switch(difficulty) {
    case "Casual":
      m = 0.03;
      baseXP = [125,125,125,125,125,125,125,125,125,145,145,145,145,145,145,145,145,145,145,165,165,165,165,165,165,165,165,165,165,185,185,185,185,185,185,185,185,185,185,205,205,205,205,205,205,205,205,205,205,225];
      break;
    case "Normal":
      m = 0.04;
      baseXP = [130,130,130,130,130,130,130,130,130,180,180,180,180,180,180,180,180,180,180,230,230,230,230,230,230,230,230,230,230,280,280,280,280,280,280,280,280,280,280,330,330,330,330,330,330,330,330,330,330,380];
      break;
    case "Hardcore":
      m = 0.05;
      baseXP = [140,140,140,140,140,140,140,140,140,220,220,220,220,220,220,220,220,220,220,300,300,300,300,300,300,300,300,300,300,380,380,380,380,380,380,380,380,380,380,460,460,460,460,460,460,460,460,460,460,540];
      break;
    case "Insane":
      m = 0.08;
      baseXP = [155,155,155,155,155,155,155,155,155,265,265,265,265,265,265,265,265,265,265,375,375,375,375,375,375,375,375,375,375,485,485,485,485,485,485,485,485,485,485,595,595,595,595,595,595,595,595,595,595,705];
      break;
    case "Inconceivable":
      m = 0.11;
      baseXP = [160,160,160,160,160,160,160,160,160,275,275,275,275,275,275,275,275,275,275,390,390,390,390,390,390,390,390,390,390,505,505,505,505,505,505,505,505,505,505,620,620,620,620,620,620,620,620,620,620,735];
      break;
    default:
      console.log("Not a valid difficulty.");
  }
  // calculate xp & cr payouts
  let baseCR = baseXP.map(xp => xp * 0.12).map(xp => Math.round(xp));// base credits are 12% of base XP
  let baseW = baseWeights(startingWave, highestWaveCompleted);
  let bonusW = bonusWeights(startingWave, failedWaves, highestWaveCompleted);
  // wc = wave completion, cwb = consecutive wave bonus
  let wcXP = sum(product(baseXP, baseW));
  let cwbXP = sum(product(baseXP, bonusW).map(xp => m * xp).map(xp => Math.floor(xp)));
  let wcCR = sum(product(baseCR, baseW));
  let cwbCR = sum(product(baseXP, bonusW).map(xp => m * xp).map(xp => Math.floor(xp)).map(xp => 0.01 * xp).map(cr => Math.round(cr)));
  displayResults(wcXP, cwbXP, wcCR, cwbCR);
}

function displayResults(wcXP, cwbXP, wcCR, cwbCR) {
  $('#wcXP').html(wcXP);
  $('#cwbXP').html(cwbXP);
  $('#wcCR').html(wcCR);
  $('#cwbCR').html(cwbCR);
  $('#totalXP').html(wcXP + cwbXP);
  $('#totalCR').html(wcCR + cwbCR);
}

function baseWeights(startingWave, highestWaveCompleted) {
  let baseWeights = new Array(50).fill(0);
  for(let i = 0; i < 50; i++) {
    if(i >= startingWave - 1 && i <= highestWaveCompleted - 1) {
      baseWeights[i] = 1;
    }
  }
  return baseWeights;
}

function bonusWeights(startingWave, failedWaves, highestWaveCompleted) {
  let bonusWeights = new Array(50).fill(0);
  let bonusWeight = 0;
  for(let i = 1; i <= 50; i++) {
    bonusWeight++;
    for(let j = 0; j < failedWaves.length; j++) {
      if(i === failedWaves[j]) {
        bonusWeight = 0;
      }
    }
    if(i <= startingWave || i > highestWaveCompleted) {
      bonusWeight = 0;
      continue;
    }
    bonusWeights[i - 1] = bonusWeight;
  }
  return bonusWeights;
}

function product(a, b) {
  return a.reduce((aibi, ai, i) => {
    return [...aibi, ai*b[i]];
  },[]);
}

function sum(a) {
  return a.reduce((x,y) => x + y, 0);
}

function populateWaveOptions(element, selectWave) {
  _.range(1, 50 + 1).forEach((wave) => {
  	if(wave === selectWave) {
    	element.append($('<option selected></option>').val(wave).html(wave));
    }
    element.append($('<option></option>').val(wave).html(wave));
  });
}

function populateFailedWaves(element) {
  _.range(1, 50 + 1).forEach((wave) => {
    element.append($('<li class="ui-state-default"></li>').val(wave).html(wave));
  });
}