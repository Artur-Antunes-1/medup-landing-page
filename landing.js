/* ============================================================
   MedUp — landing JS (perf pass)
   - One ScrollTrigger.batch per group (vs N triggers per item)
   - Skip card-reveal motion on small screens / reduced-motion
   ============================================================ */
(() => {
    /* ============================================================
       SUPABASE — coleta de e-mails (waitlist)
       Preencha as 2 constantes abaixo com os dados do SEU projeto:
       Dashboard > Project Settings > API
         • Project URL                          -> SUPABASE_URL
         • Publishable key (sb_publishable_...)  -> SUPABASE_ANON_KEY
       A publishable key é pública por design (a proteção é o RLS no banco).
       NUNCA cole aqui a "secret key" (sb_secret_...).
       ============================================================ */
    const SUPABASE_URL = 'https://kycsesbhuzyfpxmyityu.supabase.co';
    const SUPABASE_ANON_KEY = 'sb_publishable_B7E_TcZv32T9vO6IgbxF7w_IwxFEm5S';
    const WAITLIST_TABLE = 'waitlist';
    const SUPABASE_READY =
        /^https:\/\/.+\.supabase\.co$/.test(SUPABASE_URL) &&
        !/^COLE_SUA/.test(SUPABASE_ANON_KEY);

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isSmall = window.matchMedia('(max-width: 720px)').matches;

    if (window.gsap && window.ScrollTrigger && !reduce) {
        gsap.registerPlugin(ScrollTrigger);
        gsap.config({ force3D: true });
        gsap.defaults({ ease: 'power3.out', duration: 0.7 });

        /* Hero entrance — single timeline, runs once */
        gsap.timeline()
            .from('.hero-h1', { y: 50, opacity: 0, duration: 0.9 })
            .from('.hero-sub', { y: 24, opacity: 0, duration: 0.7 }, '-=0.5')
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

            ScrollTrigger.batch('.bento-cell', batchOptions);
            ScrollTrigger.batch('.step-card', batchOptions);
            ScrollTrigger.batch('.golden-card', batchOptions);
            ScrollTrigger.batch('.rmap-row', batchOptions);
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

    /* ===== Waitlist form (Supabase) ===== */
    const form = document.getElementById('waitlistForm');
    const msg = document.getElementById('formMsg');
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const setMsg = (text, isError) => {
        if (!msg) return;
        msg.textContent = text;
        msg.classList.toggle('error', !!isError);
    };

    const remember = (email) => {
        try {
            const list = JSON.parse(localStorage.getItem('medup_waitlist') || '[]');
            if (!list.includes(email)) list.push(email);
            localStorage.setItem('medup_waitlist', JSON.stringify(list));
        } catch (_) { /* ignore */ }
    };

    const alreadyJoined = (email) => {
        try {
            return JSON.parse(localStorage.getItem('medup_waitlist') || '[]').includes(email);
        } catch (_) { return false; }
    };

    if (form) {
        const submitBtn = form.querySelector('[type="submit"]');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = form.email.value.trim();

            if (!emailRe.test(email)) {
                setMsg('Hmm, esse e-mail não parece válido.', true);
                return;
            }

            // Já se inscreveu neste navegador? Evita uma ida desnecessária ao servidor.
            if (alreadyJoined(email)) {
                setMsg('Esse e-mail já está na nossa lista. 🎉', false);
                form.reset();
                return;
            }

            // Backend ainda não configurado: não perde o lead — guarda local e avisa no console.
            if (!SUPABASE_READY) {
                console.warn('[MedUp] Supabase não configurado em landing.js — e-mail salvo só localmente.');
                remember(email);
                setMsg('Pronto! Você entrou na lista do MedUp.', false);
                form.reset();
                return;
            }

            const originalLabel = submitBtn ? submitBtn.innerHTML : '';
            if (submitBtn) { submitBtn.disabled = true; submitBtn.innerHTML = 'Enviando…'; }
            setMsg('', false);

            try {
                const res = await fetch(`${SUPABASE_URL}/rest/v1/${WAITLIST_TABLE}`, {
                    method: 'POST',
                    headers: {
                        'apikey': SUPABASE_ANON_KEY,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=minimal',
                    },
                    body: JSON.stringify({ email, source: 'landing' }),
                });

                if (res.ok) {
                    remember(email);
                    setMsg('Pronto! Você entrou na lista do MedUp.', false);
                    form.reset();
                } else if (res.status === 409) {
                    // e-mail duplicado (unique constraint) — trata como sucesso amigável
                    remember(email);
                    setMsg('Esse e-mail já está na nossa lista. 🎉', false);
                    form.reset();
                } else {
                    const detail = await res.text().catch(() => '');
                    console.error('[MedUp] Falha ao salvar e-mail:', res.status, detail);
                    setMsg('Algo deu errado por aqui. Tenta de novo em instantes?', true);
                }
            } catch (err) {
                console.error('[MedUp] Erro de rede ao salvar e-mail:', err);
                setMsg('Sem conexão? Confere sua internet e tenta de novo.', true);
            } finally {
                if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = originalLabel; }
            }
        });
    }

    /* ===== Refresh ScrollTrigger after fonts load ===== */
    if (document.fonts && window.ScrollTrigger) {
        document.fonts.ready.then(() => ScrollTrigger.refresh());
    }
})();
