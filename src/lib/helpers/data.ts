import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'fs';
import { join } from 'path';

import {
  Configuration,
  type ConfigurationType,
  HttpPingRecord,
  type HttpPingRecordType,
  type ServerConfigType,
  TcpPingRecord,
  type TcpPingRecordType,
  type ValueFromType,
} from '$lib/types';

export const GH_WORKFLOW_FOLDER = '.github/workflows';
export const GH_TEMPLATE_FOLDER = './templates';
export const DATA_FOLDER = './data';
export const CONFIG_PATH = join(DATA_FOLDER, 'config.json');

/**
 * Get configuration from `config.json` file.
 *
 * @returns configurations
 */
export const readConfig = (): ConfigurationType => {
  return Configuration.parse(
    JSON.parse(readFileSync(CONFIG_PATH, { encoding: 'utf-8' }))
  );
};

export const writeConfig = (config: ConfigurationType) => {
  return writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
};

export const readConfigValue = <T>(config: {
  from: ValueFromType;
  value: T;
}): T => {
  if (config.from === 'config') {
    return config.value;
  } else {
    // @ts-expect-error
    return process.env[config.value];
  }
};

export const addNewServer = (newServer: ServerConfigType) => {
  const config = readConfig();
  for (const server of config.servers) {
    if (server.id === newServer.id) {
      throw new Error('Server ID exists.');
    }
  }
  config.servers.push(newServer);
  writeConfig(config);
};

export const getServerById = (id: string) => {
  const config = readConfig();
  return config.servers.find((server) => server.id === id);
};

export const updateServer = (server: ServerConfigType) => {
  const config = readConfig();
  const idx = config.servers.findIndex(({ id }) => id === server.id);
  if (idx === -1) {
    throw new Error('Server config not found.');
  }
  config.servers[idx] = server;
  writeConfig(config);
};

export const deleteServerById = (id: string) => {
  const config = readConfig();
  if (!config.servers.find((server) => server.id === id)) {
    throw new Error('Server ID not found.');
  }
  config.servers = config.servers.filter((server) => server.id !== id);
  writeConfig(config);
};

export const getServerList = () => {
  const config = readConfig();
  const servers = config.servers.map((s) => ({
    id: s.id,
    serverType: s.serverType,
    name: s.name,
    records: (() => {
      return readPingRecord(s.id).map((record) => {
        return (
          record.events.reduce((count, { success }) => count + +success, 0) /
          record.events.length
        );
      });
    })(),
  }));

  return servers;
};

export const serverWorkflowExist = (id: string): boolean => {
  return existsSync(join(GH_WORKFLOW_FOLDER, `${id}.yml`));
};

const fmtHolder = (name: string) => {
  return `$(${name})`;
};

const getEnvConfig = (config: {
  from: ValueFromType;
  value?: any;
}): Array<string> => {
  if (config.from === 'env') {
    return [
      `${' '.repeat(10)}${config.value}: \${{ secrets.${config.value} }}`,
    ];
  }
  return [];
};

export const createServerWorkflow = (id: string) => {
  const server = getServerById(id);
  if (!server) {
    throw new Error('Server not found.');
  }

  let template = readFileSync(
    join(GH_TEMPLATE_FOLDER, 'ping-template.yml')
  ).toString();
  template = template.replace(fmtHolder('name'), server.name);
  template = template.replace(fmtHolder('cron'), server.pingCron);
  template = template.replace(fmtHolder('id'), server.id);

  const envList = [];

  switch (server.serverType) {
    case 'http': {
      envList.push(...getEnvConfig(server.body));
      envList.push(...getEnvConfig(server.url));
      break;
    }
    case 'tcp':
      envList.push(...getEnvConfig(server.host));
      envList.push(...getEnvConfig(server.port));
      break;
  }

  if (envList.length) {
    const envValues = `env:\n${envList.join('\n')}`;
    template = template.replace(fmtHolder('env'), envValues);
  }

  writeFileSync(join(GH_WORKFLOW_FOLDER, `${id}.yml`), template);
};

export const removeServerWorkflow = (id: string) => {
  rmSync(join(GH_WORKFLOW_FOLDER, `${id}.yml`));
};

export const buildWorkflowExist = () => {
  return existsSync(join(GH_WORKFLOW_FOLDER, 'build.yml'));
};

export const createBuildWorkflow = () => {
  const config = readConfig();
  let template = readFileSync(
    join(GH_TEMPLATE_FOLDER, 'build-template.yml')
  ).toString();
  template = template.replace(fmtHolder('cron'), config.buildCron);

  if (!config.basePath) {
    template = template.replace(
      '\n        env:\n          base_path: ${{ secrets.base_path }}',
      ''
    );
  }

  writeFileSync(join(GH_WORKFLOW_FOLDER, 'build.yml'), template);
};

export const removeBuildWorkflow = () => {
  rmSync(join(GH_WORKFLOW_FOLDER, 'build.yml'));
};

export const writePingRecord = (
  server: ServerConfigType,
  record: HttpPingRecordType | TcpPingRecordType
) => {
  const recordFolder = join(DATA_FOLDER, server.id);
  const recordFile = join(recordFolder, 'record.json');
  if (!existsSync(recordFolder)) {
    mkdirSync(recordFolder);
  }

  const records: Array<HttpPingRecordType | TcpPingRecordType> = [];
  if (existsSync(recordFile)) {
    records.push(...JSON.parse(readFileSync(recordFile).toString()), record);
  } else {
    records.push(record);
  }

  const notBefore = Date.now() - server.maxRecordHistory;
  writeFileSync(
    recordFile,
    JSON.stringify(records.filter((record) => record.ranAt >= notBefore))
  );
};

export const readPingRecord = (
  id: string
): Array<TcpPingRecordType> | Array<HttpPingRecordType> => {
  const recordFile = join(DATA_FOLDER, id, 'record.json');

  if (existsSync(recordFile)) {
    const record = JSON.parse(readFileSync(recordFile).toString());
    if (Array.isArray(record)) {
      if (record.length > 0) {
        switch (record[0]?.type) {
          case 'http': {
            record.forEach((item) => HttpPingRecord.parse(item));
            return record;
          }
          case 'tcp': {
            record.forEach((item) => TcpPingRecord.parse(item));
            return record;
          }
          default:
            throw new Error(`Invalid record type: "${record[0]?.type}"`);
        }
      } else {
        return [];
      }
    } else {
      throw new Error('Invalid record data.');
    }
  } else {
    return [];
  }
};
