// listen for messages from server
const source = new EventSource('/sse');

source.onmessage = function(event) {
  const msg = document.createElement('p');
  msg.textContent = event.data;
  document.getElementById('messages').appendChild(msg);
};

// send message to server
document.getElementById('form').addEventListener('submit', function(e) {
  e.preventDefault();

  const input = document.getElementById('input');

  fetch(`/chat?message=${input.value}`);

  input.value = '';
});