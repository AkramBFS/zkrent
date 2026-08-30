// Latch / MOAT — createCapability + authorizeSpend + revokeCapability
// Depends on: feat/ashiha/authorize-spend (and compact-bootstrap before that).

pragma language_version >= 0.22;

import CompactStandardLibrary;

struct CapabilityPublic {
  policyCommitment: Bytes<32>;
  spendStateCommitment: Bytes<32>;
  ownerCommitment: Bytes<32>;
  revoked: Boolean;
}

export ledger capabilities: Map<Bytes<32>, CapabilityPublic>;
export ledger usedNullifiers: Set<Bytes<32>>;
export ledger verifiedReceipts: Set<Bytes<32>>;
export ledger capabilityCount: Counter;

// Shared capability openings
witness ownerSecret(): Bytes<32>;
witness policySalt(): Bytes<32>;
witness agentKeyHash(): Bytes<32>;
witness perTransactionLimit(): Uint<64>;
witness totalBudget(): Uint<64>;
witness maxUses(): Uint<32>;
witness allowedCategoryHash(): Bytes<32>;
witness stateSalt(): Bytes<32>;
witness spentSoFar(): Uint<64>;
witness useCount(): Uint<32>;

// authorizeSpend-only openings
witness agentSecret(): Bytes<32>;
witness amount(): Uint<64>;
witness requestCategoryHash(): Bytes<32>;
witness requestNonce(): Bytes<32>;
witness oneTimeDestinationHash(): Bytes<32>;
witness newStateSalt(): Bytes<32>;

pure circuit hashOwner(secret: Bytes<32>): Bytes<32> {
  return persistentHash<Vector<2, Bytes<32>>>([
    pad(32, "MOAT_OWNER_V1"),
    secret
  ]);
}

pure circuit hashCapabilityId(secret: Bytes<32>, salt: Bytes<32>): Bytes<32> {
  return persistentHash<Vector<3, Bytes<32>>>([
    pad(32, "MOAT_CAPABILITY_ID_V1"),
    secret,
    salt
  ]);
}

pure circuit hashAgentKey(secret: Bytes<32>): Bytes<32> {
  return persistentHash<Vector<2, Bytes<32>>>([
    pad(32, "MOAT_AGENT_KEY_V1"),
    secret
  ]);
}

pure circuit hashPolicy(
  capabilityId: Bytes<32>,
  agentKey: Bytes<32>,
  perTxLimit: Uint<64>,
  budget: Uint<64>,
  uses: Uint<32>,
  categoryHash: Bytes<32>,
  salt: Bytes<32>
): Bytes<32> {
  return persistentHash<Vector<8, Bytes<32>>>([
    pad(32, "MOAT_POLICY_V1"),
    capabilityId,
    agentKey,
    perTxLimit as Bytes<32>,
    budget as Bytes<32>,
    uses as Bytes<32>,
    categoryHash,
    salt
  ]);
}

pure circuit hashSpendState(
  capabilityId: Bytes<32>,
  spent: Uint<64>,
  uses: Uint<32>,
  salt: Bytes<32>
): Bytes<32> {
  return persistentHash<Vector<5, Bytes<32>>>([
    pad(32, "MOAT_SPEND_STATE_V1"),
    capabilityId,
    spent as Bytes<32>,
    uses as Bytes<32>,
    salt
  ]);
}

pure circuit hashRequest(
  spendAmount: Uint<64>,
  categoryHash: Bytes<32>,
  destinationHash: Bytes<32>,
  nonce: Bytes<32>
): Bytes<32> {
  return persistentHash<Vector<5, Bytes<32>>>([
    pad(32, "MOAT_REQUEST_V1"),
    spendAmount as Bytes<32>,
    categoryHash,
    destinationHash,
    nonce
  ]);
}

pure circuit hashNullifier(
  capabilityId: Bytes<32>,
  nonce: Bytes<32>,
  agent: Bytes<32>
): Bytes<32> {
  return persistentHash<Vector<4, Bytes<32>>>([
    pad(32, "MOAT_NULLIFIER_V1"),
    capabilityId,
    nonce,
    agent
  ]);
}

pure circuit hashReceipt(
  capabilityId: Bytes<32>,
  requestCommitment: Bytes<32>,
  nullifier: Bytes<32>,
  newSpendStateCommitment: Bytes<32>
): Bytes<32> {
  return persistentHash<Vector<5, Bytes<32>>>([
    pad(32, "MOAT_RECEIPT_V1"),
    capabilityId,
    requestCommitment,
    nullifier,
    newSpendStateCommitment
  ]);
}

/**
 * Prove private policy + zeroed initial spend-state open the submitted
 * commitments, then register public commitments only.
 */
export circuit createCapability(
  policyCommitment: Bytes<32>,
  spendStateCommitment: Bytes<32>
): [] {
  const secret = ownerSecret();
  const salt = policySalt();
  const agentKey = agentKeyHash();
  const perTxLimit = perTransactionLimit();
  const budget = totalBudget();
  const uses = maxUses();
  const categoryHash = allowedCategoryHash();
  const spendSalt = stateSalt();
  const spent = spentSoFar();
  const used = useCount();

  assert(perTxLimit > 0 as Uint<64>, "invalid limit");
  assert(budget > 0 as Uint<64>, "invalid budget");
  assert(uses > 0 as Uint<32>, "invalid uses");
  assert(spent == 0 as Uint<64>, "non-zero spend state");
  assert(used == 0 as Uint<32>, "non-zero use count");
  assert(perTxLimit <= budget, "limit exceeds budget");

  const capabilityId = hashCapabilityId(secret, salt);
  const ownerCommitment = hashOwner(secret);
  const expectedPolicy = hashPolicy(
    capabilityId,
    agentKey,
    perTxLimit,
    budget,
    uses,
    categoryHash,
    salt
  );
  const expectedSpendState = hashSpendState(capabilityId, spent, used, spendSalt);

  assert(expectedPolicy == policyCommitment, "policy commitment mismatch");
  assert(expectedSpendState == spendStateCommitment, "spend-state commitment mismatch");

  const publicCapabilityId = disclose(capabilityId);
  assert(!capabilities.member(publicCapabilityId), "capability exists");

  capabilities.insert(
    publicCapabilityId,
    CapabilityPublic {
      policyCommitment: disclose(policyCommitment),
      spendStateCommitment: disclose(spendStateCommitment),
      ownerCommitment: disclose(ownerCommitment),
      revoked: false
    }
  );
  capabilityCount.increment(1);
}

/**
 * Authorize one spend against a registered capability.
 * Observer-facing assert copy is intentionally generic (failure privacy).
 *
 * Privacy model for `capabilityId`: circuit arguments are private witness-like
 * inputs until disclosed. Callers prove knowledge of openings that derive this
 * ID; `disclose(capabilityId)` is what becomes the public ledger key. Do not
 * treat the undisclosed parameter as already-public chain data.
 */
export circuit authorizeSpend(capabilityId: Bytes<32>): [] {
  const publicCapabilityId = disclose(capabilityId);
  assert(capabilities.member(publicCapabilityId), "authorization rejected");

  const record = capabilities.lookup(publicCapabilityId);
  assert(!record.revoked, "authorization rejected");

  const secret = ownerSecret();
  const salt = policySalt();
  const agentKey = agentKeyHash();
  const perTxLimit = perTransactionLimit();
  const budget = totalBudget();
  const maxUse = maxUses();
  const allowedCategory = allowedCategoryHash();
  const spendSalt = stateSalt();
  const spent = spentSoFar();
  const used = useCount();
  const agent = agentSecret();
  const spendAmount = amount();
  const requestCategory = requestCategoryHash();
  const nonce = requestNonce();
  const destinationHash = oneTimeDestinationHash();
  const nextSalt = newStateSalt();

  const derivedId = hashCapabilityId(secret, salt);
  assert(derivedId == capabilityId, "authorization rejected");
  assert(hashAgentKey(agent) == agentKey, "authorization rejected");

  const expectedPolicy = hashPolicy(
    capabilityId,
    agentKey,
    perTxLimit,
    budget,
    maxUse,
    allowedCategory,
    salt
  );
  const expectedSpendState = hashSpendState(capabilityId, spent, used, spendSalt);
  assert(expectedPolicy == record.policyCommitment, "authorization rejected");
  assert(expectedSpendState == record.spendStateCommitment, "authorization rejected");

  assert(spendAmount > 0 as Uint<64>, "authorization rejected");
  assert(spendAmount <= perTxLimit, "authorization rejected");
  assert(spent + spendAmount <= budget, "authorization rejected");
  assert(requestCategory == allowedCategory, "authorization rejected");
  assert(used < maxUse, "authorization rejected");

  const requestCommitment = hashRequest(spendAmount, requestCategory, destinationHash, nonce);
  const nullifier = hashNullifier(capabilityId, nonce, agent);
  const publicNullifier = disclose(nullifier);
  assert(!usedNullifiers.member(publicNullifier), "authorization rejected");

  const newSpent = (spent + spendAmount) as Uint<64>;
  const newUseCount = (used + (1 as Uint<32>)) as Uint<32>;
  const newSpendStateCommitment = hashSpendState(capabilityId, newSpent, newUseCount, nextSalt);
  const receiptCommitment = hashReceipt(
    capabilityId,
    requestCommitment,
    nullifier,
    newSpendStateCommitment
  );

  usedNullifiers.insert(publicNullifier);
  verifiedReceipts.insert(disclose(receiptCommitment));
  // Compact Map.insert creates or overwrites (official update path). This is not
  // the createCapability uniqueness insert; the key was asserted present above.
  capabilities.insert(
    publicCapabilityId,
    CapabilityPublic {
      policyCommitment: record.policyCommitment,
      spendStateCommitment: disclose(newSpendStateCommitment),
      ownerCommitment: record.ownerCommitment,
      revoked: record.revoked
    }
  );
}

/**
 * Revoke a capability. Requires ownerSecret that opens the stored ownerCommitment
 * (and policySalt so the derived capability ID matches). Revoked capabilities fail
 * authorizeSpend via the revoked flag check.
 */
export circuit revokeCapability(capabilityId: Bytes<32>): [] {
  // Same privacy model as authorizeSpend: arg is private until disclosed.
  const publicCapabilityId = disclose(capabilityId);
  assert(capabilities.member(publicCapabilityId), "revocation rejected");

  const record = capabilities.lookup(publicCapabilityId);
  assert(!record.revoked, "revocation rejected");

  const secret = ownerSecret();
  const salt = policySalt();
  assert(hashOwner(secret) == record.ownerCommitment, "revocation rejected");
  assert(hashCapabilityId(secret, salt) == capabilityId, "revocation rejected");

  // Overwrite existing entry; Compact Map.insert updates in place.
  capabilities.insert(
    publicCapabilityId,
    CapabilityPublic {
      policyCommitment: record.policyCommitment,
      spendStateCommitment: record.spendStateCommitment,
      ownerCommitment: record.ownerCommitment,
      revoked: true
    }
  );
}