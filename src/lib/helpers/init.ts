import { existsSync, mkdirSync, writeFileSync } from 'fs';

import type { ConfigurationType } from '$lib/types';

import { CONFIG_PATH, DATA_FOLDER, GH_WORKFLOW_FOLDER } from './data';

const INIT_CONFIG: ConfigurationType = {
  buildCron: '0 0 * * *',
  basePath: '',
  servers: [],
};

/**
 * Initialize data folder and configuration.
 */
export const initialization = () => {
  if (!existsSync(DATA_FOLDER)) {
    mkdirSync(DATA_FOLDER);
  }

  if (!existsSync(CONFIG_PATH)) {
    writeFileSync(CONFIG_PATH, JSON.stringify(INIT_CONFIG, null, 2));
  }

  if (!existsSync(GH_WORKFLOW_FOLDER)) {
    mkdirSync(GH_WORKFLOW_FOLDER, { recursive: true });
  }
};

initialization();
