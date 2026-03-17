import durin from "../../data/dps/characters/Durin.json";

function averageCritMultiplier(critRate, critDamage) {
  return 1 + critRate * critDamage;
}

function calculateTalentDamage(talent, stats) {
  const critMult = averageCritMultiplier(
    stats.critRate,
    stats.critDamage
  );

  let total = 0;

  talent.hits.forEach(hit => {
    total +=
      stats.atk *
      hit.multiplier *
      critMult *
      (1 + stats.elementalBonus);
  });

  return total;
}

const stats = {
  atk: 2132,
  critRate: 0.742,
  critDamage: 2.100,
  elementalBonus: 0.466
};

console.log(
  "Durin Burst (raw, no reactions):",
  calculateTalentDamage(durin.talents.burst, stats)
);

export function calculateSingleDPS(character, stats, options) {
  return {};
}
