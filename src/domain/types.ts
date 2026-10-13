export type VariableType = 'INT' | 'REAL' | 'BOOL' | 'MAP';

export interface StateVariable {
  name: string;
  type: VariableType;
  description?: string;
}

export interface StateTransition {
  name: string;
  parameters: { name: string; type: VariableType }[];
  preconditions: string[]; // e.g. "amount > 0", "balance[sender] >= amount"
  postconditions: string[]; // e.g. "balance[sender]' == balance[sender] - amount"
}

export interface StateModel {
  name: string;
  stateVariables: StateVariable[];
  transitions: StateTransition[];
}

export type InvariantKind = 'Conservation' | 'Bound' | 'Monotonicity' | 'Idempotency';

export interface DiscoveredInvariant {
  id: string;
  kind: InvariantKind;
  formula: string;
  description: string;
  affectedVariables: string[];
}
