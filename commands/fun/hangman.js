const Discord = require('discord.js');

module.exports = {
    help: {
        name: 'hangman'
    },
    /**
     * @param {Discord.Message} message 
     * @param {Array} args 
     */
    run: async(message, args) => {
        const words = ("Put all your words here separated by an espace you can even put it in a json file wich update averytime a new word is said in the chat").toLowerCase().split(/ +/g);
        const word = words[Math.floor(Math.random() * words.length)];

        let remainingChances = 10;
        let lettersFoundedIndex = [];

        console.log(word);

        const generateDrawing = () => {
            const drawings = [
'______',
`   |
   |
   |
   |
___|___`,`
   |
   |
   |
   |
__/|\\__`,`
    ____
   |
   |
   |
   |
__/|\\__`,`
    ____
   |/
   |
   |
   |
__/|\\__`,`
    ____
   |/   |
   |
   |
   |
__/|\\__`,`
    ____
   |/   |
   |    O
   |
   |
__/|\\__`,`
    ____
   |/   |
   |    O
   |    |
   |
__/|\\__`,`
    ____
   |/   |
   |    O
   |   -|-
   |
__/|\\__`,`

    ____
   |/   |
   |    O
   |   -|-
   |   /\\
__/|\\__`
            ];

            if (remainingChances === 0) return '```' + drawings[9] + '```';

            let drawingIndex = 10 - remainingChances;
            const drawing = drawings[drawingIndex];

            return '```' + drawing + '```';
        };
        const generatePlate = () => {
            let plate = '';
            for (let i = 0; i < word.length; i++) {
                if (lettersFoundedIndex.includes(i)) {
                    plate+=word[i];
                } else {
                    plate+='_';
                }
                plate+=' ';
            }

            return '`' + plate + '`';
        };

        const embed = new Discord.EmbedBuilder()
            .setTitle("Pendu")
            .setDescription(generateDrawing() + '\n\n' + generatePlate() + `\n\n${remainingChances} chances remaining`)
            .setColor(message.guild.members?.me?.displayHexColor ?? 'Yellow')
        
        const letters = () => {
            const lettersArray = 'abcdefghijklmnopqrstuvwxyz';
                      
            return lettersArray;
        }

        const modal = new Discord.ModalBuilder()
            .setTitle("Hangman")
            .setCustomId('hangman-modal')
            .setComponents(
                new Discord.ActionRowBuilder().setComponents(
                    new Discord.TextInputBuilder()
                    .setCustomId('hangman-letter')
                    .setLabel('Letter')
                    .setMaxLength(1)
                    .setRequired(true)
                    .setStyle(Discord.TextInputStyle.Short)
                    .setPlaceholder(letters()[Math.floor(Math.random() * letters().length)])
                )
            )

        const btnRow = new Discord.ActionRowBuilder()
                .setComponents(new Discord.ButtonBuilder()
                    .setCustomId('guess')
                    .setLabel('Guess')
                    .setStyle(Discord.ButtonStyle.Success),
                    new Discord.ButtonBuilder()
                        .setCustomId('cancel')
                        .setStyle(Discord.ButtonStyle.Danger)
                        .setLabel('Cancel')
                )

        const dashboard = await message.channel.send({ embeds: [ embed ], components: [ btnRow ] });
        const collector = dashboard.createMessageComponentCollector({ filter: x => x.user.id === message.author.id, time: 120000 });

        collector.on('collect', /**@param {Discord.ButtonInteraction} i*/async(i) => {
            if (i.customId === 'cancel') {
                return collector.stop('cancel');
            }

            i.showModal(modal);
            const reply = await i.awaitModalSubmit({
                time: 10000
            }).catch(() => {});

            if (reply) {
                await reply.deferUpdate();
                const letter = reply.fields.getTextInputValue('hangman-letter').toLowerCase();

                if (word.includes(letter)) {
                    for (let i = 0; i < word.length; i++) {
                        if (word[i] === letter) lettersFoundedIndex.push(i);
                    };
    
                    embed.setDescription(generateDrawing() + '\n\n' + generatePlate() + `\n\n${remainingChances} chances remaining`);
                    if (lettersFoundedIndex.length === word.length) {
                        collector.stop('ended');
                    };
                } else {
                    remainingChances--;
                    embed.setDescription(generateDrawing() + '\n\n' + generatePlate() + `\n\n${remainingChances} chances remaining`);
                }
            }

            dashboard.edit({ embeds: [ embed ] }).catch(console.log);
            if (remainingChances === 0) {
                return collector.stop('loose');
            }
        });
        collector.on('end', (_c, reason) => {
            if (reason == 'ended') {
                embed.setDescription(`The word was **${word}**. You found it !`);
            } else if (reason == 'cancel') {
                embed.setDescription(`You gave up. The word was **${word}**`);
            } else {
                embed.setDescription(`The word was **${word}**. You loose`);
            };

            dashboard.edit({ embeds: [ embed ], components: [] }).catch(() => {});
        });
    }
};
