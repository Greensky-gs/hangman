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
        let trash = new Discord.Collection();        

        const collector = message.channel.createMessageCollector({ filter: x => !x.author.bot, time: 120000 });
        const embed = new Discord.MessageEmbed()
            .setTitle("Pendu")
            .setDescription(generateDrawing() + '\n\n' + generatePlate() + `\n\n${remainingChances} chances remaining`)
            .setColor(message.guild.me.displayHexColor)

        const dahboard = await message.channel.send({ embeds: [ embed ] });

        collector.on('collect', (msg) => {
            trash.set(msg.id, msg);
            
            let letter = msg.content[0].toLowerCase();
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

            dahboard.edit({ embeds: [ embed ] });

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

            dahboard.edit({ embeds: [ embed ] }).catch(() => {});
        });
    }
};
