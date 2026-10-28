import { characters, getCharacter } from '../data/characters';
import { artifacts, getArtifact } from '../data/artifacts';

const calculateTalentDamage = (talent, stats) => {
  let total = 0;
  const critMult = 1 + (stats.critRate * stats.critDamage);

  talent.hits.forEach(hit => {
    total +=
      stats.atk *
      hit.multiplier *
      critMult *
      (1 + stats.elementalBonus);
  });

  return total;
};

/**
 * Calculates DPS for a single character based on base stats and custom inputs.
 */
export function calculateSingleDPS(charIdentifier, customStats = {}, options = {}) {
  // 1. Get base character data
  const baseData = getCharacter(charIdentifier);
  
  if (!baseData && !customStats.atk) {
    console.warn(`[DPS] Character ${charIdentifier} not found and no manual stats provided.`);
  }

  // 2. Merge base stats with custom stats (weapon, artifacts, buffs)
  const stats = {
    hp: (baseData?.baseHp || 0) + (customStats.flatHp || 0),
    atk: (baseData?.baseAtk || 0) + (customStats.flatAtk || 0),
    def: (baseData?.baseDef || 0) + (customStats.flatDef || 0),
    critRate: (customStats.critRate || 0.05),
    critDamage: (customStats.critDamage || 0.50),
    elementalBonus: (customStats.elementalBonus || 0),
    ...customStats
  };

  return {
    characterName: baseData?.name || charIdentifier,
    role: baseData ? Object.keys(characters).find(role => characters[role][charIdentifier.toLowerCase().replace(/ /g, '_')]) : 'unknown',
    stats: stats,
    baseData: baseData
  };
}
