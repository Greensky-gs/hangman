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
        const words = ("Put all your words here separated by an espace you can even put it in a json file wich update averytime a new word is said in the chat").toLowerCase();
        const word = words[Math.floor(Math.random() * words.length)];

        let remainingChances = 10;
        let lettersFoundedIndex = [];

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
___|___`,`
    ____
   |
   |
   |
   |
___|___`,`
    ____
   |/
   |
   |
   |
___|___`,`
    ____
   |/   |
   |
   |
   |
___|___`,`
    ____
   |/   |
   |    O
   |
   |
___|___`,`
    ____
   |/   |
   |    O
   |    |
   |
___|___`,`
    ____
   |/   |
   |    O
   |   -|-
   |
___|___`,`

    ____
   |/   |
   |    O
   |   -|-
   |    /\\
___|___`
            ];

            let drawingIndex = 10 - remainingChances;
            const drawing = drawings[drawingIndex];

            return drawing;
        };
        const generatePlate = () => {
            let plate = '';
            for (let i = 0; i < word.length; i++) {
                plate+="_";
            };

            for (let str in lettersFoundedIndex) {
                let int = parseInt(str);
                plate[int] = word[int];
            };

            return plate;
        };
        const generateComponents = () => {
            let letters = [];
            let stringLetters = 'abcdefghijklmnopqrstuvwxyz';

            for (let i = 0; i < stringLetters.length; i++) {
                let letter = stringLetters[i];
                if (letter) letters.push(letter);
            };

            const row = new Discord.MessageActionRow()

            if (letters.length <= 24) {
                const options = letters.map((l) => ({ value: l, label: l.toUpperCase(), description: `Letter ${l}` }));

                let selector = new Discord.MessageSelectMenu()
                    .setCustomId('select-menu-hangman')
                    .setMaxValues(1)
                    .setMinValues(1)
                    .setPlaceholder('Choose a letter')
                    .setOptions(options);

                row.addComponents(selector);
            } else {
                let options = [];

                for (let i = 0; i < letters.length; i++) {
                    let letter = letters[i];
                    if (!letter) return;
                    
                    options.push({
                        value: letter,
                        label: letter.toUpperCase(),
                        description: `Letter ${letter}`
                    });

                    if (i == 23) {
                        const selector = new Discord.MessageSelectMenu()
                            .setPlaceholder('Choose a letter')
                            .setCustomId('select-menu-hangman')
                            .setMaxValues(1)
                            .setMinValues(1)
                            .setOptions(options)
                        
                        row.addComponents(selector);
                        options = new Array(0);
                    };
                };

                const selector = new Discord.MessageSelectMenu()
                    .setPlaceholder('Choose a letter')
                    .setCustomId('select-menu-hangman')
                    .setMaxValues(1)
                    .setMinValues(1)
                    .setOptions(options)
                        
                row.addComponents(selector);
            };

            return row;
        }

        const embed = new Discord.MessageEmbed()
            .setTitle("Pendu")
            .setDescription(generateDrawing() + '\n\n' + generatePlate() + `\n\n${remainingChances} chances remaining`)
            .setColor(message.guild.me.displayHexColor)

        const dashboard = await message.channel.send({ embeds: [ embed ] });
        const collector = dashboard.createMessageComponentCollector({ filter: x => x.user.id === message.author.id, time: 120000 });

        collector.on('collect', /**@param {Discord.SelectMenuInteraction} i*/async(i) => {
            let letter = i.values[0].toLowerCase();

            await i.reply({ content: `Letter ${letter}` }).catch(() => {});
            i.deleteReply().catch(() => {});

            if (word.includes(letter)) {
                for (let i = 0; i < word.length; i++) {
                    if (word[i] == letter) lettersFoundedIndex.push(i);
                };

                embed.setDescription(generateDrawing() + '\n\n' + generatePlate() + `\n\n${remainingChances} chances remaining`);
                if (lettersFoundedIndex.length == word.length) {
                    collector.stop('ended');
                };
            } else {
                remainingChances--;
                embed.setDescription(generateDrawing() + '\n\n' + generatePlate() + `\n\n${remainingChances} chances remaining`);
            };

            dashboard.edit({ embeds: [ embed ], components: [ generateComponents() ] });

            if (remainingChances == 0) {
                return collector.stop('loose');
            }
        });
        collector.on('end', (c, reason) => {
            message.channel.bulkDelete(trash);

            if (reason == 'ended') {
                embed.setDescription(`The word was **${word}**. You found it !`);
            } else {
                embed.setDescription(`The word was **${word}**. You loose`);
            };

            dashboard.edit({ embeds: [ embed ], components: [] }).catch(() => {});
        });
    }
};
