/* ============================================================
   MedUp landing — GSAP scroll choreography
   Paradigm A: Pinned aside (How section)
   Paradigm B: Scrubbing per-word text reveal (Manifesto)
   ============================================================ */
(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ===== GSAP setup ===== */
    if (window.gsap && window.ScrollTrigger) {
        gsap.registerPlugin(ScrollTrigger);

        if (!reduce) {
            /* Paradigm B — scrubbing per-word reveal in manifesto */
            const words = document.querySelectorAll('[data-scrub] span');
            if (words.length) {
                gsap.to(words, {
                    opacity: 1,
                    stagger: 0.05,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: '#manifesto',
                        start: 'top 75%',
                        end: 'bottom 35%',
                        scrub: 0.6,
                    },
                });
            }

            /* Paradigm A — pin the .pin-inner block (CSS sticky handles base,
               but we also fade in cards as they scroll into view) */
            gsap.utils.toArray('.step-card').forEach((card, i) => {
                gsap.fromTo(card,
                    { opacity: 0, y: 40, scale: 0.96 },
                    {
                        opacity: 1, y: 0, scale: 1,
                        duration: 0.9,
                        ease: 'power3.out',
                        scrollTrigger: {
                            trigger: card,
                            start: 'top 82%',
                            toggleActions: 'play none none reverse',
                        },
                    }
                );
            });

            /* Bento cells fade-in stagger */
            gsap.utils.toArray('.bento-cell').forEach((cell, i) => {
                gsap.fromTo(cell,
                    { opacity: 0, y: 40 },
                    {
                        opacity: 1, y: 0,
                        duration: 0.8,
                        delay: i * 0.05,
                        ease: 'power3.out',
                        scrollTrigger: {
                            trigger: cell,
                            start: 'top 85%',
                            toggleActions: 'play none none reverse',
                        },
                    }
                );
            });

            /* Golden cards */
            gsap.utils.toArray('.golden-card').forEach((card, i) => {
                gsap.fromTo(card,
                    { opacity: 0, y: 50 },
                    {
                        opacity: 1, y: 0,
                        duration: 0.9,
                        delay: i * 0.1,
                        ease: 'power3.out',
                        scrollTrigger: {
                            trigger: card,
                            start: 'top 85%',
                            toggleActions: 'play none none reverse',
                        },
                    }
                );
            });

            /* Roadmap rows */
            gsap.utils.toArray('.rmap-row').forEach((row) => {
                gsap.fromTo(row,
                    { opacity: 0, x: -40 },
                    {
                        opacity: 1, x: 0,
                        duration: 0.8,
                        ease: 'power3.out',
                        scrollTrigger: {
                            trigger: row,
                            start: 'top 85%',
                            toggleActions: 'play none none reverse',
                        },
                    }
                );
            });

            /* Hero entrance */
            gsap.timeline({ defaults: { ease: 'power3.out' } })
                .from('.hero-h1', { y: 60, opacity: 0, duration: 1.1 })
                .from('.hero-sub', { y: 30, opacity: 0, duration: 0.9 }, '-=0.6')
                .from('.hero-ctas .btn', { y: 20, opacity: 0, duration: 0.7, stagger: 0.1 }, '-=0.5')
                .from('.hero-bg-img', { scale: 1.12, duration: 2.4, ease: 'power2.out' }, 0);
        } else {
            /* Reduced motion: reveal everything */
            document.querySelectorAll('[data-scrub] span').forEach(s => s.style.opacity = 1);
        }
    }

    /* ===== Horizontal accordion ===== */
    const slices = document.querySelectorAll('.acc-slice[data-acc]');
    slices.forEach(slice => {
        const activate = () => {
            slices.forEach(s => s.classList.remove('acc-open'));
            slice.classList.add('acc-open');
        };
        slice.addEventListener('click', activate);
        slice.addEventListener('mouseenter', activate);
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

    /* ===== ScrollTrigger refresh after fonts load ===== */
    if (document.fonts && window.ScrollTrigger) {
        document.fonts.ready.then(() => ScrollTrigger.refresh());
    }
})();
