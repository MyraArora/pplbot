<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gemini Chatbot</title>
    <style>
        /* Your existing styles remain the same */
    </style>
</head>
<body>
    <div class="chat-container">
        <div class="chat-header">
            <h2>PeriodPal Chat</h2>
        </div>
        <div id="error-container"></div>
        <div class="chat-messages" id="chat-messages">
            <div class="message bot-message">
                <div class="message-content">
                    Hello! I'm PeriodPal. How can I help you today?
                </div>
            </div>
        </div>
        <div id="status" class="status-indicator"></div>
        <div class="input-area">
            <input type="text" id="user-input" placeholder="Type your message here..." autocomplete="off">
            <button id="send-button">Send</button>
        </div>
    </div>

    <script>
        const chatMessages = document.getElementById('chat-messages');
        const userInput = document.getElementById('user-input');
        const sendButton = document.getElementById('send-button');
        const errorContainer = document.getElementById('error-container');
        const statusIndicator = document.getElementById('status');

        function showError(message) {
            errorContainer.innerHTML = `<div class="error-message">${message}</div>`;
        }

        function setStatus(message) {
            statusIndicator.textContent = message;
        }

        function addMessage(content, isUser = false) {
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
            
            const messageContent = document.createElement('div');
            messageContent.className = 'message-content';
            messageContent.textContent = content;
            messageDiv.appendChild(messageContent);

            chatMessages.appendChild(messageDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }

        async function sendMessage(message) {
            try {
                setStatus('Sending message...');
                errorContainer.innerHTML = '';

                const response = await fetch('http://localhost:3000/api/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{
                                text: message
                            }]
                        }]
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.details || 'Server error');
                }

                const data = await response.json();
                setStatus('');
                
                if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
                    addMessage(data.candidates[0].content.parts[0].text, false);
                } else {
                    throw new Error('Invalid response format from server');
                }
            } catch (error) {
                console.error('Error:', error);
                setStatus('');
                showError(`Error: ${error.message}`);
            }
        }

        function handleUserInput() {
            const message = userInput.value.trim();
            if (message) {
                addMessage(message, true);
                userInput.value = '';
                sendMessage(message);
            }
        }

        sendButton.addEventListener('click', handleUserInput);
        userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleUserInput();
            }
        });
    </script>
</body>
</html>
