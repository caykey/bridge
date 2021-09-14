const index = require("../../index.js");
const blacklist = require("../../resources/blacklist.json");
const log4js = require("log4js");
const Discord = require("discord.js");
const fetch = require("node-fetch");
const bot = index.bot;
const client = index.client;
const channelID = process.env.OUTPUTCHANNELID;
const fs = require("fs");
const logger = log4js.getLogger("logs");
const errorLogs = log4js.getLogger("Errors");
var CLR;
module.exports = {
  name: "message",
  async execute(message) {
    let channel = client.channels.cache.get(channelID);
    if (!message.content.startsWith(process.env.PREFIX) || message.author.bot)
      return;

    const args = message.content
      .slice(process.env.PREFIX.length)
      .trim()
      .split(" ");
    const command = args.shift().toLowerCase();

    if (command === "help".toLowerCase()) {
      if (message.member.roles.cache.some((role) => role.name === "Staff")) {
        const embed = new Discord.MessageEmbed()
          .setTitle("Commands")
          .addField("help", "Prints this message")
          .addField("reboot", "Restarts the bot")
          .addField("chat", "Send a chat message in game")
          .addField("command", "Runs an in-game command")
          .addField(
            "blacklist",
            "Add, list or remove users that are blacklisted"
          )
          .setFooter(
            "You can send messages ingame by typing in #bridge | Prefix: " +
              process.env.PREFIX
          )
          // .setColor(CLR);

        return message.channel.send({ embeds: [embed] });
      } else {
        const embed = new Discord.MessageEmbed()
          .setTitle("Commands")
          .addField("help", "Prints this message")
          .setFooter(
            "You can send messages ingame by typing in #bridge | Prefix: " +
              process.env.PREFIX
          )
          // .setColor(CLR);

        return message.channel.send({ embeds: [embed] });
      }
    } else if (command === "chat".toLowerCase()) {
      if (message.member.roles.cache.some((role) => role.name === "Staff")) {
        if (!args.length) {
          const embed = new Discord.MessageEmbed()
            .setTitle("Error")
            // .setColor(CLR)
            .setDescription("You need to provide a message for me to send!");

          return message.channel.send({ embeds: [embed] });
        }

        bot.chat(
          `[${message.member.displayName}]: ${args.join(" ").toString()}`
        );
        return message.react("✅");
      } else {
        const embed = new Discord.MessageEmbed()
          .setTitle("Error")
          // .setColor(CLR)
          .setDescription(
            "It seems you are lacking the permission to run this command."
          );

        return message.channel.send({ embeds: [embed] });
      }
    } else if (command === "command".toLowerCase()) {
      try {
        if (message.member.roles.cache.some((role) => role.name === "Staff")) {
          var user = message.member

          if (!args.length) {
            const embed = new Discord.MessageEmbed()
              .setTitle("Error")
              // .setColor(CLR)
              .setDescription("You need to provide a message for me to send!");

            return message.channel.send({ embeds: [embed] });
          }
          if (args[1] == "kick".toLowerCase()) {
            return (
              bot.chat(
                `/${args.join(" ").toString()} [Kicker: ${message.member.displayName}]`
              ),
              message.react("✅")
            );
          }
          if (args[0] == "oc".toLowerCase()) {
            if (!args[1]) {
              const embed = new Discord.MessageEmbed()
                .setTitle("Error")
                // .setColor(CLR)
                .setDescription(
                  "You need to provide a message for me to send!"
                );

              return message.channel.send({ embeds: [embed] });
            }
            return (
              bot.chat(
                `/oc [${user.displayName}] ${args
                  .join(" ")
                  .toString()
                  .replace("oc", "")}`
              ),
              message.react("✅")
            );
          }

          return bot.chat(`/${args.join(" ").toString()}`), message.react("✅");
        } else {
          const embed = new Discord.MessageEmbed()
            .setTitle("Error")
            // .setColor(CLR)
            .setDescription(
              "It seems you are lacking the permission to run this command."
            );

          return message.channel.send({ embeds: [embed] });
        }
      } catch (err) {
        errorLogs.error(err);
        console.log(err)
        const embed = new Discord.MessageEmbed()
          .setTitle("Error")
          // .setColor(CLR)
          .setDescription(
            "Someting wong happen pls contact elijahsus to fix!!"
          );

        return message.channel.send({ embeds: [embed] });
      }
    } else if (command === "reboot".toLowerCase()) {
      if (
        message.member.roles.cache.some((role) => role.name === "Staff") ||
        message.author.id === "308343641598984203"
      ) {
        const embed = new Discord.MessageEmbed()
          .setTitle("Rebooting")
          // .setColor(CLR)
          .setDescription("The bot will reboot in `45s`");

        message.channel.send({ embeds: [embed] });

        logger.info(
          `Bot will reboot in 45s due to ${message.member.displayName} running the reboot command`
        );
        channel.send(
          `Bot will reboot in 45s due to ${message.member.displayName} running the reboot command`
        );
        setTimeout(() => {
          process.exit();
        }, 45000);
      } else {
        const embed = new Discord.MessageEmbed()
          .setTitle("Error")
          // .setColor(CLR)
          .setDescription(
            "It seems you are lacking the permission to run this command."
          );

        return message.channel.send({ embeds: [embed] });
      }
    } else if (command === "blacklist".toLowerCase()) {
      if (message.member.roles.cache.some((role) => role.name === "Staff")) {
        if (!args[0]) {
          const embed = new Discord.MessageEmbed()
            .setTitle("Blacklist")
            // .setColor(CLR)
            .setDescription(
              `The list below shows everyone who is on the blacklist (Total: ${blacklist.length})`
            )
            .setFooter(
              "The name is based on the name that was givin at the time of blacklist, refer to the UUID if the user has changed their name."
            );

          blacklist.forEach((element) =>
            embed.addField(
              `${element.user}`,
              `**End:** ${element.end}\n**Reason:** ${element.reason}\n**UUID:** ${element.uuid}\n[Message Link](https://discord.com/channels/522586672148381726/709370599809613824/${element.msgID})`
            )
          );

          if (embed.length >= 2000) {
            const embed2 = new Discord.MessageEmbed()
              // .setColor(CLR)
              .setTitle("Error | Too many people on blacklist")
              .setDescription(
                "Discord has a character limit and we have reached it with the message trying to be sent. Look at the blacklist list in <#709370599809613824>"
              );
            return message.channel.send({ embeds: [embed2] });
          }
          message.channel.send({ embeds: [embed] });
        }
        if (args[0]) {
          if (args[0] == "add".toLowerCase()) {
            if (!args[1]) {
              const embed = new Discord.MessageEmbed()
                .setTitle("Error | Invalid Arguments")
                // .setColor(CLR)
                .setDescription(
                  "```" +
                    process.env.PREFIX +
                    "blacklist <add/remove> <user>\n                        ^^^^^^\nYou must specify a user to add to the blacklist```"
                );

              return message.channel.send({ embeds: [embed] });
            }

            async function blacklistadd() {
              if (!args[2]) {
                const embed = new Discord.MessageEmbed()
                  .setTitle("Error | Invalid Arguments")
                  // .setColor(CLR)
                  .setDescription(
                    "```" +
                      process.env.PREFIX +
                      "blacklist add <user> <end> <reason>\n                      ^^^^^\nYou must specify an end date (It can be never)```"
                  );

                return message.channel.send({ embeds: [embed] });
              }

              if (!args[3]) {
                const embed = new Discord.MessageEmbed()
                  .setTitle("Error | Invalid Arguments")
                  // .setColor(CLR)
                  .setDescription(
                    "```" +
                      process.env.PREFIX +
                      "blacklist add <user> <end> <reason>\n                               ^^^^^\nYou must specify a reason for the blacklist```"
                  );

                return message.channel.send({ embeds: [embed] });
              }

              const MojangAPI = await fetch(
                `https://api.ashcon.app/mojang/v2/user/${args[1]}`
              ).then((res) => res.json());
              if (!MojangAPI.uuid) {
                const embed = new Discord.MessageEmbed()
                  .setTitle("Error")
                  // .setColor(CLR)
                  .setDescription(
                    `I have encountered an error while attempting your request, a detailed log is below.\n\`\`\`Error: ${MojangAPI.code}, ${MojangAPI.error}\nReason: ${MojangAPI.reason}\`\`\``
                  );
                return message.channel.send({ embeds: [embed] });
              }

              for (const i in blacklist) {
                if (blacklist[i].uuid == MojangAPI.uuid) {
                  const embed = new Discord.MessageEmbed()
                    .setTitle("Error")
                    // .setColor(CLR)
                    .setDescription(
                      `That user appears to already be on the blacklist. To check who is on the blacklist please run the \`${process.env.PREFIX}blacklist\` command`
                    );
                  return message.channel.send({ embeds: [embed] });
                }
              }

              function addUserToBlacklist(user, uuid, end, reason) {
                return new Promise((resolve, reject) => {
                  const embed = new Discord.MessageEmbed()
                    .setTitle(user)
                    .setAuthor(
                      "Blacklist",
                      "https://media.discordapp.net/attachments/522930879413092388/849317688517853294/misc.png"
                    ) /*           * Alternatively, use "#00AE86", [0, 174, 134] or an integer number.           */
                     .setColor("ff0000")
                    .setFooter(`UUID: ${uuid}`)
                    .setThumbnail(
                      `https://visage.surgeplay.com/full/${uuid}.png`
                    )
                    .setTimestamp()
                    .setURL(`http://plancke.io/hypixel/player/stats/${uuid}`)

                    .addField("IGN:", user, false)
                    .addField("End:", end, false)
                    .addField("Reason:", reason, false);

                  client.channels.cache
                    .get(process.env.BLACKLIST_CHANNEL)
                    .send({ embeds: [embed] })
                    .then((blistmsg) => {
                      var msgID = blistmsg.id;
                      blacklist.push({ user, uuid, end, reason, msgID });
                    });

                  fs.writeFile(
                    "blacklist.json",
                    JSON.stringify(blacklist),
                    (err) => {
                      if (err) reject(err);
                      const embed = new Discord.MessageEmbed()
                        .setTitle("Done ☑️")
                        // .setColor(
                          .setThumbnail(`https://crafatar.com/avatars/${MojangAPI.uuid}`)
                        
                        .setDescription(
                          `I have added the user \`${MojangAPI.username}\` to the blacklist! To see who is on the blacklist please run \`${process.env.PREFIX}blacklist\` or see <#${process.env.BLACKLIST_CHANNEL}>`
                        );
                      return message.channel.send({ embeds: [embed] });
                    }
                  );
                });
              }
              addUserToBlacklist(
                MojangAPI.username,
                MojangAPI.uuid,
                args[2],
                args.slice(3).join(" ")
              );
            }
            blacklistadd();
          } else if (args[0] == "remove".toLowerCase()) {
            if (!args[1]) {
              const embed = new Discord.MessageEmbed()
                .setTitle("Error | Invalid Arguments")
                // .setColor(`https://crafatar.com/avatars/${MojangAPI.uuid}`)
                .setDescription(
                  "```" +
                    process.env.PREFIX +
                    "blacklist <add/remove> <user>\n                        ^^^^^^\nYou must specify a user to remove from the blacklist```"
                );
              return message.channel.send({ embeds: [embed] });
            }
            async function blacklistremove() {
              try {
                const MojangAPI = await fetch(
                  `https://api.ashcon.app/mojang/v2/user/${args[1]}`
                ).then((res) => res.json());
                if (!MojangAPI.uuid) {
                  const embed = new Discord.MessageEmbed()
                    .setTitle("Error")
                    // .setColor(CLR)
                    .setDescription(
                      `I have encountered an error while attempting your request, a detailed log is below.\n\`\`\`Error: ${MojangAPI.code}, ${MojangAPI.error}\nReason: ${MojangAPI.reason}\`\`\``
                    );
                  return message.channel.send({ embeds: [embed] });
                }

                function removeUserFromBlacklist(uuid) {
                  return new Promise((resolve, reject) => {
                    var found = false;
                    for (var i = 0; i < blacklist.length; i++) {
                      if (blacklist[i].uuid == uuid) {
                        found = true;
                        console.log("found uuid");
                        break;
                      }
                    }
                    if (!found) {
                      const embed = new Discord.MessageEmbed()
                        .setTitle("Error")
                        // .setColor(CLR)
                        .setDescription(
                          `That user appears to not be on the blacklist. To check who is on the blacklist please run the \`${process.env.PREFIX}blacklist\` command`
                        );
                      return message.channel.send({ embeds: [embed] });
                    }
                    if (found) {
                      for (var i in blacklist) {
                        if (blacklist[i].uuid == uuid) {
                          client.channels.cache
                            .get(process.env.BLACKLIST_CHANNEL)
                            .messages.fetch(blacklist[i].msgID)
                            .then((msg) => {
                              if (!message) {
                                return message.channel.send(
                                  "The message was not found, please delete it manually"
                                );
                              }
                              msg.delete();
                            });
                          blacklist.splice(i, 1);
                          fs.writeFile(
                            "blacklist.json",
                            JSON.stringify(blacklist),
                            (err) => {
                              if (err) reject(err);
                              const embed = new Discord.MessageEmbed()
                                .setTitle("Done ☑️")
                                // .setColor(CLR)
                                .setThumbnail(
                                  `https://crafatar.com/avatars/${MojangAPI.uuid}`
                                )
                                .setDescription(
                                  `I have removed the user \`${MojangAPI.username}\` from the blacklist! To see who is on the blacklist please run \`${process.env.PREFIX}blacklist\` or see <#${process.env.BLACKLIST_CHANNEL}>`
                                );
                              return message.channel.send({ embeds: [embed] });
                            }
                          );
                        }
                      }
                    }
                  });
                }
                removeUserFromBlacklist(MojangAPI.uuid);
              } catch (err) {
                const embed = new Discord.MessageEmbed()
                  .setTitle("Error")
                  // .setColor(CLR)
                  .setDescription(
                    `An unexpected error has occurred. Please contact ElijahROOS.`
                  );
                return message.channel.send({ embeds: [embed] });
              }
            }
            blacklistremove();
          } else if (args[0] == "dump".toLowerCase()) {
            const embed = new Discord.MessageEmbed()
              .setTitle("Blacklist Dump")
              // .setColor(CLR)
              .setDescription(
                `Attached is the blacklist database, blacklists are stored in an array in a separate \`.JSON\` file. `
              );
            return message.channel.send({
              embeds: [embed],
              files: ["../resources/blacklist.json"],
            });
          } else {
            const embed = new Discord.MessageEmbed()
              .setTitle("Error | Invalid Args")
              // .setColor(CLR)
              .setDescription(
                `The second argument does not match up with my code. You must use \`add\`, \`remove\`, or \`dump\``
              );
            return message.channel.send({ embeds: [embed] });
          }
        }
      } else {
        const embed = new Discord.MessageEmbed()
          .setTitle("Error")
          // .setColor(CLR)
          .setDescription(
            `It seems you are lacking the permission to run this command.`
          );
        return message.channel.send({ embeds: [embed] });
      }
    }
  },
};
