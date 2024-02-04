const readline = require("readline");
const Gun = require("gun");
require("gun/lib/unset");

async function main() {
  const db = Gun(["www.youtube.com"]);

  const rooms = db.get("rooms");

  var current = rooms.get("chat");

  const alias = await getInput("Alias: ", validateString);

  const user = current.get("clients").set({ alias, status: "online" });

  current.get("messages").map().once((data) => {
    process.stdout.write(`${data.who} > ${data.what}\n`);
  });

  current.get("messages").set({
    who: "",
    what: `${alias} connected`,
  });

  const COMMANDS = {
    ".exit": () => {
      user.get("status").put("offine");
      current.get("messages").set({
        who: "",
        what: `${alias} disconnected`,
      });
      END = true;
    },
    ".clear": () => {
      current.get("messages").put(null);
    },
    ".list": () => {
      let count = 0;
      current.get("clients").map((client) => {
        if (client.status != "online") return;
        process.stdout.write(`"${client.alias}", `);
        ++count;
      });
      process.stdout.write(`\n\n${count} client(s) connected\n`);
    },
  };

  process.on("SIGINT", () => {
    COMMANDS[".exit"]();
  });

  var END = false;
  while (!END) {
    var newString = await getInput("", validateString);
    newString = newString.toString().trim();
    let args = newString.split(" ");
    var command = COMMANDS[args[0]];
    if (command) {
      command(...args.slice(1));
    } else {
      current.get("messages").set({
        who: alias,
        what: newString,
      });
    }
  }
  process.exit();
}
main();
function validateString(string) {
  return string.toString().trim() != "";
}
async function getInput(question, validate) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  function ask(resolve) {
    rl.question(
      question,
      (answer) => {
        readline.moveCursor(process.stdout, 0, -1);
        readline.clearLine(process.stdout, 0);
        if (!validate(answer)) {
          ask(resolve);
          return;
        }
        rl.close();
        resolve(answer);
      },
    );
  }
  return new Promise((resolve) => {
    ask(resolve);
  });
}
