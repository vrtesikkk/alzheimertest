function speakWord(word) {
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(word);
    utt.lang = 'en-US';
    utt.rate = 0.85;

    const btns = document.querySelectorAll('.word-audio-btn');
    btns.forEach(b => { if (b.textContent.toLowerCase().includes(word)) b.classList.add('playing'); });
    utt.onend = () => btns.forEach(b => b.classList.remove('playing'));

    window.speechSynthesis.speak(utt);
}

function speakAllWords() {
    const words = ['apple', 'table', 'penny'];
    let i = 0;
    window.speechSynthesis.cancel();

    function next() {
        if (i >= words.length) return;
        const utt = new SpeechSynthesisUtterance(words[i]);
        utt.lang = 'en-US';
        utt.rate = 0.85;
        utt.onend = () => setTimeout(next, 600);
        window.speechSynthesis.speak(utt);
        i++;
    }
    next();
}

function revealWorldInput() {
    document.getElementById('world-display').style.display = 'none';
    document.getElementById('world-ready-btn').style.display = 'none';
    document.getElementById('world-input-area').style.display = 'block';
    document.getElementById('world-backwards').focus();
}

function revealRepetitionInput() {
    document.getElementById('repetition-display').style.display = 'none';
    document.getElementById('repetition-ready-btn').style.display = 'none';
    document.getElementById('repetition-input-area').style.display = 'block';
    document.getElementById('repetition').focus();
}

function speakPhrase() {
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance('No ifs, ands, or buts');
    utt.lang = 'en-US';
    utt.rate = 0.8;
    window.speechSynthesis.speak(utt);
}

function speakInstructions() {
    const steps = [
        'Step one. Click the blue button.',
        'Step two. Click the red button.',
        'Step three. Click the green button.'
    ];
    let i = 0;
    window.speechSynthesis.cancel();

    function next() {
        if (i >= steps.length) return;
        const utt = new SpeechSynthesisUtterance(steps[i]);
        utt.lang = 'en-US';
        utt.rate = 0.85;
        utt.onend = () => setTimeout(next, 500);
        window.speechSynthesis.speak(utt);
        i++;
    }
    next();
}

function revealCommandButtons() {
    document.getElementById('command-instructions-display').style.display = 'none';
    document.getElementById('command-ready-btn').style.display = 'none';
    document.getElementById('commandButtons').style.display = 'flex';
}

// ========================================
// DRAWING CANVAS (Q9)
// ========================================

let isDrawing = false;
let drawingHasContent = false;

const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');
ctx.lineWidth = 2.5;
ctx.lineCap = 'round';
ctx.strokeStyle = '#2c3e50';

function getCanvasPos(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if (e.touches) {
        return {
            x: (e.touches[0].clientX - rect.left) * scaleX,
            y: (e.touches[0].clientY - rect.top) * scaleY
        };
    }
    return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
    };
}

canvas.addEventListener('mousedown', e => {
    isDrawing = true;
    const pos = getCanvasPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
});

canvas.addEventListener('mousemove', e => {
    if (!isDrawing) return;
    const pos = getCanvasPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    drawingHasContent = true;
});

canvas.addEventListener('mouseup', () => { isDrawing = false; });
canvas.addEventListener('mouseleave', () => { isDrawing = false; });

canvas.addEventListener('touchstart', e => {
    e.preventDefault();
    isDrawing = true;
    const pos = getCanvasPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
}, { passive: false });

canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    if (!isDrawing) return;
    const pos = getCanvasPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    drawingHasContent = true;
}, { passive: false });

canvas.addEventListener('touchend', () => { isDrawing = false; });

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawingHasContent = false;
}

// ========================================
// STATE
// ========================================

let currentQuestion = 1;

// ========================================
// SERIAL SEVENS (Q3)
// ========================================

const serialIds = ['serial1', 'serial2', 'serial3', 'serial4', 'serial5'];
let serialStep = 0;

let serialTimer = null;

document.getElementById('serial-active').addEventListener('input', function() {
    clearTimeout(serialTimer);
    if (this.value.trim() === '') return;
    serialTimer = setTimeout(() => {
        document.getElementById(serialIds[serialStep]).value = this.value.trim();
        serialStep++;
        this.value = '';
        if (serialStep < 5) {
            document.getElementById('serial-step').textContent = `Answer ${serialStep + 1} of 5`;
        } else {
            document.getElementById('serial-step').textContent = 'All answers entered ✓';
            this.disabled = true;
            this.style.cursor = 'not-allowed';
        }
    }, 800);
});
const totalQuestions = 9;

let scores = {
    orientation_time: 0,  // Q1: max 4  (1 per field)
    registration: 0,      // Q2: max 3  (1 per word)
    serial_sevens: 0,     // Q3: max 1
    world_backwards: 0,   // Q4: max 1
    naming: 0,            // Q5: max 2  (1 per object)
    repetition: 0,        // Q6: max 5  (1 per word of phrase)
    command: 0,           // Q7: max 1
    writing: 0,           // Q8: max 9
    papersteps: 0,        // Q9: max 4  (1 per step)
};

let commandSequence = [];

// ========================================
// COMMAND BUTTONS (Q6)
// ========================================

document.querySelectorAll('.command-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const color = btn.dataset.color;
        commandSequence.push(color);
        btn.classList.add('clicked');
        btn.disabled = true;

        const feedback = document.getElementById('commandFeedback');
        feedback.textContent = `Steps completed: ${commandSequence.join(' → ')}`;

        if (commandSequence.length === 3) {
            const correct = commandSequence[0] === 'blue' &&
                            commandSequence[1] === 'red' &&
                            commandSequence[2] === 'green';
            if (correct) {
                scores.command = 1;
                feedback.textContent = '✓ Correct! You followed all three steps in order.';
                feedback.style.color = '#42f545';
            } else {
                scores.command = 0;
                feedback.textContent = '✗ Incorrect sequence. The correct order was: blue → red → green';
                feedback.style.color = '#f54242';
            }
        }
    });
});

// ========================================
// NAVIGATION
// ========================================

function updateProgress() {
    document.getElementById('progressFill').style.width = (currentQuestion / totalQuestions) * 100 + '%';
}

function showQuestion(num) {
    document.querySelectorAll('.question-section').forEach(s => s.classList.remove('active'));
    const target = document.querySelector(`[data-question="${num}"]`);
    if (target) target.classList.add('active');
    document.getElementById('prevBtn').style.display = num > 1 ? 'block' : 'none';
    document.getElementById('nextBtn').textContent = num === totalQuestions ? 'Finish Test' : 'Next';
    currentQuestion = num;
    updateProgress();
}

// ========================================
// SCORING
// ========================================

function calculateScores() {

    // Q1: Orientation to Time — 1 point per correct field (max 4)
    scores.orientation_time = 0;
    const now = new Date();
    const correctYear   = String(now.getFullYear());
    const correctMonth  = now.toLocaleString('en-US', { month: 'long' }).toLowerCase();
    const correctDay    = now.toLocaleString('en-US', { weekday: 'long' }).toLowerCase();
    const m = now.getMonth();
    const correctSeason = m <= 1 || m === 11 ? 'winter'
                        : m <= 4 ? 'spring'
                        : m <= 7 ? 'summer'
                        : 'fall';
    const seasonAliases = { fall: ['fall', 'autumn'], spring: ['spring'], summer: ['summer'], winter: ['winter'] };

    if (document.getElementById('q1-year')?.value.trim() === correctYear) scores.orientation_time++;
    if (seasonAliases[correctSeason]?.includes(document.getElementById('q1-season')?.value.trim().toLowerCase())) scores.orientation_time++;
    if (document.getElementById('q1-day')?.value.trim().toLowerCase() === correctDay) scores.orientation_time++;
    if (document.getElementById('q1-month')?.value.trim().toLowerCase() === correctMonth) scores.orientation_time++;

    // Q2: Registration — 1 point per correct word (max 3)
    scores.registration = 0;
    ['reg-word1', 'reg-word2', 'reg-word3'].forEach(id => {
        const input = document.getElementById(id);
        if (input?.value.toLowerCase().trim() === input?.dataset.answer) scores.registration++;
    });

    // Q3: Serial Sevens — max 1 (any correct answer scores)
    scores.serial_sevens = 0;
    ['serial1', 'serial2', 'serial3', 'serial4', 'serial5'].forEach(id => {
        const input = document.getElementById(id);
        if (input?.value.trim() === input?.dataset.answer) scores.serial_sevens = 1;
    });

    // Q4: WORLD Backwards — max 1
    const worldInput = document.getElementById('world-backwards');
    scores.world_backwards = worldInput?.value.toLowerCase().trim() === worldInput?.dataset.answer ? 1 : 0;

    // Q4: Naming — 1 point per object (max 2)
    scores.naming = 0;
    const v1 = document.getElementById('object1')?.value.toLowerCase().trim();
    if (v1 === 'watch' || v1 === 'wristwatch' || v1 === 'clock') scores.naming++;
    const v2 = document.getElementById('object2')?.value.toLowerCase().trim();
    if (v2 === 'pencil' || v2 === 'pen') scores.naming++;

    // Q5: Repetition — 1 point per correct word of phrase (max 5)
    // Phrase: "No ifs, ands, or buts" → 5 words
    scores.repetition = 0;
    const correctPhrase = ['no', 'ifs', 'ands', 'or', 'buts'];
    const userPhrase = (document.getElementById('repetition')?.value.toLowerCase().trim().replace(/,/g, '') || '').split(/\s+/);
    correctPhrase.forEach((word, i) => {
        if (userPhrase[i] === word) scores.repetition++;
    });

    // Q6: Three-Step Command — max 1 (scored live by button handler)
    // scores.command already set

    // Q7: Writing — 10 points if sentence has subject + verb, 0 otherwise
    scores.writing = 0;
    const sentence = document.getElementById('sentence')?.value.trim() || '';
    const words = sentence.toLowerCase().split(/\s+/).filter(w => w.length > 0);
    const subjects = ['i','you','he','she','it','we','they','the','a','an',
                      'my','your','his','her','our','their','this','that'];
    const verbs = ['is','are','was','were','be','been','have','has','had',
                   'do','does','did','will','would','can','could','should',
                   'may','might','shall','must','go','goes','went','come',
                   'came','get','got','make','made','take','took','see','saw',
                   'know','think','want','need','feel','look','seem','become'];
    const hasSubject = words.some(w => subjects.includes(w) || (/^[a-z]+(s|es)?$/.test(w) && w.length > 2));
    const hasVerb    = words.some(w => verbs.includes(w) || (/[a-z]+(s|es|ed|ing)$/.test(w) && w.length > 3));
    if (words.length >= 2 && hasSubject && hasVerb) scores.writing = 9;

    // Q9: Drawing — 4 points if canvas has any drawn content
    scores.papersteps = drawingHasContent ? 4 : 0;
}

// ========================================
// RESULTS
// ========================================

function showResults() {
    calculateScores();
    const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
    document.getElementById('totalScore').textContent = totalScore;

    let interpretation = '';
    if (totalScore >= 25) {
        interpretation = '<span class="interpretation-level level-normal">Normal cognition</span><p>Score indicates no cognitive impairment.</p>';
    } else if (totalScore >= 19) {
        interpretation = '<span class="interpretation-level level-mild">Mild cognitive impairment</span><p>Score suggests mild cognitive impairment. Consider professional evaluation.</p>';
    } else if (totalScore >= 10) {
        interpretation = '<span class="interpretation-level level-moderate">Moderate cognitive impairment</span><p>Score indicates moderate cognitive impairment. Professional evaluation recommended.</p>';
    } else {
        interpretation = '<span class="interpretation-level level-severe">Severe cognitive impairment</span><p>Score suggests severe cognitive impairment. Please consult a healthcare professional.</p>';
    }
    document.getElementById('interpretationText').innerHTML = interpretation;

    document.getElementById('categoryBreakdown').innerHTML = `
        <p><strong>1. Orientation to Time:</strong> ${scores.orientation_time}/4</p>
        <p><strong>2. Registration:</strong> ${scores.registration}/3</p>
        <p><strong>3. Serial Sevens:</strong> ${scores.serial_sevens}/1</p>
        <p><strong>4. Spell Word Backwards:</strong> ${scores.world_backwards}/1</p>
        <p><strong>5. Naming:</strong> ${scores.naming}/2</p>
        <p><strong>6. Repetition:</strong> ${scores.repetition}/5</p>
        <p><strong>7. Three-Step Command:</strong> ${scores.command}/1</p>
        <p><strong>8. Writing:</strong> ${scores.writing}/9</p>
        <p><strong>9. Drawing:</strong> ${scores.papersteps}/4</p>
    `;

    document.querySelectorAll('.question-section').forEach(s => s.classList.remove('active'));
    document.getElementById('resultsSection').classList.add('active');
    document.querySelector('.navigation').style.display = 'none';
}

// ========================================
// BUTTON HANDLERS
// ========================================

document.getElementById('nextBtn').addEventListener('click', () => {
    if (currentQuestion < totalQuestions) {
        showQuestion(currentQuestion + 1);
    } else {
        showResults();
    }
});

document.getElementById('prevBtn').addEventListener('click', () => {
    if (currentQuestion > 1) showQuestion(currentQuestion - 1);
});

// ========================================
// INIT
// ========================================

updateProgress();
