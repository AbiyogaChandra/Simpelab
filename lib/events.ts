import { EventEmitter } from 'events';

// Create a singleton EventEmitter to prevent duplicate instances during hot-reloading in dev.
const globalForEvents = global as unknown as { eventEmitter: EventEmitter };

export const eventEmitter =
  globalForEvents.eventEmitter || new EventEmitter();

if (process.env.NODE_ENV !== 'production') globalForEvents.eventEmitter = eventEmitter;
