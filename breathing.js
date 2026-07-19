(function () {
    'use strict';

    const orbit = document.getElementById('breath-orbit');
    if (!orbit) return;

    const phaseLabel = document.getElementById('breath-phase');
    const countLabel = document.getElementById('breath-count');
    const unitLabel = document.getElementById('breath-unit');
    const guidance = document.getElementById('breath-guidance');
    const toggleButton = document.getElementById('breath-toggle');
    const resetButton = document.getElementById('breath-reset');
    const roundsLabel = document.getElementById('breath-rounds');
    const inputs = {
        inhale: document.getElementById('inhale-duration'),
        hold: document.getElementById('hold-duration'),
        exhale: document.getElementById('exhale-duration')
    };
    const presetButtons = Array.from(document.querySelectorAll('[data-preset]'));
    const trackLabels = Array.from(document.querySelectorAll('[data-track-phase]'));

    const phases = [
        { key: 'inhale', label: '吸气', unit: '缓慢吸入', guidance: '用鼻子缓慢吸气，感受腹部自然鼓起。' },
        { key: 'hold', label: '屏息', unit: '轻柔停留', guidance: '保持身体放松，不要用力憋气。' },
        { key: 'exhale', label: '呼气', unit: '缓缓呼出', guidance: '缓慢呼气，让肩膀和腹部一起放松。' }
    ];

    let isRunning = false;
    let phaseIndex = 0;
    let phaseStartedAt = 0;
    let remainingWhenPaused = 0;
    let currentPhaseDuration = 0;
    let animationFrame = 0;
    let rounds = 0;
    let lastShownSecond = null;

    function durationFor(key) {
        const input = inputs[key];
        const min = Number(input.min);
        const max = Number(input.max);
        const value = Math.round(Number(input.value));
        return Math.min(max, Math.max(min, Number.isFinite(value) ? value : min));
    }

    function normalizeInputs() {
        Object.keys(inputs).forEach(function (key) {
            inputs[key].value = durationFor(key);
        });
    }

    function setControlsLocked(locked) {
        Object.values(inputs).forEach(function (input) { input.disabled = locked; });
        presetButtons.forEach(function (button) { button.disabled = locked; });
    }

    function setPhaseVisual(phase, durationSeconds) {
        orbit.dataset.phase = phase.key;
        orbit.querySelector('.breath-orb').style.transitionDuration = durationSeconds + 's';
        phaseLabel.textContent = phase.label;
        unitLabel.textContent = phase.unit;
        guidance.textContent = phase.guidance;
        trackLabels.forEach(function (label) {
            label.classList.toggle('active', label.dataset.trackPhase === phase.key);
        });
    }

    function startPhase(index, durationOverride) {
        phaseIndex = index;
        const phase = phases[phaseIndex];
        const duration = durationOverride || durationFor(phase.key);
        currentPhaseDuration = duration;
        phaseStartedAt = performance.now();
        remainingWhenPaused = duration;
        lastShownSecond = null;
        setPhaseVisual(phase, duration);
    }

    function advancePhase() {
        let nextIndex = (phaseIndex + 1) % phases.length;
        if (nextIndex === 0) {
            rounds += 1;
            roundsLabel.textContent = rounds;
        }

        if (phases[nextIndex].key === 'hold' && durationFor('hold') === 0) {
            nextIndex = (nextIndex + 1) % phases.length;
        }
        startPhase(nextIndex);
    }

    function tick(now) {
        if (!isRunning) return;

        const phase = phases[phaseIndex];
        const elapsed = (now - phaseStartedAt) / 1000;
        const remaining = Math.max(0, currentPhaseDuration - elapsed);
        const shownSecond = Math.max(1, Math.ceil(remaining));

        if (shownSecond !== lastShownSecond) {
            countLabel.textContent = shownSecond;
            lastShownSecond = shownSecond;
        }

        if (remaining <= 0) advancePhase();
        animationFrame = requestAnimationFrame(tick);
    }

    function start() {
        normalizeInputs();
        isRunning = true;
        toggleButton.textContent = '暂停练习';
        toggleButton.setAttribute('aria-pressed', 'true');
        setControlsLocked(true);

        if (remainingWhenPaused > 0 && orbit.dataset.phase !== 'ready') {
            startPhase(phaseIndex, remainingWhenPaused);
        } else {
            startPhase(phaseIndex);
        }
        animationFrame = requestAnimationFrame(tick);
    }

    function pause() {
        const elapsed = (performance.now() - phaseStartedAt) / 1000;
        remainingWhenPaused = Math.max(0.1, currentPhaseDuration - elapsed);
        isRunning = false;
        cancelAnimationFrame(animationFrame);
        toggleButton.textContent = '继续练习';
        toggleButton.setAttribute('aria-pressed', 'false');
        setControlsLocked(false);
        guidance.textContent = '练习已暂停，准备好后继续。';
        orbit.querySelector('.breath-orb').style.transitionDuration = '300ms';
    }

    function reset() {
        isRunning = false;
        cancelAnimationFrame(animationFrame);
        phaseIndex = 0;
        rounds = 0;
        remainingWhenPaused = 0;
        lastShownSecond = null;
        roundsLabel.textContent = '0';
        orbit.dataset.phase = 'ready';
        orbit.querySelector('.breath-orb').style.transitionDuration = '500ms';
        phaseLabel.textContent = '准备好了吗？';
        countLabel.textContent = '—';
        unitLabel.textContent = '放松肩膀';
        guidance.textContent = '舒适坐好，轻轻闭眼或放松视线。';
        toggleButton.textContent = '开始练习';
        toggleButton.setAttribute('aria-pressed', 'false');
        setControlsLocked(false);
        trackLabels.forEach(function (label) { label.classList.remove('active'); });
    }

    toggleButton.addEventListener('click', function () {
        if (isRunning) pause();
        else start();
    });

    resetButton.addEventListener('click', reset);

    Object.values(inputs).forEach(function (input) {
        input.addEventListener('change', function () {
            normalizeInputs();
            remainingWhenPaused = 0;
            presetButtons.forEach(function (button) { button.classList.remove('active'); });
        });
    });

    presetButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            const values = button.dataset.preset.split(',');
            inputs.inhale.value = values[0];
            inputs.hold.value = values[1];
            inputs.exhale.value = values[2];
            remainingWhenPaused = 0;
            presetButtons.forEach(function (item) { item.classList.toggle('active', item === button); });
        });
    });
})();
