import test from 'node:test';
import assert from 'node:assert';
import { inferInvariants } from '../domain/invariantInferrer.js';
import { StateModel } from '../domain/types.js';

test('inferInvariants discovers conservation and bound invariants', () => {
  const model: StateModel = {
    name: 'TokenVault',
    stateVariables: [
      { name: 'balances', type: 'MAP' },
      { name: 'totalSupply', type: 'INT' },
      { name: 'nonce', type: 'INT' },
    ],
    transitions: [],
  };

  const invs = inferInvariants(model);
  assert.ok(invs.some((i) => i.kind === 'Conservation'));
  assert.ok(invs.some((i) => i.kind === 'Bound'));
  assert.ok(invs.some((i) => i.kind === 'Monotonicity'));
});
