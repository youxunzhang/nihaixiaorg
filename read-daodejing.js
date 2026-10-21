const readerState = {
    chapters: [],
    book: null,
    chapterIndex: 0,
    volume: 'all',
    fontSize: 26,
    theme: 'paper',
    speechToken: 0,
    speechIndex: 0,
    paused: false,
    wakeLock: null,
    sleepTimerId: null
};

const elements = {
    chapterList: document.querySelector('#chapterList'),
    chapterSearch: document.querySelector('#chapterSearch'),
    volumeTabs: document.querySelector('.dao-volume-tabs'),
    directoryEmpty: document.querySelector('#directoryEmpty'),
    progressLabel: document.querySelector('#readingProgressLabel'),
    progress: document.querySelector('#readingProgress'),
    readingCard: document.querySelector('#readingCard'),
    chapterSeal: document.querySelector('#chapterSeal'),
    volumeName: document.querySelector('#volumeName'),
    chapterTitle: document.querySelector('#chapterTitle'),
    chapterBody: document.querySelector('#chapterBody'),
    previousChapter: document.querySelector('#previousChapter'),
    previousLabel: document.querySelector('#previousLabel'),
    nextChapter: document.querySelector('#nextChapter'),
    nextLabel: document.querySelector('#nextLabel'),
    chapterSourceLink: document.querySelector('#chapterSourceLink'),
    sourceEditionLink: document.querySelector('#sourceEditionLink'),
    listenButton: document.querySelector('#listenButton'),
    stopButton: document.querySelector('#stopButton'),
    speechStatus: document.querySelector('#speechStatus'),
    speechStatusWrap: document.querySelector('.dao-reading-status'),
    fontDecrease: document.querySelector('#fontDecrease'),
    fontIncrease: document.querySelector('#fontIncrease'),
    fontSizeValue: document.querySelector('#fontSizeValue'),
    themeOptions: document.querySelector('.dao-theme-options'),
    speechRate: document.querySelector('#speechRate'),
    autoNext: document.querySelector('#autoNext'),
    sleepTimer: document.querySelector('#sleepTimer'),
    wakeLockButton: document.querySelector('#wakeLockButton')
};

const chineseNumerals = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];

function numberToChinese(number) {
    if (number <= 10) return chineseNumerals[number];
    if (number < 20) return `十${number % 10 ? chineseNumerals[number % 10] : ''}`;
    const tens = Math.floor(number / 10);
    const ones = number % 10;
    return `${chineseNumerals[tens]}十${ones ? chineseNumerals[ones] : ''}`;
}

function loadPreferences() {
    try {
        const saved = JSON.parse(localStorage.getItem('daodejing-reader-preferences') || '{}');
        readerState.fontSize = Math.min(36, Math.max(20, Number(saved.fontSize) || 26));
        readerState.theme = ['paper', 'white', 'ink'].includes(saved.theme) ? saved.theme : 'paper';
        elements.speechRate.value = ['0.8', '1', '1.2'].includes(String(saved.speechRate)) ? String(saved.speechRate) : '1';
        elements.autoNext.checked = Boolean(saved.autoNext);
    } catch (_) {
        localStorage.removeItem('daodejing-reader-preferences');
    }
    applyPreferences();
}

function savePreferences() {
    localStorage.setItem('daodejing-reader-preferences', JSON.stringify({
        fontSize: readerState.fontSize,
        theme: readerState.theme,
        speechRate: Number(elements.speechRate.value),
        autoNext: elements.autoNext.checked
    }));
}

function applyPreferences() {
    elements.readingCard.style.setProperty('--reader-font-size', `${readerState.fontSize}px`);
    elements.readingCard.dataset.theme = readerState.theme;
    elements.fontSizeValue.value = String(readerState.fontSize);
    elements.fontSizeValue.textContent = String(readerState.fontSize);
    elements.themeOptions.querySelectorAll('[data-theme]').forEach((button) => {
        button.classList.toggle('active', button.dataset.theme === readerState.theme);
    });
}

function renderDirectory() {
    const query = elements.chapterSearch.value.trim().replace(/第|章/g, '');
    const filtered = readerState.chapters.filter((chapter) => {
        const matchesVolume = readerState.volume === 'all' || chapter.volumeId === readerState.volume;
        const haystack = `${chapter.order}${chapter.title}${numberToChinese(chapter.order)}`;
        return matchesVolume && (!query || haystack.includes(query));
    });

    elements.directoryEmpty.hidden = filtered.length > 0;
    elements.chapterList.hidden = filtered.length === 0;
    elements.chapterList.replaceChildren(...filtered.map((chapter) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'dao-chapter-button';
        button.dataset.order = String(chapter.order);
        button.classList.toggle('active', chapter.order === readerState.chapters[readerState.chapterIndex]?.order);
        button.setAttribute('aria-current', chapter.order === readerState.chapters[readerState.chapterIndex]?.order ? 'true' : 'false');
        const number = document.createElement('span');
        number.textContent = String(chapter.order).padStart(2, '0');
        const title = document.createElement('strong');
        title.textContent = chapter.title;
        button.append(number, title);
        return button;
    }));
}

function setSpeechStatus(message, speaking = false) {
    elements.speechStatus.textContent = message;
    elements.speechStatusWrap.classList.toggle('speaking', speaking);
}

function stopSpeech(message = '已停止朗读') {
    readerState.speechToken += 1;
    readerState.paused = false;
    window.speechSynthesis?.cancel();
    elements.chapterBody.querySelectorAll('.current').forEach((node) => node.classList.remove('current'));
    elements.listenButton.querySelector('span:last-child').textContent = '朗读本章';
    elements.stopButton.disabled = true;
    setSpeechStatus(message, false);
    if (readerState.sleepTimerId) window.clearTimeout(readerState.sleepTimerId);
    readerState.sleepTimerId = null;
}

function createParagraph(text, index) {
    const paragraph = document.createElement('p');
    paragraph.dataset.paragraph = String(index);
    const lines = text.split('\n');
    lines.forEach((line, lineIndex) => {
        if (lineIndex) paragraph.append(document.createElement('br'));
        paragraph.append(document.createTextNode(line));
    });
    return paragraph;
}

function updateUrl(order) {
    const url = new URL(window.location.href);
    url.searchParams.set('chapter', String(order));
    history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
}

function renderChapter(index, { updateHistory = true, focusReader = false } = {}) {
    if (!readerState.chapters[index]) return;
    stopSpeech('选择章节，静心阅读');
    readerState.chapterIndex = index;
    const chapter = readerState.chapters[index];
    const volumeName = chapter.volumeId === 'daojing' ? '道经' : '德经';
    const volumeOrder = chapter.volumeId === 'daojing' ? chapter.order : chapter.order - 37;

    elements.chapterSeal.textContent = numberToChinese(chapter.order).slice(-1);
    elements.volumeName.textContent = `${volumeName} · 第${numberToChinese(volumeOrder)}篇`;
    elements.chapterTitle.textContent = chapter.title;
    elements.chapterBody.replaceChildren(...chapter.paragraphs.map((paragraph, paragraphIndex) => createParagraph(paragraph.text, paragraphIndex)));
    elements.progress.style.width = `${(chapter.order / readerState.chapters.length) * 100}%`;
    elements.progressLabel.textContent = `已读至 ${chapter.order} / ${readerState.chapters.length}`;
    elements.previousChapter.disabled = index === 0;
    elements.nextChapter.disabled = index === readerState.chapters.length - 1;
    elements.previousLabel.textContent = readerState.chapters[index - 1]?.title || '已到开篇';
    elements.nextLabel.textContent = readerState.chapters[index + 1]?.title || '已到末章';
    elements.chapterSourceLink.href = `/guji/daodejing/${chapter.volumeId}/${chapter.slug}/`;
    elements.listenButton.disabled = !('speechSynthesis' in window);
    elements.stopButton.disabled = true;

    renderDirectory();
    localStorage.setItem('daodejing-reader-last-chapter', String(chapter.order));
    if (updateHistory) updateUrl(chapter.order);
    if (focusReader) elements.readingCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function scheduleSleepTimer() {
    if (readerState.sleepTimerId) window.clearTimeout(readerState.sleepTimerId);
    const minutes = Number(elements.sleepTimer.value);
    if (!minutes) return;
    readerState.sleepTimerId = window.setTimeout(() => {
        stopSpeech('定时朗读已结束');
        elements.sleepTimer.value = '0';
    }, minutes * 60 * 1000);
}

function speakParagraph(index, token) {
    const chapter = readerState.chapters[readerState.chapterIndex];
    if (!chapter || token !== readerState.speechToken) return;
    if (index >= chapter.paragraphs.length) {
        elements.stopButton.disabled = true;
        elements.listenButton.querySelector('span:last-child').textContent = '朗读本章';
        setSpeechStatus('本章朗读完毕', false);
        elements.chapterBody.querySelectorAll('.current').forEach((node) => node.classList.remove('current'));
        if (elements.autoNext.checked && readerState.chapterIndex < readerState.chapters.length - 1) {
            renderChapter(readerState.chapterIndex + 1);
            startSpeech();
        }
        return;
    }

    readerState.speechIndex = index;
    const paragraphs = elements.chapterBody.querySelectorAll('[data-paragraph]');
    paragraphs.forEach((node) => node.classList.toggle('current', Number(node.dataset.paragraph) === index));
    paragraphs[index]?.scrollIntoView({ behavior: 'smooth', block: 'center' });

    const utterance = new SpeechSynthesisUtterance(chapter.paragraphs[index].text.replace(/\n/g, ''));
    utterance.lang = 'zh-CN';
    utterance.rate = Number(elements.speechRate.value);
    utterance.onend = () => {
        if (token === readerState.speechToken) speakParagraph(index + 1, token);
    };
    utterance.onerror = (event) => {
        if (token !== readerState.speechToken || event.error === 'canceled' || event.error === 'interrupted') return;
        stopSpeech('浏览器朗读暂不可用，请继续阅读原文');
    };
    window.speechSynthesis.speak(utterance);
}

function startSpeech() {
    if (!('speechSynthesis' in window)) {
        setSpeechStatus('当前浏览器不支持文字朗读');
        return;
    }
    if (window.speechSynthesis.speaking && readerState.paused) {
        window.speechSynthesis.resume();
        readerState.paused = false;
        elements.listenButton.querySelector('span:last-child').textContent = '暂停';
        setSpeechStatus(`正在朗读 ${readerState.chapters[readerState.chapterIndex].title}`, true);
        return;
    }
    if (window.speechSynthesis.speaking) {
        window.speechSynthesis.pause();
        readerState.paused = true;
        elements.listenButton.querySelector('span:last-child').textContent = '继续';
        setSpeechStatus('朗读已暂停');
        return;
    }

    readerState.speechToken += 1;
    readerState.paused = false;
    elements.listenButton.querySelector('span:last-child').textContent = '暂停';
    elements.stopButton.disabled = false;
    setSpeechStatus(`正在朗读 ${readerState.chapters[readerState.chapterIndex].title}`, true);
    scheduleSleepTimer();
    speakParagraph(0, readerState.speechToken);
}

async function toggleWakeLock() {
    if (!('wakeLock' in navigator)) {
        setSpeechStatus('当前浏览器不支持屏幕常亮');
        return;
    }
    if (readerState.wakeLock) {
        await readerState.wakeLock.release();
        readerState.wakeLock = null;
        elements.wakeLockButton.classList.remove('active');
        elements.wakeLockButton.textContent = '保持屏幕常亮';
        return;
    }
    try {
        readerState.wakeLock = await navigator.wakeLock.request('screen');
        elements.wakeLockButton.classList.add('active');
        elements.wakeLockButton.textContent = '已保持屏幕常亮';
        readerState.wakeLock.addEventListener('release', () => {
            readerState.wakeLock = null;
            elements.wakeLockButton.classList.remove('active');
            elements.wakeLockButton.textContent = '保持屏幕常亮';
        });
    } catch (_) {
        setSpeechStatus('无法保持屏幕常亮，请检查浏览器权限');
    }
}

async function initializeReader() {
    loadPreferences();
    try {
        const response = await fetch('/data/daodejing-reader.json');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const payload = await response.json();
        if (!Array.isArray(payload.chapters) || payload.chapters.length !== 81) throw new Error('章节数量不完整');
        readerState.book = payload.book;
        readerState.chapters = payload.chapters;
        elements.sourceEditionLink.href = payload.book.sourceUrl;

        const requested = Number(new URLSearchParams(window.location.search).get('chapter'));
        const remembered = Number(localStorage.getItem('daodejing-reader-last-chapter'));
        const initialOrder = requested >= 1 && requested <= 81 ? requested : (remembered >= 1 && remembered <= 81 ? remembered : 1);
        renderChapter(initialOrder - 1, { updateHistory: Boolean(requested) });
    } catch (error) {
        elements.chapterBody.innerHTML = '<p class="dao-loading">原文载入失败，请刷新页面后重试，或前往古籍目录阅读。</p>';
        elements.progressLabel.textContent = '原文暂未载入';
        console.error('Failed to load Daodejing reader data:', error);
    }
}

elements.chapterList.addEventListener('click', (event) => {
    const button = event.target.closest('[data-order]');
    if (button) renderChapter(Number(button.dataset.order) - 1, { focusReader: window.innerWidth <= 820 });
});
elements.chapterSearch.addEventListener('input', renderDirectory);
elements.volumeTabs.addEventListener('click', (event) => {
    const button = event.target.closest('[data-volume]');
    if (!button) return;
    readerState.volume = button.dataset.volume;
    elements.volumeTabs.querySelectorAll('button').forEach((item) => item.classList.toggle('active', item === button));
    renderDirectory();
});
elements.previousChapter.addEventListener('click', () => renderChapter(readerState.chapterIndex - 1));
elements.nextChapter.addEventListener('click', () => renderChapter(readerState.chapterIndex + 1));
elements.listenButton.addEventListener('click', startSpeech);
elements.stopButton.addEventListener('click', () => stopSpeech());
elements.fontDecrease.addEventListener('click', () => {
    readerState.fontSize = Math.max(20, readerState.fontSize - 2);
    applyPreferences();
    savePreferences();
});
elements.fontIncrease.addEventListener('click', () => {
    readerState.fontSize = Math.min(36, readerState.fontSize + 2);
    applyPreferences();
    savePreferences();
});
elements.themeOptions.addEventListener('click', (event) => {
    const button = event.target.closest('[data-theme]');
    if (!button) return;
    readerState.theme = button.dataset.theme;
    applyPreferences();
    savePreferences();
});
elements.speechRate.addEventListener('change', savePreferences);
elements.autoNext.addEventListener('change', savePreferences);
elements.sleepTimer.addEventListener('change', scheduleSleepTimer);
elements.wakeLockButton.addEventListener('click', toggleWakeLock);

const menuButton = document.querySelector('.tool-menu');
const menuLinks = document.querySelector('#toolLinks');
menuButton?.addEventListener('click', () => {
    const open = menuLinks.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(open));
});

window.addEventListener('beforeunload', () => window.speechSynthesis?.cancel());
initializeReader();
