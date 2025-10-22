// Chatbot state
let chatbotState = {
    step: 1,
    responses: {}
};

function toggleChatbot() {
    const widget = document.getElementById('chatbotWidget');
    widget.classList.toggle('active');
    if (widget.classList.contains('active')) {
        showQuestion1();
    }
}

function closeChatbot() {
    document.getElementById('chatbotWidget').classList.remove('active');
}

function showQuestion1() {
    const chatInput = document.getElementById('chatInput');
    const chatMessages = document.getElementById('chatMessages');

    chatbotState.step = 1;

    chatMessages.innerHTML = `
        <div class="chat-message bot-message">
            <p>👋 Hi! We'd love to hear your feedback!</p>
            <p><strong>Did you like this test paper?</strong></p>
        </div>
    `;

    chatInput.innerHTML = `
        <div class="chat-buttons">
            <button class="chat-btn" onclick="answerQ1('yes')">👍 Yes</button>
            <button class="chat-btn" onclick="answerQ1('no')">👎 No</button>
        </div>
    `;
}

async function answerQ1(answer) {
    chatbotState.responses.liked_paper = answer === 'yes';
    const chatMessages = document.getElementById('chatMessages');

    // Add user response
    chatMessages.innerHTML += `
        <div class="chat-message user-message">
            <p>${answer === 'yes' ? '👍 Yes' : '👎 No'}</p>
        </div>
    `;

    // Get bot response
    try {
        const response = await fetch(`/api/reviews/chatbot-response/likedPaper?answer=${answer}`);
        const data = await response.json();

        chatMessages.innerHTML += `
            <div class="chat-message bot-message">
                <p>${data.response}</p>
            </div>
        `;
    } catch (error) {
        console.error('Chatbot error:', error);
    }

    chatMessages.scrollTop = chatMessages.scrollHeight;
    setTimeout(showQuestion2, 1500);
}

function showQuestion2() {
    const chatInput = document.getElementById('chatInput');
    const chatMessages = document.getElementById('chatMessages');

    chatbotState.step = 2;

    chatMessages.innerHTML += `
        <div class="chat-message bot-message">
            <p><strong>Did you face any questions that confused you?</strong></p>
        </div>
    `;

    chatInput.innerHTML = `
        <div class="chat-buttons">
            <button class="chat-btn" onclick="answerQ2('yes')">😕 Yes</button>
            <button class="chat-btn" onclick="answerQ2('no')">✓ No</button>
        </div>
    `;

    chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function answerQ2(answer) {
    chatbotState.responses.hasQuestions = answer === 'yes';
    const chatMessages = document.getElementById('chatMessages');

    chatMessages.innerHTML += `
        <div class="chat-message user-message">
            <p>${answer === 'yes' ? '😕 Yes' : '✓ No'}</p>
        </div>
    `;

    try {
        const response = await fetch(`/api/reviews/chatbot-response/hasQuestions?answer=${answer}`);
        const data = await response.json();

        chatMessages.innerHTML += `
            <div class="chat-message bot-message">
                <p>${data.response}</p>
            </div>
        `;
    } catch (error) {
        console.error('Chatbot error:', error);
    }

    chatMessages.scrollTop = chatMessages.scrollHeight;
    setTimeout(showQuestion3, 1500);
}

function showQuestion3() {
    const chatInput = document.getElementById('chatInput');
    const chatMessages = document.getElementById('chatMessages');

    chatbotState.step = 3;

    chatMessages.innerHTML += `
        <div class="chat-message bot-message">
            <p><strong>Did you face any technical problems?</strong></p>
        </div>
    `;

    chatInput.innerHTML = `
        <div class="chat-buttons">
            <button class="chat-btn" onclick="answerQ3('yes')">⚠️ Yes</button>
            <button class="chat-btn" onclick="answerQ3('no')">✓ No</button>
        </div>
    `;

    chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function answerQ3(answer) {
    chatbotState.responses.hasProblem = answer === 'yes';
    const chatMessages = document.getElementById('chatMessages');

    chatMessages.innerHTML += `
        <div class="chat-message user-message">
            <p>${answer === 'yes' ? '⚠️ Yes' : '✓ No'}</p>
        </div>
    `;

    try {
        const response = await fetch(`/api/reviews/chatbot-response/hasProblem?answer=${answer}`);
        const data = await response.json();

        chatMessages.innerHTML += `
            <div class="chat-message bot-message">
                <p>${data.response}</p>
            </div>
        `;
    } catch (error) {
        console.error('Chatbot error:', error);
    }

    chatMessages.scrollTop = chatMessages.scrollHeight;
    setTimeout(showFinalStep, 1500);
}

function showFinalStep() {
    const chatInput = document.getElementById('chatInput');
    const chatMessages = document.getElementById('chatMessages');

    chatMessages.innerHTML += `
        <div class="chat-message bot-message">
            <p><strong>Any additional feedback?</strong> (Optional)</p>
        </div>
    `;

    chatInput.innerHTML = `
        <textarea class="chat-textarea" id="feedbackText" placeholder="Share any suggestions..."></textarea>
        <div style="display: flex; gap: 8px;">
            <button class="chat-btn" onclick="skipFeedback()">Skip</button>
            <button class="chat-submit" onclick="submitFeedback()" style="flex: 1;">Submit</button>
        </div>
    `;

    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function skipFeedback() {
    submitReview('');
}

function submitFeedback() {
    const feedback = document.getElementById('feedbackText').value;
    submitReview(feedback);
}

async function submitReview(additionalFeedback) {
    const chatMessages = document.getElementById('chatMessages');
    const chatInput = document.getElementById('chatInput');

    try {
        const authToken = localStorage.getItem('authToken');
        if (!authToken) {
            chatMessages.innerHTML += `
                <div class="chat-message bot-message">
                    <p>⚠️ Please login to submit feedback!</p>
                </div>
            `;
            return;
        }

        const response = await fetch('/api/reviews/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                rating: 4,
                liked_paper: chatbotState.responses.liked_paper,
                questions_faced: chatbotState.responses.hasQuestions ? ['Some questions were confusing'] : [],
                problems_faced: chatbotState.responses.hasProblem ? 'Technical issues encountered' : null,
                feedback: additionalFeedback,
                chatbot_responses: chatbotState.responses
            })
        });

        const data = await response.json();

        if (response.ok) {
            chatMessages.innerHTML += `
                <div class="chat-message bot-message">
                    <p>✅ Thank you for your feedback!</p>
                    <p>Your response helps us improve AptitudePro.</p>
                </div>
            `;
            chatInput.innerHTML = `
                <button class="chat-submit" onclick="closeChatbot()" style="width: 100%;">Close</button>
            `;
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        console.error('Error submitting review:', error);
        chatMessages.innerHTML += `
            <div class="chat-message bot-message">
                <p>❌ Error submitting feedback. Please try again.</p>
            </div>
        `;
    }
}
