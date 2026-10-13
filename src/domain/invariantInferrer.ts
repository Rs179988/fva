import { DiscoveredInvariant, StateModel } from './types.js';

export function inferInvariants(model: StateModel): DiscoveredInvariant[] {
  const invariants: DiscoveredInvariant[] = [];
  const varNames = model.stateVariables.map((v) => v.name);

  // 1. Conservation Law Discovery
  // E.g. If we have a map like balances and a totalSupply variable
  const mapVar = model.stateVariables.find((v) => v.type === 'MAP' && v.name.toLowerCase().includes('balance'));
  const sumVar = model.stateVariables.find((v) => v.type === 'INT' && (v.name.toLowerCase().includes('total') || v.name.toLowerCase().includes('supply')));

  if (mapVar && sumVar) {
    invariants.push({
      id: 'inv-conservation-1',
      kind: 'Conservation',
      formula: `sum(${mapVar.name}) == ${sumVar.name}`,
      description: `Sum of all individual entries in ${mapVar.name} must exactly equal ${sumVar.name} across all transitions.`,
      affectedVariables: [mapVar.name, sumVar.name],
    });
  }

  // 2. Non-Negativity / Lower Bound Discovery
  for (const v of model.stateVariables) {
    if (v.name.toLowerCase().includes('balance') || v.name.toLowerCase().includes('amount') || v.name.toLowerCase().includes('supply') || v.name.toLowerCase().includes('count')) {
      invariants.push({
        id: `inv-bound-${v.name}`,
        kind: 'Bound',
        formula: v.type === 'MAP' ? `forall x, ${v.name}[x] >= 0` : `${v.name} >= 0`,
        description: `Variable ${v.name} represents a physical/token quantity and must remain strictly non-negative.`,
        affectedVariables: [v.name],
      });
    }
  }

  // 3. Monotonic Sequence Counters
  for (const v of model.stateVariables) {
    if (v.name.toLowerCase().includes('nonce') || v.name.toLowerCase().includes('sequence') || v.name.toLowerCase().includes('index') || v.name.toLowerCase().includes('counter')) {
      invariants.push({
        id: `inv-mono-${v.name}`,
        kind: 'Monotonicity',
        formula: `${v.name}_next >= ${v.name}_curr`,
        description: `Sequence counter ${v.name} must monotonically increase across transitions.`,
        affectedVariables: [v.name],
      });
    }
  }

  return invariants;
}
