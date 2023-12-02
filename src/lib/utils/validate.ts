import { isValidCron } from 'cron-validator';
import { z } from 'zod';

export const isCron = (exp: string) => {
  return isValidCron(exp, {
    alias: true,
    allowBlankDay: false,
    allowSevenAsSunday: false,
    seconds: false,
  });
};

export const isHost = (hostname: string) => {
  return /^(?=.{1,255}$)[0-9A-Za-z](?:(?:[0-9A-Za-z]|-){0,61}[0-9A-Za-z])?(?:\.[0-9A-Za-z](?:(?:[0-9A-Za-z]|-){0,61}[0-9A-Za-z])?)*\.?$/.test(
    hostname
  );
};

export const isValidStatusList = (val: string, ctx: z.RefinementCtx) => {
  if (val.length < 3) return z.NEVER;

  if (val.charAt(0) === ',' || val.charAt(val.length - 1) === ',') {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Cannot start or end with comma.`,
    });
    return z.NEVER;
  }

  const list = val.split(',');
  const set = new Set<string>();
  const rangeRegex = /^(1[0-9]{2}|[2-5][0-9]{2})$/;

  for (const [idx, item] of list.entries()) {
    if (set.has(item)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Duplicated value at item ${idx}.`,
      });
      return z.NEVER;
    }

    if (item.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Value at item ${idx} is empty.`,
      });
      return z.NEVER;
    } else if (item.includes('-')) {
      const [left, right] = item.split('-');

      if (!rangeRegex.test(left)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Range start value "${left}" at item ${idx} is not a number from 100-599.`,
        });
        return z.NEVER;
      }

      if (!rangeRegex.test(right)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Range end value "${right}" at item ${idx} is not a number from 100-599.`,
        });
        return z.NEVER;
      }

      if (parseInt(left) >= parseInt(right)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Range start value has to be less than the end value at item ${idx}.`,
        });
        return z.NEVER;
      }
    } else {
      if (!rangeRegex.test(item)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Value at item ${idx} is not a number from 100-599.`,
        });
        return z.NEVER;
      }
    }
    set.add(item);
  }
};

export const isValidBasePath = (val: string, ctx: z.RefinementCtx) => {
  if (val === '') {
    return z.NEVER;
  }

  if (val === '/') {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message:
        '"/" is not needed if you don\'t have a base path, just set it to empty.',
    });
    return z.NEVER;
  }

  if (val[0] !== '/') {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Base path need to start with /.',
    });
    return z.NEVER;
  }

  if (val[val.length - 1] === '/') {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Base path cannot end with /.',
    });
    return z.NEVER;
  }
};
