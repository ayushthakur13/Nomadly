const socket = io(); 

const chatForm = document.getElementById('chat-form');
const chatInput = document.querySelector('.chat-input');
const chatBox = document.querySelector('.chat-box');

const tripId = window.tripId;
const userId = window.userId;

if (tripId) 
    socket.emit('joinRoom', { tripId });

chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const content = chatInput.value.trim();

    if (content) {
        socket.emit('sendMessage', { tripId, userId, content });
        chatInput.value = '';
    }
});

socket.on('receiveMessage', ({ sender, content, createdAt }) => {
    const isMe = sender._id === window.userId;

    const msgElement = document.createElement('div');
    msgElement.classList.add('chat-message');
    if (isMe) msgElement.classList.add('me');

    msgElement.innerHTML = `
        <div class="message-header">
            <strong>${isMe ? 'You' : sender.name}</strong>
            <span class="timestamp">${new Date(createdAt).toLocaleTimeString()}</span>
        </div>
        <div class="message-body">${content}</div>
    `;
    chatBox.appendChild(msgElement);
    chatBox.scrollTop = chatBox.scrollHeight;
});
