(function () {
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ---------- Scroll reveal + count-up ----------
    // Everything renders fully without JS; this only opts in to the
    // animated version when the browser supports it.
    if ('IntersectionObserver' in window && !reduceMotion) {
        document.documentElement.classList.add('js');

        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (e) {
                if (!e.isIntersecting) return;
                e.target.classList.add('in');
                e.target.querySelectorAll('.count').forEach(countUp);
                io.unobserve(e.target);
            });
        }, { rootMargin: '0px 0px -10% 0px' });

        document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
    }

    function countUp(el) {
        var to = parseFloat(el.dataset.to);
        var decimals = parseInt(el.dataset.decimals || '0', 10);
        var comma = el.dataset.format === 'comma';
        var duration = 1400;
        var start = null;

        function fmt(n) {
            var s = n.toFixed(decimals);
            return comma ? Number(s).toLocaleString('en-US') : s;
        }

        function tick(ts) {
            if (start === null) start = ts;
            var p = Math.min((ts - start) / duration, 1);
            var eased = 1 - Math.pow(1 - p, 3);
            el.textContent = fmt(to * eased);
            if (p < 1) requestAnimationFrame(tick);
        }

        el.textContent = fmt(0);
        requestAnimationFrame(tick);
    }

    // ---------- Playbook tabs (WAI-ARIA tabs pattern) ----------
    var tabs = Array.prototype.slice.call(document.querySelectorAll('[role="tab"]'));

    function select(tab, focus) {
        tabs.forEach(function (t) {
            var on = t === tab;
            t.setAttribute('aria-selected', on);
            t.tabIndex = on ? 0 : -1;
            document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
        });
        // On phones the tab row scrolls sideways; keep the active tab visible
        var row = tab.parentNode;
        row.scrollLeft = tab.offsetLeft - (row.clientWidth - tab.offsetWidth) / 2;
        if (focus) tab.focus();
    }

    tabs.forEach(function (tab, i) {
        tab.addEventListener('click', function () { select(tab); });
        tab.addEventListener('keydown', function (e) {
            var next = null;
            if (e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
            if (e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
            if (e.key === 'Home') next = tabs[0];
            if (e.key === 'End') next = tabs[tabs.length - 1];
            if (next) { e.preventDefault(); select(next, true); }
        });
    });

    // ---------- Nav: border once scrolled, highlight current section ----------
    var nav = document.querySelector('.nav');
    var links = Array.prototype.slice.call(document.querySelectorAll('.nav-links a'));
    var sections = links.map(function (a) { return document.querySelector(a.getAttribute('href')); });

    function onScroll() {
        nav.classList.toggle('scrolled', window.scrollY > 8);
        var y = window.scrollY + window.innerHeight * 0.35;
        var current = -1;
        sections.forEach(function (s, i) { if (s && s.offsetTop <= y) current = i; });
        links.forEach(function (a, i) { a.classList.toggle('active', i === current); });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
})();
