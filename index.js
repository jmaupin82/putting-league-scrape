const fs = require('fs');
const _ = require('lodash');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const request = require('request');
const jsonexport = require('jsonexport');

function updatePlayers(newPlayer, allPlayers) {
  const result = allPlayers.concat(newPlayer);
  // just overwrite the players for inital script
  jsonexport(result,function(err, csv){
    if(err) return console.log(err);
    console.log(csv);
    fs.writeFileSync('output.csv', csv, { encoding: 'utf-8' });
});
  return result;
}

function scrapeCsvOfResults(filename) {
  const fileContents = fs.readFileSync(filename).toString();
  const lines = fileContents.split('\n');
  let playerCompendium = [];
  for(let i = 0; i < lines.length; i++) {
  // for (let i = 0; i < 1; ++i) {
    const columns = lines[i].split(',');
    const playerName = columns[2];
    console.log(playerName);
    if (playerName) {
      const firstName = _.get(playerName.toString().split(/[ ,]+/), [0], '');
      const lastName = _.get(playerName.toString().split(/[ ,]+/), [1], '');
      console.log(firstName);

      console.log(lastName);


      const url = `https://www.pdga.com/players?FirstName=${firstName}&LastName=${lastName}&PDGANum=&Status=All&Class=All&MemberType=All&City=&StateProv=OK&Country=All&Country_1=All&UpdateDate=`;
      const requestResult = request(url, (error, response, content) => {
        if (error) {
          console.error(error);
          console.error('oops');
          return;
        }
        // class="views-field views-field-PDGANum pdga-number"

        const dom = new JSDOM(content, {includeNodeLocations: true});
        const document = dom.window.document;
        const firstPDGANumber = document.querySelector('td.views-field.views-field-PDGANum.pdga-number');
        if(firstPDGANumber) {
          const pdgaNumber = firstPDGANumber.innerHTML.toString().trim()
          const pdgaNumberUrl = `https://www.pdga.com/player/${pdgaNumber}`;
          const player = {
            name: playerName,
            pdgaNumber,
            pdgaNumberUrl,
          };
          playerCompendium = updatePlayers(player, playerCompendium);
        }
    });
  }
}
}

scrapeCsvOfResults('week2.csv');
