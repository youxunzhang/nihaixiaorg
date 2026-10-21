const installPrompt = '请根据 https://skillhub.cn/install/skillhub.md，安装 @user_ff4d9420/nihaixia-pro。';
const copyStatus = document.querySelector('#copyStatus');

async function copyInstallPrompt() {
    try {
        await navigator.clipboard.writeText(installPrompt);
        copyStatus.textContent = '安装提示词已复制。';
        document.querySelectorAll('#copyInstallPrompt, #copyInstallPromptInline').forEach((button) => {
            const previous = button.textContent;
            button.textContent = '已复制';
            window.setTimeout(() => { button.textContent = previous; }, 1600);
        });
    } catch (_) {
        copyStatus.textContent = '浏览器未允许自动复制，请长按上方提示词手动复制。';
    }
}

document.querySelector('#copyInstallPrompt')?.addEventListener('click', copyInstallPrompt);
document.querySelector('#copyInstallPromptInline')?.addEventListener('click', copyInstallPrompt);

const menuButton = document.querySelector('.tool-menu');
const menuLinks = document.querySelector('#toolLinks');
menuButton?.addEventListener('click', () => {
    const open = menuLinks.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(open));
});
