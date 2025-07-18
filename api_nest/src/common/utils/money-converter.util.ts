function centsToReal(cents: number): string {
  return (cents / 100).toFixed(2);
}

function realToCents(real: string | number): number {
  const realAmount = typeof real === 'string' ? parseFloat(real) : real;
  return Math.round(realAmount * 100);
}

export { centsToReal, realToCents };
