(() => {
    const normalizeLabel = (label) => {
        const labels = {
            paper: 'Research',
            talk: 'Talks & conferences',
            talks: 'Talks & conferences',
            conference: 'Talks & conferences',
            training: 'Talks & conferences',
            award: 'Awards & funding',
            funding: 'Awards & funding',
            resources: 'Awards & funding',
            people: 'People',
            milestone: 'People',
            visitor: 'Group activities',
            visitors: 'Group activities'
        };

        return labels[label.trim().toLowerCase()] || label;
    };

    const createLatestCard = (sourceCard) => {
        const card = document.createElement('a');
        card.className = 'page-card page-card--link home-latest-card';
        card.href = 'news.html#latest';

        const meta = document.createElement('div');
        meta.className = 'home-latest-meta';

        const tag = document.createElement('span');
        tag.className = 'page-tag';
        tag.textContent = normalizeLabel(sourceCard.querySelector('.news-label')?.textContent || 'News');

        const sourceTime = sourceCard.querySelector('time');
        const time = document.createElement('time');
        time.className = 'home-latest-date';
        time.dateTime = sourceTime?.dateTime || '';
        time.textContent = sourceTime?.textContent.trim() || '';

        const title = document.createElement('h3');
        title.textContent = sourceCard.querySelector('h2')?.textContent.trim() || 'Group update';

        const summary = document.createElement('p');
        summary.textContent = sourceCard.querySelector('p')?.textContent.replace(/\s+/g, ' ').trim() || '';

        meta.append(tag, time);
        card.append(meta, title, summary);
        return card;
    };

    const updateLatestNews = async () => {
        const container = document.querySelector('[data-home-latest]');
        if (!container || window.location.protocol === 'file:') return;

        container.setAttribute('aria-busy', 'true');

        try {
            const response = await fetch('news.html?home-latest=1', { cache: 'no-store' });
            if (!response.ok) throw new Error(`News request failed: ${response.status}`);

            const source = new DOMParser().parseFromString(await response.text(), 'text/html');
            let sourceCards = Array.from(source.querySelectorAll('.news-latest .news-card'));
            if (!sourceCards.length) sourceCards = Array.from(source.querySelectorAll('.news-card'));

            const latestCards = sourceCards.slice(0, 3);
            if (latestCards.length) {
                const fragment = document.createDocumentFragment();
                latestCards.forEach((sourceCard) => fragment.append(createLatestCard(sourceCard)));
                container.replaceChildren(fragment);
            }
        } catch (error) {
            console.warn('Using homepage news fallback.', error);
        } finally {
            container.removeAttribute('aria-busy');
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', updateLatestNews);
    } else {
        updateLatestNews();
    }
})();
