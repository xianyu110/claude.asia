(function () {
    const QQ = '1002569303';
    const root = document.getElementById('cs-widget');
    if (!root) return;

    const toggle = root.querySelector('.cs-widget-toggle');
    const panel = root.querySelector('.cs-widget-panel');
    const copyBtn = root.querySelector('.cs-widget-copy');

    function t(key, fallback) {
        if (window.i18nManager && typeof window.i18nManager.t === 'function') {
            const value = window.i18nManager.t(key, fallback);
            if (typeof value === 'string' && value) return value;
        }
        return fallback;
    }

    function setOpen(open) {
        root.classList.toggle('is-open', open);
        if (toggle) toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        if (panel) panel.hidden = !open;
    }

    if (toggle) {
        toggle.addEventListener('click', function (event) {
            event.stopPropagation();
            setOpen(!root.classList.contains('is-open'));
        });
    }

    document.addEventListener('click', function (event) {
        if (!root.contains(event.target)) setOpen(false);
    });

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') setOpen(false);
    });

    function markCopied() {
        if (!copyBtn) return;
        const previous = copyBtn.getAttribute('data-default-label') || copyBtn.textContent;
        copyBtn.setAttribute('data-default-label', previous);
        copyBtn.textContent = t('cs.copied', '已复制');
        window.setTimeout(function () {
            copyBtn.textContent = copyBtn.getAttribute('data-default-label') || t('cs.copy', '复制号码');
        }, 1600);
    }

    function copyNumber() {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(QQ).then(markCopied).catch(fallbackCopy);
        } else {
            fallbackCopy();
        }
    }

    function fallbackCopy() {
        const input = document.createElement('input');
        input.value = QQ;
        input.setAttribute('readonly', '');
        input.style.position = 'fixed';
        input.style.left = '-9999px';
        document.body.appendChild(input);
        input.select();
        try {
            document.execCommand('copy');
            markCopied();
        } catch (err) {
            /* ignore */
        }
        input.remove();
    }

    if (copyBtn) {
        copyBtn.addEventListener('click', function (event) {
            event.preventDefault();
            copyNumber();
        });
    }
})();
