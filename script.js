// Results figures count up from zero the first time they scroll into view,
// each benchmark scale draws its black rule alongside, and the Selected work
// routes draw in stop by stop. Without JS, or with reduced motion, everything
// simply shows as written.
(function () {
    var figures = document.querySelectorAll('.figure');
    if (!('IntersectionObserver' in window)) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    document.documentElement.classList.add('animate');

    function countUp(el) {
        var text = el.textContent;
        // Animate every run of digits in place ("2–3×", "+299%", "2M+")
        var parts = text.split(/(\d+)/);
        var duration = 1600;
        var start = null;

        function frame(ts) {
            if (start === null) start = ts;
            var p = Math.min((ts - start) / duration, 1);
            var eased = 1 - Math.pow(1 - p, 4);
            el.textContent = parts.map(function (part) {
                return /^\d+$/.test(part) ? String(Math.round(parseInt(part, 10) * eased)) : part;
            }).join('');
            if (p < 1) requestAnimationFrame(frame);
        }

        requestAnimationFrame(frame);
    }

    var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
            if (!e.isIntersecting) return;
            e.target.classList.add('in');
            var big = e.target.querySelector('.big');
            if (big) countUp(big);
            io.unobserve(e.target);
        });
    }, { threshold: 0.4 });

    figures.forEach(function (f) { io.observe(f); });
    document.querySelectorAll('.case').forEach(function (c) { io.observe(c); });
})();
