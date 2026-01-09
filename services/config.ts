import configData from '../conf/apikey.json';

export interface ModelConfig {
  provider: string;
  apiKey: string;
  models: Record<string, string>;
}

export interface Config {
  models: Record<string, ModelConfig>;
}

export const getConfig = (): Config => {
  return configData;
};

export const getModelConfig = (modelKey: string): ModelConfig | undefined => {
  return getConfig().models[modelKey];
};

export const getModelName = (modelKey: string, variant: string): string | undefined => {
  const modelConfig = getModelConfig(modelKey);
  return modelConfig?.models[variant];
};

export const getApiKey = (modelKey: string): string | undefined => {
  const modelConfig = getModelConfig(modelKey);
  return modelConfig?.apiKey || process.env[`${modelKey.toUpperCase()}_API_KEY`];
};