import * as __compactRuntime from '@midnight-ntwrk/compact-runtime';
__compactRuntime.checkRuntimeVersion('0.19.0');

export var RecordLifecycle;
(function (RecordLifecycle) {
  RecordLifecycle[RecordLifecycle['Active'] = 0] = 'Active';
  RecordLifecycle[RecordLifecycle['Consumed'] = 1] = 'Consumed';
  RecordLifecycle[RecordLifecycle['Revoked'] = 2] = 'Revoked';
})(RecordLifecycle || (RecordLifecycle = {}));

const _descriptor_0 = new __compactRuntime.CompactTypeBytes(32);

const _descriptor_1 = new __compactRuntime.CompactTypeUnsignedInteger(255n, 1);

const _descriptor_2 = new __compactRuntime.CompactTypeEnum(2, 1);

const _descriptor_3 = new __compactRuntime.CompactTypeUnsignedInteger(18446744073709551615n, 8);

class _ApplicationStatusRecord_0 {
  alignment() {
    return _descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_1.alignment().concat(_descriptor_2.alignment().concat(_descriptor_3.alignment().concat(_descriptor_3.alignment()))))));
  }
  fromValue(value_0) {
    return {
      listingId: _descriptor_0.fromValue(value_0),
      criteriaHash: _descriptor_0.fromValue(value_0),
      tenantCommitment: _descriptor_0.fromValue(value_0),
      tier: _descriptor_1.fromValue(value_0),
      lifecycle: _descriptor_2.fromValue(value_0),
      verifiedAt: _descriptor_3.fromValue(value_0),
      expiresAt: _descriptor_3.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0.listingId).concat(_descriptor_0.toValue(value_0.criteriaHash).concat(_descriptor_0.toValue(value_0.tenantCommitment).concat(_descriptor_1.toValue(value_0.tier).concat(_descriptor_2.toValue(value_0.lifecycle).concat(_descriptor_3.toValue(value_0.verifiedAt).concat(_descriptor_3.toValue(value_0.expiresAt)))))));
  }
}

const _descriptor_4 = new _ApplicationStatusRecord_0();

const _descriptor_5 = __compactRuntime.CompactTypeBoolean;

const _descriptor_6 = new __compactRuntime.CompactTypeUnsignedInteger(4294967295n, 4);

const _descriptor_7 = new __compactRuntime.CompactTypeUnsignedInteger(65535n, 2);

class _ListingCriteria_0 {
  alignment() {
    return _descriptor_0.alignment().concat(_descriptor_6.alignment().concat(_descriptor_0.alignment().concat(_descriptor_3.alignment().concat(_descriptor_3.alignment().concat(_descriptor_7.alignment().concat(_descriptor_7.alignment().concat(_descriptor_5.alignment().concat(_descriptor_7.alignment().concat(_descriptor_7.alignment().concat(_descriptor_7.alignment().concat(_descriptor_5.alignment())))))))))));
  }
  fromValue(value_0) {
    return {
      landlordPk: _descriptor_0.fromValue(value_0),
      criteriaVersion: _descriptor_6.fromValue(value_0),
      criteriaHash: _descriptor_0.fromValue(value_0),
      monthlyRent: _descriptor_3.fromValue(value_0),
      minMonthlyIncome: _descriptor_3.fromValue(value_0),
      maxRentToIncomeRatioBps: _descriptor_7.fromValue(value_0),
      minCreditScore: _descriptor_7.fromValue(value_0),
      requireCleanBackground: _descriptor_5.fromValue(value_0),
      minEmploymentMonths: _descriptor_7.fromValue(value_0),
      primeMinIncomeRatioBps: _descriptor_7.fromValue(value_0),
      primeMinCreditScore: _descriptor_7.fromValue(value_0),
      active: _descriptor_5.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0.landlordPk).concat(_descriptor_6.toValue(value_0.criteriaVersion).concat(_descriptor_0.toValue(value_0.criteriaHash).concat(_descriptor_3.toValue(value_0.monthlyRent).concat(_descriptor_3.toValue(value_0.minMonthlyIncome).concat(_descriptor_7.toValue(value_0.maxRentToIncomeRatioBps).concat(_descriptor_7.toValue(value_0.minCreditScore).concat(_descriptor_5.toValue(value_0.requireCleanBackground).concat(_descriptor_7.toValue(value_0.minEmploymentMonths).concat(_descriptor_7.toValue(value_0.primeMinIncomeRatioBps).concat(_descriptor_7.toValue(value_0.primeMinCreditScore).concat(_descriptor_5.toValue(value_0.active))))))))))));
  }
}

const _descriptor_8 = new _ListingCriteria_0();

class _Attestation_0 {
  alignment() {
    return _descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_3.alignment().concat(_descriptor_7.alignment().concat(_descriptor_7.alignment().concat(_descriptor_5.alignment().concat(_descriptor_3.alignment().concat(_descriptor_3.alignment())))))));
  }
  fromValue(value_0) {
    return {
      issuerPk: _descriptor_0.fromValue(value_0),
      subjectCommitment: _descriptor_0.fromValue(value_0),
      annualIncome: _descriptor_3.fromValue(value_0),
      creditScore: _descriptor_7.fromValue(value_0),
      employmentMonths: _descriptor_7.fromValue(value_0),
      backgroundClean: _descriptor_5.fromValue(value_0),
      issuedAt: _descriptor_3.fromValue(value_0),
      expiresAt: _descriptor_3.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0.issuerPk).concat(_descriptor_0.toValue(value_0.subjectCommitment).concat(_descriptor_3.toValue(value_0.annualIncome).concat(_descriptor_7.toValue(value_0.creditScore).concat(_descriptor_7.toValue(value_0.employmentMonths).concat(_descriptor_5.toValue(value_0.backgroundClean).concat(_descriptor_3.toValue(value_0.issuedAt).concat(_descriptor_3.toValue(value_0.expiresAt))))))));
  }
}

const _descriptor_9 = new _Attestation_0();

const _descriptor_10 = new __compactRuntime.CompactTypeVector(2, _descriptor_0);

const _descriptor_11 = new __compactRuntime.CompactTypeVector(3, _descriptor_0);

const _descriptor_12 = new __compactRuntime.CompactTypeVector(6, _descriptor_0);

const _descriptor_13 = new __compactRuntime.CompactTypeVector(4, _descriptor_0);

class _Either_0 {
  alignment() {
    return _descriptor_5.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment()));
  }
  fromValue(value_0) {
    return {
      is_left: _descriptor_5.fromValue(value_0),
      left: _descriptor_0.fromValue(value_0),
      right: _descriptor_0.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_5.toValue(value_0.is_left).concat(_descriptor_0.toValue(value_0.left).concat(_descriptor_0.toValue(value_0.right)));
  }
}

const _descriptor_14 = new _Either_0();

const _descriptor_15 = new __compactRuntime.CompactTypeUnsignedInteger(340282366920938463463374607431768211455n, 16);

class _ContractAddress_0 {
  alignment() {
    return _descriptor_0.alignment();
  }
  fromValue(value_0) {
    return {
      bytes: _descriptor_0.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0.bytes);
  }
}

const _descriptor_16 = new _ContractAddress_0();

export class Contract {
  witnesses;
  constructor(...args_0) {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`Contract constructor: expected 1 argument, received ${args_0.length}`);
    }
    const witnesses_0 = args_0[0];
    if (typeof(witnesses_0) !== 'object') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor is not an object');
    }
    if (typeof(witnesses_0.getAttestation) !== 'function') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named getAttestation');
    }
    if (typeof(witnesses_0.getTenantSecret) !== 'function') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named getTenantSecret');
    }
    if (typeof(witnesses_0.getTenantSalt) !== 'function') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named getTenantSalt');
    }
    if (typeof(witnesses_0.getCallerSecret) !== 'function') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named getCallerSecret');
    }
    this.witnesses = witnesses_0;
    this.circuits = {
      setPaused: async (...args_1) => {
        if (args_1.length !== 2) {
          throw new __compactRuntime.CompactError(`setPaused: expected 2 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const paused_0 = args_1[1];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.callContext.currentQueryContext != undefined)) {
          __compactRuntime.typeError('setPaused',
                                     'argument 1 (as invoked from Typescript)',
                                     'qualification.compact line 112 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(typeof(paused_0) === 'boolean')) {
          __compactRuntime.typeError('setPaused',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'qualification.compact line 112 char 1',
                                     'Boolean',
                                     paused_0)
        }
        const context = __compactRuntime.copyCircuitContext(contextOrig_0);
        const partialProofData = {
          input: {
            value: _descriptor_5.toValue(paused_0),
            alignment: _descriptor_5.alignment()
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = await this._setPaused_0(context,
                                                 partialProofData,
                                                 paused_0);
        partialProofData.output = { value: [], alignment: [] };
        __compactRuntime.finalizeCallProofData(context, partialProofData);
        return { result: result_0, context: context, gasCost: context.callContext.currentGasCost };
      },
      registerListingCriteria: async (...args_1) => {
        if (args_1.length !== 11) {
          throw new __compactRuntime.CompactError(`registerListingCriteria: expected 11 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const listingId_0 = args_1[1];
        const monthlyRent_0 = args_1[2];
        const minMonthlyIncome_0 = args_1[3];
        const maxRentToIncomeRatioBps_0 = args_1[4];
        const minCreditScore_0 = args_1[5];
        const requireCleanBackground_0 = args_1[6];
        const minEmploymentMonths_0 = args_1[7];
        const primeMinIncomeRatioBps_0 = args_1[8];
        const primeMinCreditScore_0 = args_1[9];
        const active_0 = args_1[10];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.callContext.currentQueryContext != undefined)) {
          __compactRuntime.typeError('registerListingCriteria',
                                     'argument 1 (as invoked from Typescript)',
                                     'qualification.compact line 123 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(listingId_0.buffer instanceof ArrayBuffer && listingId_0.BYTES_PER_ELEMENT === 1 && listingId_0.length === 32)) {
          __compactRuntime.typeError('registerListingCriteria',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'qualification.compact line 123 char 1',
                                     'Bytes<32>',
                                     listingId_0)
        }
        if (!(typeof(monthlyRent_0) === 'bigint' && monthlyRent_0 >= 0n && monthlyRent_0 <= 18446744073709551615n)) {
          __compactRuntime.typeError('registerListingCriteria',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'qualification.compact line 123 char 1',
                                     'Uint<0..18446744073709551616>',
                                     monthlyRent_0)
        }
        if (!(typeof(minMonthlyIncome_0) === 'bigint' && minMonthlyIncome_0 >= 0n && minMonthlyIncome_0 <= 18446744073709551615n)) {
          __compactRuntime.typeError('registerListingCriteria',
                                     'argument 3 (argument 4 as invoked from Typescript)',
                                     'qualification.compact line 123 char 1',
                                     'Uint<0..18446744073709551616>',
                                     minMonthlyIncome_0)
        }
        if (!(typeof(maxRentToIncomeRatioBps_0) === 'bigint' && maxRentToIncomeRatioBps_0 >= 0n && maxRentToIncomeRatioBps_0 <= 65535n)) {
          __compactRuntime.typeError('registerListingCriteria',
                                     'argument 4 (argument 5 as invoked from Typescript)',
                                     'qualification.compact line 123 char 1',
                                     'Uint<0..65536>',
                                     maxRentToIncomeRatioBps_0)
        }
        if (!(typeof(minCreditScore_0) === 'bigint' && minCreditScore_0 >= 0n && minCreditScore_0 <= 65535n)) {
          __compactRuntime.typeError('registerListingCriteria',
                                     'argument 5 (argument 6 as invoked from Typescript)',
                                     'qualification.compact line 123 char 1',
                                     'Uint<0..65536>',
                                     minCreditScore_0)
        }
        if (!(typeof(requireCleanBackground_0) === 'boolean')) {
          __compactRuntime.typeError('registerListingCriteria',
                                     'argument 6 (argument 7 as invoked from Typescript)',
                                     'qualification.compact line 123 char 1',
                                     'Boolean',
                                     requireCleanBackground_0)
        }
        if (!(typeof(minEmploymentMonths_0) === 'bigint' && minEmploymentMonths_0 >= 0n && minEmploymentMonths_0 <= 65535n)) {
          __compactRuntime.typeError('registerListingCriteria',
                                     'argument 7 (argument 8 as invoked from Typescript)',
                                     'qualification.compact line 123 char 1',
                                     'Uint<0..65536>',
                                     minEmploymentMonths_0)
        }
        if (!(typeof(primeMinIncomeRatioBps_0) === 'bigint' && primeMinIncomeRatioBps_0 >= 0n && primeMinIncomeRatioBps_0 <= 65535n)) {
          __compactRuntime.typeError('registerListingCriteria',
                                     'argument 8 (argument 9 as invoked from Typescript)',
                                     'qualification.compact line 123 char 1',
                                     'Uint<0..65536>',
                                     primeMinIncomeRatioBps_0)
        }
        if (!(typeof(primeMinCreditScore_0) === 'bigint' && primeMinCreditScore_0 >= 0n && primeMinCreditScore_0 <= 65535n)) {
          __compactRuntime.typeError('registerListingCriteria',
                                     'argument 9 (argument 10 as invoked from Typescript)',
                                     'qualification.compact line 123 char 1',
                                     'Uint<0..65536>',
                                     primeMinCreditScore_0)
        }
        if (!(typeof(active_0) === 'boolean')) {
          __compactRuntime.typeError('registerListingCriteria',
                                     'argument 10 (argument 11 as invoked from Typescript)',
                                     'qualification.compact line 123 char 1',
                                     'Boolean',
                                     active_0)
        }
        const context = __compactRuntime.copyCircuitContext(contextOrig_0);
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(listingId_0).concat(_descriptor_3.toValue(monthlyRent_0).concat(_descriptor_3.toValue(minMonthlyIncome_0).concat(_descriptor_7.toValue(maxRentToIncomeRatioBps_0).concat(_descriptor_7.toValue(minCreditScore_0).concat(_descriptor_5.toValue(requireCleanBackground_0).concat(_descriptor_7.toValue(minEmploymentMonths_0).concat(_descriptor_7.toValue(primeMinIncomeRatioBps_0).concat(_descriptor_7.toValue(primeMinCreditScore_0).concat(_descriptor_5.toValue(active_0)))))))))),
            alignment: _descriptor_0.alignment().concat(_descriptor_3.alignment().concat(_descriptor_3.alignment().concat(_descriptor_7.alignment().concat(_descriptor_7.alignment().concat(_descriptor_5.alignment().concat(_descriptor_7.alignment().concat(_descriptor_7.alignment().concat(_descriptor_7.alignment().concat(_descriptor_5.alignment())))))))))
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = await this._registerListingCriteria_0(context,
                                                               partialProofData,
                                                               listingId_0,
                                                               monthlyRent_0,
                                                               minMonthlyIncome_0,
                                                               maxRentToIncomeRatioBps_0,
                                                               minCreditScore_0,
                                                               requireCleanBackground_0,
                                                               minEmploymentMonths_0,
                                                               primeMinIncomeRatioBps_0,
                                                               primeMinCreditScore_0,
                                                               active_0);
        partialProofData.output = { value: [], alignment: [] };
        __compactRuntime.finalizeCallProofData(context, partialProofData);
        return { result: result_0, context: context, gasCost: context.callContext.currentGasCost };
      },
      proveQualification: async (...args_1) => {
        if (args_1.length !== 4) {
          throw new __compactRuntime.CompactError(`proveQualification: expected 4 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const listingId_0 = args_1[1];
        const applicationId_0 = args_1[2];
        const currentTime_0 = args_1[3];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.callContext.currentQueryContext != undefined)) {
          __compactRuntime.typeError('proveQualification',
                                     'argument 1 (as invoked from Typescript)',
                                     'qualification.compact line 177 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(listingId_0.buffer instanceof ArrayBuffer && listingId_0.BYTES_PER_ELEMENT === 1 && listingId_0.length === 32)) {
          __compactRuntime.typeError('proveQualification',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'qualification.compact line 177 char 1',
                                     'Bytes<32>',
                                     listingId_0)
        }
        if (!(applicationId_0.buffer instanceof ArrayBuffer && applicationId_0.BYTES_PER_ELEMENT === 1 && applicationId_0.length === 32)) {
          __compactRuntime.typeError('proveQualification',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'qualification.compact line 177 char 1',
                                     'Bytes<32>',
                                     applicationId_0)
        }
        if (!(typeof(currentTime_0) === 'bigint' && currentTime_0 >= 0n && currentTime_0 <= 18446744073709551615n)) {
          __compactRuntime.typeError('proveQualification',
                                     'argument 3 (argument 4 as invoked from Typescript)',
                                     'qualification.compact line 177 char 1',
                                     'Uint<0..18446744073709551616>',
                                     currentTime_0)
        }
        const context = __compactRuntime.copyCircuitContext(contextOrig_0);
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(listingId_0).concat(_descriptor_0.toValue(applicationId_0).concat(_descriptor_3.toValue(currentTime_0))),
            alignment: _descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_3.alignment()))
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = await this._proveQualification_0(context,
                                                          partialProofData,
                                                          listingId_0,
                                                          applicationId_0,
                                                          currentTime_0);
        partialProofData.output = { value: [], alignment: [] };
        __compactRuntime.finalizeCallProofData(context, partialProofData);
        return { result: result_0, context: context, gasCost: context.callContext.currentGasCost };
      },
      consumeQualification: async (...args_1) => {
        if (args_1.length !== 2) {
          throw new __compactRuntime.CompactError(`consumeQualification: expected 2 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const applicationId_0 = args_1[1];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.callContext.currentQueryContext != undefined)) {
          __compactRuntime.typeError('consumeQualification',
                                     'argument 1 (as invoked from Typescript)',
                                     'qualification.compact line 263 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(applicationId_0.buffer instanceof ArrayBuffer && applicationId_0.BYTES_PER_ELEMENT === 1 && applicationId_0.length === 32)) {
          __compactRuntime.typeError('consumeQualification',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'qualification.compact line 263 char 1',
                                     'Bytes<32>',
                                     applicationId_0)
        }
        const context = __compactRuntime.copyCircuitContext(contextOrig_0);
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(applicationId_0),
            alignment: _descriptor_0.alignment()
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = await this._consumeQualification_0(context,
                                                            partialProofData,
                                                            applicationId_0);
        partialProofData.output = { value: [], alignment: [] };
        __compactRuntime.finalizeCallProofData(context, partialProofData);
        return { result: result_0, context: context, gasCost: context.callContext.currentGasCost };
      },
      revokeQualification: async (...args_1) => {
        if (args_1.length !== 2) {
          throw new __compactRuntime.CompactError(`revokeQualification: expected 2 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const applicationId_0 = args_1[1];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.callContext.currentQueryContext != undefined)) {
          __compactRuntime.typeError('revokeQualification',
                                     'argument 1 (as invoked from Typescript)',
                                     'qualification.compact line 292 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(applicationId_0.buffer instanceof ArrayBuffer && applicationId_0.BYTES_PER_ELEMENT === 1 && applicationId_0.length === 32)) {
          __compactRuntime.typeError('revokeQualification',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'qualification.compact line 292 char 1',
                                     'Bytes<32>',
                                     applicationId_0)
        }
        const context = __compactRuntime.copyCircuitContext(contextOrig_0);
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(applicationId_0),
            alignment: _descriptor_0.alignment()
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = await this._revokeQualification_0(context,
                                                           partialProofData,
                                                           applicationId_0);
        partialProofData.output = { value: [], alignment: [] };
        __compactRuntime.finalizeCallProofData(context, partialProofData);
        return { result: result_0, context: context, gasCost: context.callContext.currentGasCost };
      }
    };
    this.impureCircuits = {
      setPaused: this.circuits.setPaused,
      registerListingCriteria: this.circuits.registerListingCriteria,
      proveQualification: this.circuits.proveQualification,
      consumeQualification: this.circuits.consumeQualification,
      revokeQualification: this.circuits.revokeQualification
    };
    this.provableCircuits = {
      setPaused: this.circuits.setPaused,
      registerListingCriteria: this.circuits.registerListingCriteria,
      proveQualification: this.circuits.proveQualification,
      consumeQualification: this.circuits.consumeQualification,
      revokeQualification: this.circuits.revokeQualification
    };
  }
  async initialState(...args_0) {
    if (args_0.length !== 2) {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 2 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const constructorContext_0 = args_0[0];
    const admin_0 = args_0[1];
    if (typeof(constructorContext_0) !== 'object') {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'constructorContext' in argument 1 (as invoked from Typescript) to be an object`);
    }
    if (!('initialPrivateState' in constructorContext_0)) {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'initialPrivateState' in argument 1 (as invoked from Typescript)`);
    }
    if (!('initialZswapLocalState' in constructorContext_0)) {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'initialZswapLocalState' in argument 1 (as invoked from Typescript)`);
    }
    if (typeof(constructorContext_0.initialZswapLocalState) !== 'object') {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'initialZswapLocalState' in argument 1 (as invoked from Typescript) to be an object`);
    }
    if (!(admin_0.buffer instanceof ArrayBuffer && admin_0.BYTES_PER_ELEMENT === 1 && admin_0.length === 32)) {
      __compactRuntime.typeError('Contract state constructor',
                                 'argument 1 (argument 2 as invoked from Typescript)',
                                 'qualification.compact line 70 char 1',
                                 'Bytes<32>',
                                 admin_0)
    }
    const state_0 = new __compactRuntime.ContractState();
    let stateValue_0 = __compactRuntime.StateValue.newArray();
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    state_0.data = new __compactRuntime.ChargedState(stateValue_0);
    state_0.setOperation('setPaused', new __compactRuntime.ContractOperation());
    state_0.setOperation('registerListingCriteria', new __compactRuntime.ContractOperation());
    state_0.setOperation('proveQualification', new __compactRuntime.ContractOperation());
    state_0.setOperation('consumeQualification', new __compactRuntime.ContractOperation());
    state_0.setOperation('revokeQualification', new __compactRuntime.ContractOperation());
    const context = __compactRuntime.createCircuitContext('constructor', __compactRuntime.dummyContractAddress(), constructorContext_0.initialZswapLocalState.coinPublicKey, state_0.data, constructorContext_0.initialPrivateState);
    const partialProofData = {
      input: { value: [], alignment: [] },
      output: undefined,
      publicTranscript: [],
      privateTranscriptOutputs: []
    };
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(0n),
                                                                                              alignment: _descriptor_1.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newMap(
                                                          new __compactRuntime.StateMap()
                                                        ).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(1n),
                                                                                              alignment: _descriptor_1.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newMap(
                                                          new __compactRuntime.StateMap()
                                                        ).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(2n),
                                                                                              alignment: _descriptor_1.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newMap(
                                                          new __compactRuntime.StateMap()
                                                        ).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(3n),
                                                                                              alignment: _descriptor_1.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(new Uint8Array(32)),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(4n),
                                                                                              alignment: _descriptor_1.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_5.toValue(false),
                                                                                              alignment: _descriptor_5.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(3n),
                                                                                              alignment: _descriptor_1.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(admin_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(4n),
                                                                                              alignment: _descriptor_1.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_5.toValue(false),
                                                                                              alignment: _descriptor_5.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    state_0.data = new __compactRuntime.ChargedState(context.callContext.currentQueryContext.state.state);
    return {
      currentContractState: state_0,
      currentPrivateState: context.callContext.currentPrivateState,
      currentZswapLocalState: context.callContext.currentZswapLocalState
    }
  }
  _persistentHash_0(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_12, value_0);
    return result_0;
  }
  _persistentHash_1(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_13, value_0);
    return result_0;
  }
  _persistentHash_2(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_10, value_0);
    return result_0;
  }
  _persistentHash_3(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_11, value_0);
    return result_0;
  }
  _getAttestation_0(context, partialProofData) {
    const witnessContext_0 = __compactRuntime.createWitnessContext(ledger(context.callContext.currentQueryContext.state), context.callContext.currentPrivateState, context.callContext.currentQueryContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.getAttestation(witnessContext_0);
    context.callContext.currentPrivateState = nextPrivateState_0;
    if (!(typeof(result_0) === 'object' && result_0.issuerPk.buffer instanceof ArrayBuffer && result_0.issuerPk.BYTES_PER_ELEMENT === 1 && result_0.issuerPk.length === 32 && result_0.subjectCommitment.buffer instanceof ArrayBuffer && result_0.subjectCommitment.BYTES_PER_ELEMENT === 1 && result_0.subjectCommitment.length === 32 && typeof(result_0.annualIncome) === 'bigint' && result_0.annualIncome >= 0n && result_0.annualIncome <= 18446744073709551615n && typeof(result_0.creditScore) === 'bigint' && result_0.creditScore >= 0n && result_0.creditScore <= 65535n && typeof(result_0.employmentMonths) === 'bigint' && result_0.employmentMonths >= 0n && result_0.employmentMonths <= 65535n && typeof(result_0.backgroundClean) === 'boolean' && typeof(result_0.issuedAt) === 'bigint' && result_0.issuedAt >= 0n && result_0.issuedAt <= 18446744073709551615n && typeof(result_0.expiresAt) === 'bigint' && result_0.expiresAt >= 0n && result_0.expiresAt <= 18446744073709551615n)) {
      __compactRuntime.typeError('getAttestation',
                                 'return value',
                                 'qualification.compact line 61 char 1',
                                 'struct Attestation<issuerPk: Bytes<32>, subjectCommitment: Bytes<32>, annualIncome: Uint<0..18446744073709551616>, creditScore: Uint<0..65536>, employmentMonths: Uint<0..65536>, backgroundClean: Boolean, issuedAt: Uint<0..18446744073709551616>, expiresAt: Uint<0..18446744073709551616>>',
                                 result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_9.toValue(result_0),
      alignment: _descriptor_9.alignment()
    });
    return result_0;
  }
  _getTenantSecret_0(context, partialProofData) {
    const witnessContext_0 = __compactRuntime.createWitnessContext(ledger(context.callContext.currentQueryContext.state), context.callContext.currentPrivateState, context.callContext.currentQueryContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.getTenantSecret(witnessContext_0);
    context.callContext.currentPrivateState = nextPrivateState_0;
    if (!(result_0.buffer instanceof ArrayBuffer && result_0.BYTES_PER_ELEMENT === 1 && result_0.length === 32)) {
      __compactRuntime.typeError('getTenantSecret',
                                 'return value',
                                 'qualification.compact line 62 char 1',
                                 'Bytes<32>',
                                 result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_0.toValue(result_0),
      alignment: _descriptor_0.alignment()
    });
    return result_0;
  }
  _getTenantSalt_0(context, partialProofData) {
    const witnessContext_0 = __compactRuntime.createWitnessContext(ledger(context.callContext.currentQueryContext.state), context.callContext.currentPrivateState, context.callContext.currentQueryContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.getTenantSalt(witnessContext_0);
    context.callContext.currentPrivateState = nextPrivateState_0;
    if (!(result_0.buffer instanceof ArrayBuffer && result_0.BYTES_PER_ELEMENT === 1 && result_0.length === 32)) {
      __compactRuntime.typeError('getTenantSalt',
                                 'return value',
                                 'qualification.compact line 63 char 1',
                                 'Bytes<32>',
                                 result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_0.toValue(result_0),
      alignment: _descriptor_0.alignment()
    });
    return result_0;
  }
  _getCallerSecret_0(context, partialProofData) {
    const witnessContext_0 = __compactRuntime.createWitnessContext(ledger(context.callContext.currentQueryContext.state), context.callContext.currentPrivateState, context.callContext.currentQueryContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.getCallerSecret(witnessContext_0);
    context.callContext.currentPrivateState = nextPrivateState_0;
    if (!(result_0.buffer instanceof ArrayBuffer && result_0.BYTES_PER_ELEMENT === 1 && result_0.length === 32)) {
      __compactRuntime.typeError('getCallerSecret',
                                 'return value',
                                 'qualification.compact line 64 char 1',
                                 'Bytes<32>',
                                 result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_0.toValue(result_0),
      alignment: _descriptor_0.alignment()
    });
    return result_0;
  }
  _getPublicKey_0(sk_0) {
    return this._persistentHash_2([new Uint8Array([122, 107, 114, 101, 110, 116, 58, 112, 107, 58, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
                                   sk_0]);
  }
  _computeCriteriaHash_0(listingId_0,
                         version_0,
                         rent_0,
                         minInc_0,
                         maxRatio_0,
                         minCred_0)
  {
    return this._persistentHash_0([listingId_0,
                                   __compactRuntime.convertBigintToBytes(32,
                                                                         version_0,
                                                                         'qualification.compact line 96 char 5'),
                                   __compactRuntime.convertBigintToBytes(32,
                                                                         rent_0,
                                                                         'qualification.compact line 97 char 5'),
                                   __compactRuntime.convertBigintToBytes(32,
                                                                         minInc_0,
                                                                         'qualification.compact line 98 char 5'),
                                   __compactRuntime.convertBigintToBytes(32,
                                                                         maxRatio_0,
                                                                         'qualification.compact line 99 char 5'),
                                   __compactRuntime.convertBigintToBytes(32,
                                                                         minCred_0,
                                                                         'qualification.compact line 100 char 5')]);
  }
  async _assertNotPaused_0(context, partialProofData) {
    __compactRuntime.assert(!_descriptor_5.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                       partialProofData,
                                                                                       [
                                                                                        { dup: { n: 0 } },
                                                                                        { idx: { cached: false,
                                                                                                 pushPath: false,
                                                                                                 path: [
                                                                                                        { tag: 'value',
                                                                                                          value: { value: _descriptor_1.toValue(4n),
                                                                                                                   alignment: _descriptor_1.alignment() } }] } },
                                                                                        { popeq: { cached: false,
                                                                                                   result: undefined } }]).value),
                            'Contract is currently paused');
    return [];
  }
  async _setPaused_0(context, partialProofData, paused_0) {
    const callerSk_0 = this._getCallerSecret_0(context, partialProofData);
    const callerPk_0 = this._getPublicKey_0(callerSk_0);
    __compactRuntime.assert(this._equal_0(callerPk_0,
                                          _descriptor_0.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                                    partialProofData,
                                                                                                    [
                                                                                                     { dup: { n: 0 } },
                                                                                                     { idx: { cached: false,
                                                                                                              pushPath: false,
                                                                                                              path: [
                                                                                                                     { tag: 'value',
                                                                                                                       value: { value: _descriptor_1.toValue(3n),
                                                                                                                                alignment: _descriptor_1.alignment() } }] } },
                                                                                                     { popeq: { cached: false,
                                                                                                                result: undefined } }]).value)),
                            'Only contract admin can pause');
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(4n),
                                                                                              alignment: _descriptor_1.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_5.toValue(paused_0),
                                                                                              alignment: _descriptor_5.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    return [];
  }
  async _registerListingCriteria_0(context,
                                   partialProofData,
                                   listingId_0,
                                   monthlyRent_0,
                                   minMonthlyIncome_0,
                                   maxRentToIncomeRatioBps_0,
                                   minCreditScore_0,
                                   requireCleanBackground_0,
                                   minEmploymentMonths_0,
                                   primeMinIncomeRatioBps_0,
                                   primeMinCreditScore_0,
                                   active_0)
  {
    await this._assertNotPaused_0(context, partialProofData);
    const callerSk_0 = this._getCallerSecret_0(context, partialProofData);
    const callerPk_0 = this._getPublicKey_0(callerSk_0);
    const isExisting_0 = _descriptor_5.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                   partialProofData,
                                                                                   [
                                                                                    { dup: { n: 0 } },
                                                                                    { idx: { cached: false,
                                                                                             pushPath: false,
                                                                                             path: [
                                                                                                    { tag: 'value',
                                                                                                      value: { value: _descriptor_1.toValue(0n),
                                                                                                               alignment: _descriptor_1.alignment() } }] } },
                                                                                    { push: { storage: false,
                                                                                              value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(listingId_0),
                                                                                                                                           alignment: _descriptor_0.alignment() }).encode() } },
                                                                                    'member',
                                                                                    { popeq: { cached: true,
                                                                                               result: undefined } }]).value);
    if (isExisting_0) {
      const existing_0 = _descriptor_8.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                   partialProofData,
                                                                                   [
                                                                                    { dup: { n: 0 } },
                                                                                    { idx: { cached: false,
                                                                                             pushPath: false,
                                                                                             path: [
                                                                                                    { tag: 'value',
                                                                                                      value: { value: _descriptor_1.toValue(0n),
                                                                                                               alignment: _descriptor_1.alignment() } }] } },
                                                                                    { idx: { cached: false,
                                                                                             pushPath: false,
                                                                                             path: [
                                                                                                    { tag: 'value',
                                                                                                      value: { value: _descriptor_0.toValue(listingId_0),
                                                                                                               alignment: _descriptor_0.alignment() } }] } },
                                                                                    { popeq: { cached: false,
                                                                                               result: undefined } }]).value);
      __compactRuntime.assert(this._equal_1(existing_0.landlordPk, callerPk_0),
                              'Only listing owner can update criteria');
    }
    const version_0 = isExisting_0 ?
                      ((t1) => {
                        if (t1 > 4294967295n) {
                          throw new __compactRuntime.CompactError('qualification.compact line 144 char 43: cast from Field or Uint value to smaller Uint value failed: ' + t1 + ' is greater than 4294967295');
                        }
                        return t1;
                      })(_descriptor_8.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                   partialProofData,
                                                                                   [
                                                                                    { dup: { n: 0 } },
                                                                                    { idx: { cached: false,
                                                                                             pushPath: false,
                                                                                             path: [
                                                                                                    { tag: 'value',
                                                                                                      value: { value: _descriptor_1.toValue(0n),
                                                                                                               alignment: _descriptor_1.alignment() } }] } },
                                                                                    { idx: { cached: false,
                                                                                             pushPath: false,
                                                                                             path: [
                                                                                                    { tag: 'value',
                                                                                                      value: { value: _descriptor_0.toValue(listingId_0),
                                                                                                               alignment: _descriptor_0.alignment() } }] } },
                                                                                    { popeq: { cached: false,
                                                                                               result: undefined } }]).value).criteriaVersion
                         +
                         1n)
                      :
                      1n;
    const cHash_0 = this._computeCriteriaHash_0(listingId_0,
                                                version_0,
                                                monthlyRent_0,
                                                minMonthlyIncome_0,
                                                maxRentToIncomeRatioBps_0,
                                                minCreditScore_0);
    const newCriteria_0 = { landlordPk: callerPk_0,
                            criteriaVersion: version_0,
                            criteriaHash: cHash_0,
                            monthlyRent: monthlyRent_0,
                            minMonthlyIncome: minMonthlyIncome_0,
                            maxRentToIncomeRatioBps: maxRentToIncomeRatioBps_0,
                            minCreditScore: minCreditScore_0,
                            requireCleanBackground: requireCleanBackground_0,
                            minEmploymentMonths: minEmploymentMonths_0,
                            primeMinIncomeRatioBps: primeMinIncomeRatioBps_0,
                            primeMinCreditScore: primeMinCreditScore_0,
                            active: active_0 };
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_1.toValue(0n),
                                                                  alignment: _descriptor_1.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(listingId_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_8.toValue(newCriteria_0),
                                                                                              alignment: _descriptor_8.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    return [];
  }
  async _proveQualification_0(context,
                              partialProofData,
                              listingId_0,
                              applicationId_0,
                              currentTime_0)
  {
    await this._assertNotPaused_0(context, partialProofData);
    __compactRuntime.assert(_descriptor_5.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                      partialProofData,
                                                                                      [
                                                                                       { dup: { n: 0 } },
                                                                                       { idx: { cached: false,
                                                                                                pushPath: false,
                                                                                                path: [
                                                                                                       { tag: 'value',
                                                                                                         value: { value: _descriptor_1.toValue(0n),
                                                                                                                  alignment: _descriptor_1.alignment() } }] } },
                                                                                       { push: { storage: false,
                                                                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(listingId_0),
                                                                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                                                                       'member',
                                                                                       { popeq: { cached: true,
                                                                                                  result: undefined } }]).value),
                            'Listing does not exist');
    const listing_0 = _descriptor_8.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                partialProofData,
                                                                                [
                                                                                 { dup: { n: 0 } },
                                                                                 { idx: { cached: false,
                                                                                          pushPath: false,
                                                                                          path: [
                                                                                                 { tag: 'value',
                                                                                                   value: { value: _descriptor_1.toValue(0n),
                                                                                                            alignment: _descriptor_1.alignment() } }] } },
                                                                                 { idx: { cached: false,
                                                                                          pushPath: false,
                                                                                          path: [
                                                                                                 { tag: 'value',
                                                                                                   value: { value: _descriptor_0.toValue(listingId_0),
                                                                                                            alignment: _descriptor_0.alignment() } }] } },
                                                                                 { popeq: { cached: false,
                                                                                            result: undefined } }]).value);
    __compactRuntime.assert(listing_0.active, 'Listing is not active');
    const attestation_0 = this._getAttestation_0(context, partialProofData);
    const tenantSecret_0 = this._getTenantSecret_0(context, partialProofData);
    const tenantSalt_0 = this._getTenantSalt_0(context, partialProofData);
    __compactRuntime.assert(currentTime_0 >= attestation_0.issuedAt,
                            'Attestation not yet valid');
    __compactRuntime.assert(currentTime_0 <= attestation_0.expiresAt,
                            'Attestation has expired');
    const expectedCommitment_0 = this._persistentHash_3([new Uint8Array([122, 107, 114, 101, 110, 116, 58, 116, 101, 110, 97, 110, 116, 58, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
                                                         applicationId_0,
                                                         tenantSalt_0]);
    __compactRuntime.assert(this._equal_2(attestation_0.subjectCommitment,
                                          expectedCommitment_0),
                            'Commitment mismatch');
    const minAnnualIncome_0 = ((t1) => {
                                if (t1 > 18446744073709551615n) {
                                  throw new __compactRuntime.CompactError('qualification.compact line 206 char 27: cast from Field or Uint value to smaller Uint value failed: ' + t1 + ' is greater than 18446744073709551615');
                                }
                                return t1;
                              })(listing_0.minMonthlyIncome * 12n);
    let t_0;
    __compactRuntime.assert((t_0 = attestation_0.annualIncome,
                             t_0 >= minAnnualIncome_0),
                            'Income below requirement');
    const rentRatioLhs_0 = ((t1) => {
                             if (t1 > 18446744073709551615n) {
                               throw new __compactRuntime.CompactError('qualification.compact line 211 char 24: cast from Field or Uint value to smaller Uint value failed: ' + t1 + ' is greater than 18446744073709551615');
                             }
                             return t1;
                           })(listing_0.monthlyRent * 120000n);
    const rentRatioRhs_0 = ((t1) => {
                             if (t1 > 18446744073709551615n) {
                               throw new __compactRuntime.CompactError('qualification.compact line 212 char 24: cast from Field or Uint value to smaller Uint value failed: ' + t1 + ' is greater than 18446744073709551615');
                             }
                             return t1;
                           })(attestation_0.annualIncome
                              *
                              listing_0.maxRentToIncomeRatioBps);
    __compactRuntime.assert(rentRatioLhs_0 <= rentRatioRhs_0,
                            'Rent-to-income ratio exceeds maximum allowed');
    let t_1;
    __compactRuntime.assert((t_1 = attestation_0.creditScore,
                             t_1 >= listing_0.minCreditScore),
                            'Credit score below minimum');
    let t_2;
    __compactRuntime.assert((t_2 = attestation_0.employmentMonths,
                             t_2 >= listing_0.minEmploymentMonths),
                            'Employment history insufficient');
    if (listing_0.requireCleanBackground) {
      __compactRuntime.assert(attestation_0.backgroundClean === true,
                              'Clean background check required');
    }
    const primeRatioRhs_0 = ((t1) => {
                              if (t1 > 18446744073709551615n) {
                                throw new __compactRuntime.CompactError('qualification.compact line 226 char 25: cast from Field or Uint value to smaller Uint value failed: ' + t1 + ' is greater than 18446744073709551615');
                              }
                              return t1;
                            })(attestation_0.annualIncome
                               *
                               listing_0.primeMinIncomeRatioBps);
    const meetsPrimeRatio_0 = rentRatioLhs_0 <= primeRatioRhs_0;
    let t_3;
    const meetsPrimeCredit_0 = (t_3 = attestation_0.creditScore,
                                t_3 >= listing_0.primeMinCreditScore);
    const isPrime_0 = meetsPrimeRatio_0 && meetsPrimeCredit_0;
    const tierValue_0 = isPrime_0 ? 1n : 0n;
    const nullifier_0 = this._persistentHash_1([new Uint8Array([122, 107, 114, 101, 110, 116, 58, 110, 117, 108, 108, 58, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
                                                tenantSecret_0,
                                                listingId_0,
                                                __compactRuntime.convertBigintToBytes(32,
                                                                                      attestation_0.issuedAt,
                                                                                      'qualification.compact line 237 char 5')]);
    __compactRuntime.assert(!_descriptor_5.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                       partialProofData,
                                                                                       [
                                                                                        { dup: { n: 0 } },
                                                                                        { idx: { cached: false,
                                                                                                 pushPath: false,
                                                                                                 path: [
                                                                                                        { tag: 'value',
                                                                                                          value: { value: _descriptor_1.toValue(2n),
                                                                                                                   alignment: _descriptor_1.alignment() } }] } },
                                                                                        { push: { storage: false,
                                                                                                  value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(nullifier_0),
                                                                                                                                               alignment: _descriptor_0.alignment() }).encode() } },
                                                                                        'member',
                                                                                        { popeq: { cached: true,
                                                                                                   result: undefined } }]).value),
                            'Applicant already proved qualification with this attestation for this listing');
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_1.toValue(2n),
                                                                  alignment: _descriptor_1.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(nullifier_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newNull().encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    const validityPeriod_0 = 2592000n;
    const proofExpiresAt_0 = ((t1) => {
                               if (t1 > 18446744073709551615n) {
                                 throw new __compactRuntime.CompactError('qualification.compact line 244 char 36: cast from Field or Uint value to smaller Uint value failed: ' + t1 + ' is greater than 18446744073709551615');
                               }
                               return t1;
                             })(currentTime_0 + validityPeriod_0);
    const statusRecord_0 = { listingId: listingId_0,
                             criteriaHash: listing_0.criteriaHash,
                             tenantCommitment: expectedCommitment_0,
                             tier: tierValue_0,
                             lifecycle: 0,
                             verifiedAt: currentTime_0,
                             expiresAt: proofExpiresAt_0 };
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_1.toValue(1n),
                                                                  alignment: _descriptor_1.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(applicationId_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_4.toValue(statusRecord_0),
                                                                                              alignment: _descriptor_4.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    return [];
  }
  async _consumeQualification_0(context, partialProofData, applicationId_0) {
    await this._assertNotPaused_0(context, partialProofData);
    __compactRuntime.assert(_descriptor_5.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                      partialProofData,
                                                                                      [
                                                                                       { dup: { n: 0 } },
                                                                                       { idx: { cached: false,
                                                                                                pushPath: false,
                                                                                                path: [
                                                                                                       { tag: 'value',
                                                                                                         value: { value: _descriptor_1.toValue(1n),
                                                                                                                  alignment: _descriptor_1.alignment() } }] } },
                                                                                       { push: { storage: false,
                                                                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(applicationId_0),
                                                                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                                                                       'member',
                                                                                       { popeq: { cached: true,
                                                                                                  result: undefined } }]).value),
                            'Application not found');
    const record_0 = _descriptor_4.fromValue(__compactRuntime.queryLedgerState(context,
                                                                               partialProofData,
                                                                               [
                                                                                { dup: { n: 0 } },
                                                                                { idx: { cached: false,
                                                                                         pushPath: false,
                                                                                         path: [
                                                                                                { tag: 'value',
                                                                                                  value: { value: _descriptor_1.toValue(1n),
                                                                                                           alignment: _descriptor_1.alignment() } }] } },
                                                                                { idx: { cached: false,
                                                                                         pushPath: false,
                                                                                         path: [
                                                                                                { tag: 'value',
                                                                                                  value: { value: _descriptor_0.toValue(applicationId_0),
                                                                                                           alignment: _descriptor_0.alignment() } }] } },
                                                                                { popeq: { cached: false,
                                                                                           result: undefined } }]).value);
    __compactRuntime.assert(record_0.lifecycle === 0,
                            'Qualification is not in active state');
    let tmp_0;
    const listing_0 = (tmp_0 = record_0.listingId,
                       _descriptor_8.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                 partialProofData,
                                                                                 [
                                                                                  { dup: { n: 0 } },
                                                                                  { idx: { cached: false,
                                                                                           pushPath: false,
                                                                                           path: [
                                                                                                  { tag: 'value',
                                                                                                    value: { value: _descriptor_1.toValue(0n),
                                                                                                             alignment: _descriptor_1.alignment() } }] } },
                                                                                  { idx: { cached: false,
                                                                                           pushPath: false,
                                                                                           path: [
                                                                                                  { tag: 'value',
                                                                                                    value: { value: _descriptor_0.toValue(tmp_0),
                                                                                                             alignment: _descriptor_0.alignment() } }] } },
                                                                                  { popeq: { cached: false,
                                                                                             result: undefined } }]).value));
    const callerSk_0 = this._getCallerSecret_0(context, partialProofData);
    const callerPk_0 = this._getPublicKey_0(callerSk_0);
    __compactRuntime.assert(this._equal_3(callerPk_0, listing_0.landlordPk),
                            'Only listing landlord can execute lease consumption');
    const updatedRecord_0 = { listingId: record_0.listingId,
                              criteriaHash: record_0.criteriaHash,
                              tenantCommitment: record_0.tenantCommitment,
                              tier: record_0.tier,
                              lifecycle: 1,
                              verifiedAt: record_0.verifiedAt,
                              expiresAt: record_0.expiresAt };
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_1.toValue(1n),
                                                                  alignment: _descriptor_1.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(applicationId_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_4.toValue(updatedRecord_0),
                                                                                              alignment: _descriptor_4.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    return [];
  }
  async _revokeQualification_0(context, partialProofData, applicationId_0) {
    await this._assertNotPaused_0(context, partialProofData);
    __compactRuntime.assert(_descriptor_5.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                      partialProofData,
                                                                                      [
                                                                                       { dup: { n: 0 } },
                                                                                       { idx: { cached: false,
                                                                                                pushPath: false,
                                                                                                path: [
                                                                                                       { tag: 'value',
                                                                                                         value: { value: _descriptor_1.toValue(1n),
                                                                                                                  alignment: _descriptor_1.alignment() } }] } },
                                                                                       { push: { storage: false,
                                                                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(applicationId_0),
                                                                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                                                                       'member',
                                                                                       { popeq: { cached: true,
                                                                                                  result: undefined } }]).value),
                            'Application not found');
    const record_0 = _descriptor_4.fromValue(__compactRuntime.queryLedgerState(context,
                                                                               partialProofData,
                                                                               [
                                                                                { dup: { n: 0 } },
                                                                                { idx: { cached: false,
                                                                                         pushPath: false,
                                                                                         path: [
                                                                                                { tag: 'value',
                                                                                                  value: { value: _descriptor_1.toValue(1n),
                                                                                                           alignment: _descriptor_1.alignment() } }] } },
                                                                                { idx: { cached: false,
                                                                                         pushPath: false,
                                                                                         path: [
                                                                                                { tag: 'value',
                                                                                                  value: { value: _descriptor_0.toValue(applicationId_0),
                                                                                                           alignment: _descriptor_0.alignment() } }] } },
                                                                                { popeq: { cached: false,
                                                                                           result: undefined } }]).value);
    __compactRuntime.assert(record_0.lifecycle === 0,
                            'Only active qualification can be revoked');
    const tenantSalt_0 = this._getTenantSalt_0(context, partialProofData);
    const callerCommitment_0 = this._persistentHash_3([new Uint8Array([122, 107, 114, 101, 110, 116, 58, 116, 101, 110, 97, 110, 116, 58, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
                                                       applicationId_0,
                                                       tenantSalt_0]);
    __compactRuntime.assert(this._equal_4(callerCommitment_0,
                                          record_0.tenantCommitment),
                            'Only applicant can revoke application');
    const updatedRecord_0 = { listingId: record_0.listingId,
                              criteriaHash: record_0.criteriaHash,
                              tenantCommitment: record_0.tenantCommitment,
                              tier: record_0.tier,
                              lifecycle: 2,
                              verifiedAt: record_0.verifiedAt,
                              expiresAt: record_0.expiresAt };
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_1.toValue(1n),
                                                                  alignment: _descriptor_1.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(applicationId_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_4.toValue(updatedRecord_0),
                                                                                              alignment: _descriptor_4.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    return [];
  }
  _equal_0(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_1(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_2(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_3(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_4(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
}
export function ledger(stateOrChargedState) {
  const state = stateOrChargedState instanceof __compactRuntime.StateValue ? stateOrChargedState : stateOrChargedState.state;
  const chargedState = stateOrChargedState instanceof __compactRuntime.StateValue ? new __compactRuntime.ChargedState(stateOrChargedState) : stateOrChargedState;
  const context = {
    callContext: { currentQueryContext: new __compactRuntime.QueryContext(chargedState, __compactRuntime.dummyContractAddress()), currentGasCost: __compactRuntime.emptyRunningCost() },
    costModel: __compactRuntime.CostModel.initialCostModel()
  };
  const partialProofData = {
    input: { value: [], alignment: [] },
    output: undefined,
    publicTranscript: [],
    privateTranscriptOutputs: []
  };
  return {
    listings: {
      isEmpty(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`isEmpty: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_5.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_1.toValue(0n),
                                                                                                     alignment: _descriptor_1.alignment() } }] } },
                                                                          'size',
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_3.toValue(0n),
                                                                                                                                 alignment: _descriptor_3.alignment() }).encode() } },
                                                                          'eq',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      size(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`size: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_3.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_1.toValue(0n),
                                                                                                     alignment: _descriptor_1.alignment() } }] } },
                                                                          'size',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      member(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`member: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(key_0.buffer instanceof ArrayBuffer && key_0.BYTES_PER_ELEMENT === 1 && key_0.length === 32)) {
          __compactRuntime.typeError('member',
                                     'argument 1',
                                     'qualification.compact line 51 char 1',
                                     'Bytes<32>',
                                     key_0)
        }
        return _descriptor_5.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_1.toValue(0n),
                                                                                                     alignment: _descriptor_1.alignment() } }] } },
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(key_0),
                                                                                                                                 alignment: _descriptor_0.alignment() }).encode() } },
                                                                          'member',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      lookup(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`lookup: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(key_0.buffer instanceof ArrayBuffer && key_0.BYTES_PER_ELEMENT === 1 && key_0.length === 32)) {
          __compactRuntime.typeError('lookup',
                                     'argument 1',
                                     'qualification.compact line 51 char 1',
                                     'Bytes<32>',
                                     key_0)
        }
        return _descriptor_8.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_1.toValue(0n),
                                                                                                     alignment: _descriptor_1.alignment() } }] } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_0.toValue(key_0),
                                                                                                     alignment: _descriptor_0.alignment() } }] } },
                                                                          { popeq: { cached: false,
                                                                                     result: undefined } }]).value);
      },
      [Symbol.iterator](...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`iter: expected 0 arguments, received ${args_0.length}`);
        }
        const self_0 = state.asArray()[0];
        return self_0.asMap().keys().map(  (key) => {    const value = self_0.asMap().get(key).asCell();    return [      _descriptor_0.fromValue(key.value),      _descriptor_8.fromValue(value.value)    ];  })[Symbol.iterator]();
      }
    },
    applicationRecords: {
      isEmpty(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`isEmpty: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_5.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_1.toValue(1n),
                                                                                                     alignment: _descriptor_1.alignment() } }] } },
                                                                          'size',
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_3.toValue(0n),
                                                                                                                                 alignment: _descriptor_3.alignment() }).encode() } },
                                                                          'eq',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      size(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`size: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_3.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_1.toValue(1n),
                                                                                                     alignment: _descriptor_1.alignment() } }] } },
                                                                          'size',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      member(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`member: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(key_0.buffer instanceof ArrayBuffer && key_0.BYTES_PER_ELEMENT === 1 && key_0.length === 32)) {
          __compactRuntime.typeError('member',
                                     'argument 1',
                                     'qualification.compact line 52 char 1',
                                     'Bytes<32>',
                                     key_0)
        }
        return _descriptor_5.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_1.toValue(1n),
                                                                                                     alignment: _descriptor_1.alignment() } }] } },
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(key_0),
                                                                                                                                 alignment: _descriptor_0.alignment() }).encode() } },
                                                                          'member',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      lookup(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`lookup: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(key_0.buffer instanceof ArrayBuffer && key_0.BYTES_PER_ELEMENT === 1 && key_0.length === 32)) {
          __compactRuntime.typeError('lookup',
                                     'argument 1',
                                     'qualification.compact line 52 char 1',
                                     'Bytes<32>',
                                     key_0)
        }
        return _descriptor_4.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_1.toValue(1n),
                                                                                                     alignment: _descriptor_1.alignment() } }] } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_0.toValue(key_0),
                                                                                                     alignment: _descriptor_0.alignment() } }] } },
                                                                          { popeq: { cached: false,
                                                                                     result: undefined } }]).value);
      },
      [Symbol.iterator](...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`iter: expected 0 arguments, received ${args_0.length}`);
        }
        const self_0 = state.asArray()[1];
        return self_0.asMap().keys().map(  (key) => {    const value = self_0.asMap().get(key).asCell();    return [      _descriptor_0.fromValue(key.value),      _descriptor_4.fromValue(value.value)    ];  })[Symbol.iterator]();
      }
    },
    nullifierSet: {
      isEmpty(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`isEmpty: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_5.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_1.toValue(2n),
                                                                                                     alignment: _descriptor_1.alignment() } }] } },
                                                                          'size',
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_3.toValue(0n),
                                                                                                                                 alignment: _descriptor_3.alignment() }).encode() } },
                                                                          'eq',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      size(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`size: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_3.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_1.toValue(2n),
                                                                                                     alignment: _descriptor_1.alignment() } }] } },
                                                                          'size',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      member(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`member: expected 1 argument, received ${args_0.length}`);
        }
        const elem_0 = args_0[0];
        if (!(elem_0.buffer instanceof ArrayBuffer && elem_0.BYTES_PER_ELEMENT === 1 && elem_0.length === 32)) {
          __compactRuntime.typeError('member',
                                     'argument 1',
                                     'qualification.compact line 53 char 1',
                                     'Bytes<32>',
                                     elem_0)
        }
        return _descriptor_5.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_1.toValue(2n),
                                                                                                     alignment: _descriptor_1.alignment() } }] } },
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(elem_0),
                                                                                                                                 alignment: _descriptor_0.alignment() }).encode() } },
                                                                          'member',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      [Symbol.iterator](...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`iter: expected 0 arguments, received ${args_0.length}`);
        }
        const self_0 = state.asArray()[2];
        return self_0.asMap().keys().map((elem) => _descriptor_0.fromValue(elem.value))[Symbol.iterator]();
      }
    },
    get contractAdmin() {
      return _descriptor_0.fromValue(__compactRuntime.queryLedgerState(context,
                                                                       partialProofData,
                                                                       [
                                                                        { dup: { n: 0 } },
                                                                        { idx: { cached: false,
                                                                                 pushPath: false,
                                                                                 path: [
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_1.toValue(3n),
                                                                                                   alignment: _descriptor_1.alignment() } }] } },
                                                                        { popeq: { cached: false,
                                                                                   result: undefined } }]).value);
    },
    get isPaused() {
      return _descriptor_5.fromValue(__compactRuntime.queryLedgerState(context,
                                                                       partialProofData,
                                                                       [
                                                                        { dup: { n: 0 } },
                                                                        { idx: { cached: false,
                                                                                 pushPath: false,
                                                                                 path: [
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_1.toValue(4n),
                                                                                                   alignment: _descriptor_1.alignment() } }] } },
                                                                        { popeq: { cached: false,
                                                                                   result: undefined } }]).value);
    }
  };
}
const _emptyContext = {
  callContext: { currentQueryContext: new __compactRuntime.QueryContext(new __compactRuntime.ContractState().data, __compactRuntime.dummyContractAddress()), currentGasCost: __compactRuntime.emptyRunningCost() }
};
const _dummyContract = new Contract({
  getAttestation: (...args) => undefined,
  getTenantSecret: (...args) => undefined,
  getTenantSalt: (...args) => undefined,
  getCallerSecret: (...args) => undefined
});
export const pureCircuits = {};
export const contractReferenceLocations =
  { tag: 'publicLedgerArray', indices: { } };
export const expectedVk = {
  'consumeQualification': '0438858eeb6c1a48a07d61b3684a93c59871f16b6765bda5a127b8793fa9ec66',
  'proveQualification': 'ab12e8719604a3ab8302d7385a2bcdb794ca338c20587c29ebd970d8b3682859',
  'registerListingCriteria': '54e1f1075975cc5c7564bea88722ed4b77e12d08a9e39d5a434587bdf41e9c87',
  'revokeQualification': 'addf49462731f6a145fc00857b4453929fb35a0202887355ff63f443859e4b9e',
  'setPaused': '52890da8ec90edf6e022feff63ade315fc1ae3d9899a0bf2f76c55b3b3ddc43c',
};

//# sourceMappingURL=index.js.map
