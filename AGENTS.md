# Repository Guidelines for FVA (Formal Verification Anything)

## Core Philosophy

FVA operates on **Mathematical Invariant Proofs**.
Unit tests only test what developers can imagine; formal verification tests what developers forget.

1. **Conservation Invariants**: Balance sum conservation, total supply consistency, non-negative state limits, and monotonicity must be formally defined as mathematical relations.
2. **Property-Based Fuzzing Synthesis**: Synthesize high-coverage property test harnesses using fuzz testing frameworks (`fast-check`, `proptest`, Foundry invariant tests) capable of executing 100,000+ randomized state transitions.
3. **First-Order Logic (SMT-LIB)**: Emits standard SMT-LIB 2.0 assertions for Z3/CVC5 automated theorem provers to mathematically prove invariant safety.
4. **Agentic Integration**: Plugs into AI coding agents over MCP and terminal CLI to guarantee zero hallucinated correctness.
