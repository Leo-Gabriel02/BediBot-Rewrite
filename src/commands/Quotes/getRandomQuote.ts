import {Args, PieceContext} from '@sapphire/framework';
import {Message} from 'discord.js';
import {BediEmbed} from '../../lib/BediEmbed';
import colors from '../../utils/colorUtil';
import {surroundStringWithBackTick} from '../../utils/discordUtil';
import {getRandomQuote, getRandomQuoteFromAuthor} from '../../database/models/QuoteModel';

const {Command} = require('@sapphire/framework');

module.exports = class GetRandomQuoteCommand extends Command {
  constructor(context: PieceContext) {
    super(context, {
      name: 'getRandomQuote',
      aliases: ['grq'],
      description: 'Gets a random quote',
      preconditions: ['GuildOnly', 'QuotesEnabled'],
    });
  }

  async run(message: Message, args: Args) {
    const {guildId} = message;

    let quoteAuthor;

    quoteAuthor = await args.pickResult('user');
    if (!quoteAuthor.success) quoteAuthor = await args.pickResult('string');

    let quoteDoc;

    if (!quoteAuthor.success) {
      quoteDoc = await getRandomQuote(guildId as string);
    } else {
      quoteDoc = await getRandomQuoteFromAuthor(guildId as string, quoteAuthor.value.toString());
    }

    if (!quoteDoc) {
      const embed = new BediEmbed()
          .setColor(colors.ERROR)
          .setTitle('Get Random Quote Reply')
          .setDescription('No quotes found!');
      return message.reply({embeds: [embed]});
    }
    const embed = new BediEmbed()
        .setTitle('Get Random Quote Reply');

    if (typeof quoteAuthor === 'string') {
      embed.setDescription(`Quote: ${surroundStringWithBackTick(quoteDoc.quote)}
        Author: ${surroundStringWithBackTick(quoteDoc.author)}
        Date: ${surroundStringWithBackTick(quoteDoc.date.toDateString())}`);
    } else {
      embed.setDescription(`Quote: ${surroundStringWithBackTick(quoteDoc.quote)}
        Author: ${quoteDoc.author}
        Date: ${surroundStringWithBackTick(quoteDoc.date.toDateString())}`);
    }
    return message.reply({embeds: [embed]});
  };
};