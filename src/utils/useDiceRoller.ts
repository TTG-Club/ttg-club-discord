import DiceRollerParser from 'dice-roller-parser';
import { orderBy } from 'lodash-es';

import type { DiceRollResult } from 'dice-roller-parser/dist/rollTypes.js';

export interface IRollResult {
  full: string;
  rendered: string;
  notation: string;
  value: number;
  highest?: number;
  lowest?: number;
}

export function useDiceRoller() {
  const { DiceRoller, DiscordRollRenderer } = DiceRollerParser;

  const roller = new DiceRoller();
  const renderer = new DiscordRollRenderer();

  const getDropOrKeepMsg = (notation: string): Promise<IRollResult> => {
    try {
      const roll = roller.roll(notation) as DiceRollResult;
      const rendered = renderer.render(roll);
      const [highest, lowest] = orderBy(roll.rolls, ['value'], ['desc']);

      return Promise.resolve({
        full: `**[${notation}]:** ${rendered}`,
        rendered,
        notation,
        value: roll.value,
        highest: highest!.value,
        lowest: lowest!.value,
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
