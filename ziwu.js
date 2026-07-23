(function () {
    const periods = window.ZIWU_PERIODS || [];
    const clock = document.getElementById('ziwuClock');
    const grid = document.getElementById('periodGrid');
    const hourHand = document.getElementById('clockHour');
    const minuteHand = document.getElementById('clockMinute');
    const secondHand = document.getElementById('clockSecond');
    let previewIndex = null;

    function buildClock() {
        for (let i = 0; i < 24; i += 1) {
            const tick = document.createElement('span');
            tick.className = 'clock-tick';
            tick.style.transform = `rotate(${i * 15}deg)`;
            clock.appendChild(tick);
        }
        periods.forEach((period, index) => {
            const angle = (index * 30) - 90;
            const radians = angle * Math.PI / 180;
            const label = document.createElement('button');
            label.type = 'button';
            label.className = 'clock-label';
            label.dataset.index = String(index);
            label.style.left = `${50 + Math.cos(radians) * 40}%`;
            label.style.top = `${50 + Math.sin(radians) * 40}%`;
            label.innerHTML = `<strong>${period.branch}·${period.organ}</strong><small>${window.formatZiwuRange(period)}</small>`;
            label.addEventListener('click', () => {
                previewIndex = previewIndex === index ? null : index;
                renderActive(new Date());
            });
            clock.appendChild(label);
        });
    }

    function buildCards() {
        periods.forEach((period, index) => {
            const card = document.createElement('article');
            card.className = 'period-card';
            card.dataset.index = String(index);
            card.style.setProperty('--period-color', period.color);
            card.innerHTML = `<div class="period-card-head"><strong>${period.branch}时</strong><span>${window.formatZiwuRange(period)}</span></div><h3>${period.meridian}</h3><p>${period.note}</p><div class="period-tags"><span>${period.yinYang}</span><span>五行属${period.element}</span></div>`;
            card.addEventListener('click', () => {
                previewIndex = previewIndex === index ? null : index;
                renderActive(new Date());
                clock.scrollIntoView({ behavior: 'smooth', block: 'center' });
            });
            grid.appendChild(card);
        });
    }

    function renderActive(now) {
        const livePeriod = window.getCurrentZiwuPeriod(now);
        const liveIndex = periods.indexOf(livePeriod);
        const displayIndex = previewIndex === null ? liveIndex : previewIndex;
        const displayPeriod = periods[displayIndex];
        document.querySelectorAll('.clock-label').forEach((label, index) => {
            label.classList.toggle('active', index === displayIndex);
            if (index === displayIndex) label.style.setProperty('--active-color', displayPeriod.color);
        });
        document.querySelectorAll('.period-card').forEach((card, index) => card.classList.toggle('active', index === displayIndex));
        document.getElementById('clockBranch').textContent = `${displayPeriod.branch}时`;
        document.getElementById('currentMeridian').textContent = `${displayPeriod.organ}经当令 · ${displayPeriod.meridian}`;
        document.getElementById('currentNote').textContent = previewIndex === null ? displayPeriod.note : `预览 ${displayPeriod.branch}时：${displayPeriod.note}`;
        document.getElementById('currentRange').textContent = window.formatZiwuRange(displayPeriod);
    }

    function updateClock() {
        const now = new Date();
        const seconds = now.getSeconds();
        const minutes = now.getMinutes() + seconds / 60;
        const hours = (now.getHours() % 12) + minutes / 60;
        hourHand.style.transform = `rotate(${hours * 30}deg)`;
        minuteHand.style.transform = `rotate(${minutes * 6}deg)`;
        secondHand.style.transform = `rotate(${seconds * 6}deg)`;
        const time = new Intl.DateTimeFormat('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(now);
        document.getElementById('clockDigital').textContent = time;
        document.getElementById('currentTime').textContent = time.slice(0, 5);
        renderActive(now);
    }

    const menu = document.querySelector('.tool-menu');
    const links = document.getElementById('toolLinks');
    menu?.addEventListener('click', () => {
        const open = links.classList.toggle('open');
        menu.setAttribute('aria-expanded', String(open));
    });
    buildClock();
    buildCards();
    updateClock();
    setInterval(updateClock, 1000);
})();
