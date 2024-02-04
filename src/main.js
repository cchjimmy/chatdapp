const Gun = require("gun");

async function main() {
  const db = Gun([`https://gun-manhattan.herokuapp.com/gun`]);

  const rooms = db.get("rooms");

  var current = rooms.get("global"); // global room

  const form = document.querySelector("#sign");
  const aliasInput = document.querySelector("#alias");
  const signIn = document.querySelector("#sign-in");
  const chat = document.querySelector("#chat");
  const send = document.querySelector("#send");
  const text = document.querySelector("#text-input");
  const messages = document.querySelector("#messages");

  var alias;

  const pool = [];

  const liPool = [];

  signIn.onclick = (e) => {
    alias = aliasInput.value;
    if (validateString(alias)) {
      form.style.display = "none";
      chat.style.display = "block";
    }
  };

  send.onclick = () => {
    let payload = pool.pop() ?? {};
    payload.who = alias;
    payload.what = text.value;
    payload.when = JSON.stringify(new Date());
    current.get("messages").set(payload);
    text.value = null;
  };

  current
    .get("messages")
    .map()
    .once((data) => {
      var li = liPool.pop() ?? document.createElement("li");
      li.id = data.when;
      li.textContent = `${data.who} > ${data.what}`;
      messages.appendChild(li);
    });
}
main();
function validateString(string) {
  return string.toString().trim() != "";
}
