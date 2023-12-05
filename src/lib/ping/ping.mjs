import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

import { ping } from './tcp.mjs';

/** @type {import('./ping.d.ts').round} */
const round = (num, precision) => {
  precision =
    precision == null
      ? 0
      : precision >= 0
        ? Math.min(precision, 292)
        : Math.max(precision, -292);
  if (precision) {
    let pair = `${num}e`.split('e');
    const value = Math.round(`${pair[0]}e${+pair[1] + precision}`);

    pair = `${value}e`.split('e');
    return +`${pair[0]}e${+pair[1] - precision}`;
  }
  return Math.round(num);
};

/** @type {import('./ping.d.ts').tcpPingAsync} */
const tcpPingAsync = async ({ host, port, attempts = 4 }) => {
  let address = host;

  try {
    address = new URL(host).host;
  } catch (err) {
    if (err?.message !== 'Invalid URL') {
      console.error(`Not a url: ${address}`);
    }
  }

  /** @type {import("../types/record.ts").TcpPingRecordType>} */
  const record = {
    type: 'tcp',
    ranAt: Date.now(),
  };

  const pingResult = await ping({ address, port, attempts });

  record.time = {
    min: round(pingResult.minimumLatency, 4),
    max: round(pingResult.maximumLatency, 4),
    avg: round(pingResult.averageLatency, 4),
  };

  record.events = pingResult.attempts.map(({ result }) =>
    'error' in result
      ? {
          success: false,
          error: {
            name: result.error.name ?? 'Unknown Error',
            message: result.error.message ?? '',
          },
        }
      : {
          success: true,
          time: result.time,
        }
  );

  return record;
};

/** @type {import('./ping.d.ts').checkValidStatus} */
const checkValidStatus = (statusCode, validStatusList) => {
  return validStatusList.split(',').some((validStatus) => {
    if (validStatus.includes('-')) {
      const range = validStatus.split('-').map(parseInt);
      return range[0] <= statusCode && statusCode <= range[1];
    } else {
      return parseInt(validStatus) === statusCode;
    }
  });
};

/** @type {import('./ping.d.ts').httpPingAsync} */
const httpPingAsync = async ({
  method = 'GET',
  url,
  attempts = 1,
  expectStatus = '200-299',
}) => {
  /** @type {import('../types/record.ts').HttpPingRecordType} */
  const record = {
    type: 'http',
    ranAt: Date.now(),
    method: method,
    time: { min: Number.MAX_SAFE_INTEGER, max: 0, avg: 0 },
    events: [],
  };

  for (let i = 0; i < attempts; i++) {
    const start = process.hrtime.bigint();
    try {
      const { status } = await fetch(url, { method });
      const time = Number(process.hrtime.bigint() - start) / 1e6;

      if (checkValidStatus(status, expectStatus)) {
        record.events.push({ success: true, status, time });
      } else {
        record.events.push({
          success: false,
          status,
          error: {
            name: 'Invalid Status',
            message: `Status ${status} is not in the accepted status list.`,
          },
        });
      }
    } catch (error) {
      const time = Number(process.hrtime.bigint() - start) / 1e6;
      const status = error.response?.status;

      if (checkValidStatus(status, expectStatus)) {
        record.events.push({ success: true, status, time });
      } else {
        record.events.push({
          success: false,
          status: status ?? null,
          error: {
            name: error.response?.statusText ?? 'Unknown Error',
            message: error.message ?? '',
          },
        });
      }
    }
  }

  let sum = 0;
  let success = 0;

  for (const events of record.events) {
    if (events.success) {
      success++;
      sum += events.time;

      if (events.time < record.time.min) {
        record.time.min = events.time;
      }

      if (events.time > record.time.max) {
        record.time.max = events.time;
      }
    }
  }

  // reset min back to 0 if all request failed
  if (success === 0) {
    record.time.min = 0;
  } else {
    record.time.avg = round(sum / success, 4);
  }

  return record;
};

/** @type {import('./ping.d.ts').readConfigValue} */
const readConfigValue = (configField) => {
  switch (configField.from) {
    case 'config':
      return configField.value;
    case 'env':
      return process.env[configField.value];
    default:
      throw new Error('Invalid config type.');
  }
};

/** @type {import("./ping.d.ts").writePingRecord} */
const writePingRecord = (server, record) => {
  const recordFolder = join('./data', server.id);
  const recordFile = join(recordFolder, 'record.json');

  if (!existsSync(recordFolder)) {
    mkdirSync(recordFolder);
  }

  /** @type {(import("../types/record.ts").HttpPingRecordType | import("../types/record.ts").TcpPingRecordType)[]} */
  const records = [];

  if (existsSync(recordFile)) {
    records.push(...JSON.parse(readFileSync(recordFile).toString()), record);
  } else {
    records.push(record);
  }

  const notBefore = Date.now() - server.maxRecordHistory;
  writeFileSync(
    recordFile,
    JSON.stringify(
      records.filter((record) => record.ranAt >= notBefore),
      null,
      2
    )
  );
};

const main = async () => {
  const id = process.argv?.[2];

  if (!id) {
    throw new Error('No server id passed in the argument.');
  }

  /** @type {import("../types/configuration.ts").ServerConfigType} */
  const server = JSON.parse(
    readFileSync('./data/config.json', { encoding: 'utf-8' })
  )?.servers?.find((s) => s.id === id);

  if (!server) {
    throw new Error(`No server has the id "${id}".`);
  }

  switch (server.serverType) {
    case 'http': {
      const record = await httpPingAsync({
        method: server.method,
        url: readConfigValue(server.url),
        attempts: server.pingAttempts,
        expectStatus: server.statusCodes,
      });
      writePingRecord(server, record);
      break;
    }
    case 'tcp': {
      const record = await tcpPingAsync({
        host: readConfigValue(server.host),
        port: parseInt(readConfigValue(server.port).toString()),
        attempts: server.pingAttempts,
      });
      writePingRecord(server, record);
      break;
    }
    default:
      throw new Error(`Server type "${server?.serverType} is not supported."`);
  }
};

main();
