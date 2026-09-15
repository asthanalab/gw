(() => {
    const initializeMenu = () => {
        const wrapper = document.querySelector('.menu-wrap');
        if (!wrapper) return;
        if (wrapper.dataset.menuInitialized === 'true') return;
        wrapper.dataset.menuInitialized = 'true';

        const toggler = wrapper.querySelector('.toggler');
        const menu = wrapper.querySelector('.menu');
        const links = Array.from(wrapper.querySelectorAll('.menu a'));
        if (!toggler || !menu) return;

        let openedAt = 0;
        let lastToggleAt = 0;

        menu.id = menu.id || 'mobile-navigation';
        toggler.setAttribute('aria-controls', menu.id);

        const setOpen = (isOpen, returnFocus = false) => {
            wrapper.classList.toggle('is-open', isOpen);
            toggler.setAttribute('aria-expanded', String(isOpen));
            toggler.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
            menu.setAttribute('aria-hidden', String(!isOpen));
            document.body.classList.toggle('menu-open', isOpen);

            if (!isOpen && returnFocus) toggler.focus();
        };

        toggler.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();

            const now = performance.now();
            if (now - lastToggleAt < 400) return;
            lastToggleAt = now;

            const willOpen = !wrapper.classList.contains('is-open');
            setOpen(willOpen);
            if (willOpen) openedAt = now;
        });

        links.forEach((link) => link.addEventListener('click', (event) => {
            // Some mobile browsers can retarget the opening tap after the panel moves under it.
            if (performance.now() - openedAt < 400) {
                event.preventDefault();
                return;
            }
            setOpen(false);
        }));

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

        const desktopQuery = window.matchMedia('(min-width: 768px)');
        const handleBreakpointChange = (event) => {
            if (event.matches && wrapper.classList.contains('is-open')) setOpen(false);
        };
        if (desktopQuery.addEventListener) {
            desktopQuery.addEventListener('change', handleBreakpointChange);
        } else {
            desktopQuery.addListener(handleBreakpointChange);
        }

        setOpen(false);
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeMenu);
    } else {
        initializeMenu();
    }

    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js?v=99').catch(() => {});
        });
    }
})();
