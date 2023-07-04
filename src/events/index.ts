import eventError from './error';
import eventInteractionCreate from './interactionCreate';
import eventReady from './ready';
import eventShardError from './shardError';

export default [
  eventReady,
  eventInteractionCreate,
  eventError,
  eventShardError
];
