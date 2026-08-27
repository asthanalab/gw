(() => {
    const initializeNews = () => {
        const page = document.querySelector('.news-page');
        if (!page) return;

        const categoryMap = {
            paper: ['research', 'Research'],
            talk: ['talks', 'Talks & conferences'],
            talks: ['talks', 'Talks & conferences'],
            conference: ['talks', 'Talks & conferences'],
            training: ['talks', 'Talks & conferences'],
            award: ['awards', 'Awards & funding'],
            funding: ['awards', 'Awards & funding'],
            resources: ['awards', 'Awards & funding'],
            people: ['people', 'People'],
            milestone: ['people', 'People'],
            visitor: ['group', 'Group activities'],
            visitors: ['group', 'Group activities']
        };

        const cards = Array.from(page.querySelectorAll('.news-card'));
        cards.forEach((card) => {
            const label = card.querySelector('.news-label');
            const originalLabel = label?.textContent.trim().toLowerCase();
            const [category, normalizedLabel] = categoryMap[originalLabel] || ['group', 'Group activities'];
            card.dataset.newsCategory = category;
            if (label) label.textContent = normalizedLabel;
        });

        const controls = page.querySelector('[data-news-controls]');
        const buttons = Array.from(page.querySelectorAll('[data-news-filter]'));
        const archiveYears = Array.from(page.querySelectorAll('.news-archive-year'));
        const archive = page.querySelector('.news-archive');
        const latest = page.querySelector('.news-latest');
        const status = page.querySelector('[data-news-filter-status]');

        if (controls) controls.hidden = false;

        const applyFilter = (filter) => {
            let visibleCount = 0;

            cards.forEach((card) => {
                const isVisible = filter === 'all' || card.dataset.newsCategory === filter;
                card.hidden = !isVisible;
                if (isVisible) visibleCount += 1;
            });

            archiveYears.forEach((year) => {
                const hasVisibleCards = Array.from(year.querySelectorAll('.news-card')).some((card) => !card.hidden);
                year.hidden = !hasVisibleCards;
                year.open = filter === 'all' ? false : hasVisibleCards;
            });

            if (latest) {
                latest.hidden = !Array.from(latest.querySelectorAll('.news-card')).some((card) => !card.hidden);
            }

            if (archive) {
                archive.hidden = !archiveYears.some((year) => !year.hidden);
            }

            buttons.forEach((button) => {
                const isActive = button.dataset.newsFilter === filter;
                button.classList.toggle('is-active', isActive);
                button.setAttribute('aria-pressed', String(isActive));
            });

            if (status) {
                status.textContent = filter === 'all'
                    ? `${visibleCount} updates, newest first.`
                    : `${visibleCount} matching update${visibleCount === 1 ? '' : 's'}.`;
            }
        };

        buttons.forEach((button) => {
            button.addEventListener('click', () => applyFilter(button.dataset.newsFilter));
        });

        page.querySelectorAll('[data-news-year-link]').forEach((link) => {
            link.addEventListener('click', () => {
                const target = page.querySelector(link.getAttribute('href'));
                if (target?.tagName === 'DETAILS') target.open = true;
            });
        });

        applyFilter('all');

        const hashTarget = window.location.hash ? page.querySelector(window.location.hash) : null;
        if (hashTarget?.tagName === 'DETAILS') hashTarget.open = true;
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeNews);
    } else {
        initializeNews();
    }
})();
