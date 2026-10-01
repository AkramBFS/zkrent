/**
 * Canonical Application Lifecycle State Machine.
 *
 * Enforces valid state transitions across the application lifecycle,
 * verification statuses, identity reveal consents, and on-chain contract records.
 */

export type ApplicationStatus =
  | 'PENDING_PAYMENT'
  | 'PAYMENT_CONFIRMED'
  | 'VERIFYING'
  | 'ZK_VERIFIED'
  | 'ZK_REJECTED'
  | 'LEASE_OFFERED'
  | 'WITHDRAWN';

export type VerificationStatus =
  | 'PENDING'
  | 'VERIFIED'
  | 'FAILED'
  | 'SIMULATED';

export type PaymentStatus =
  | 'PENDING'
  | 'PAID'
  | 'FAILED'
  | 'REFUNDED';

export type RevealStatus =
  | 'NONE'
  | 'REQUESTED'
  | 'GRANTED'
  | 'DECLINED';

export type ContractRecordLifecycle =
  | 'Active'
  | 'Consumed'
  | 'Revoked';

/* -------------------------------------------------------------------------- */
/* Transition Definitions                                                     */
/* -------------------------------------------------------------------------- */

export const APPLICATION_TRANSITIONS: Record<ApplicationStatus, readonly ApplicationStatus[]> = {
  PENDING_PAYMENT: ['PAYMENT_CONFIRMED', 'WITHDRAWN'],
  PAYMENT_CONFIRMED: ['VERIFYING', 'WITHDRAWN'],
  VERIFYING: ['ZK_VERIFIED', 'ZK_REJECTED', 'WITHDRAWN'],
  ZK_VERIFIED: ['LEASE_OFFERED', 'ZK_REJECTED', 'WITHDRAWN'],
  LEASE_OFFERED: ['WITHDRAWN'], // Terminal or consumed
  ZK_REJECTED: [],              // Terminal
  WITHDRAWN: [],                // Terminal
};

export const VERIFICATION_TRANSITIONS: Record<VerificationStatus, readonly VerificationStatus[]> = {
  PENDING: ['VERIFIED', 'FAILED', 'SIMULATED'],
  // Invariant: SIMULATED can NEVER transition to on-chain VERIFIED
  SIMULATED: ['FAILED'],
  VERIFIED: ['FAILED'],
  FAILED: [],
};

export const REVEAL_TRANSITIONS: Record<RevealStatus, readonly RevealStatus[]> = {
  NONE: ['REQUESTED'],
  REQUESTED: ['GRANTED', 'DECLINED'],
  GRANTED: [],
  DECLINED: ['REQUESTED'], // Landlord may re-request if terms change
};

export const CONTRACT_LIFECYCLE_TRANSITIONS: Record<ContractRecordLifecycle, readonly ContractRecordLifecycle[]> = {
  Active: ['Consumed', 'Revoked'],
  Consumed: [], // Terminal: qualification spent on signed lease
  Revoked: [],  // Terminal: revoked by tenant
};

/* -------------------------------------------------------------------------- */
/* Validation & Assertion Functions                                           */
/* -------------------------------------------------------------------------- */

export class InvalidStateTransitionError extends Error {
  constructor(
    public readonly domain: 'Application' | 'Verification' | 'Reveal' | 'ContractLifecycle',
    public readonly from: string,
    public readonly to: string,
    message?: string
  ) {
    super(
      message ||
        `Illegal ${domain} state transition from "${from}" to "${to}". Allowed targets: [${
          getAllowedTransitions(domain, from).join(', ')
        }]`
    );
    this.name = 'InvalidStateTransitionError';
  }
}

function getAllowedTransitions(domain: string, from: string): readonly string[] {
  switch (domain) {
    case 'Application':
      return APPLICATION_TRANSITIONS[from as ApplicationStatus] || [];
    case 'Verification':
      return VERIFICATION_TRANSITIONS[from as VerificationStatus] || [];
    case 'Reveal':
      return REVEAL_TRANSITIONS[from as RevealStatus] || [];
    case 'ContractLifecycle':
      return CONTRACT_LIFECYCLE_TRANSITIONS[from as ContractRecordLifecycle] || [];
    default:
      return [];
  }
}

export function canTransitionApplication(from: ApplicationStatus, to: ApplicationStatus): boolean {
  return APPLICATION_TRANSITIONS[from]?.includes(to) ?? false;
}

export function assertApplicationTransition(from: ApplicationStatus, to: ApplicationStatus): void {
  if (!canTransitionApplication(from, to)) {
    throw new InvalidStateTransitionError('Application', from, to);
  }
}

export function canTransitionVerification(from: VerificationStatus, to: VerificationStatus): boolean {
  // Hard invariant: SIMULATED can never become on-chain VERIFIED
  if (from === 'SIMULATED' && to === 'VERIFIED') {
    return false;
  }
  return VERIFICATION_TRANSITIONS[from]?.includes(to) ?? false;
}

export function assertVerificationTransition(from: VerificationStatus, to: VerificationStatus): void {
  if (!canTransitionVerification(from, to)) {
    throw new InvalidStateTransitionError(
      'Verification',
      from,
      to,
      from === 'SIMULATED' && to === 'VERIFIED'
        ? 'Security Violation: A simulated verification can never reach on-chain VERIFIED status.'
        : undefined
    );
  }
}

export function canTransitionReveal(from: RevealStatus, to: RevealStatus): boolean {
  return REVEAL_TRANSITIONS[from]?.includes(to) ?? false;
}

export function assertRevealTransition(from: RevealStatus, to: RevealStatus): void {
  if (!canTransitionReveal(from, to)) {
    throw new InvalidStateTransitionError('Reveal', from, to);
  }
}

export function canTransitionContractLifecycle(
  from: ContractRecordLifecycle,
  to: ContractRecordLifecycle
): boolean {
  return CONTRACT_LIFECYCLE_TRANSITIONS[from]?.includes(to) ?? false;
}

export function assertContractLifecycleTransition(
  from: ContractRecordLifecycle,
  to: ContractRecordLifecycle
): void {
  if (!canTransitionContractLifecycle(from, to)) {
    throw new InvalidStateTransitionError('ContractLifecycle', from, to);
  }
}

export function transitionRecordLifecycle(
  from: ContractRecordLifecycle,
  to: ContractRecordLifecycle
): ContractRecordLifecycle {
  assertContractLifecycleTransition(from, to);
  return to;
}

export function consumeContractRecord(from: ContractRecordLifecycle): ContractRecordLifecycle {
  return transitionRecordLifecycle(from, 'Consumed');
}
