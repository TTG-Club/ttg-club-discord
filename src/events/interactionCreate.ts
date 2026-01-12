import { Events } from 'discord.js';

import type {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  Interaction,
} from 'discord.js';

import type { BotEvent } from '../types.js';

async function chatInputCommandInteraction(
  interaction: ChatInputCommandInteraction,
) {
  const command = interaction.client.slashCommands.get(interaction.commandName);

  const cooldown = interaction.client.cooldowns.get(
    `${interaction.commandName}-${interaction.user.username}`,
  );

  await interaction.deferReply();

  if (!command) {
    return;
  }

  if (command.cooldown && cooldown) {
    if (Date.now() < cooldown) {
      await interaction.followUp({
        content: `Тебе нужно подождать ${Math.floor(
          Math.abs(Date.now() - cooldown) / 1000,
        )} секунд, чтобы использовать команды снова.`,
        ephemeral: true,
      });

      setTimeout(() => interaction.deleteReply(), 5000);

      return;
    }

    interaction.client.cooldowns.set(
      `${interaction.commandName}-${interaction.user.username}`,
      Date.now() + command.cooldown * 1000,
    );

    setTimeout(() => {
      interaction.client.cooldowns.delete(
        `${interaction.commandName}-${interaction.user.username}`,
      );
    }, command.cooldown * 1000);
  } else if (command.cooldown && !cooldown) {
    interaction.client.cooldowns.set(
      `${interaction.commandName}-${interaction.user.username}`,
      Date.now() + command.cooldown * 1000,
    );
  }

  command.execute(interaction);
}

function autocompleteInteraction(interaction: AutocompleteInteraction) {
  const command = interaction.client.slashCommands.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);

    return;
  }

  try {
    if (!command.autocomplete) {
      return;
    }

    command.autocomplete(interaction);
  } catch (error) {
    console.error(error);
  }
}

function isInteraction(value: unknown): value is Interaction {
  return (
    typeof value === 'object' &&
    value !== null &&
    'isChatInputCommand' in value &&
    'isAutocomplete' in value
  );
}

const eventInteractionCreate: BotEvent = {
  name: Events.InteractionCreate,
  execute: async (...args: unknown[]) => {
    const interaction = args[0];

    if (!isInteraction(interaction)) {
      return;
    }

    if (interaction.isChatInputCommand()) {
      await chatInputCommandInteraction(interaction);

      return;
    }

    if (interaction.isAutocomplete()) {
      autocompleteInteraction(interaction);
    }
  },
};

export default eventInteractionCreate;
