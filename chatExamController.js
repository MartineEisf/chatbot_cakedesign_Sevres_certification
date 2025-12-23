// ============================================
// CONTRÔLEUR D'EXAMEN - TIMER 60 SECONDES
// ============================================

const EXAM_TIMER_DELAY = 60000; // 60000 = 60 secondes
const STORAGE_KEY_EXAM_LOCKED = 'exam_locked';

class ChatExamController {
  constructor() {
    this.state = 'idle'; // idle | started | waitingBot | locked
    this.timer = null;
    this.userMessageCount = 0;
    this.modal = null;
    this.overlay = null;
  }

  init() {
    if (localStorage.getItem(STORAGE_KEY_EXAM_LOCKED) === 'true') {
      this.state = 'locked';
      this.lockChatUI();
      return;
    }
    this.createModal();
  }

  createModal() {
    this.overlay = document.createElement('div');
    this.overlay.className = 'exam-overlay';
    this.overlay.style.display = 'none';

    this.modal = document.createElement('div');
    this.modal.className = 'exam-modal';
    this.modal.innerHTML = `
      <div class="exam-modal-content">
        <p class="exam-modal-text">
          Vous disposez d'un certain nombre d'informations pour réaliser votre commande.<br>
          Souhaitez-vous poser d'autres questions ou clarifier un élément ?
        </p>
        <div class="exam-modal-buttons">
          <button class="exam-btn exam-btn-yes">Oui</button>
          <button class="exam-btn exam-btn-no">Non</button>
        </div>
      </div>
    `;

    this.overlay.appendChild(this.modal);
    document.body.appendChild(this.overlay);

    this.modal.querySelector('.exam-btn-yes').addEventListener('click', () => this.handleYes());
    this.modal.querySelector('.exam-btn-no').addEventListener('click', () => this.handleNo());
  }

  onUserSendMessage() {
    if (this.state === 'locked') return;

    this.userMessageCount++;
    if (this.userMessageCount === 1) this.state = 'started';

    if (this.state === 'started') {
      this.state = 'waitingBot';
      this.clearTimer();
    }
  }

  onBotResponseDone() {
    if (this.state === 'locked') return;
    if (this.state !== 'waitingBot') return;

    this.state = 'started';
    this.startTimer();
  }

  startTimer() {
    this.clearTimer();
    this.timer = setTimeout(() => {
      if (this.state === 'waitingBot') {
        const check = setInterval(() => {
          if (this.state === 'started') {
            clearInterval(check);
            this.showModal();
          }
        }, 100);
      } else {
        this.showModal();
      }
    }, EXAM_TIMER_DELAY);
  }

  clearTimer() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  showModal() {
    if (this.state === 'locked') return;
    this.overlay.style.display = 'flex';
  }

  hideModal() {
    this.overlay.style.display = 'none';
  }

  // ✅ IMPORTANT : le pop-up doit revenir toutes les minutes si "Oui"
  handleYes() {
    this.hideModal();
    this.state = 'started';
    this.startTimer();
  }

  handleNo() {
    this.hideModal();
    this.state = 'locked';
    localStorage.setItem(STORAGE_KEY_EXAM_LOCKED, 'true');
    this.lockChatUI();
  }

  lockChatUI() {
    const messageInput = document.getElementById('messageInput');
    const sendBtn = document.getElementById('sendBtn');

    if (messageInput) {
      messageInput.disabled = true;
      messageInput.placeholder = 'Épreuve 1 terminée';
    }
    if (sendBtn) sendBtn.disabled = true;

    const chatBox = document.getElementById('chatBox');
    if (chatBox) {
      const lockMessage = document.createElement('div');
      lockMessage.className = 'message ai';
      lockMessage.innerHTML = `<div class="bubble"><strong>Épreuve 1 terminée</strong><br>Vous avez choisi de terminer l'épreuve.</div>`;
      chatBox.appendChild(lockMessage);
      chatBox.scrollTop = chatBox.scrollHeight;
    }
  }
}

// ⚠️ CETTE LIGNE EST OBLIGATOIRE
const examController = new ChatExamController();
