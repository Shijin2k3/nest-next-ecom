import { Throttle } from '@nestjs/throttler';

export const StrictThrottle = () =>
  Throttle({ default: { ttl: 60, limit: 100 } });

export const ModerateThrottle = () =>
  Throttle({ default: { ttl: 1000, limit: 500 } });
