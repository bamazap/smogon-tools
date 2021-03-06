const { PriorityQueue } = require('./PriorityQueue');

function maxKey(obj) {
  let bestKey;
  let bestValue = Number.NEGATIVE_INFINITY;
  Object.entries(obj).forEach(([key, val]) => {
    if (val > bestValue) {
      bestKey = key;
      bestValue = val;
    }
  });
  return bestKey;
}

function sortedKeys(obj) {
  // eslint-disable-next-line no-unused-vars
  return Object
    .entries(obj)
    .sort(([moveA, freqA], [moveB, freqB]) => freqB - freqA) // eslint-disable-line no-unused-vars
    .map(([move, freq]) => move); // eslint-disable-line no-unused-vars
}

function sumObjValues(obj) {
  return Object.values(obj).reduce((a, b) => a + b);
}

class Team {
  constructor(data) {
    this.data = data;
    this.team = [];
    this.pq = new PriorityQueue();
    this.correlations = {}; // this.correlations[A][B] = P(B | A) - P(B)
    Object.entries(data).forEach(([pokemonName, { usage, Abilities, Teammates }]) => {
      this.pq.push(pokemonName, usage);
      this.correlations[pokemonName] = {};
      Object.keys(data).forEach((partnerName) => {
        const totalCounts = sumObjValues(Abilities);
        const partnerCounts = Teammates[partnerName] || 0;
        this.correlations[pokemonName][partnerName] = partnerCounts / totalCounts;
      });
    });
    this.pq.order();
  }

  addMostLikelyTeammate() {
    const newTeammate = this.pq.pull();
    this.team.push(newTeammate);
    this.updatePQ(newTeammate);
  }

  updatePQ(newTeammate) {
    for (let i = 0; i < this.pq.elements.length; i += 1) {
      const { data: pokemonName, priority: oldUseRate } = this.pq.elements[i];
      const useRateChange = this.correlations[newTeammate][pokemonName];
      const newUseRate = oldUseRate + useRateChange;
      this.pq.elements[i].priority = newUseRate;
    }
    this.pq.order();
  }

  export() {
    let text = '';
    this.team.forEach((pokemonName) => {
      const item = maxKey(this.data[pokemonName].Items);
      const ability = maxKey(this.data[pokemonName].Abilities);
      const spread = maxKey(this.data[pokemonName].Spreads);
      const [nature, evs] = spread.split(':');
      const [
        HP,
        Atk,
        Def,
        SpA,
        SpD,
        Spe,
      ] = evs.split('/');
      const [move1, move2, move3, move4] = sortedKeys(this.data[pokemonName].Moves);
      text += `
${pokemonName} @ ${item}
Ability: ${ability}
EVs: ${HP} HP / ${Atk} Atk / ${Def} Def / ${SpA} SpA / ${SpD} SpD / ${Spe} Spe
${nature} Nature
- ${move1}
- ${move2}
- ${move3}
- ${move4}

`;
    });
    return text;
  }
}

module.exports = { Team };
