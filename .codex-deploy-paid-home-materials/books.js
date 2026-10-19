(function () {
    const searchForm = document.getElementById('bookSearchForm');
    const searchInput = document.getElementById('bookSearch');
    const cards = Array.from(document.querySelectorAll('.book-card'));
    const chips = Array.from(document.querySelectorAll('.filter-chip'));
    const status = document.getElementById('resultsStatus');
    const emptyState = document.getElementById('emptyState');
    const menuButton = document.querySelector('.library-menu-button');
    const nav = document.getElementById('libraryNav');
    const topButton = document.querySelector('.library-top');
    let activeCategory = 'all';

    function updateBooks() {
        const query = (searchInput?.value || '').trim().toLocaleLowerCase('zh-CN');
        let visibleCount = 0;

        cards.forEach((card) => {
            const categories = card.dataset.category || '';
            const haystack = (card.dataset.search || '').toLocaleLowerCase('zh-CN');
            const matchesCategory = activeCategory === 'all' || categories.includes(activeCategory);
            const matchesQuery = !query || haystack.includes(query);
            const visible = matchesCategory && matchesQuery;
            card.hidden = !visible;
            if (visible) visibleCount += 1;
        });

        if (status) status.textContent = query ? `找到 ${visibleCount} 本相关书籍` : `显示 ${visibleCount} 本书`;
        if (emptyState) emptyState.hidden = visibleCount !== 0;
    }

    chips.forEach((chip) => {
        chip.addEventListener('click', () => {
            activeCategory = chip.dataset.filter || 'all';
            chips.forEach((item) => {
                const selected = item === chip;
                item.classList.toggle('active', selected);
                item.setAttribute('aria-pressed', String(selected));
            });
            updateBooks();
        });
    });

    searchForm?.addEventListener('submit', (event) => {
        event.preventDefault();
        updateBooks();
        document.getElementById('books')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    searchInput?.addEventListener('input', updateBooks);

    menuButton?.addEventListener('click', () => {
        const open = nav?.classList.toggle('open') || false;
        menuButton.setAttribute('aria-expanded', String(open));
    });
    nav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
        nav.classList.remove('open');
        menuButton?.setAttribute('aria-expanded', 'false');
    }));

    window.addEventListener('scroll', () => topButton?.classList.toggle('show', window.scrollY > 500), { passive: true });
    topButton?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();
