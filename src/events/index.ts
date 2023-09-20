import eventError from './error.js';
import eventInteractionCreate from './interactionCreate.js';
import eventReady from './ready.js';
import eventShardDisconnect from './shardDisconnect.js';
import eventShardError from './shardError.js';
import eventUnhandledRejection from './unhandledRejection.js';
import eventWarn from './warn.js';

export default [
  eventReady,
  eventInteractionCreate,
  eventError,
  eventShardError,
  eventUnhandledRejection,
  eventWarn,
  eventShardDisconnect
];
