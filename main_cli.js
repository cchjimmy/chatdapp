const readline = require("readline");
const Gun = require("gun");

async function main() {
  const db = Gun();

  const copy = db.get("test").get("paste");

  const alias = await getInput("Alias: ", validateString);

  copy.on((data) => {
    process.stdout.write(data);
  });

  const COMMANDS = {
    ".exit": () => {
      END = true;
    },
    ".clear": () => {
      copy.put("");
    },
  };

  var END = false;
  while (!END) {
    var newString = await getInput("", validateString);
    newString = newString.toString().trim();
    var command = COMMANDS[newString];
    if (command) {
      command();
    } else {
      copy.put(alias + " > " + newString + "\n");
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
