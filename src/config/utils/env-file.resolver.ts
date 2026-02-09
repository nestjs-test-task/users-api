import { existsSync } from 'fs';
import { resolve } from 'path';

interface ResolveEnvFilePathsOptions {
  rootPath: string;
  envDirs: string[];
  defaultEnv?: string;
  nodeEnv?: string;
}

export function resolveEnvFilePaths({
  rootPath,
  envDirs,
  defaultEnv = 'development.env',
  nodeEnv = process.env.NODE_ENV,
}: ResolveEnvFilePathsOptions): string[] {
  const filename = nodeEnv ? `${nodeEnv}.env` : defaultEnv;

  return envDirs.map((dir) => {
    const filePath = resolve(rootPath, dir, filename);

    if (!existsSync(filePath)) {
      if (!nodeEnv) {
        throw new Error(`Env file not found: ${filePath}`);
      }
      console.warn(`Env file not found: ${filePath}`);
    }

    return filePath;
  });
}
