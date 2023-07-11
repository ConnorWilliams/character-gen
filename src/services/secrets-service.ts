import {
  GetSecretValueRequest,
  SecretsManager,
  SecretsManagerClientConfig,
} from "@aws-sdk/client-secrets-manager";
import { Log } from "../utils/logger";

let globalInstance: SecretsService | undefined;

export class SecretsService {
  public static getInstance(
    config?: SecretsManagerClientConfig
  ): SecretsService {
    if (globalInstance) {
      return globalInstance;
    }
    globalInstance = new SecretsService(config);
    return globalInstance;
  }

  public static invalidateCache(): void {
    globalInstance = undefined;
  }

  private cache: Record<string, unknown> = {};
  private secretsManager: SecretsManager;

  private constructor(config?: SecretsManagerClientConfig) {
    this.secretsManager = new SecretsManager({
      ...config,
      region: process.env.AWS_REGION,
    });
  }

  public async getSecret(secretId: string): Promise<unknown> {
    try {
      const cachedValue = this.cache[secretId];
      if (cachedValue) {
        return cachedValue;
      }

      const getSecretValueReq: GetSecretValueRequest = {
        SecretId: secretId,
      };
      const response = await this.secretsManager.getSecretValue(
        getSecretValueReq
      );
      const secret: unknown = JSON.parse(response.SecretString as string);
      this.cache[secretId] = secret;
      return secret;
    } catch (err) {
      if (err instanceof Error) {
        Log.error(`Could not retrieve secret ${secretId}.`, err);
      }
      Log.error("Could not retrieve secrets.");
      SecretsService.invalidateCache();
      throw err;
    }
  }
}
