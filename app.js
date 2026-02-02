// Estado do app
const state = {
selectedDept: null,
deptNames: {
'atendimento': 'Atendimento',
'procuracoes': 'Fechamento de Contrato',
'juridico': 'Jurídico',
'administrativo': 'Administrativo',
'notas': 'Notas Fiscais'
},
chatStep: 0, // 0: nome, 1: cpf, 2: tem processo?, 3: conversa livre
userData: {
nome: '',
cpf: '',
temProcesso: null
},
whatsappNumber: '5543988235003'
};

// Elementos
const screens = {
welcome: document.getElementById('screen-welcome'),
channel: document.getElementById('screen-channel'),
chat: document.getElementById('screen-chat')
};

const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const chatSend = document.getElementById('chat-send');

// Navegação
function showScreen(screenId) {
Object.values(screens).forEach(s => s.classList.remove('active'));
screens[screenId].classList.add('active');
}

function goBack(screenId) {
showScreen(screenId.replace('screen-', ''));
}

// Departamentos
document.querySelectorAll('.dept-btn').forEach(btn => {
btn.addEventListener('click', () => {
state.selectedDept = btn.dataset.dept;
document.getElementById('selected-dept-text').textContent = state.deptNames[state.selectedDept];
showScreen('channel');
});
});

// Canal de atendimento
document.getElementById('btn-chat').addEventListener('click', () => {
document.getElementById('chat-dept-title').textContent = state.deptNames[state.selectedDept];
showScreen('chat');
startChat();
});

document.getElementById('btn-whatsapp').addEventListener('click', () => {
const message = Olá! Gostaria de atendimento no setor: ${state.deptNames[state.selectedDept]};
const url = https://wa.me/${state.whatsappNumber}?text=${encodeURIComponent(message)};
window.open(url, '_blank');
});

// Chat
function startChat() {
chatMessages.innerHTML = '';
state.chatStep = 0;
state.userData = { nome: '', cpf: '', temProcesso: null };

setTimeout(() => {
    addMessage('bot', `Olá! Bem-vindo ao setor de ${state.deptNames[state.selectedDept]}. 👋`);
    setTimeout(() => {
        addMessage('bot', 'Para começar, qual é o seu nome completo?');
    }, 1000);
}, 500);
}

function addMessage(type, text, quickReplies = null) {
const msgDiv = document.createElement('div');
msgDiv.className = message ${type};
msgDiv.textContent = text;
chatMessages.appendChild(msgDiv);

if (quickReplies) {
    const qrDiv = document.createElement('div');
    qrDiv.className = 'quick-replies';
    quickReplies.forEach(qr => {
        const btn = document.createElement('button');
        btn.className = 'quick-reply';
        btn.textContent = qr;
        btn.addEventListener('click', () => {
            handleUserInput(qr);
            qrDiv.remove();
        });
        qrDiv.appendChild(btn);
    });
    chatMessages.appendChild(qrDiv);
}

chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showTyping() {
const typingDiv = document.createElement('div');
typingDiv.className = 'message typing';
typingDiv.id = 'typing-indicator';
typingDiv.innerHTML = '

';
chatMessages.appendChild(typingDiv);
chatMessages.scrollTop = chatMessages.scrollHeight;
}
function hideTyping() {
const typing = document.getElementById('typing-indicator');
if (typing) typing.remove();
}

function handleUserInput(text) {
addMessage('user', text);

showTyping();

setTimeout(() => {
    hideTyping();
    processInput(text);
}, 1000 + Math.random() * 500);
}

function processInput(text) {
switch (state.chatStep) {
case 0: // Nome
state.userData.nome = text;
state.chatStep = 1;
addMessage('bot', Prazer, ${text.split(' ')[0]}! 😊);
setTimeout(() => {
addMessage('bot', 'Agora preciso do seu CPF (apenas números):');
}, 800);
break;

    case 1: // CPF
        const cpfClean = text.replace(/\D/g, '');
        if (cpfClean.length === 11) {
            state.userData.cpf = cpfClean;
            state.chatStep = 2;
            addMessage('bot', 'Perfeito! ✅');
            setTimeout(() => {
                addMessage('bot', 'Você já tem algum processo conosco?', ['Sim', 'Não', 'Não sei']);
            }, 800);
        } else {
            addMessage('bot', 'CPF inválido. Por favor, digite os 11 números do seu CPF:');
        }
        break;
        
    case 2: // Tem processo?
        state.userData.temProcesso = text.toLowerCase().includes('sim') ? true : 
                                     text.toLowerCase().includes('não') ? false : null;
        state.chatStep = 3;
        
        let response = '';
        if (state.userData.temProcesso === true) {
            response = 'Ótimo! Vou verificar seu cadastro. ';
        } else if (state.userData.temProcesso === false) {
            response = 'Sem problemas! ';
        } else {
            response = 'Tudo bem, vamos verificar. ';
        }
        
        addMessage('bot', response);
        setTimeout(() => {
            addMessage('bot', `Pronto! Coletei suas informações:\n\n📋 Nome: ${state.userData.nome}\n🔢 CPF: ${formatCPF(state.userData.cpf)}\n📁 Processo existente: ${state.userData.temProcesso === true ? 'Sim' : state.userData.temProcesso === false ? 'Não' : 'A verificar'}`);
            setTimeout(() => {
                addMessage('bot', 'Um de nossos atendentes irá continuar o atendimento em breve. Enquanto isso, você pode descrever o motivo do seu contato:');
            }, 1000);
        }, 800);
        break;
        
    case 3: // Conversa livre
        addMessage('bot', 'Obrigado pela informação! Um atendente humano responderá em breve. 🙏');
        break;
}
}

function formatCPF(cpf) {
return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

// Event listeners do chat
chatSend.addEventListener('click', sendMessage);
chatInput.addEventListener('keypress', (e) => {
if (e.key === 'Enter') sendMessage();
});

function sendMessage() {
const text = chatInput.value.trim();
if (text) {
handleUserInput(text);
chatInput.value = '';
}
}

// Inicialização
showScreen('welcome');
