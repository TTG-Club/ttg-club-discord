import { DiceRoll } from '@dice-roller/rpg-dice-roller';
import _ from 'lodash';

export type TRollResult = {
  result: string
  full: string
  highest?: string
  lowest?: string
}

export function useDiceRoller() {
  const getDiceMsg = async (str: string): Promise<TRollResult | null> => {
    try {
      const formula = str.replace(/к/g, 'd');

      let msg: TRollResult | null;

      switch (formula) {
        case '2d20':
        case '2d20kh1':
        case '2d20kl1':
          msg = await getDropOrKeepMsg(formula);

          break;
        default:
          msg = await getDefaultDiceMsg(formula);

          break;
      }

      if (!msg) {
        return null;
      }

      return msg;
    } catch (err) {
      return await Promise.reject(err);
    }
  };

  const getDropOrKeepMsg = (str: string): Promise<TRollResult | null> => {
    try {
      let formula = '2d20';

      if (str === '2d20kh1' || str === '2d20kl1') {
        formula = str;
      }

      const roll = new DiceRoll(formula);
      const resultStr = roll.export();

      if (!resultStr) {
        return Promise.resolve(null);
      }

      const result = JSON.parse(resultStr);
      const { rolls } = result.rolls[0];
      const [highest, lowest] = _.orderBy(rolls, ['value'], ['desc']);

      return Promise.resolve({
        result: String(roll.total),
        highest: String(highest.value),
        lowest: String(lowest.value),
        full: String(roll.output)
      });
    } catch (err) {
      return Promise.reject(err);
    }
  };

  const getDefaultDiceMsg = (notation: string): Promise<TRollResult | null> => {
    try {
      const roll = new DiceRoll(notation);

      return Promise.resolve({
        result: String(roll.total),
        full: String(roll.output)
      });
    } catch (err) {
      return Promise.reject(err);
    }
  };

  return {
    getDiceMsg
  };
}
