// ===== SCRIPT BLOCK 1: inline =====
const nav=document.getElementById('navbar');
        window.addEventListener('scroll',()=>{nav.classList.toggle('scrolled',window.scrollY>80)});
        function toggleMenu(){document.getElementById('navLinks').classList.toggle('open')}
        function closeMenu(){document.getElementById('navLinks').classList.remove('open')}
        document.querySelectorAll('.reveal').forEach(el=>{
            new IntersectionObserver((entries,obs)=>{entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');obs.unobserve(e.target)}})},{threshold:.12,rootMargin:'0px 0px -40px 0px'}).observe(el)
        });
        document.querySelectorAll('a[href^="#"]').forEach(a=>{a.addEventListener('click',function(e){e.preventDefault();const t=document.querySelector(this.getAttribute('href'));if(t)t.scrollIntoView({behavior:'smooth',block:'start'});closeMenu()})});

        // Animate glow breathing after initial load
        setTimeout(()=>{
            const glow=document.querySelector('.hero-logo-glow');
            if(glow)glow.style.animation='glowBreathe 4s ease-in-out infinite';
        },3000);
    

        const hero=document.querySelector('.hero');
        const prefersReducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
        let heroFramePending=false;
        function updateHeroParallax(){
            if(!hero){heroFramePending=false;return;}
            if(prefersReducedMotion.matches){
                hero.style.setProperty('--hero-parallax-y','0px');
                hero.style.setProperty('--hero-content-shift','0px');
                hero.style.setProperty('--hero-glint-x','0px');
                hero.style.setProperty('--hero-glint-y','0px');
                heroFramePending=false;
                return;
            }
            const rect=hero.getBoundingClientRect();
            const viewport=Math.max(window.innerHeight,1);
            const progress=Math.max(-1,Math.min(1,((viewport * .5) - rect.top) / (viewport + rect.height)));
            hero.style.setProperty('--hero-parallax-y',`${Math.round(progress * 34)}px`);
            hero.style.setProperty('--hero-content-shift',`${Math.round(progress * -14)}px`);
            hero.style.setProperty('--hero-glint-x',`${Math.round(progress * 18)}px`);
            hero.style.setProperty('--hero-glint-y',`${Math.round(progress * -6)}px`);
            heroFramePending=false;
        }
        function requestHeroParallax(){
            if(heroFramePending)return;
            heroFramePending=true;
            requestAnimationFrame(updateHeroParallax);
        }
        window.addEventListener('scroll',requestHeroParallax,{passive:true});
        window.addEventListener('resize',requestHeroParallax);
        if(prefersReducedMotion.addEventListener){
            prefersReducedMotion.addEventListener('change',requestHeroParallax);
        }
        requestHeroParallax();

        // ===== REVIEWS CAROUSEL =====
        const track = document.getElementById('reviewsTrack');
        const slides = track ? track.querySelectorAll('.review-slide') : [];
        const trackerEl = document.getElementById('carouselTracker');
        const progressEl = document.getElementById('carouselProgress');
        const currentEl = document.getElementById('carouselCurrent');
        const totalEl = document.getElementById('carouselTotal');
        let currentSlide = 0;
        let slidesPerView = 3;
        let autoTimer = null;
        let hoverPaused = false;
        let focusPaused = false;
        const AUTO_DELAY = 5800;
        document.documentElement.style.setProperty('--reviews-auto-delay', AUTO_DELAY + 'ms');

        function getPerView() {
            if (window.innerWidth <= 768) return 1;
            if (window.innerWidth <= 1024) return 2;
            return 3;
        }

        function getTotalPages() {
            return Math.max(1, slides.length - slidesPerView + 1);
        }

        function buildTracker() {
            if (!trackerEl) return;
            trackerEl.innerHTML = '';
            const pages = getTotalPages();
            for (let i = 0; i < pages; i++) {
                const dot = document.createElement('div');
                dot.className = 'tracker-dot' + (i === currentSlide ? ' active' : '');
                dot.onclick = () => goToSlide(i, true);
                trackerEl.appendChild(dot);
            }
            if (totalEl) totalEl.textContent = pages;
        }

        function restartProgress() {
            if (!progressEl) return;
            progressEl.classList.remove('running');
            void progressEl.offsetWidth;
            progressEl.classList.add('running');
        }

        function clearReviewsAuto() {
            if (autoTimer) {
                clearTimeout(autoTimer);
                autoTimer = null;
            }
        }

        function queueReviewsAuto() {
            clearReviewsAuto();
            if (document.hidden || hoverPaused || focusPaused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
            restartProgress();
            autoTimer = window.setTimeout(() => {
                goToSlide(currentSlide + 1);
                queueReviewsAuto();
            }, AUTO_DELAY);
        }

        function goToSlide(idx, userInitiated = false) {
            const pages = getTotalPages();
            currentSlide = ((idx % pages) + pages) % pages;
            const pct = (currentSlide / slidesPerView) * 100;
            if (track) track.style.transform = 'translate3d(-' + pct + '%, 0, 0)';
            if (trackerEl) {
                trackerEl.querySelectorAll('.tracker-dot').forEach((d, i) => {
                    d.classList.toggle('active', i === currentSlide);
                });
            }
            if (currentEl) currentEl.textContent = currentSlide + 1;
            slides.forEach((s, i) => {
                const card = s.querySelector('.review-card');
                if (card) card.classList.toggle('active', i >= currentSlide && i < currentSlide + slidesPerView);
            });
            if (userInitiated) queueReviewsAuto();
        }

        function carouselNext() { goToSlide(currentSlide + 1, true); }
        function carouselPrev() { goToSlide(currentSlide - 1, true); }

        function initCarousel() {
            slidesPerView = getPerView();
            slides.forEach(s => s.style.minWidth = (100 / slidesPerView) + '%');
            buildTracker();
            goToSlide(0);
            queueReviewsAuto();
        }

        if (track) {
            initCarousel();
            window.addEventListener('resize', () => {
                const newPV = getPerView();
                if (newPV !== slidesPerView) { slidesPerView = newPV; initCarousel(); }
            });
            const wrap = document.querySelector('.reviews-carousel-wrap');
            if (wrap) {
                wrap.addEventListener('mouseenter', () => { hoverPaused = true; clearReviewsAuto(); });
                wrap.addEventListener('mouseleave', () => { hoverPaused = false; queueReviewsAuto(); });
                wrap.addEventListener('focusin', () => { focusPaused = true; clearReviewsAuto(); });
                wrap.addEventListener('focusout', (event) => {
                    if (wrap.contains(event.relatedTarget)) return;
                    focusPaused = false;
                    queueReviewsAuto();
                });
            }
            document.addEventListener('visibilitychange', queueReviewsAuto);
            let touchX = 0;
            track.addEventListener('touchstart', e => {
                touchX = e.touches[0].clientX;
                hoverPaused = true;
                clearReviewsAuto();
            }, {passive:true});
            track.addEventListener('touchend', e => {
                const diff = touchX - e.changedTouches[0].clientX;
                if (Math.abs(diff) > 50) {
                    diff > 0 ? goToSlide(currentSlide + 1) : goToSlide(currentSlide - 1);
                }
                hoverPaused = false;
                queueReviewsAuto();
            }, {passive:true});
        }
        // ===== ABOUT REVIEW CAROUSEL =====
        (function() {
            const carousel = document.getElementById('aboutCarousel');
            const track = document.getElementById('aboutCarouselTrack');
            const dotsWrap = document.getElementById('aboutCarouselDots');
            const prevBtn = document.getElementById('aboutPrev');
            const nextBtn = document.getElementById('aboutNext');
            const statusEl = document.getElementById('aboutCarouselStatus');
            if (!carousel || !track || !dotsWrap || !prevBtn || !nextBtn) return;

            const slides = Array.from(track.querySelectorAll('.about-carousel-slide'));
            const total = slides.length;
            const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
            const AUTO_DELAY = 6200;
            let current = 0;
            let autoTimer = null;
            let hoverPaused = false;
            let focusPaused = false;

            slides.forEach((slide, i) => {
                const dot = document.createElement('button');
                dot.type = 'button';
                dot.className = 'about-carousel-dot' + (i === 0 ? ' active' : '');
                dot.setAttribute('role', 'tab');
                dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
                dot.setAttribute('aria-label', 'Rezension ' + (i + 1) + ' anzeigen');
                dot.tabIndex = i === 0 ? 0 : -1;
                dot.addEventListener('click', () => {
                    goTo(i, true);
                });
                dotsWrap.appendChild(dot);
                slide.setAttribute('aria-hidden', i === 0 ? 'false' : 'true');
            });

            function updateStatus() {
                if (statusEl) statusEl.textContent = 'Rezension ' + (current + 1) + ' von ' + total;
            }

            function render() {
                track.style.transform = 'translate3d(-' + (current * 100) + '%, 0, 0)';
                const dots = dotsWrap.querySelectorAll('.about-carousel-dot');
                dots.forEach((dot, i) => {
                    const active = i === current;
                    dot.classList.toggle('active', active);
                    dot.setAttribute('aria-selected', active ? 'true' : 'false');
                    dot.tabIndex = active ? 0 : -1;
                });
                slides.forEach((slide, i) => slide.setAttribute('aria-hidden', i === current ? 'false' : 'true'));
                updateStatus();
            }

            function goTo(index, userInitiated = false) {
                current = (index + total) % total;
                render();
                if (userInitiated) queueAuto();
            }

            function clearAuto() {
                if (autoTimer) {
                    clearTimeout(autoTimer);
                    autoTimer = null;
                }
            }

            function queueAuto() {
                clearAuto();
                if (reduceMotionQuery.matches || hoverPaused || focusPaused || document.hidden) return;
                autoTimer = window.setTimeout(() => {
                    goTo(current + 1);
                    queueAuto();
                }, AUTO_DELAY);
            }

            prevBtn.addEventListener('click', () => { goTo(current - 1, true); });
            nextBtn.addEventListener('click', () => { goTo(current + 1, true); });

            carousel.addEventListener('mouseenter', () => { hoverPaused = true; clearAuto(); });
            carousel.addEventListener('mouseleave', () => { hoverPaused = false; queueAuto(); });
            carousel.addEventListener('focusin', () => { focusPaused = true; clearAuto(); });
            carousel.addEventListener('focusout', (event) => {
                if (carousel.contains(event.relatedTarget)) return;
                focusPaused = false;
                queueAuto();
            });
            document.addEventListener('visibilitychange', queueAuto);

            const motionHandler = () => {
                if (reduceMotionQuery.matches) {
                    clearAuto();
                    return;
                }
                queueAuto();
            };

            if (typeof reduceMotionQuery.addEventListener === 'function') {
                reduceMotionQuery.addEventListener('change', motionHandler);
            } else if (typeof reduceMotionQuery.addListener === 'function') {
                reduceMotionQuery.addListener(motionHandler);
            }

            let startX = 0;
            let dragging = false;
            track.addEventListener('touchstart', (event) => {
                startX = event.touches[0].clientX;
                dragging = true;
                hoverPaused = true;
                clearAuto();
            }, { passive: true });

            track.addEventListener('touchend', (event) => {
                if (!dragging) return;
                dragging = false;
                const diff = startX - event.changedTouches[0].clientX;
                if (Math.abs(diff) > 40) goTo(current + (diff > 0 ? 1 : -1));
                hoverPaused = false;
                queueAuto();
            }, { passive: true });

            goTo(0);
            queueAuto();
        })();

        // ===== INLINE ORDERING SYSTEM =====
        (function(){
            const menuSection = document.getElementById('speisekarte');
            const orderSuite = document.getElementById('bestellen');
            if (!menuSection || !orderSuite) return;

            const currency = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' });
            const cart = new Map();
            const lineQtyMap = new Map();

            const modeWrap = document.getElementById('quickOrderMode');
            const modeButtons = modeWrap ? Array.from(modeWrap.querySelectorAll('.quick-mode-btn')) : [];
            const inlineCount = document.getElementById('quickInlineCount');
            const inlineTotal = document.getElementById('quickInlineTotal');
            const inlineCheckout = document.getElementById('quickCheckoutBtn');
            const openQuickCartBtn = document.getElementById('openQuickCartBtn');

            const overlay = document.createElement('div');
            overlay.className = 'quick-cart-overlay';
            overlay.hidden = true;
            document.body.appendChild(overlay);

            const drawer = document.createElement('div');
            drawer.className = 'quick-cart-drawer';
            drawer.id = 'quickCartDrawer';
            drawer.hidden = true;
            drawer.innerHTML = `
              <div class="quick-cart-panel" role="dialog" aria-modal="true" aria-labelledby="quickCartTitle">
                <div class="quick-cart-head">
                  <div>
                    <div class="section-label">Warenkorb</div>
                    <h3 id="quickCartTitle">Schnell zur Kasse</h3>
                    <p id="quickCartModeText">Abholung öffnet den offiziellen Shop.</p>
                    <div class="quick-cart-mode-toggle quick-order-mode" id="quickDrawerMode" role="radiogroup" aria-label="Bestellart im Warenkorb">
                      <button type="button" class="quick-mode-btn active" data-mode="pickup" aria-pressed="true">Abholung</button>
                      <button type="button" class="quick-mode-btn" data-mode="delivery" aria-pressed="false">Lieferung</button>
                    </div>
                  </div>
                  <button type="button" class="quick-cart-close" aria-label="Warenkorb schließen">×</button>
                </div>
                <div class="quick-cart-body">
                  <div class="quick-cart-items" id="quickCartItems"></div>
                  <div class="quick-cart-meta">
                    <div class="quick-cart-fields">
                      <div class="quick-cart-fields-row">
                        <div class="quick-cart-field">
                          <label for="quickOrderName">Name</label>
                          <input id="quickOrderName" type="text" autocomplete="name" placeholder="Vor- und Nachname">
                        </div>
                        <div class="quick-cart-field">
                          <label for="quickOrderPhone">Telefon</label>
                          <input id="quickOrderPhone" type="tel" autocomplete="tel" inputmode="tel" placeholder="z. B. 0176 12345678">
                        </div>
                      </div>
                      <div class="quick-cart-address" id="quickCartAddress" hidden>
                        <div class="quick-cart-field">
                          <label for="quickOrderStreet">Lieferadresse</label>
                          <input id="quickOrderStreet" type="text" autocomplete="street-address" placeholder="Straße & Hausnummer, PLZ, Ort">
                        </div>
                      </div>
                      <div class="quick-cart-field">
                        <label for="quickOrderNotes">Notiz</label>
                        <textarea id="quickOrderNotes" placeholder="Optional: ohne Zwiebeln, extra scharf, Klingelhinweis"></textarea>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="quick-cart-footer">
                  <div class="quick-cart-total">
                    <div>
                      <span>Gesamt</span>
                      <strong id="quickCartTotal">0,00 €</strong>
                    </div>
                    <div class="quick-cart-chip">
                      <strong id="quickCartCount">0 Artikel</strong>
                      <span id="quickCartFeeText">Abholung</span>
                    </div>
                  </div>
                  <div class="quick-cart-helper" id="quickCartHelper">Checkout öffnet den offiziellen Bestellweg.</div>
                  <div class="quick-cart-actions">
                    <button type="button" class="quick-cart-copy" id="quickCartCopyBtn">Bestellung kopieren</button>
                    <a class="quick-cart-pay is-disabled" id="quickCartCheckoutBtn" href="https://changthai.koeln/shop/" rel="noopener" target="_blank" aria-disabled="true">Jetzt zahlen</a>
                  </div>
                </div>
              </div>
            `;
            document.body.appendChild(drawer);

            const cartBar = document.createElement('div');
            cartBar.className = 'quick-cart-bar';
            cartBar.id = 'quickCartBar';
            cartBar.hidden = true;
            cartBar.innerHTML = `
              <div class="quick-cart-chip">
                <strong id="quickBarCount">0 Artikel</strong>
                <span id="quickBarMode">Abholung</span>
              </div>
              <div class="quick-cart-chip">
                <strong id="quickBarTotal">0,00 €</strong>
                <span>Gesamt</span>
              </div>
              <div class="quick-cart-spacer"></div>
              <button type="button" class="quick-cart-bar-btn" id="quickBarOpenBtn">Warenkorb</button>
              <a class="quick-cart-bar-link is-disabled" id="quickBarCheckoutBtn" href="https://changthai.koeln/shop/" rel="noopener" target="_blank" aria-disabled="true">Zur Kasse</a>
            `;
            document.body.appendChild(cartBar);

            const cartItemsEl = drawer.querySelector('#quickCartItems');
            const drawerModeWrap = drawer.querySelector('#quickDrawerMode');
            const drawerModeButtons = drawerModeWrap ? Array.from(drawerModeWrap.querySelectorAll('.quick-mode-btn')) : [];
            const cartModeText = drawer.querySelector('#quickCartModeText');
            const cartAddress = drawer.querySelector('#quickCartAddress');
            const quickOrderName = drawer.querySelector('#quickOrderName');
            const quickOrderPhone = drawer.querySelector('#quickOrderPhone');
            const quickOrderStreet = drawer.querySelector('#quickOrderStreet');
            const quickOrderNotes = drawer.querySelector('#quickOrderNotes');
            const quickCartTotal = drawer.querySelector('#quickCartTotal');
            const quickCartCount = drawer.querySelector('#quickCartCount');
            const quickCartFeeText = drawer.querySelector('#quickCartFeeText');
            const quickCartHelper = drawer.querySelector('#quickCartHelper');
            const quickCartCopyBtn = drawer.querySelector('#quickCartCopyBtn');
            const quickCartCheckoutBtn = drawer.querySelector('#quickCartCheckoutBtn');
            const quickBarCount = cartBar.querySelector('#quickBarCount');
            const quickBarMode = cartBar.querySelector('#quickBarMode');
            const quickBarTotal = cartBar.querySelector('#quickBarTotal');
            const quickBarOpenBtn = cartBar.querySelector('#quickBarOpenBtn');
            const quickBarCheckoutBtn = cartBar.querySelector('#quickBarCheckoutBtn');
            const liveRegion = document.createElement('div');
            liveRegion.className = 'quick-cart-live';
            liveRegion.setAttribute('aria-live', 'polite');
            document.body.appendChild(liveRegion);

            function getMode(){
                const active = modeWrap ? modeWrap.querySelector('.quick-mode-btn.active') : null;
                return active ? active.dataset.mode : 'pickup';
            }

            function syncModeButtons(mode){
                [...modeButtons, ...drawerModeButtons].forEach(btn => {
                    const active = btn.dataset.mode === mode;
                    btn.classList.toggle('active', active);
                    btn.setAttribute('aria-pressed', String(active));
                });
            }

            function setMode(mode){
                syncModeButtons(mode);
                render();
            }

            function parsePrice(value){
                const normalized = value.replace(/\./g,'').replace(',', '.').replace(/[^\d.]/g,'');
                return Number.parseFloat(normalized || '0');
            }

            function getCategoryLabel(item){
                const category = item.closest('.menu-category');
                const title = category ? category.querySelector('.menu-cat-title') : null;
                return title ? title.textContent.trim() : 'Speisekarte';
            }

            function announce(text){
                liveRegion.textContent = text;
            }

            function openDrawer(){
                overlay.hidden = false;
                drawer.hidden = false;
                document.body.classList.add('has-quick-cart');
            }

            function closeDrawer(){
                overlay.hidden = true;
                drawer.hidden = true;
                if (cart.size === 0) document.body.classList.remove('has-quick-cart');
            }

            function getCheckoutUrl(){
                return getMode() === 'delivery' ? 'https://changthai.koeln/lieferservice/' : 'https://changthai.koeln/shop/';
            }

            function getModeCopy(){
                return getMode() === 'delivery'
                    ? { title: 'Lieferung', helper: 'Lieferung öffnet den offiziellen Lieferservice.', fee: 'Online ab 10 €', cta: 'Jetzt Lieferung zahlen' }
                    : { title: 'Abholung', helper: 'Abholung öffnet den offiziellen Shop.', fee: 'Abholung', cta: 'Jetzt Abholung zahlen' };
            }

            function getTotals(){
                const subtotal = Array.from(cart.values()).reduce((sum, item) => sum + (item.price * item.qty), 0);
                const itemCount = Array.from(cart.values()).reduce((sum, item) => sum + item.qty, 0);
                return { subtotal, itemCount };
            }

            function setCheckoutState(link, disabled, text){
                link.classList.toggle('is-disabled', disabled);
                link.setAttribute('aria-disabled', String(disabled));
                link.textContent = text;
                if (disabled) link.setAttribute('tabindex', '-1');
                else link.removeAttribute('tabindex');
                link.href = getCheckoutUrl();
            }

            function summaryText(){
                const modeCopy = getModeCopy();
                const lines = [`Bestellart: ${modeCopy.title}`];
                if (quickOrderName.value.trim()) lines.push(`Name: ${quickOrderName.value.trim()}`);
                if (quickOrderPhone.value.trim()) lines.push(`Telefon: ${quickOrderPhone.value.trim()}`);
                if (getMode() === 'delivery' && quickOrderStreet.value.trim()) lines.push(`Lieferadresse: ${quickOrderStreet.value.trim()}`);
                if (quickOrderNotes.value.trim()) lines.push(`Notiz: ${quickOrderNotes.value.trim()}`);
                lines.push('');
                if (!cart.size) {
                    lines.push('Noch keine Gerichte im Warenkorb.');
                } else {
                    lines.push('Gerichte:');
                    Array.from(cart.values()).forEach(item => {
                        lines.push(`- ${item.qty}× ${item.number} ${item.name} — ${currency.format(item.price * item.qty)}`);
                    });
                }
                lines.push('');
                lines.push(`Gesamt: ${currency.format(getTotals().subtotal)}`);
                lines.push(`Checkout: ${getCheckoutUrl()}`);
                return lines.join('\n');
            }

            async function copySummary(){
                const text = summaryText();
                try {
                    await navigator.clipboard.writeText(text);
                    quickCartCopyBtn.textContent = 'Kopiert';
                    announce('Die Bestellung wurde in die Zwischenablage kopiert.');
                    window.setTimeout(() => { quickCartCopyBtn.textContent = 'Bestellung kopieren'; }, 1800);
                } catch (error) {
                    announce('Die Bestellung konnte nicht automatisch kopiert werden.');
                }
            }

            function updateModeUI(){
                const modeCopy = getModeCopy();
                syncModeButtons(getMode());
                cartAddress.hidden = getMode() !== 'delivery';
                cartModeText.textContent = modeCopy.helper;
                quickCartFeeText.textContent = modeCopy.fee;
                quickBarMode.textContent = modeCopy.title;
                quickCartHelper.textContent = 'Bezahlung läuft im offiziellen Bestellweg.';
            }

            function renderCartItems(){
                cartItemsEl.innerHTML = '';
                if (!cart.size) {
                    cartItemsEl.innerHTML = '<div class="quick-cart-empty">Noch nichts im Warenkorb. Wähle direkt in der Speisekarte Menge und Gericht aus.</div>';
                    return;
                }
                Array.from(cart.values()).forEach(item => {
                    const row = document.createElement('div');
                    row.className = 'quick-cart-item';
                    row.innerHTML = `
                      <div>
                        <strong>${item.qty}× ${item.name}</strong>
                        <span>Nr. ${item.number} · ${item.category}</span>
                      </div>
                      <div class="quick-cart-item-side">
                        <div class="quick-cart-item-price">${currency.format(item.price * item.qty)}</div>
                        <div class="quick-cart-item-controls">
                          <button type="button" aria-label="Menge verringern">−</button>
                          <button type="button" aria-label="Menge erhöhen">+</button>
                          <button type="button" aria-label="Gericht entfernen">×</button>
                        </div>
                      </div>
                    `;
                    const buttons = row.querySelectorAll('button');
                    buttons[0].addEventListener('click', () => {
                        if (item.qty <= 1) cart.delete(item.id);
                        else item.qty -= 1;
                        render();
                    });
                    buttons[1].addEventListener('click', () => {
                        item.qty += 1;
                        render();
                    });
                    buttons[2].addEventListener('click', () => {
                        cart.delete(item.id);
                        render();
                        announce(`${item.name} wurde aus dem Warenkorb entfernt.`);
                    });
                    cartItemsEl.appendChild(row);
                });
            }

            function render(){
                updateModeUI();
                const totals = getTotals();
                if (inlineCount) inlineCount.textContent = String(totals.itemCount);
                if (inlineTotal) inlineTotal.textContent = currency.format(totals.subtotal);
                quickCartTotal.textContent = currency.format(totals.subtotal);
                quickCartCount.textContent = `${totals.itemCount} Artikel`;
                quickBarCount.textContent = `${totals.itemCount} Artikel`;
                quickBarTotal.textContent = currency.format(totals.subtotal);
                const modeCopy = getModeCopy();
                const disabled = totals.itemCount === 0;
                setCheckoutState(inlineCheckout, disabled, disabled ? 'Zur Kasse' : modeCopy.cta);
                setCheckoutState(quickCartCheckoutBtn, disabled, disabled ? 'Jetzt zahlen' : modeCopy.cta);
                setCheckoutState(quickBarCheckoutBtn, disabled, 'Zur Kasse');
                cartBar.hidden = disabled;
                document.body.classList.toggle('has-quick-cart', !disabled || !overlay.hidden);
                renderCartItems();
            }

            function attachCheckoutLink(link){
                link.addEventListener('click', async (event) => {
                    if (link.classList.contains('is-disabled')) {
                        event.preventDefault();
                        return;
                    }
                    try {
                        await navigator.clipboard.writeText(summaryText());
                        announce('Bestellung kopiert und offizieller Checkout geöffnet.');
                    } catch (error) {
                        announce('Offizieller Checkout wird geöffnet.');
                    }
                });
            }

            function setupMenuItems(){
                menuSection.querySelectorAll('.menu-item').forEach((item, index) => {
                    const info = item.querySelector('.menu-item-info');
                    const nameEl = item.querySelector('.menu-item-name');
                    const numEl = item.querySelector('.menu-item-num');
                    const thaiEl = item.querySelector('.menu-item-thai');
                    const priceEl = item.querySelector('.menu-item-price');
                    const descEl = item.querySelector('.menu-item-desc');
                    if (!info || !nameEl || !priceEl || item.querySelector('.menu-item-orderbar')) return;
                    const number = numEl ? numEl.textContent.trim() : String(index + 1).padStart(2, '0');
                    const rawName = nameEl.cloneNode(true);
                    rawName.querySelectorAll('.menu-item-num').forEach(el => el.remove());
                    const name = rawName.textContent.trim();
                    const thaiName = thaiEl ? thaiEl.textContent.trim() : '';
                    const desc = descEl ? descEl.textContent.trim() : '';
                    const price = parsePrice(priceEl.textContent);
                    const category = getCategoryLabel(item);
                    const id = `menu-${number}-${name.toLowerCase().replace(/[^a-z0-9]+/gi,'-').replace(/^-|-$/g,'')}`;
                    const bar = document.createElement('div');
                    bar.className = 'menu-item-orderbar';
                    bar.innerHTML = `
                        <div class="menu-order-controls">
                            <div class="menu-qty" aria-label="Menge für ${name}">
                                <button type="button" class="menu-qty-dec" aria-label="Menge für ${name} verringern">−</button>
                                <output aria-live="polite">1</output>
                                <button type="button" class="menu-qty-inc" aria-label="Menge für ${name} erhöhen">+</button>
                            </div>
                            <button type="button" class="menu-add-btn">+ Warenkorb</button>
                        </div>
                    `;
                    item.appendChild(bar);
                    const output = bar.querySelector('output');
                    lineQtyMap.set(id, 1);
                    bar.querySelector('.menu-qty-dec').addEventListener('click', () => {
                        const next = Math.max(1, (lineQtyMap.get(id) || 1) - 1);
                        lineQtyMap.set(id, next);
                        output.textContent = String(next);
                    });
                    bar.querySelector('.menu-qty-inc').addEventListener('click', () => {
                        const next = Math.min(20, (lineQtyMap.get(id) || 1) + 1);
                        lineQtyMap.set(id, next);
                        output.textContent = String(next);
                    });
                    bar.querySelector('.menu-add-btn').addEventListener('click', () => {
                        const qty = lineQtyMap.get(id) || 1;
                        const current = cart.get(id);
                        const payload = { id, number, name, thaiName, desc, category, price, qty };
                        if (current) payload.qty = current.qty + qty;
                        cart.set(id, payload);
                        lineQtyMap.set(id, 1);
                        output.textContent = '1';
                        render();
                        openDrawer();
                        announce(`${name} wurde ${qty}× zum Warenkorb hinzugefügt.`);
                    });
                });
            }

            [...modeButtons, ...drawerModeButtons].forEach(btn => {
                btn.addEventListener('click', () => setMode(btn.dataset.mode));
            });
            if (openQuickCartBtn) openQuickCartBtn.addEventListener('click', openDrawer);
            quickBarOpenBtn.addEventListener('click', openDrawer);
            drawer.querySelector('.quick-cart-close').addEventListener('click', closeDrawer);
            overlay.addEventListener('click', closeDrawer);
            document.addEventListener('keydown', (event) => {
                if (event.key === 'Escape' && !drawer.hidden) closeDrawer();
            });
            [quickOrderName, quickOrderPhone, quickOrderStreet, quickOrderNotes].forEach(el => {
                if (!el) return;
                el.addEventListener('input', render);
                el.addEventListener('change', render);
            });
            quickCartCopyBtn.addEventListener('click', copySummary);
            if (inlineCheckout) attachCheckoutLink(inlineCheckout);
            attachCheckoutLink(quickCartCheckoutBtn);
            attachCheckoutLink(quickBarCheckoutBtn);
            setupMenuItems();
            render();
        })();


        // ===== MENU TABS =====
        document.querySelectorAll('.speisekarte-tab').forEach(tab => {
            tab.addEventListener('click', function() {
                document.querySelectorAll('.speisekarte-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.menu-category').forEach(c => c.classList.remove('active'));
                this.classList.add('active');
                const cat = this.getAttribute('data-cat');
                const target = document.getElementById('cat-' + cat);
                if (target) target.classList.add('active');
            });
        });

        // ===== NAV SCROLL =====
        const navbar = document.getElementById('navbar');
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });

        // ===== HAMBURGER MENU =====
        function toggleMenu() {
            const navLinks = document.getElementById('navLinks');
            navLinks.classList.toggle('open');
        }
        function closeMenu() {
            const navLinks = document.getElementById('navLinks');
            navLinks.classList.remove('open');
        }

        // ===== REVEAL ON SCROLL =====
        const revealEls = document.querySelectorAll('.reveal');
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });
        revealEls.forEach(el => revealObserver.observe(el));


// ===== SCRIPT BLOCK 2: id="mobile-usability-script" =====
(function(){
    const media = window.matchMedia('(max-width: 768px)');
    const body = document.body;
    const navLinks = document.getElementById('navLinks');
    const burger = document.getElementById('navToggle') || document.querySelector('.hamburger');
    const navbar = document.getElementById('navbar');
    if(!navLinks || !burger || !navbar){ return; }

    let backdrop = document.querySelector('.mobile-nav-backdrop');
    if(!backdrop){
        backdrop = document.createElement('div');
        backdrop.className = 'mobile-nav-backdrop';
        backdrop.setAttribute('aria-hidden', 'true');
        document.body.appendChild(backdrop);
    }

    function isMobile(){
        return media.matches;
    }

    function syncMenuState(open){
        const shouldOpen = !!open && isMobile();
        navLinks.classList.toggle('open', shouldOpen);
        body.classList.toggle('menu-open', shouldOpen);
        burger.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');
        burger.setAttribute('aria-label', shouldOpen ? 'Menü schließen' : 'Menü öffnen');
        burger.setAttribute('title', shouldOpen ? 'Menü schließen' : 'Menü öffnen');
        navLinks.setAttribute('aria-hidden', shouldOpen ? 'false' : 'true');
    }

    window.toggleMenu = function(event){
        if(event){
            event.preventDefault();
            event.stopPropagation();
        }
        syncMenuState(!navLinks.classList.contains('open'));
    };

    window.closeMenu = function(){
        syncMenuState(false);
    };

    burger.addEventListener('click', window.toggleMenu, {passive:false});

    backdrop.addEventListener('click', function(){
        window.closeMenu();
    });

    document.addEventListener('keydown', function(event){
        if(event.key === 'Escape'){
            window.closeMenu();
        }
    });

    navLinks.querySelectorAll('a').forEach(function(link){
        link.addEventListener('click', function(){
            window.closeMenu();
        }, {passive:true});
    });

    media.addEventListener('change', function(event){
        if(!event.matches){
            window.closeMenu();
        } else {
            syncMenuState(navLinks.classList.contains('open'));
        }
    });

    window.addEventListener('resize', function(){
        if(!isMobile()){
            window.closeMenu();
        }
    }, {passive:true});

    window.addEventListener('orientationchange', function(){
        setTimeout(function(){
            if(!isMobile()){
                window.closeMenu();
            } else {
                syncMenuState(navLinks.classList.contains('open'));
            }
        }, 120);
    });

    const observer = new MutationObserver(function(){
        if(!isMobile() && navLinks.classList.contains('open')){
            window.closeMenu();
        }
    });
    observer.observe(document.body, {attributes:true, attributeFilter:['class']});

    syncMenuState(false);
})();
