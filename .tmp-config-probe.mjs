import * as Config from 'effect/Config';
import * as ConfigProvider from 'effect/ConfigProvider';
import * as Schema from 'effect/Schema';
import * as Effect from 'effect/Effect';

const KeysConfig = Config.all([
  Schema.Config('coinPublic', Schema.String),
  Config.option(Schema.Config('signing', Schema.String)),
]).pipe(Config.nested('keys'));

const cases = [
  new Map([['KEYS_COIN_PUBLIC', 'abc']]),
  new Map([['keys_coinPublic', 'abc']]),
  new Map([['keys_coin_public', 'abc']]),
  new Map([['keys.coinPublic', 'abc']]),
  new Map([['keys.coin_public', 'abc']]),
  new Map([['keys__coinPublic', 'abc']]),
];

for (const map of cases) {
  try {
    const cfg = ConfigProvider.fromMap(map, { pathDelim: '_' }).pipe(ConfigProvider.constantCase);
    const result = await Effect.runPromise(ConfigProvider.run(cfg, KeysConfig));
    console.log([...map.keys()], '=>', result);
  } catch (error) {
    console.log([...map.keys()], '=> ERROR', error?.message ?? error);
  }
}
