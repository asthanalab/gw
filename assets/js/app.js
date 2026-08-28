(() => {
    const initializeMenu = () => {
        const wrapper = document.querySelector('.menu-wrap');
        if (!wrapper) return;

        const toggler = wrapper.querySelector('.toggler');
        const menu = wrapper.querySelector('.menu');
        const links = Array.from(wrapper.querySelectorAll('.menu a'));
        if (!toggler || !menu) return;

        menu.id = menu.id || 'mobile-navigation';
        toggler.setAttribute('aria-controls', menu.id);

        const setOpen = (isOpen, returnFocus = false) => {
            wrapper.classList.toggle('is-open', isOpen);
            toggler.setAttribute('aria-expanded', String(isOpen));
            toggler.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
            menu.setAttribute('aria-hidden', String(!isOpen));
            document.body.classList.toggle('menu-open', isOpen);

            if (isOpen && links.length) links[0].focus();
            if (!isOpen && returnFocus) toggler.focus();
        };

        toggler.addEventListener('click', () => setOpen(!wrapper.classList.contains('is-open')));
        links.forEach((link) => link.addEventListener('click', () => setOpen(false)));

        wrapper.addEventListener('keydown', (event) => {
            if (!wrapper.classList.contains('is-open')) return;

            if (event.key === 'Escape') {
                event.preventDefault();
                setOpen(false, true);
                return;
            }

            if (event.key !== 'Tab' || links.length === 0) return;
            const first = links[0];
            const last = links[links.length - 1];
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                toggler.focus();
            } else if (event.shiftKey && document.activeElement === toggler) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === toggler) {
                event.preventDefault();
                first.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                toggler.focus();
            }
        });

        window.addEventListener('resize', () => {
            if (window.innerWidth > 767 && wrapper.classList.contains('is-open')) setOpen(false);
        });

        setOpen(false);
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeMenu);
    } else {
        initializeMenu();
    }

    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js').catch(() => {});
        });
    }
})();
