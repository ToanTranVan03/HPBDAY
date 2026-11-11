/* ==========================================================================
   APP STATE & MUSIC PLAYLIST ENGINE
   ========================================================================== */
let currentStep = 1;
const totalSteps = 5;
let recipientName = "Bạn Yêu";
let candleBlown = false;

// SFX Audio Elements
const sfxBox = new Audio('audio/box_open.wav');
const sfxBlow = new Audio('audio/blow.wav');
const sfxChime = new Audio('audio/chime.wav');
const sfxFirework = new Audio('audio/firework.wav');

function playSFX(audio) {
    try {
        audio.currentTime = 0;
        audio.play().catch(() => {});
    } catch(e) {}
}

// Audio Playlist (Gồm các bài hát local wav chuẩn sinh nhật và audio trực tuyến)
const playlist = [
    {
        title: "Happy Birthday Piano Song",
        src: "audio/happy_birthday_melody.wav"
    },
    {
        title: "Happy Birthday Music Box Chimes",
        src: "audio/happy_birthday_chimes.wav"
    },
    {
        title: "Celebration Victory Fanfare",
        src: "audio/win.ogg"
    },
    {
        title: "Party Celebration Acoustic",
        src: "https://assets.mixkit.co/music/preview/mixkit-happy-birthday-celebration-451.mp3"
    }
];

let currentTrackIndex = 0;
let isAudioPlaying = false;

const mainAudio = document.getElementById('mainAudio');
const vinylDisc = document.getElementById('vinylDisc');
const tonearm = document.getElementById('tonearm');
const vinylCenterIcon = document.getElementById('vinylCenterIcon');
const trackStatusBadge = document.getElementById('trackStatusBadge');
const currentTrackTitle = document.getElementById('currentTrackTitle');
const musicVisualizer = document.getElementById('musicVisualizer');
const mainPlayIcon = document.getElementById('mainPlayIcon');
const audioStartBanner = document.getElementById('audioAutoBanner');

// Web Audio API Synthesizer (Dự phòng tuyệt đối 100% không bao giờ lỗi mất tiếng)
let audioCtx = null;
function getAudioContext() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    return audioCtx;
}

/* ==========================================================================
   MUSIC PLAYER CONTROLS
   ========================================================================== */
function loadTrack(index) {
    currentTrackIndex = index;
    const track = playlist[index];
    mainAudio.src = track.src;
    currentTrackTitle.innerText = `🎶 ${track.title}`;
    
    // Update active class trong dropdown playlist
    document.querySelectorAll('#playlistDropdown .dropdown-item').forEach((item, i) => {
        if (i === index) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

function selectTrack(index) {
    loadTrack(index);
    playMusic();
}

function playMusic() {
    getAudioContext();
    mainAudio.play().then(() => {
        isAudioPlaying = true;
        updatePlayerUI(true);
        if (audioStartBanner) audioStartBanner.style.display = 'none';
    }).catch(err => {
        console.log("Audio play prevented:", err);
        // Nếu trình duyệt chặn hoặc file ngoại tuyến bị nghẽn, phát qua Web Audio Synth
        playSynthBirthdayMelody();
        updatePlayerUI(true);
    });
}

function pauseMusic() {
    mainAudio.pause();
    isAudioPlaying = false;
    updatePlayerUI(false);
}

function togglePlayMusic() {
    if (isAudioPlaying) {
        pauseMusic();
    } else {
        playMusic();
    }
}

function nextSong() {
    currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
    selectTrack(currentTrackIndex);
}

function prevSong() {
    currentTrackIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
    selectTrack(currentTrackIndex);
}

function changeVolume(val) {
    mainAudio.volume = parseFloat(val);
}

function updatePlayerUI(playing) {
    if (playing) {
        vinylDisc.classList.add('spinning');
        tonearm.classList.add('playing');
        musicVisualizer.classList.add('playing');
        trackStatusBadge.innerText = "Đang phát 🎶";
        trackStatusBadge.style.color = "#4ade80";
        mainPlayIcon.className = "fas fa-pause";
        vinylCenterIcon.className = "fas fa-music fa-spin-pulse";
    } else {
        vinylDisc.classList.remove('spinning');
        tonearm.classList.remove('playing');
        musicVisualizer.classList.remove('playing');
        trackStatusBadge.innerText = "Đang dừng";
        trackStatusBadge.style.color = "#ff9cb3";
        mainPlayIcon.className = "fas fa-play";
        vinylCenterIcon.className = "fas fa-music";
    }
}

// Khi hết bài tự sang bài kế tiếp
mainAudio.addEventListener('ended', () => {
    nextSong();
});

// Khi người dùng bấm bất kỳ đâu trên trang lần đầu tiên
function initAudioUserGesture() {
    playMusic();
    if (audioStartBanner) {
        audioStartBanner.classList.add('animate__fadeOutUp');
        setTimeout(() => audioStartBanner.style.display = 'none', 600);
    }
}
document.body.addEventListener('click', initAudioUserGesture, { once: true });

/* ==========================================================================
   WEB AUDIO API SOUND GENERATOR (DỰ PHÒNG CHUẨN MELODY)
   ========================================================================== */
function playTone(freq, duration, startTime, ctx) {
    if (freq <= 0) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.exponentialRampToValueAtTime(0.3, startTime + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration);
}

function playSynthBirthdayMelody() {
    const ctx = getAudioContext();
    const notes = [
        { f: 261.63, d: 0.35 }, { f: 261.63, d: 0.15 }, { f: 293.66, d: 0.5 }, { f: 261.63, d: 0.5 }, { f: 349.23, d: 0.5 }, { f: 329.63, d: 0.9 },
        { f: 261.63, d: 0.35 }, { f: 261.63, d: 0.15 }, { f: 293.66, d: 0.5 }, { f: 261.63, d: 0.5 }, { f: 392.00, d: 0.5 }, { f: 349.23, d: 0.9 },
        { f: 261.63, d: 0.35 }, { f: 261.63, d: 0.15 }, { f: 523.25, d: 0.5 }, { f: 440.00, d: 0.5 }, { f: 349.23, d: 0.5 }, { f: 329.63, d: 0.5 }, { f: 293.66, d: 0.9 },
        { f: 466.16, d: 0.35 }, { f: 466.16, d: 0.15 }, { f: 440.00, d: 0.5 }, { f: 349.23, d: 0.5 }, { f: 392.00, d: 0.5 }, { f: 349.23, d: 1.2 }
    ];

    let t = ctx.currentTime + 0.1;
    notes.forEach(n => {
        playTone(n.f, n.d, t, ctx);
        t += n.d + 0.08;
    });
}

/* ==========================================================================
   STEP NAVIGATION (CHUYỂN TIẾP TRANG & BƯỚC)
   ========================================================================== */
function updateStepper(step) {
    document.querySelectorAll('.step-dot').forEach((dot, index) => {
        const dotStep = index + 1;
        dot.classList.remove('active', 'completed');
        if (dotStep === step) {
            dot.classList.add('active');
        } else if (dotStep < step) {
            dot.classList.add('completed');
        }
    });
}

function goToStep(step) {
    if (step < 1 || step > totalSteps) return;

    for (let i = 1; i <= totalSteps; i++) {
        const section = document.getElementById(`step-${i}`);
        if (section) {
            section.classList.add('d-none');
            section.classList.remove('animate__fadeIn', 'animate__zoomIn');
        }
    }

    const targetSection = document.getElementById(`step-${step}`);
    if (targetSection) {
        targetSection.classList.remove('d-none');
        targetSection.classList.add('animate__fadeIn');
    }

    currentStep = step;
    updateStepper(step);

    // Kích hoạt hiệu ứng theo bước
    if (step === 2) {
        burstConfettiSmall();
    } else if (step === 3) {
        triggerHeartConfetti();
    } else if (step === 4) {
        // Tự kích hoạt carousel
        const myCarousel = document.querySelector('#memoryCarousel');
        if (myCarousel) new bootstrap.Carousel(myCarousel, { interval: 4000 });
    } else if (step === 5) {
        launchFireworks();
        spawnBalloons(10);
    }
}

function nextStep(step) { goToStep(step); }
function prevStep(step) { goToStep(step); }

document.querySelectorAll('.step-dot').forEach(dot => {
    dot.addEventListener('click', () => {
        const stepNum = parseInt(dot.getAttribute('data-step'));
        goToStep(stepNum);
    });
});

/* ==========================================================================
   STEP 1: OPEN GIFT BOX
   ========================================================================== */
function openGiftBox() {
    const box = document.getElementById('mysteryBox');
    box.classList.add('open');
    playSFX(sfxBox);
    triggerConfetti();

    setTimeout(() => {
        const surpriseModal = new bootstrap.Modal(document.getElementById('surpriseModal'));
        surpriseModal.show();
    }, 600);
}

/* ==========================================================================
   STEP 2: BLOW CANDLE (THỔI TẮT NẾN & BỐC KHÓI)
   ========================================================================== */
function blowCandle() {
    if (candleBlown) return;

    playSFX(sfxBlow);
    const flame = document.getElementById('flame');
    const smoke = document.getElementById('candleSmoke');
    const status = document.getElementById('candle-status');

    flame.classList.add('extinguished');
    smoke.classList.add('active');
    candleBlown = true;

    status.className = "alert alert-success d-inline-block px-4 py-2 mt-2 animate__animated animate__bounceIn";
    status.innerHTML = `<i class="fas fa-check-circle me-2"></i> Nguyện ước của <strong>${recipientName}</strong> đã gửi tới các vì sao! ✨ Điều ước sẽ thành hiện thực!`;

    // Âm thanh chim hót hoặc tiếng chúc mừng
    triggerConfetti();
    setTimeout(triggerHeartConfetti, 400);
}

/* ==========================================================================
   STEP 5: MINI-GAME RÚT QUẺ VŨ TRỤ & ĐỔI TÊN
   ========================================================================== */
const fortunes = [
    "🌟 Năm nay tài lộc rủng rỉnh, tiền vô như nước, công việc thăng hoa vượt bậc!",
    "💖 Tình duyên nở rộ, luôn được yêu thương, chăm sóc và chở che hết mực!",
    "✈️ Bạn sẽ có ít nhất một chuyến du lịch xa tuyệt đẹp và đáng nhớ trong năm nay!",
    "💎 Mọi ước mơ ấp ủ bấy lâu sẽ sớm gặt hái quả ngọt vượt mong đợi!",
    "🍀 May mắn mỉm cười mỗi ngày, ăn ngon ngủ yên, tâm hồn thư thái bình an!",
    "🌈 Tuổi mới bước ngoặt mới: Rạng rỡ hơn, tự tin hơn và thành công hơn!",
    "🎁 Một món quà bất ngờ vô cùng ý nghĩa sẽ xuất hiện trong tháng sinh nhật này!"
];

function drawFortune() {
    const card = document.getElementById('fortuneCard');
    const resultText = document.getElementById('fortuneResult');
    
    playSFX(sfxChime);
    card.classList.add('animate__animated', 'animate__headShake');
    
    setTimeout(() => {
        const randomIndex = Math.floor(Math.random() * fortunes.length);
        resultText.innerText = fortunes[randomIndex];
        card.classList.add('revealed');
        card.classList.remove('animate__animated', 'animate__headShake');
        burstConfettiSmall();
    }, 400);
}

function applyCustomName() {
    const input = document.getElementById('customNameInput');
    const val = input.value.trim();
    if (val) {
        recipientName = val;
        // Cập nhật thư chúc và modal
        const letterGreeting = document.getElementById('letterGreeting');
        if (letterGreeting) letterGreeting.innerText = `Thân gửi ${recipientName}! 💖`;
        
        const modalTitle = document.getElementById('surpriseModalTitle');
        if (modalTitle) modalTitle.innerText = `Chúc Mừng Sinh Nhật ${recipientName}! 🎂`;
        
        triggerHeartConfetti();
        alert(`Đã đổi tên người nhận thành: "${recipientName}" thành công! 🎉`);
    }
}

/* ==========================================================================
   CONFETTI & FIREWORKS EFFECTS
   ========================================================================== */
function triggerConfetti() {
    confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
    });
}

function burstConfettiSmall() {
    confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
    });
}

function triggerHeartConfetti() {
    const scalar = 2.2;
    const heart = confetti.shapeFromPath({
        path: 'M167 72c19,-38 37,-56 75,-56 42,0 76,33 76,75 0,76 -76,151 -151,227 -75,-76 -151,-151 -151,-227 0,-42 34,-75 76,-75 38,0 57,18 75,56z'
    });

    confetti({
        shapes: [heart],
        scalar,
        particleCount: 35,
        spread: 80,
        origin: { y: 0.6 }
    });
}

function launchFireworks() {
    const duration = 2.8 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 35, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) {
            return clearInterval(interval);
        }
        const particleCount = 45 * (timeLeft / duration);
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.4), y: Math.random() - 0.2 } }));
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.6, 0.9), y: Math.random() - 0.2 } }));
    }, 250);
}

function launchMassiveFireworks() {
    playSFX(sfxFirework);
    launchFireworks();
    setTimeout(triggerHeartConfetti, 700);
}

/* ==========================================================================
   BONG BÓNG BAY (BALLOONS)
   ========================================================================== */
function dropBalloons() {
    spawnBalloons(15);
}

function spawnBalloons(count) {
    const container = document.getElementById('balloonContainer');
    const colors = ['#ff758c', '#ffd166', '#06d6a0', '#118ab2', '#a06cd5', '#ff4d6d'];

    for (let i = 0; i < count; i++) {
        const b = document.createElement('div');
        b.className = 'balloon';
        const color = colors[Math.floor(Math.random() * colors.length)];
        b.style.backgroundColor = color;
        b.style.left = `${Math.random() * 92 + 4}%`;
        const size = Math.random() * 20 + 40;
        b.style.width = `${size}px`;
        b.style.height = `${size * 1.3}px`;
        b.style.animationDuration = `${Math.random() * 4 + 6}s`;
        b.style.animationDelay = `${Math.random() * 2}s`;
        container.appendChild(b);

        setTimeout(() => b.remove(), 10000);
    }
}
// Khởi chạy vài quả bóng lúc ban đầu
setTimeout(() => spawnBalloons(6), 1200);

/* ==========================================================================
   BACKGROUND FLOATING PARTICLES (CANVAS)
   ========================================================================== */
const canvas = document.getElementById('fireworks-canvas');
const ctx = canvas.getContext('2d');
let stars = [];

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class FloatingStar {
    constructor() {
        this.reset();
    }
    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2.2 + 0.5;
        this.alpha = Math.random() * 0.8 + 0.2;
        this.speedY = Math.random() * 0.6 + 0.1;
        this.pulseSpeed = Math.random() * 0.02 + 0.005;
    }
    update() {
        this.y -= this.speedY;
        this.alpha += Math.sin(Date.now() * this.pulseSpeed) * 0.01;
        if (this.y < 0) {
            this.y = canvas.height;
            this.x = Math.random() * canvas.width;
        }
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.abs(this.alpha)})`;
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#ff758c';
        ctx.fill();
    }
}

for (let i = 0; i < 70; i++) {
    stars.push(new FloatingStar());
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach(s => {
        s.update();
        s.draw();
    });
    requestAnimationFrame(animateParticles);
}
animateParticles();

// Tự nạp bài hát đầu tiên
loadTrack(0);
