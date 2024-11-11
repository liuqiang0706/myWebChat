// 添加开场白功能
window.onload = function() {
    setTimeout(() => {
        addMessage("你好，我是NCSS技术支持专家，有什么我可以帮助你的？", 'bot');
    }, 500);
}

async function getBotResponse(message) {
    try {
        const response = await fetch('http://localhost:5000/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message
            })
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error('API Error:', errorData);
            throw new Error(`API request failed: ${response.status}`);
        }

        const data = await response.json();
        if (data.error) {
            throw new Error(data.error);
        }
        
        return data.response;
    } catch (error) {
        console.error('API调用错误:', error);
        return `抱歉，发生错误：${error.message}`;
    }
}

async function sendMessage() {
    const input = document.getElementById('messageInput');
    const message = input.value.trim();
    
    if (message) {
        addMessage(message, 'user');
        input.value = '';
        
        // 显示加载状态
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'message bot-message loading';
        loadingDiv.innerHTML = `
            <div class="typing-indicator">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        `;
        document.getElementById('chatBox').appendChild(loadingDiv);
        
        try {
            const botResponse = await getBotResponse(message);
            loadingDiv.remove();
            addMessage(botResponse, 'bot');
        } catch (error) {
            loadingDiv.remove();
            addMessage('抱歉，发生了错误，请稍后重试。', 'bot');
        }
    }
}

function addMessage(text, sender) {
    const chatBox = document.getElementById('chatBox');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    messageDiv.textContent = text;
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// 添加回车键发送功能
document.getElementById('messageInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// 添加输入框焦点
document.getElementById('messageInput').focus(); 
