let socket;

// DOM elemanları
const usernameInput = document.getElementById('username');
const roomInput = document.getElementById('room');
const joinBtn = document.getElementById('joinBtn');
const chatContainer = document.getElementById('chatContainer');

const sender = document.getElementById('sender');
const message = document.getElementById('message');
const submitBtn = document.getElementById('submitBtn');
const output = document.getElementById('output');
const feedback = document.getElementById('feedback');

// --- Odaya katılma ---
joinBtn.addEventListener('click', () => {
    const username = usernameInput.value.trim();
    const room = roomInput.value.trim();
    if (!username || !room) return alert('Kullanıcı adı ve oda gerekli');

    chatContainer.style.display = 'block';

    // 🔑 localhost sabitini kaldırdık → Render’da kendi origin üzerinden bağlanır
    socket = io.connect();

    socket.emit('joinRoom', { username, room });

    setupChat();

    // Sayfa açıldığında mesaj inputuna otomatik focus
    message.focus();
});

// --- Chat ve typing setup ---
function setupChat() {

    // Mesaj gönder
    submitBtn.addEventListener('click', () => {
        if (message.value.trim() !== "") {
            socket.emit('chat', {
                message: message.value
            });
            message.value = "";
        }
    });

    // Mesaj geldiğinde
    socket.on('chat', (data) => {
        feedback.innerHTML = "";
        const position = data.sender === usernameInput.value ? "right" : "left";

        const div = document.createElement('div');
        div.className = `message ${position}`;
        div.innerHTML = `<p><strong>${data.sender}:</strong> ${data.message}</p>`;
        output.appendChild(div);

        // Son mesaja kaydır
        output.scrollTop = output.scrollHeight;
    });

    // Yazıyor bildirisi
    message.addEventListener('keydown', (e) => {
        if (e.key === "Enter" && message.value.trim() !== "") {
            socket.emit('chat', { message: message.value });
            message.value = "";
        } else {
            // Yazıyor bildirisi
            socket.emit('typing');
        }
    });

    socket.on('typing', (data) => {
        if (data !== usernameInput.value) {
            feedback.innerHTML = `<p class="typing"><em>${data} yazıyor...</em></p>`;
        }
    });
}
