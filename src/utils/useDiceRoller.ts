import DiceRollerParser from 'dice-roller-parser';
import { orderBy } from 'lodash-es';

export interface IRollResult {
  full: string;
  rendered: string;
  notation: string;
  value: number;
  highest?: number;
  lowest?: number;
}

interface RollWithRolls {
  value: number;
  rolls: Array<{ value: number }>;
}

function getProperty<T>(obj: unknown, key: string): T | undefined {
  if (typeof obj !== 'object' || obj === null) {
    return undefined;
  }

  if (!(key in obj)) {
    return undefined;
  }

  // Используем Object.entries для безопасного доступа без type assertion
  const entries = Object.entries(obj);

  const entry = entries.find(([k]) => k === key);

  if (!entry) {
    return undefined;
  }

  return entry[1] as T | undefined;
}

function hasRolls(roll: unknown): roll is RollWithRolls {
  if (typeof roll !== 'object' || roll === null) {
    return false;
  }

  if (!('value' in roll) || !('rolls' in roll)) {
    return false;
  }

  const value = getProperty<number>(roll, 'value');

  if (typeof value !== 'number') {
    return false;
  }

  const rolls = getProperty<unknown[]>(roll, 'rolls');

  if (!Array.isArray(rolls) || rolls.length === 0) {
    return false;
  }

  const firstRoll = rolls[0];

  if (
    typeof firstRoll !== 'object' ||
    firstRoll === null ||
    !('value' in firstRoll)
  ) {
    return false;
  }

  const firstRollValue = getProperty<number>(firstRoll, 'value');

  return typeof firstRollValue === 'number';
}

export function useDiceRoller() {
  const { DiceRoller, DiscordRollRenderer } = DiceRollerParser;

  const roller = new DiceRoller();
  const renderer = new DiscordRollRenderer();

  const getDropOrKeepMsg = (notation: string): Promise<IRollResult> => {
    try {
      const roll = roller.roll(notation);
      const rendered = renderer.render(roll);

      if (!hasRolls(roll)) {
        return Promise.reject(new Error('Invalid roll result'));
      }

      const [highest, lowest] = orderBy(roll.rolls, ['value'], ['desc']);

      if (!highest || !lowest) {
        return Promise.reject(new Error('Invalid roll result'));
      }

      return Promise.resolve({
        full: `**[${notation}]:** ${rendered}`,
        rendered,
        notation,
        value: roll.value,
        highest: highest.value,
        lowest: lowest.value,
      });
    } catch (err) {
      return Promise.reject(err);
    }
  };

  const getDefaultDiceMsg = (notation: string): Promise<IRollResult> => {
    try {
      const roll = roller.roll(notation);
      const rendered = renderer.render(roll);

      return Promise.resolve({
        full: `**[${notation}]:** ${rendered}`,
        rendered,
        notation,
        value: roll.value,
      });
    } catch (err) {
      return Promise.reject(err);
    }
  };

  const getDiceMsg = (notation: string): Promise<IRollResult> => {
    const formula = notation.replace(/к/g, 'd');

    switch (formula) {
      case '2d20':
      case '2d20kh1':
      case '2d20kl1':
        return getDropOrKeepMsg(formula);
      default:
        return getDefaultDiceMsg(formula);
    }
  };

  return {
    getDiceMsg,
  };
}
