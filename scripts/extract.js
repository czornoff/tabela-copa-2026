const fs = require('fs');
const lines = fs.readFileSync('./%TEMP%/reep/data/teams.csv', 'utf8').split('\n');
const teamsToFind = ['Korea Republic', 'Czech Republic', 'Czechia', 'Bosnia and Herzegovina', 'Bosnia', 'Canada', 'Qatar', 'Scotland', 'Mexico', 'United States', 'USA', 'Paraguay', 'Turkey', 'Germany', 'Ivory Coast', 'Curaçao', 'Curacao', 'Ecuador', 'Netherlands', 'Japan', 'Sweden', 'Tunisia', 'Belgium', 'Egypt', 'Iran', 'New Zealand', 'Saudi Arabia', 'Cape Verde', 'Spain', 'Uruguay', 'France', 'Iraq', 'Norway', 'Senegal', 'Argentina', 'Algeria', 'Austria', 'Jordan', 'Colombia', 'Portugal', 'DR Congo', 'Congo DR', 'Uzbekistan', 'Croatia', 'Ghana', 'England', 'Panama', 'South Africa', 'Brazil', 'Morocco', 'Haiti'];

const results = {};
for (const line of lines) {
  if (!line.trim()) continue;
  let cols = [];
  let current = '';
  let inQuotes = false;
  for(let i=0; i<line.length; i++){
      let char = line[i];
      if(char === '"') inQuotes = !inQuotes;
      else if(char === ',' && !inQuotes){
          cols.push(current);
          current = '';
      }else{
          current += char;
      }
  }
  cols.push(current);

  const name = cols[2];
  if (!name) continue;
  const cleanName = name.replace(/^"|"$/g, '').trim();
  const apiFootballId = cols[21];
  
  if (teamsToFind.includes(cleanName) && apiFootballId) {
    if (!results[cleanName]) results[cleanName] = [];
    results[cleanName].push({ id: apiFootballId, country: cols[3] });
  }
}
console.log(JSON.stringify(results, null, 2));
