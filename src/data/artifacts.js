import artifactData from './artifacts.json';

/**
 * Artifact sets database with 2-piece and 4-piece effects.
 */
export const artifacts = artifactData;

/**
 * Helper to get artifact by name
 * @param {string} name - Set name (e.g., 'Noblesse Oblige')
 */
export const getArtifact = (name) => {
  if (!name) return null;
  return artifacts[name] || null;
};
