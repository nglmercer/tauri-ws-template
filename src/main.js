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
setInterval(() => {
  const number = Math.floor(Math.random() * 100);
  const datatest = { "action": "get_data", "data": number }
  const testdata = {       action: 'say_hello',
    data: 'Hello, server!' }
  socket.send(JSON.stringify( testdata));
}, 5555);
window.addEventListener("DOMContentLoaded", () => {
  greetInputEl = document.querySelector("#greet-input");
  greetMsgEl = document.querySelector("#greet-msg");
  document.querySelector("#greet-form").addEventListener("submit", (e) => {
    e.preventDefault();
    greet();
  });
});
