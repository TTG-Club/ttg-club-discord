import type { BotEvent } from '../types';
import type { Interaction } from 'discord.js';


const eventInteractionCreate: BotEvent = {
  name: 'interactionCreate',
  execute: async (interaction: Interaction) => {
    if (interaction.isChatInputCommand()) {
      let command = interaction.client.slashCommands.get(interaction.commandName);
      let cooldown = interaction.client.cooldowns.get(`${ interaction.commandName }-${ interaction.user.username }`);

      await interaction.deferReply();

      if (!command) return;

      if (command.cooldown && cooldown) {
        if (Date.now() < cooldown) {
          interaction.followUp({
            content: `Тебе нужно подождать ${
              Math.floor(Math.abs(Date.now() - cooldown) / 1000)
            } секунд, чтобы использовать команды снова.`,
            ephemeral: true
          });

          setTimeout(() => interaction.deleteReply(), 5000);

          return;
        }

        interaction.client.cooldowns.set(
          `${ interaction.commandName }-${ interaction.user.username }`,
          Date.now() + command.cooldown * 1000
        );

        setTimeout(() => {
          interaction.client.cooldowns.delete(`${ interaction.commandName }-${ interaction.user.username }`);
        }, command.cooldown * 1000);
      } else if (command.cooldown && !cooldown) {
        interaction.client.cooldowns.set(
          `${ interaction.commandName }-${ interaction.user.username }`,
          Date.now() + command.cooldown * 1000
        );
      }

      command.execute(interaction);
    } else if (interaction.isAutocomplete()) {
      const command = interaction.client.slashCommands.get(interaction.commandName);

      if (!command) {
        // eslint-disable-next-line no-console
        console.error(`No command matching ${ interaction.commandName } was found.`);

        return;
      }

      try {
        if (!command.autocomplete) return;
        command.autocomplete(interaction);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
      }
    }
  }
};

export default eventInteractionCreate;
