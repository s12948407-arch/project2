/**
 * ACT UTILITARIANISM INTERACTIVE ODYSSEY
 * Core Application Engine & Interactive Handlers
 */

document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================================================
       1. Audio Synthesizer (Web Audio API - Zero External Assets)
       ========================================================================== */
    class SoundEngine {
        constructor() {
            this.ctx = null;
            this.muted = false;
        }

        init() {
            if (!this.ctx) {
                const AudioCtx = window.AudioContext || window.webkitAudioContext;
                if (AudioCtx) this.ctx = new AudioCtx();
            }
            if (this.ctx && this.ctx.state === 'suspended') {
                this.ctx.resume();
            }
        }

        playTone(freq, type = 'sine', duration = 0.15, vol = 0.1) {
            if (this.muted) return;
            this.init();
            if (!this.ctx) return;

            try {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();

                osc.type = type;
                osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

                gain.gain.setValueAtTime(vol, this.ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

                osc.connect(gain);
                gain.connect(this.ctx.destination);

                osc.start();
                osc.stop(this.ctx.currentTime + duration);
            } catch (e) {
                console.warn('Audio play error:', e);
            }
        }

        navClick() {
            this.playTone(520, 'sine', 0.08, 0.08);
        }

        slideChange() {
            this.playTone(330, 'triangle', 0.2, 0.06);
            setTimeout(() => this.playTone(440, 'sine', 0.2, 0.07), 70);
        }

        success() {
            this.playTone(523.25, 'sine', 0.15, 0.1);
            setTimeout(() => this.playTone(659.25, 'sine', 0.15, 0.1), 90);
            setTimeout(() => this.playTone(783.99, 'sine', 0.25, 0.12), 180);
        }

        warning() {
            this.playTone(220, 'sawtooth', 0.2, 0.08);
            setTimeout(() => this.playTone(196, 'sawtooth', 0.25, 0.09), 120);
        }
    }

    const sound = new SoundEngine();

    // Sound toggle button
    const soundBtn = document.getElementById('sound-btn');
    soundBtn.addEventListener('click', () => {
        sound.init();
        sound.muted = !sound.muted;
        if (sound.muted) {
            soundBtn.classList.add('muted');
            soundBtn.innerHTML = '<i class="fa-solid fa-volume-xmark"></i>';
        } else {
            soundBtn.classList.remove('muted');
            soundBtn.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
            sound.navClick();
        }
    });

    /* ==========================================================================
       2. Interactive Particle Background Canvas (High-Performance & Mobile-Optimized)
       ========================================================================== */
    const canvas = document.getElementById('bg-canvas');
    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    const isMobile = window.innerWidth < 768 || ('ontouchstart' in window);
    const particleCount = isMobile ? 14 : 35; // Drastically reduced for silky mobile performance
    let mouse = { x: -1000, y: -1000 };

    function resizeCanvas() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    if (!isMobile) {
        window.addEventListener('mousemove', (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        });
    }

    class Particle {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * (isMobile ? 0.35 : 0.6);
            this.vy = (Math.random() - 0.5) * (isMobile ? 0.35 : 0.6);
            this.radius = Math.random() * (isMobile ? 1.8 : 2.2) + 1;
            // Moral color themes: Emerald, Cyan, Violet
            const colors = ['rgba(0, 245, 160, ', 'rgba(0, 217, 245, ', 'rgba(168, 85, 247, '];
            this.colorBase = colors[Math.floor(Math.random() * colors.length)];
            this.alpha = Math.random() * 0.4 + 0.2;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            // Screen wrap
            if (this.x < 0) this.x = width;
            if (this.x > width) this.x = 0;
            if (this.y < 0) this.y = height;
            if (this.y > height) this.y = height;

            // Mouse repulsion on desktop only
            if (!isMobile) {
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 100) {
                    this.x -= (dx / dist) * 1.2;
                    this.y -= (dy / dist) * 1.2;
                }
            }
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.colorBase + this.alpha + ')';
            // Removed expensive ctx.shadowBlur which murders mobile FPS!
            ctx.fill();
        }
    }

    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }

    let lastFrameTime = 0;
    const targetFPS = isMobile ? 30 : 60;
    const frameInterval = 1000 / targetFPS;

    function animateParticles(currentTime) {
        requestAnimationFrame(animateParticles);

        // Throttle frame rate on mobile to save CPU and battery
        const elapsed = currentTime - lastFrameTime;
        if (elapsed < frameInterval) return;
        lastFrameTime = currentTime - (elapsed % frameInterval);

        ctx.clearRect(0, 0, width, height);

        // Draw connections (only on desktop or very small subset on mobile)
        if (!isMobile) {
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distSq = dx * dx + dy * dy; // Avoid Math.sqrt for speed

                    if (distSq < 10000) { // 100 * 100
                        const dist = Math.sqrt(distSq);
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(0, 217, 245, ${0.12 * (1 - dist / 100)})`;
                        ctx.lineWidth = 0.7;
                        ctx.stroke();
                    }
                }
            }
        }

        particles.forEach(p => {
            p.update();
            p.draw();
        });
    }
    requestAnimationFrame(animateParticles);

    /* ==========================================================================
       3. Slideshow Navigation Engine
       ========================================================================== */
    const slides = Array.from(document.querySelectorAll('.slide-card'));
    const totalSlides = slides.length;
    let currentSlide = 1;

    const prevBtn = document.getElementById('prev-slide-btn');
    const nextBtn = document.getElementById('next-slide-btn');
    const progressBar = document.getElementById('global-progress');
    const slideBadge = document.getElementById('slide-num-badge');
    const dotsContainer = document.getElementById('dots-container');
    const drawer = document.getElementById('slide-drawer');
    const menuBtn = document.getElementById('menu-btn');
    const closeDrawerBtn = document.getElementById('close-drawer-btn');
    const drawerList = document.getElementById('drawer-list');

    // Generate Dots & Drawer items
    slides.forEach((slide, index) => {
        const slideNum = index + 1;
        const title = slide.getAttribute('data-title') || `سلايد ${slideNum}`;

        // Dot
        const dot = document.createElement('div');
        dot.className = `dot ${slideNum === 1 ? 'active' : ''}`;
        dot.setAttribute('title', title);
        dot.addEventListener('click', () => goToSlide(slideNum));
        dotsContainer.appendChild(dot);

        // Drawer list item
        const li = document.createElement('li');
        li.className = `drawer-item ${slideNum === 1 ? 'active' : ''}`;
        li.innerHTML = `
            <span class="drawer-num">${String(slideNum).padStart(2, '0')}</span>
            <span class="drawer-title">${title}</span>
        `;
        li.addEventListener('click', () => {
            goToSlide(slideNum);
            toggleDrawer(false);
        });
        drawerList.appendChild(li);
    });

    const allDots = Array.from(dotsContainer.querySelectorAll('.dot'));
    const allDrawerItems = Array.from(drawerList.querySelectorAll('.drawer-item'));

    function updateSlideUI() {
        // Toggle slide active classes
        slides.forEach((slide) => {
            const num = parseInt(slide.getAttribute('data-slide'));
            if (num === currentSlide) {
                slide.classList.add('active');
                slide.scrollTop = 0; // scroll to top when entered
            } else {
                slide.classList.remove('active');
            }
        });

        // Update progress bar
        const progressPercent = (currentSlide / totalSlides) * 100;
        progressBar.style.width = `${progressPercent}%`;

        // Update Badge
        slideBadge.textContent = `سلايد ${String(currentSlide).padStart(2, '0')} / ${String(totalSlides).padStart(2, '0')}`;

        // Update Nav buttons state
        prevBtn.disabled = currentSlide === 1;
        nextBtn.disabled = currentSlide === totalSlides;

        // Update Dots
        allDots.forEach((dot, idx) => {
            dot.classList.toggle('active', idx + 1 === currentSlide);
        });

        // Update Drawer items
        allDrawerItems.forEach((item, idx) => {
            item.classList.toggle('active', idx + 1 === currentSlide);
        });
    }

    function goToSlide(slideNum) {
        if (slideNum < 1 || slideNum > totalSlides || slideNum === currentSlide) return;
        currentSlide = slideNum;
        sound.slideChange();
        updateSlideUI();
    }

    function nextSlide() {
        if (currentSlide < totalSlides) {
            goToSlide(currentSlide + 1);
        }
    }

    function prevSlide() {
        if (currentSlide > 1) {
            goToSlide(currentSlide - 1);
        }
    }

    // Button event listeners
    nextBtn.addEventListener('click', nextSlide);
    prevBtn.addEventListener('click', prevSlide);

    // Keyboard Shortcuts (Arrow keys adapted for Arabic RTL!)
    // ArrowLeft = Forward (Next in RTL Arabic), ArrowRight = Backward (Prev)
    window.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        if (e.key === 'ArrowLeft' || e.key === 'PageDown' || e.key === ' ') {
            e.preventDefault();
            nextSlide();
        } else if (e.key === 'ArrowRight' || e.key === 'PageUp') {
            e.preventDefault();
            prevSlide();
        } else if (e.key === 'Home') {
            e.preventDefault();
            goToSlide(1);
        } else if (e.key === 'End') {
            e.preventDefault();
            goToSlide(totalSlides);
        } else if (e.key.toLowerCase() === 'f') {
            toggleFullscreen();
        } else if (e.key.toLowerCase() === 'm') {
            soundBtn.click();
        }
    });

    // Smart Touch swipe gestures for mobile (Prevents accidental trigger during vertical scrolling)
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;
    let touchStartTime = 0;
    const minHorizontalDistance = 85; // Requires an intentional swipe gesture

    const deckWrapper = document.getElementById('deck-wrapper');

    if (deckWrapper) {
        deckWrapper.addEventListener('touchstart', (e) => {
            // Ignore touches on interactive controls like range sliders or buttons
            if (e.target.closest('input, button, .action-btn, .quiz-opt-btn, .calc-slider')) return;

            const touch = e.changedTouches[0];
            touchStartX = touch.screenX;
            touchStartY = touch.screenY;
            touchStartTime = Date.now();
        }, { passive: true });

        deckWrapper.addEventListener('touchend', (e) => {
            if (e.target.closest('input, button, .action-btn, .quiz-opt-btn, .calc-slider')) return;

            const touch = e.changedTouches[0];
            touchEndX = touch.screenX;
            touchEndY = touch.screenY;
            handleTouchSwipe();
        }, { passive: true });
    }

    function handleTouchSwipe() {
        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;
        const deltaTime = Date.now() - touchStartTime;

        // CRITICAL FIX: Ensure the gesture was purely horizontal, NOT a vertical scroll!
        // 1. Horizontal movement must exceed minHorizontalDistance (85px)
        // 2. Horizontal movement must be at least 2.5 times larger than vertical movement
        // 3. Gesture must be a quick swipe (< 500ms), not a slow dragging finger while reading
        const isHorizontalIntent = Math.abs(deltaX) > minHorizontalDistance &&
                                   Math.abs(deltaX) > (Math.abs(deltaY) * 2.5) &&
                                   deltaTime < 500;

        if (isHorizontalIntent) {
            // In RTL Arabic layout: swiping left (deltaX < 0) moves forward to next slide
            if (deltaX < 0) {
                nextSlide();
            } else {
                prevSlide();
            }
        }
    }

    // Drawer Toggle
    function toggleDrawer(open) {
        drawer.classList.toggle('open', open);
    }
    menuBtn.addEventListener('click', () => {
        sound.navClick();
        toggleDrawer(!drawer.classList.contains('open'));
    });
    closeDrawerBtn.addEventListener('click', () => {
        sound.navClick();
        toggleDrawer(false);
    });

    // Fullscreen Toggle
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    function toggleFullscreen() {
        sound.navClick();
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => console.log(err));
            fullscreenBtn.innerHTML = '<i class="fa-solid fa-compress"></i>';
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                fullscreenBtn.innerHTML = '<i class="fa-solid fa-expand"></i>';
            }
        }
    }
    fullscreenBtn.addEventListener('click', toggleFullscreen);

    /* ==========================================================================
       4. Interactive Elements on Slides
       ========================================================================== */

    // --- Slide 2: Quick Simple Utility Slider ---
    const quickSlider = document.getElementById('quick-utility-slider');
    const quickScore = document.getElementById('simple-utility-score');
    const quickVerdict = document.getElementById('slider-verdict-text');

    if (quickSlider) {
        quickSlider.addEventListener('input', (e) => {
            const val = parseInt(e.target.value);
            quickScore.textContent = `${val > 0 ? '+' : ''}${val} Net Utility`;

            if (val > 50) {
                quickScore.style.color = 'var(--neon-emerald)';
                quickScore.style.borderColor = 'var(--neon-emerald)';
                quickVerdict.innerHTML = '🟢 <strong>سعادة عارمة!</strong> القرار ده واجب أخلاقي لا غبار عليه عند النفعيين.';
            } else if (val > 0) {
                quickScore.style.color = 'var(--neon-cyan)';
                quickScore.style.borderColor = 'var(--neon-cyan)';
                quickVerdict.innerHTML = '🔵 <strong>مكسب إيجابي:</strong> المنفعة تفوق الألم بدرجة معقولة، القرار مقبول أخلاقياً.';
            } else if (val === 0) {
                quickScore.style.color = 'var(--neon-gold)';
                quickScore.style.borderColor = 'var(--neon-gold)';
                quickVerdict.innerHTML = '🟡 <strong>حياد أخلاقي:</strong> اللذة تعادل الألم بالملي، الفعل ملوش وزن ترجيحي.';
            } else {
                quickScore.style.color = 'var(--neon-red)';
                quickScore.style.borderColor = 'var(--neon-red)';
                quickVerdict.innerHTML = '🔴 <strong>ألم وكارثة!</strong> الفعل ده يولد نكداً أكثر من السعادة، تجنبه فوراً!';
            }
        });
    }

    // --- Slide 5: Bentham's Felicific Calculus Simulator ---
    const calcSliders = {
        intensity: document.getElementById('sl-intensity'),
        duration: document.getElementById('sl-duration'),
        certainty: document.getElementById('sl-certainty'),
        propinquity: document.getElementById('sl-propinquity'),
        fecundity: document.getElementById('sl-fecundity'),
        purity: document.getElementById('sl-purity'),
        extent: document.getElementById('sl-extent')
    };

    const calcVals = {
        intensity: document.getElementById('val-intensity'),
        duration: document.getElementById('val-duration'),
        certainty: document.getElementById('val-certainty'),
        propinquity: document.getElementById('val-propinquity'),
        fecundity: document.getElementById('val-fecundity'),
        purity: document.getElementById('val-purity'),
        extent: document.getElementById('val-extent')
    };

    const meterCircle = document.getElementById('meter-circle');
    const calcScoreNumber = document.getElementById('calc-final-score');
    const verdictBadge = document.getElementById('verdict-badge');
    const verdictCommentary = document.getElementById('verdict-commentary');

    function calculateBenthamUtility() {
        if (!calcSliders.intensity) return;

        const i = parseInt(calcSliders.intensity.value);
        const d = parseInt(calcSliders.duration.value);
        const c = parseInt(calcSliders.certainty.value);
        const pr = parseInt(calcSliders.propinquity.value);
        const f = parseInt(calcSliders.fecundity.value);
        const pu = parseInt(calcSliders.purity.value);
        const ext = parseInt(calcSliders.extent.value);

        // Update individual label badges
        calcVals.intensity.textContent = i;
        calcVals.duration.textContent = d;
        calcVals.certainty.textContent = c;
        calcVals.propinquity.textContent = pr;
        calcVals.fecundity.textContent = f;
        calcVals.purity.textContent = pu;
        calcVals.extent.textContent = ext;

        // Weighted algorithm mimicking Bentham's philosophy
        // Extent acts as a massive multiplier for social utility
        const rawScore = (i * 1.5 + d * 1.3 + c * 1.1 + pr * 0.7 + f * 1.2 + pu * 1.2) * (ext / 10);
        // Normalize roughly between 0 and 100
        const normalized = Math.min(100, Math.max(0, Math.round((rawScore / 70) * 100)));

        calcScoreNumber.textContent = normalized;

        // Meter SVG dash offset (full circumference ~ 264)
        const circumference = 264;
        const offset = circumference - (normalized / 100) * circumference;
        meterCircle.style.strokeDashoffset = offset;

        // Visual feedback based on score
        if (normalized >= 75) {
            meterCircle.style.stroke = 'var(--neon-emerald)';
            verdictBadge.innerHTML = '<i class="fa-solid fa-square-check text-emerald"></i> فعل أخلاقي عالي النفعية';
            verdictCommentary.textContent = '"يا سلام على الحلاوة! الفعل ده بيحقق متعة واسعة وبتطول ومضمونة لأكبر عدد من الناس. عمنا بنثام بيبصم لك بالعشرة ويقولك: ده عين العقل والصواب الأخلاقي!"';
        } else if (normalized >= 45) {
            meterCircle.style.stroke = 'var(--neon-cyan)';
            verdictBadge.innerHTML = '<i class="fa-solid fa-circle-check text-cyan"></i> نفعية معقولة ومقبولة';
            verdictCommentary.textContent = '"الفعل ده كويس ومقنع، أرباحه من السعادة غالبة على متاعبه، بس خلي عينك على المدى واليقين عشان المتعة متتبخرش فجأة."';
        } else if (normalized >= 25) {
            meterCircle.style.stroke = 'var(--neon-gold)';
            verdictBadge.innerHTML = '<i class="fa-solid fa-circle-exclamation text-amber"></i> قرار مهزوز ونفعه ضعيف';
            verdictCommentary.textContent = '"حاسب يا صديقي.. الفعل ده إما متعته قصيرة أوي، أو مفيش غير شخصين تلاتة اللي مستفيدين، وممكن يجر وراه ألم أو ندم ينكد على الناس."';
        } else {
            meterCircle.style.stroke = 'var(--neon-red)';
            verdictBadge.innerHTML = '<i class="fa-solid fa-triangle-exclamation text-red"></i> جريمة نفعية ومرفوض تماماً';
            verdictCommentary.textContent = '"اوعى تدوس في السكة دي! حسبة بنثام بتقول إن القرار ده بينتج عنه تعاسة وألم للناس أكتر من أي فرفشة، ده غلط أخلاقي جسيم!"';
        }
    }

    Object.values(calcSliders).forEach(slider => {
        if (slider) {
            slider.addEventListener('input', () => {
                sound.playTone(350 + parseInt(slider.value) * 30, 'sine', 0.05, 0.04);
                calculateBenthamUtility();
            });
        }
    });
    calculateBenthamUtility();

    // --- Slide 6: Act vs Rule Utilitarianism Comparison Toggle ---
    const btnShowAct = document.getElementById('btn-show-act');
    const btnShowRule = document.getElementById('btn-show-rule');
    const btnShowBoth = document.getElementById('btn-show-both');
    const colAct = document.getElementById('col-act');
    const colRule = document.getElementById('col-rule');

    if (btnShowAct && btnShowRule && btnShowBoth) {
        btnShowAct.addEventListener('click', () => {
            sound.navClick();
            btnShowAct.classList.add('active');
            btnShowRule.classList.remove('active');
            btnShowBoth.classList.remove('active');
            colAct.classList.remove('dimmed');
            colRule.classList.add('dimmed');
        });

        btnShowRule.addEventListener('click', () => {
            sound.navClick();
            btnShowRule.classList.add('active');
            btnShowAct.classList.remove('active');
            btnShowBoth.classList.remove('active');
            colRule.classList.remove('dimmed');
            colAct.classList.add('dimmed');
        });

        btnShowBoth.addEventListener('click', () => {
            sound.navClick();
            btnShowBoth.classList.add('active');
            btnShowAct.classList.remove('active');
            btnShowRule.classList.remove('active');
            colAct.classList.remove('dimmed');
            colRule.classList.remove('dimmed');
        });
    }

    // --- Slide 7: Trolley Problem Simulator ---
    const btnPullLever = document.getElementById('btn-pull-lever');
    const btnDoNothing = document.getElementById('btn-do-nothing');
    const trolleyFeedback = document.getElementById('trolley-feedback');

    if (btnPullLever && btnDoNothing) {
        btnPullLever.addEventListener('click', () => {
            sound.success();
            trolleyFeedback.innerHTML = `
                <div class="feedback-card success-card" style="border-right: 4px solid var(--neon-emerald); padding: 0.5rem 0.8rem;">
                    <strong class="text-emerald"><i class="fa-solid fa-check"></i> اختيارك يطابق النفعية الفعلية 100%!</strong>
                    <p style="margin-top:0.3rem;">
                        أنت فكرت كـ Act Utilitarian حقيقي: حسبت الأرواح بالأرقام، وقررت إن تضحية شخص واحد لإنقاذ 5 هي النتيجة ذات السعادة الصافية الأعظم (+4 أرواح). ضميرك ارتاح للحسبة!
                    </p>
                </div>
            `;
        });

        btnDoNothing.addEventListener('click', () => {
            sound.warning();
            trolleyFeedback.innerHTML = `
                <div class="feedback-card warning-card" style="border-right: 4px solid var(--neon-red); padding: 0.5rem 0.8rem;">
                    <strong class="text-red"><i class="fa-solid fa-xmark"></i> النفعي الفعلي هيلومك بشدة!</strong>
                    <p style="margin-top:0.3rem;">
                        أنت هنا فكرت بفلسفة الواجب (Deontology): خفت تكون قاتل مباشر. بس عمنا النفعي هيقولك: <em>"سلبيتك دي خلت 5 يموتوا بدل 1! امتناعك عن الفعل نفسه أنتج خسارة -4 أرواح إضافية، وده فشل نفعي ذريع!"</em>
                    </p>
                </div>
            `;
        });
    }

    // --- Slide 8: Organ Transplant Problem Simulator ---
    const btnHarvest = document.getElementById('btn-harvest');
    const btnSpare = document.getElementById('btn-spare');
    const transplantFeedback = document.getElementById('transplant-feedback');

    if (btnHarvest && btnSpare) {
        btnHarvest.addEventListener('click', () => {
            sound.warning();
            transplantFeedback.innerHTML = `
                <div class="feedback-card warning-card" style="border-right: 4px solid var(--neon-red); padding: 0.5rem 0.8rem;">
                    <strong class="text-red"><i class="fa-solid fa-skull"></i> النتيجة منطقية للنظرية لكن مرعبة للإنسانية!</strong>
                    <p style="margin-top:0.3rem;">
                        لو مشينا بالحسابات الرقمية البحتة للنفعية الفعلية: (5 أنقذتهم - 1 قتلته = +4). بس هل ده مقبول؟ مستحيل! لو ده اتطبق، النظام الصحي كله هيتدمر والناس هتخاف تروح المستشفيات. عشان كده دي المعضلة اللي هزت عرش النفعية الفعلية!
                    </p>
                </div>
            `;
        });

        btnSpare.addEventListener('click', () => {
            sound.success();
            transplantFeedback.innerHTML = `
                <div class="feedback-card success-card" style="border-right: 4px solid var(--neon-emerald); padding: 0.5rem 0.8rem;">
                    <strong class="text-emerald"><i class="fa-solid fa-shield-halved"></i> انتصار الفطرة وحقوق الإنسان!</strong>
                    <p style="margin-top:0.3rem;">
                        رفضك للقتل بيثبت إن فيه <strong>حقوق أصيلة للإنسان غير قابلة للمساومة</strong> بأي معادلة نفعية. وده اللي دفع الفلاسفة لتأسيس <strong>النفعية القاعدية (Rule Utilitarianism)</strong> اللي بتضع قاعدة مقدسة: <em>"لا تقتل المريض أبداً لتحقيق استقرار المجتمع"</em>.
                    </p>
                </div>
            `;
        });
    }

    // --- Slide 10: Critiques Accordion ---
    const critiqueItems = document.querySelectorAll('.critique-item');
    critiqueItems.forEach(item => {
        item.addEventListener('click', () => {
            sound.navClick();
            const isOpen = item.classList.contains('open');
            // Close all
            critiqueItems.forEach(i => i.classList.remove('open'));
            // Toggle clicked
            if (!isOpen) {
                item.classList.add('open');
            }
        });
    });

    // --- Slide 12: Interactive Philosophical Quiz ---
    const quizQuestions = [
        {
            question: "سؤال 1: لو طبيب نفعي فعلي (Act Utilitarian) بحت، واكتشف إنه يقدر يقتل مريض واحد سراً بدون علم أحد لإنقاذ 5 مرضى.. ما موقفه النظري المباشر؟",
            options: [
                { text: "أ) يرفض فوراً لأن قتل الأبرياء محرم في كل الأديان والقوانين.", correct: false },
                { text: "ب) يقتله سراً ويوزع أعضاءه، لأن الحسبة الرياضية (5 مقابل 1) تحقق صافي سعادة أكبر.", correct: true },
                { text: "ج) يقرر استشارة لجنة الأخلاقيات الطبية وانتظار رأيهم.", correct: false },
                { text: "د) يمتنع لأن النفعية الفعلية تقدس القواعد الثابتة دون استثناء.", correct: false }
            ],
            explanation: "الإجابة الصحيحة (ب): النفعية الفعلية الصرفة تقيس الفعل بمفرده، وما دام قتل هذا الشخص سينتج عنه إنقاذ 5 وسعادة أسرهم دون أن يكتشف أحد الجريمة، فالنظرية نظرياً توجب قتله! وهو الانتقاد الأكثر إحراجاً للنظرية."
        },
        {
            question: "سؤال 2: ما الفرق الجوهري بين النفعية الفعلية (Act) والنفعية القاعدية (Rule)؟",
            options: [
                { text: "أ) النفعية الفعلية تهتم بسعادة الفرد، بينما القاعدية تهتم بسعادة الدولة.", correct: false },
                { text: "ب) النفعية الفعلية تزن كل فعل على حدة، بينما القاعدية تتبع القواعد التي تولد أعظم نفع لو عممت.", correct: true },
                { text: "ج) النفعية الفعلية ترفض الرياضيات، والقاعدية تستخدم الكمبيوتر.", correct: false },
                { text: "د) النفعية الفعلية أسسها ميل والقاعدية أسسها بنثام.", correct: false }
            ],
            explanation: "الإجابة الصحيحة (ب): نفعية الفعل (Act) تنظر للفعل المحدد وظروفه اللحظية، بينما نفعية القاعدة (Rule) تلتزم بقواعد عامة يضمن الالتزام بها تحقيق أعظم منفعة عامة على المدى الطويل."
        },
        {
            question: "سؤال 3: من هو الفيلسوف الذي اعتبر أن كل اللذات متساوية في النوع وتختلف في الكم فقط، وصاحب مقولة 'لعبة الورق تعادل الشعر إذا تساوت السعادة'؟",
            options: [
                { text: "أ) إيمانويل كانط", correct: false },
                { text: "ب) جون ستيوارت ميل", correct: false },
                { text: "ج) جيريمي بنثام", correct: true },
                { text: "د) أرسطو", correct: false }
            ],
            explanation: "الإجابة الصحيحة (ج): جيريمي بنثام هو الأب الكمي للنفعية الفعلية، ورفض التمييز الفلسفي بين اللذات، معتبراً أن السعادة تقاس كمياً فقط عبر معاييره السبعة."
        }
    ];

    let currentQIndex = 0;
    let quizScore = 0;

    const quizBox = document.getElementById('quiz-box');
    const qNumDisplay = document.getElementById('quiz-question-num');
    const qTextDisplay = document.getElementById('quiz-question-text');
    const qOptionsContainer = document.getElementById('quiz-options-container');
    const qExplanationBox = document.getElementById('quiz-explanation-box');
    const qNextBtn = document.getElementById('quiz-next-btn');
    const qScoreCounter = document.getElementById('quiz-score-counter');

    function renderQuestion(index) {
        if (!qTextDisplay) return;
        const q = quizQuestions[index];
        qNumDisplay.textContent = `سؤال ${index + 1} من ${quizQuestions.length}`;
        qTextDisplay.textContent = q.question;
        qOptionsContainer.innerHTML = '';
        qExplanationBox.style.display = 'none';
        qNextBtn.style.display = 'none';

        q.options.forEach((opt, optIdx) => {
            const btn = document.createElement('button');
            btn.className = 'quiz-opt-btn';
            btn.textContent = opt.text;
            btn.addEventListener('click', () => selectAnswer(opt, btn));
            qOptionsContainer.appendChild(btn);
        });
    }

    function selectAnswer(opt, selectedBtn) {
        const allOptionBtns = qOptionsContainer.querySelectorAll('.quiz-opt-btn');
        allOptionBtns.forEach(btn => btn.disabled = true);

        const currentQ = quizQuestions[currentQIndex];

        if (opt.correct) {
            sound.success();
            selectedBtn.classList.add('correct');
            quizScore++;
            qScoreCounter.textContent = `النتيجة: ${quizScore} / ${quizQuestions.length}`;
        } else {
            sound.warning();
            selectedBtn.classList.add('wrong');
            // Highlight correct one
            allOptionBtns.forEach((btn, idx) => {
                if (currentQ.options[idx].correct) {
                    btn.classList.add('correct');
                }
            });
        }

        // Show explanation
        qExplanationBox.innerHTML = `<strong><i class="fa-solid fa-lightbulb text-gold"></i> التحليل الفلسفي:</strong> ${currentQ.explanation}`;
        qExplanationBox.style.display = 'block';

        // Show next button or finish
        if (currentQIndex < quizQuestions.length - 1) {
            qNextBtn.textContent = 'السؤال التالي';
            qNextBtn.style.display = 'inline-flex';
        } else {
            qNextBtn.textContent = 'إنهاء الكويز والاحتفال 🎉';
            qNextBtn.style.display = 'inline-flex';
        }
    }

    if (qNextBtn) {
        qNextBtn.addEventListener('click', () => {
            sound.navClick();
            if (currentQIndex < quizQuestions.length - 1) {
                currentQIndex++;
                renderQuestion(currentQIndex);
            } else {
                // Show completion summary
                qOptionsContainer.innerHTML = '';
                qExplanationBox.style.display = 'none';
                qNextBtn.style.display = 'none';
                qNumDisplay.textContent = 'اكتمل الاختبار بنجاح!';
                qTextDisplay.innerHTML = `
                    <div style="text-align: center; padding: 1.5rem;">
                        <div style="font-size: 3rem; color: var(--neon-gold); margin-bottom: 0.5rem;">
                            <i class="fa-solid fa-trophy"></i>
                        </div>
                        <h3 style="color: var(--neon-emerald); font-size: 1.5rem; margin-bottom: 0.5rem;">
                            مبروك! نتيجتك: ${quizScore} من ${quizQuestions.length}
                        </h3>
                        <p style="color: #cbd5e1; font-size: 1rem; line-height: 1.7;">
                            ${quizScore === 3 ? 'فيلسوف نفعي أصيل! أنت الآن فاهم النظرية من جذورها البنثامية لحد أعقد معضلاتها الأخلاقية الحديثة!' : 'أداء ممتاز ومحترم جداً! أصبحت متمكناً من كل مفاهيم ومصطلحات النفعية الفعلية.'}
                        </p>
                    </div>
                `;
                sound.success();
            }
        });
    }

    renderQuestion(0);
    updateSlideUI();
});
