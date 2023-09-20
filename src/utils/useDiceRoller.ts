import DiceRollerParser from 'dice-roller-parser';
import { orderBy } from 'lodash-es';

import type { DiceRollResult } from 'dice-roller-parser/dist/rollTypes.js';

export interface IRollResult {
  result: number;
  full: string;
  highest?: number;
  lowest?: number;
}

export function useDiceRoller() {
  const { DiceRoller, DiscordRollRenderer } = DiceRollerParser;

  const roller = new DiceRoller();
  const renderer = new DiscordRollRenderer();

  const getDropOrKeepMsg = (notation: string): IRollResult => {
    const roll = roller.roll(notation) as DiceRollResult;
    const [highest, lowest] = orderBy(roll.rolls, ['value'], ['desc']);

    return {
      result: roll.value,
      highest: highest!.value,
      lowest: lowest!.value,
      full: `**[${notation}]**: ${renderer.render(roll)}`
    };
  };

  const getDefaultDiceMsg = (notation: string): IRollResult => {
    const roll = roller.roll(notation);

    return {
      result: roll.value,
      full: `**[${notation}]**: ${renderer.render(roll)}`
    };
  };

  const getDiceMsg = (notation: string): IRollResult => {
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
    getDropOrKeepMsg,
    getDefaultDiceMsg
  };
}
