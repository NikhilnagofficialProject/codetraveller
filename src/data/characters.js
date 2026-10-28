import characterData from './characters.json';

/**
 * Character database with Level 90 stats, segregated by role.
 * Note: Names, elements, and weapons are now handled by the primary 'genshin data' source.
 */
export const characters = characterData;

/**
 * Helper to get character stats by ID or key (searches across all roles)
 * @param {string|number} identifier - Character key (e.g. 'hutao') or ID (e.g. 10000046)
 */
export const getCharacterStats = (identifier) => {
  if (!identifier) return null;
  
  const lowerKey = String(identifier).toLowerCase().replace(/ /g, '');
  
  // Search in all roles
  for (const role of Object.keys(characters)) {
    // 1. Direct key match
    if (characters[role][lowerKey]) return characters[role][lowerKey];
    
    // 2. ID match
    const matchById = Object.values(characters[role]).find(c => c.id === identifier);
    if (matchById) return matchById;
  }
  
  return null;
};

/**
 * Helper to get all character keys in a specific role
 * @param {string} role - 'main_dps', 'sub_dps', or 'support'
 */
export const getCharactersByRole = (role) => {
  return characters[role] || {};
};
