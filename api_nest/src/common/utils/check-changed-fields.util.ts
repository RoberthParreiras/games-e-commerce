function getChangedFields<T extends Record<string, any>>(
  original: T,
  updated: T,
): Partial<T> {
  /*Check if the arguments fields from original to updated changed*/

  const changes: Partial<T> = {};

  for (const key in updated) {
    if (updated[key] !== original[key]) {
      changes[key] = updated[key];
    }
  }

  return changes;
}

export { getChangedFields };
