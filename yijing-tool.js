const trigrams = [
    { key: 'qian', name: '乾', symbol: '☰', nature: '天', lines: [1, 1, 1], quality: '健', family: '父', color: '#315d4c', note: '三爻皆阳，以天为象，基本性质为健。' },
    { key: 'dui', name: '兑', symbol: '☱', nature: '泽', lines: [1, 1, 0], quality: '说', family: '少女', color: '#a87332', note: '上爻为阴、下两爻为阳，以泽为象。' },
    { key: 'li', name: '离', symbol: '☲', nature: '火', lines: [1, 0, 1], quality: '丽', family: '中女', color: '#a84b39', note: '中爻为阴、上下为阳，以火为象。' },
    { key: 'zhen', name: '震', symbol: '☳', nature: '雷', lines: [1, 0, 0], quality: '动', family: '长男', color: '#496f49', note: '初爻为阳、其上两爻为阴，以雷为象。' },
    { key: 'xun', name: '巽', symbol: '☴', nature: '风', lines: [0, 1, 1], quality: '入', family: '长女', color: '#527b67', note: '初爻为阴、其上两爻为阳，以风为象。' },
    { key: 'kan', name: '坎', symbol: '☵', nature: '水', lines: [0, 1, 0], quality: '陷', family: '中男', color: '#3d6076', note: '中爻为阳、上下为阴，以水为象。' },
    { key: 'gen', name: '艮', symbol: '☶', nature: '山', lines: [0, 0, 1], quality: '止', family: '少男', color: '#806b4c', note: '上爻为阳、下两爻为阴，以山为象。' },
    { key: 'kun', name: '坤', symbol: '☷', nature: '地', lines: [0, 0, 0], quality: '顺', family: '母', color: '#765c50', note: '三爻皆阴，以地为象，基本性质为顺。' }
];

const hexagramPairs = [
    ['qian','qian'], ['kun','kun'], ['kan','zhen'], ['gen','kan'], ['kan','qian'], ['qian','kan'], ['kun','kan'], ['kan','kun'],
    ['xun','qian'], ['qian','dui'], ['kun','qian'], ['qian','kun'], ['qian','li'], ['li','qian'], ['kun','gen'], ['zhen','kun'],
    ['dui','zhen'], ['gen','xun'], ['kun','dui'], ['xun','kun'], ['li','zhen'], ['gen','li'], ['gen','kun'], ['kun','zhen'],
    ['qian','zhen'], ['gen','qian'], ['gen','zhen'], ['dui','xun'], ['kan','kan'], ['li','li'], ['dui','gen'], ['zhen','xun'],
    ['qian','gen'], ['zhen','qian'], ['li','kun'], ['kun','li'], ['xun','li'], ['li','dui'], ['kan','gen'], ['zhen','kan'],
    ['gen','dui'], ['xun','zhen'], ['dui','qian'], ['qian','xun'], ['dui','kun'], ['kun','xun'], ['dui','kan'], ['kan','xun'],
    ['dui','li'], ['li','xun'], ['zhen','zhen'], ['gen','gen'], ['xun','gen'], ['zhen','dui'], ['zhen','li'], ['li','gen'],
    ['xun','xun'], ['dui','dui'], ['xun','kan'], ['kan','dui'], ['xun','dui'], ['zhen','gen'], ['kan','li'], ['li','kan']
];

const yiState = {
    book: null,
    hexagrams: [],
    upper: 'qian',
    lower: 'qian',
    selectedOrder: 1
};

const elements = {
    upper: document.querySelector('#upperTrigrams'),
    lower: document.querySelector('#lowerTrigrams'),
    resultLines: document.querySelector('#resultLines'),
    resultPosition: document.querySelector('#resultPosition'),
    resultTitle: document.querySelector('#resultTitle'),
    resultOrder: document.querySelector('#resultOrder'),
    upperFact: document.querySelector('#upperFact'),
    lowerFact: document.querySelector('#lowerFact'),
    orderFact: document.querySelector('#orderFact'),
    judgmentText: document.querySelector('#judgmentText'),
    openHexagram: document.querySelector('#openHexagram'),
    classicPageLink: document.querySelector('#classicPageLink'),
    trigramCards: document.querySelector('#trigramCards'),
    search: document.querySelector('#hexagramSearch'),
    grid: document.querySelector('#hexagramGrid'),
    count: document.querySelector('#catalogCount'),
    empty: document.querySelector('#hexagramEmpty'),
    dialog: document.querySelector('#hexagramDialog'),
    dialogClose: document.querySelector('#dialogClose'),
    dialogContent: document.querySelector('#dialogContent')
};

function numberToChinese(number) {
    const digits = ['零','一','二','三','四','五','六','七','八','九','十'];
    if (number <= 10) return digits[number];
    if (number < 20) return `十${number % 10 ? digits[number % 10] : ''}`;
    const tens = Math.floor(number / 10);
    return `${digits[tens]}十${number % 10 ? digits[number % 10] : ''}`;
}

function trigramByKey(key) {
    return trigrams.find((item) => item.key === key);
}

function pairForOrder(order) {
    const [upper, lower] = hexagramPairs[order - 1];
    return { upper: trigramByKey(upper), lower: trigramByKey(lower) };
}

function orderForPair(upper, lower) {
    return hexagramPairs.findIndex(([up, down]) => up === upper && down === lower) + 1;
}

function fullHexagramName(hexagram, upper, lower) {
    if (upper.key === lower.key) return `${upper.name}为${upper.nature}`;
    return `${upper.nature}${lower.nature}${hexagram.title}`;
}

function hexagramSymbol(order) {
    return String.fromCodePoint(0x4dc0 + order - 1);
}

function renderSelector(container, position) {
    container.replaceChildren(...trigrams.map((trigram) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.dataset.trigram = trigram.key;
        button.style.setProperty('--trigram-color', trigram.color);
        button.classList.toggle('active', yiState[position] === trigram.key);
        button.setAttribute('aria-pressed', String(yiState[position] === trigram.key));
        button.setAttribute('aria-label', `${trigram.name}卦，象${trigram.nature}`);
        const symbol = document.createElement('b');
        symbol.textContent = trigram.symbol;
        const name = document.createElement('span');
        name.textContent = `${trigram.name} · ${trigram.nature}`;
        button.append(symbol, name);
        return button;
    }));
}

function appendLine(container, value) {
    const line = document.createElement('span');
    line.className = `yi-line ${value ? 'yang' : 'yin'}`;
    line.setAttribute('aria-label', value ? '阳爻' : '阴爻');
    container.append(line);
}

function updateUrl(order) {
    const url = new URL(window.location.href);
    url.searchParams.set('gua', String(order));
    history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
}

function selectHexagram(order, { updateHistory = true, scroll = false } = {}) {
    const hexagram = yiState.hexagrams[order - 1];
    if (!hexagram) return;
    const pair = pairForOrder(order);
    yiState.upper = pair.upper.key;
    yiState.lower = pair.lower.key;
    yiState.selectedOrder = order;

    renderSelector(elements.upper, 'upper');
    renderSelector(elements.lower, 'lower');
    elements.resultLines.replaceChildren();
    [...pair.lower.lines, ...pair.upper.lines].forEach((line) => appendLine(elements.resultLines, line));
    elements.resultPosition.textContent = `上${pair.upper.name} · 下${pair.lower.name}`;
    elements.resultTitle.textContent = fullHexagramName(hexagram, pair.upper, pair.lower);
    elements.resultOrder.textContent = `第${numberToChinese(order)}卦 · ${hexagram.volumeId === 'shangjing' ? '上经' : '下经'}`;
    elements.upperFact.textContent = `${pair.upper.name} · ${pair.upper.nature}`;
    elements.lowerFact.textContent = `${pair.lower.name} · ${pair.lower.nature}`;
    elements.orderFact.textContent = String(order).padStart(2, '0');
    elements.judgmentText.textContent = hexagram.paragraphs[0]?.text || '本卦原文整理中';
    elements.classicPageLink.href = `/guji/yijing/${hexagram.volumeId}/${hexagram.slug}/`;
    elements.grid.querySelectorAll('[data-order]').forEach((button) => button.classList.toggle('active', Number(button.dataset.order) === order));
    if (updateHistory) updateUrl(order);
    if (scroll) document.querySelector('#combine').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderTrigramCards() {
    elements.trigramCards.replaceChildren(...trigrams.map((trigram) => {
        const article = document.createElement('article');
        article.className = 'yi-trigram-card';
        article.dataset.symbol = trigram.symbol;
        article.innerHTML = `<header><h3>${trigram.name}卦</h3><span aria-hidden="true">${trigram.symbol}</span></header><p>${trigram.note}</p><dl><div><dt>自然类象</dt><dd>${trigram.nature}</dd></div><div><dt>基本性质</dt><dd>${trigram.quality}</dd></div><div><dt>家庭类象</dt><dd>${trigram.family}</dd></div></dl>`;
        return article;
    }));
}

function normalized(value) {
    return String(value || '').replace(/第|卦|\s/g, '').toLowerCase();
}

function renderCatalog() {
    const query = normalized(elements.search.value);
    const filtered = yiState.hexagrams.filter((hexagram) => {
        const pair = pairForOrder(hexagram.order);
        const haystack = normalized(`${hexagram.order}${numberToChinese(hexagram.order)}${hexagram.title}${fullHexagramName(hexagram, pair.upper, pair.lower)}`);
        return !query || haystack.includes(query);
    });
    elements.count.textContent = `共 ${filtered.length} 卦`;
    elements.empty.hidden = filtered.length > 0;
    elements.grid.hidden = filtered.length === 0;
    elements.grid.replaceChildren(...filtered.map((hexagram) => {
        const pair = pairForOrder(hexagram.order);
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'yi-hexagram-button';
        button.dataset.order = String(hexagram.order);
        button.classList.toggle('active', hexagram.order === yiState.selectedOrder);
        button.setAttribute('aria-label', `第${hexagram.order}卦，${fullHexagramName(hexagram, pair.upper, pair.lower)}`);
        button.innerHTML = `<small>${String(hexagram.order).padStart(2, '0')}</small><strong>${hexagram.title}</strong><span aria-hidden="true">${hexagramSymbol(hexagram.order)}</span>`;
        return button;
    }));
}

function appendParagraph(container, text, className = '') {
    const paragraph = document.createElement('p');
    if (className) paragraph.className = className;
    text.split('\n').forEach((line, index) => {
        if (index) paragraph.append(document.createElement('br'));
        paragraph.append(document.createTextNode(line));
    });
    container.append(paragraph);
}

function openDialog() {
    const hexagram = yiState.hexagrams[yiState.selectedOrder - 1];
    if (!hexagram) return;
    const pair = pairForOrder(hexagram.order);
    elements.dialogContent.replaceChildren();

    const hero = document.createElement('header');
    hero.className = 'yi-dialog-hero';
    hero.innerHTML = `<span class="yi-dialog-symbol" aria-hidden="true">${hexagramSymbol(hexagram.order)}</span><div><p>第${numberToChinese(hexagram.order)}卦 · 上${pair.upper.name}下${pair.lower.name}</p><h2 id="dialogTitle">${fullHexagramName(hexagram, pair.upper, pair.lower)}</h2></div>`;
    const body = document.createElement('div');
    body.className = 'yi-dialog-body';
    hexagram.paragraphs.forEach((paragraph) => appendParagraph(body, paragraph.text));
    const source = document.createElement('p');
    source.className = 'yi-dialog-source';
    source.append(document.createTextNode(`${hexagram.sourceCitation} · `));
    const sourceLink = document.createElement('a');
    sourceLink.href = hexagram.sourceUrl;
    sourceLink.target = '_blank';
    sourceLink.rel = 'noopener';
    sourceLink.textContent = '核对来源原页';
    const classicLink = document.createElement('a');
    classicLink.href = `/guji/yijing/${hexagram.volumeId}/${hexagram.slug}/`;
    classicLink.textContent = '查看本站古籍页';
    source.append(sourceLink, document.createTextNode(' · '), classicLink);
    body.append(source);
    elements.dialogContent.append(hero, body);
    if (!elements.dialog.open) elements.dialog.showModal();
}

function closeDialog() {
    if (elements.dialog.open) elements.dialog.close();
}

function handleSelectorClick(position, event) {
    const button = event.target.closest('[data-trigram]');
    if (!button) return;
    yiState[position] = button.dataset.trigram;
    const order = orderForPair(yiState.upper, yiState.lower);
    selectHexagram(order);
}

async function initialize() {
    renderTrigramCards();
    try {
        const response = await fetch('/data/yijing-tool.json');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const payload = await response.json();
        if (!Array.isArray(payload.hexagrams) || payload.hexagrams.length !== 64) throw new Error('卦数不完整');
        yiState.book = payload.book;
        yiState.hexagrams = payload.hexagrams;
        const requested = Number(new URLSearchParams(window.location.search).get('gua'));
        const initial = requested >= 1 && requested <= 64 ? requested : 1;
        renderCatalog();
        selectHexagram(initial, { updateHistory: Boolean(requested) });
    } catch (error) {
        elements.judgmentText.textContent = '原文载入失败，请刷新页面后重试，或前往《周易》古籍目录阅读。';
        elements.count.textContent = '六十四卦暂未载入';
        console.error('Failed to load Yijing tool data:', error);
    }
}

elements.upper.addEventListener('click', (event) => handleSelectorClick('upper', event));
elements.lower.addEventListener('click', (event) => handleSelectorClick('lower', event));
elements.search.addEventListener('input', renderCatalog);
elements.grid.addEventListener('click', (event) => {
    const button = event.target.closest('[data-order]');
    if (button) selectHexagram(Number(button.dataset.order), { scroll: true });
});
elements.openHexagram.addEventListener('click', openDialog);
elements.dialogClose.addEventListener('click', closeDialog);
elements.dialog.addEventListener('click', (event) => {
    const rect = elements.dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeDialog();
});
elements.dialog.addEventListener('cancel', (event) => { event.preventDefault(); closeDialog(); });

const menuButton = document.querySelector('.tool-menu');
const menuLinks = document.querySelector('#toolLinks');
menuButton?.addEventListener('click', () => {
    const open = menuLinks.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(open));
});

initialize();
