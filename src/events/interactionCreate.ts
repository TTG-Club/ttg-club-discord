import {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  Events
} from 'discord.js';

import type { BotEvent } from '../types.js';
import type { Interaction } from 'discord.js';

const chatInputCommandInteraction = async (
  interaction: ChatInputCommandInteraction
) => {
  const command = interaction.client.slashCommands.get(interaction.commandName);

  const cooldown = interaction.client.cooldowns.get(
    `${interaction.commandName}-${interaction.user.username}`
  );

  await interaction.deferReply();

  if (!command) return;

  if (command.cooldown && cooldown) {
    if (Date.now() < cooldown) {
      await interaction.followUp({
        content: `Тебе нужно подождать ${Math.floor(
          Math.abs(Date.now() - cooldown) / 1000
        )} секунд, чтобы использовать команды снова.`,
        ephemeral: true
      });

      setTimeout(() => interaction.deleteReply(), 5000);

      return;
    }

    interaction.client.cooldowns.set(
      `${interaction.commandName}-${interaction.user.username}`,
      Date.now() + command.cooldown * 1000
    );

    setTimeout(() => {
      interaction.client.cooldowns.delete(
        `${interaction.commandName}-${interaction.user.username}`
      );
    }, command.cooldown * 1000);
  } else if (command.cooldown && !cooldown) {
    interaction.client.cooldowns.set(
      `${interaction.commandName}-${interaction.user.username}`,
      Date.now() + command.cooldown * 1000
    );
  }

  command.execute(interaction);
};

const autocompleteInteraction = (interaction: AutocompleteInteraction) => {
  const command = interaction.client.slashCommands.get(interaction.commandName);

  if (!command) {
    // eslint-disable-next-line no-console
    console.error(`No command matching ${interaction.commandName} was found.`);

    return;
  }

  try {
    if (!command.autocomplete) {
      return;
    }

    command.autocomplete(interaction);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
  }
};

const eventInteractionCreate: BotEvent = {
  name: Events.InteractionCreate,
  execute: async (interaction: Interaction) => {
    if (interaction.isChatInputCommand()) {
      await chatInputCommandInteraction(interaction);

      return;
    }

    if (interaction.isAutocomplete()) {
      autocompleteInteraction(interaction);
    }
  }
};

export default eventInteractionCreate;
