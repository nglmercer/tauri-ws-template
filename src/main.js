const { invoke } = window.__TAURI__.core;

let greetInputEl;
let greetMsgEl;

async function greet() {
  // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
  greetMsgEl.textContent = await invoke("greet", { name: greetInputEl.value });
}
const socket = new WebSocket("ws://localhost:8080/ws");

socket.onopen = () => {
    console.log("Connected to server");
    greetMsgEl.textContent = "Connected to server";
    socket.send("Hello, Server!");
};

socket.onmessage = (event) => {
    console.log("Message from server:", event.data);
    greetMsgEl.textContent = "Message from server: " + event.data;
};
/* setInterval(() => {
  const number = Math.floor(Math.random() * 100);
  const datatest = { "action": "get_data", "data": number }
  const testdata = {       action: 'say_hello',
    data: 'Hello, server!' }
  socket.send(JSON.stringify( testdata));
}, 5555); */
window.addEventListener("DOMContentLoaded", () => {
  greetInputEl = document.querySelector("#greet-input");
  greetMsgEl = document.querySelector("#greet-msg");
  document.querySelector("#greet-form").addEventListener("submit", (e) => {
    e.preventDefault();
    greet();
  });
});
/* setTimeout(() => {
  const create = { "action": "create_window", "label": "test", "url": "http://example.com" }
  const close = { "action": "close_window", "label": "test" }
  const list = { "action": "list_windows" }
  const get = { "action": "get_window_url", "label": "test" }
  socket.send(JSON.stringify(create));
}, 5555); */
/*   socket.send(JSON.stringify(close));
  socket.send(JSON.stringify(list));
  socket.send(JSON.stringify(get)); */