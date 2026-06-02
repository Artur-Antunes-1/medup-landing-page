/* ============================================================
   MedUp — landing JS (perf pass)
   - One ScrollTrigger.batch per group (vs N triggers per item)
   - Skip card-reveal motion on small screens / reduced-motion
   ============================================================ */
(() => {
    const reduce  = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isSmall = window.matchMedia('(max-width: 720px)').matches;

    if (window.gsap && window.ScrollTrigger && !reduce) {
        gsap.registerPlugin(ScrollTrigger);
        gsap.config({ force3D: true });
        gsap.defaults({ ease: 'power3.out', duration: 0.7 });

        /* Hero entrance — single timeline, runs once */
        gsap.timeline()
            .from('.hero-h1',        { y: 50, opacity: 0, duration: 0.9 })
            .from('.hero-sub',       { y: 24, opacity: 0, duration: 0.7 }, '-=0.5')
            .from('.hero-ctas .btn', { y: 18, opacity: 0, duration: 0.55, stagger: 0.08 }, '-=0.4');

        /* Scrubbing per-word manifesto reveal — one trigger */
        const words = document.querySelectorAll('[data-scrub] span');
        if (words.length) {
            gsap.to(words, {
                opacity: 1,
                stagger: 0.04,
                ease: 'none',
                scrollTrigger: {
                    trigger: '#manifesto',
                    start: 'top 80%',
                    end: 'bottom 40%',
                    scrub: 0.5,
                },
            });
        }

        /* Batched reveals — ONE observer per group instead of one-per-card.
           Skip on small screens to keep mobile fluid. */
        if (!isSmall) {
            const batchOptions = {
                start: 'top 88%',
                onEnter: (els) => gsap.fromTo(els,
                    { opacity: 0, y: 32 },
                    { opacity: 1, y: 0, stagger: 0.08, overwrite: true }
                ),
                once: true,
            };

            ScrollTrigger.batch('.bento-cell',  batchOptions);
            ScrollTrigger.batch('.step-card',   batchOptions);
            ScrollTrigger.batch('.golden-card', batchOptions);
            ScrollTrigger.batch('.rmap-row',    batchOptions);
        }
    } else {
        /* reveal everything immediately for reduced-motion / no-gsap */
        document.querySelectorAll('[data-scrub] span').forEach(s => s.style.opacity = 1);
    }

    /* ===== Horizontal accordion ===== */
    const slices = document.querySelectorAll('.acc-slice[data-acc]');
    slices.forEach(slice => {
        const activate = () => {
            slices.forEach(s => s.classList.remove('acc-open'));
            slice.classList.add('acc-open');
        };
        slice.addEventListener('click', activate);
        if (!isSmall) slice.addEventListener('mouseenter', activate);
    });

    /* ===== Smooth scroll for anchors ===== */
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            const id = link.getAttribute('href');
            if (!id || id === '#') return;
            const target = document.querySelector(id);
            if (!target) return;
            e.preventDefault();
            const offset = 90;
            const top = target.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({ top, behavior: 'smooth' });
        });
    });

    /* ===== Waitlist form ===== */
    const form = document.getElementById('waitlistForm');
    const msg  = document.getElementById('formMsg');
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = form.email.value.trim();

            if (!emailRe.test(email)) {
                msg.textContent = 'Hmm, esse e-mail não parece válido.';
                msg.classList.add('error');
                return;
            }

            msg.classList.remove('error');
            msg.textContent = `Você está dentro. Confirmação enviada para ${email}.`;
            form.reset();

            try {
                const list = JSON.parse(localStorage.getItem('medup_waitlist') || '[]');
                if (!list.includes(email)) list.push(email);
                localStorage.setItem('medup_waitlist', JSON.stringify(list));
            } catch (_) { /* ignore */ }
        });
    }

    /* ===== Refresh ScrollTrigger after fonts load ===== */
    if (document.fonts && window.ScrollTrigger) {
        document.fonts.ready.then(() => ScrollTrigger.refresh());
    }
})();
