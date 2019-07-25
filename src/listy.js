const Discord = require("discord.js"),
    client = new Discord.Client(),
    https = require('https'),
    fs = require('fs');

require('dotenv').config();

let files = [],
    currentFile = {
        name : null,
        contents : [],
        position : 0
    };
 
client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`);
});
 
client.on("message", message => {
    if (!message.content.startsWith('q!')) return;
    let command = message.content.toLowerCase().replace('q!', '');
    
    if (command.startsWith("upload")) {
        if (!message.attachments.size) return message.channel.send("You need to upload a text file with this command");
        checkDir("./txt/");

        message.attachments.each(attachment => {
            if (!attachment.name.endsWith('.txt')) return message.channel.send(`\`${attachment.name}\` is not a text file`);

            let request = https.get(attachment.url, function(response) {
                response.pipe(fs.createWriteStream(`./txt/${attachment.name}`));
            });

            message.channel.send(`I have stored \`${attachment.name}\`!`);
        });
    }
    else if (command.startsWith("list")) {
        loadFiles();

        message.channel.send(`Available Files: \`\`\`CSS\n${files.join("\n")}\`\`\``);
    }
    else if (command.startsWith("load")) {
        loadFiles();
        let subcommand = command.replace("load", '').trim();

        if (!subcommand.endsWith(".txt")) subcommand += ".txt";

        if (files.includes(subcommand)) {
            currentFile.name = subcommand;
            currentFile.contents = fs.readFileSync(`./txt/${currentFile.name}`).toString('utf-8').split("\n");
            message.channel.send(`\`${currentFile.name}\` has been loaded!`);
        }
        else message.channel.send(`\`${subcommand}\` is not a valid file!`);
    }
    else if (command.startsWith("post") | command.startsWith("next")) {
        if (!currentFile.name) return message.channel.send("There is no file loaded!");
        if (currentFile.position >= currentFile.contents.length) return message.channel.send(`You have reached the end of \`${currentFile.name}\``);

        message.channel.send(`\`[${currentFile.position + 1}]\` ${currentFile.contents[currentFile.position]}`);
        currentFile.position++;
    }
    else if (command.startsWith("jump")) {
        if (!currentFile.name) return message.channel.send("There is no file loaded!");

        let subcommand = command.replace("jump", '').trim();

        if (isNaN(subcommand)) return message.channel.send(`\`${subcommand}\` is not a number!`);

        currentFile.position = subcommand - 1;

        message.channel.send(`Jumped to position ${currentFile.position + 1}`);
    }
    else if (command.startsWith("info")) {
        if (!currentFile.name) return message.channel.send("There is no file loaded!");

        let info = "",
            count = 1;

        currentFile.contents.forEach(line => {
            info += `[${count}] ${line}\n`;
            count++;
        })

        message.channel.send(`Contents of \`${currentFile.name}\`: \`\`\`CSS\n${info}\`\`\``);
    }
    else if (command.startsWith("help")) {
        message.channel.send(`Here are the commands: \`\`\`CSS\n[upload] Uploads a text file (attach a .txt file)\n[list] Lists available files\n[load] Loads a file from the available files to be used\n[post/next] Posts the next line of the loaded file\n[info] Shows the contents of the currently loaded file\n[jump] Jumps to a specific line of the file\`\`\``);
    }
});

function checkDir(path) {
    if (!fs.existsSync(path)) fs.mkdirSync(path);
}

function loadFiles() {
    files = [];
    fs.readdirSync("./txt/").forEach(file => files.push(file));
}
 
client.login(process.env.TOKEN);