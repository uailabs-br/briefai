// UI Elements
const rawInput = document.getElementById('rawInput');
const charCount = document.getElementById('charCount');
const generateBtn = document.getElementById('generateBtn');
const regenerateBtn = document.getElementById('regenerateBtn');
const copyBtn = document.getElementById('copyBtn');
const outputContent = document.getElementById('outputContent');
const emptyState = document.getElementById('emptyState');
const briefResult = document.getElementById('briefResult');
const loadingDots = document.getElementById('loadingDots');
const btnText = document.querySelector('.btn-text');
const settingsBtn = document.getElementById('settingsBtn');
const modalOverlay = document.getElementById('modalOverlay');
const closeModal = document.getElementById('closeModal');
const saveKeyBtn = document.getElementById('saveKey');
const apiKeyInput = document.getElementById('apiKey');
const copyToast = document.getElementById('copyToast');

// Character count update
rawInput.addEventListener('input', () => {
    charCount.textContent = `${rawInput.value.length} characters`;
});

// Modal Logic
settingsBtn.addEventListener('click', () => {
    const savedKey = localStorage.getItem('GEMINI_API_KEY');
    if (savedKey) apiKeyInput.value = savedKey;
    modalOverlay.style.display = 'flex';
});

closeModal.addEventListener('click', () => {
    modalOverlay.style.display = 'none';
});

saveKeyBtn.addEventListener('click', () => {
    const key = apiKeyInput.value.trim();
    if (key) {
        localStorage.setItem('GEMINI_API_KEY', key);
        modalOverlay.style.display = 'none';
        showToast('Settings saved!');
    } else {
        alert('Please enter a valid API key');
    }
});

// Brief Generation Logic
async function handleGenerate() {
    const input = rawInput.value.trim();
    const apiKey = localStorage.getItem('GEMINI_API_KEY');

    if (!apiKey) {
        modalOverlay.style.display = 'flex';
        return;
    }

    if (!input) {
        alert('Please enter some notes first!');
        return;
    }

    setLoading(true);

    try {
        const brief = await AIService.generateBrief(input, apiKey);
        displayBrief(brief);
    } catch (error) {
        console.error('Generation failed:', error);
        alert(`Error: ${error.message}`);
    } finally {
        setLoading(false);
    }
}

function setLoading(isLoading) {
    generateBtn.disabled = isLoading;
    regenerateBtn.disabled = isLoading;

    if (isLoading) {
        btnText.style.display = 'none';
        loadingDots.style.display = 'flex';
    } else {
        btnText.style.display = 'block';
        loadingDots.style.display = 'none';
    }
}

function displayBrief(brief) {
    emptyState.style.display = 'none';
    briefResult.style.display = 'block';
    regenerateBtn.style.display = 'flex';
    copyBtn.style.display = 'flex';

    briefResult.innerHTML = `
        <div class="brief-section">
            <h3><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> Campaign Overview</h3>
            <p>${brief.overview}</p>
        </div>
        
        <div class="brief-section">
            <h3><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg> Key Talking Points</h3>
            <ul>
                ${brief.talkingPoints.map(point => `<li>${point}</li>`).join('')}
            </ul>
        </div>
        
        <div class="brief-section">
            <h3><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path></svg> Required Deliverables</h3>
            <ul>
                ${brief.deliverables.map(item => `<li>${item}</li>`).join('')}
            </ul>
        </div>
        
        <div class="brief-section">
            <h3><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg> Brand Dos & Donts</h3>
            <p><strong>Dos:</strong> ${brief.dos}</p>
            <p><strong>Donts:</strong> ${brief.donts}</p>
        </div>

        <div class="brief-section">
            <h3><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg> Timeline</h3>
            <p>${brief.timeline}</p>
        </div>

        <div class="brief-section">
            <h3><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg> Payment</h3>
            <div contenteditable="true" class="payment-field" id="paymentField">
                ${brief.payment}
            </div>
            <small style="color: var(--text-secondary); margin-top: 8px; display: block;">This section is editable</small>
        </div>
    `;
}

// Copy to Clipboard
copyBtn.addEventListener('click', () => {
    const text = getBriefText();
    navigator.clipboard.writeText(text).then(() => {
        showToast('Brief copied to clipboard!');
    });
});

function getBriefText() {
    const sections = briefResult.querySelectorAll('.brief-section');
    let text = "CREATOR BRIEF\n\n";
    sections.forEach(section => {
        const title = section.querySelector('h3').textContent.trim();
        const content = section.querySelector('p, ul, .payment-field');

        text += `${title.toUpperCase()}\n`;
        if (content.tagName === 'UL') {
            section.querySelectorAll('li').forEach(li => {
                text += `- ${li.textContent}\n`;
            });
        } else {
            text += `${content.textContent.trim()}\n`;
        }
        text += "\n";
    });
    return text;
}

function showToast(msg) {
    copyToast.textContent = msg;
    copyToast.classList.add('show');
    setTimeout(() => {
        copyToast.classList.remove('show');
    }, 3000);
}

generateBtn.addEventListener('click', handleGenerate);
regenerateBtn.addEventListener('click', handleGenerate);
