import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { componentVersions } from './versions';

const componentsDir = path.resolve(import.meta.dirname, 'components');
const components = readdirSync(componentsDir);

describe('component versions', () => {
  it.each(components)('%s is listed in componentVersions', (name) => {
    expect(componentVersions).toHaveProperty(name);
  });

  it.each(components)('%s CHANGELOG.md top entry matches version.ts', (name) => {
    const changelog = readFileSync(path.join(componentsDir, name, 'CHANGELOG.md'), 'utf8');
    const top = changelog.match(/^## (\d+\.\d+\.\d+)/m)?.[1];
    expect(top).toBe(componentVersions[name as keyof typeof componentVersions]);
  });
});
