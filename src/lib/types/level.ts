import { z } from 'zod';

export const StatusLevel = z.union([
  z.literal('OPERATIONAL'),
  z.literal('ACCEPTABLE'),
  z.literal('UNSTABLE'),
  z.literal('CRITICAL'),
]);

export type StatusLevelType = z.infer<typeof StatusLevel>;
