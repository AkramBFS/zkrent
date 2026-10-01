import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  AUTH_SECRET: z
    .string()
    .min(1, 'AUTH_SECRET is required for authentication session encryption')
    .default('dev-secret-change-in-production-must-be-32-chars-min'),
  DATABASE_URL: z
    .string()
    .default('postgresql://postgres:postgres@localhost:5432/zkrent'),
  DIRECT_URL: z.string().optional(),

  // Midnight Network
  MIDNIGHT_NODE_URL: z.string().default('http://127.0.0.1:9944'),
  MIDNIGHT_NODE_WS_URL: z.string().default('ws://127.0.0.1:9944'),
  MIDNIGHT_INDEXER_URL: z.string().default('http://127.0.0.1:8088/api/v4/graphql'),
  MIDNIGHT_INDEXER_WS_URL: z.string().default('ws://127.0.0.1:8088/api/v4/graphql/ws'),
  MIDNIGHT_PROOF_SERVER_URL: z.string().default('http://127.0.0.1:6300'),
  MIDNIGHT_NETWORK_ID: z.string().default('undeployed'),
  MIDNIGHT_CONTRACT_ADDRESS: z.string().default('0x_placeholder'),
  MIDNIGHT_PRIVATE_STATE_PASSWORD: z.string().default('zkrent-local-devnet-key'),
  MIDNIGHT_DEPLOY_SEED: z
    .string()
    .default('0000000000000000000000000000000000000000000000000000000000000001'),

  // Stripe
  STRIPE_SECRET_KEY: z.string().default('sk_test_placeholder'),
  STRIPE_WEBHOOK_SECRET: z.string().default('whsec_placeholder'),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().default('pk_test_placeholder'),
});

export type EnvConfig = z.infer<typeof envSchema>;

export function getValidatedConfig(): EnvConfig {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const errorDetails = result.error.issues
      .map((err) => `  - ${err.path.join('.')}: ${err.message}`)
      .join('\n');
    console.warn(
      `⚠️ [ZkRent Config Warning] Environment configuration issue:\n${errorDetails}\nFalling back to default safe development configuration.`
    );
    return envSchema.parse({});
  }
  return result.data;
}

export const config = getValidatedConfig();
