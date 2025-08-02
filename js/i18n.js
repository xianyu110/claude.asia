// Claude.Asia 国际化管理器
class ClaudeI18nManager {
    constructor() {
        this.currentLanguage = 'zh-CN';
        this.translations = {};
        this.supportedLanguages = {
            'zh-CN': '中文',
            'en-US': 'English',
            'ja-JP': '日本語',
            'ko-KR': '한국어',
            'es-ES': 'Español'
        };
        this.init();
    }

    async init() {
        this.detectLanguage();
        await this.loadTranslations();
        this.applyTranslations();
        this.createLanguageSelector();
        this.bindEvents();
    }

    detectLanguage() {
        const savedLanguage = localStorage.getItem('claude-preferred-language');
        if (savedLanguage && this.supportedLanguages[savedLanguage]) {
            this.currentLanguage = savedLanguage;
            return;
        }

        const browserLanguage = navigator.language || navigator.userLanguage;
        if (this.supportedLanguages[browserLanguage]) {
            this.currentLanguage = browserLanguage;
            return;
        }

        const languageCode = browserLanguage.split('-')[0];
        const matchedLanguage = Object.keys(this.supportedLanguages).find(key => 
            key.startsWith(languageCode + '-')
        );
        
        if (matchedLanguage) {
            this.currentLanguage = matchedLanguage;
        }
    }

    async loadTranslations() {
        try {
            const response = await fetch(`./languages/${this.currentLanguage}.json`);
            if (!response.ok) {
                throw new Error(`Failed to load ${this.currentLanguage}.json`);
            }
            this.translations = await response.json();
        } catch (error) {
            console.error('Error loading translations:', error);
            if (this.currentLanguage !== 'zh-CN') {
                this.currentLanguage = 'zh-CN';
                const response = await fetch('./languages/zh-CN.json');
                this.translations = await response.json();
            }
        }
    }

    t(key, fallback = '') {
        const keys = key.split('.');
        let value = this.translations;
        
        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                return fallback || key;
            }
        }
        
        return value || fallback || key;
    }

    applyTranslations() {
        document.title = this.t('meta.title');
        document.documentElement.lang = this.currentLanguage;
        
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
            metaDescription.setAttribute('content', this.t('meta.description'));
        }

        this.updateContent();
    }

    updateContent() {
        // 更新页面标题
        const titleElements = document.querySelectorAll('[data-i18n="header.title"]');
        titleElements.forEach(el => el.textContent = this.t('header.title'));

        // 更新副标题
        const subtitleElements = document.querySelectorAll('[data-i18n="header.subtitle"]');
        subtitleElements.forEach(el => el.textContent = this.t('header.subtitle'));

        // 更新功能列表
        const featureItems = document.querySelectorAll('[data-i18n^="features.items"]');
        featureItems.forEach((el, index) => {
            const features = this.t('features.items');
            if (Array.isArray(features) && features[index]) {
                el.textContent = features[index];
            }
        });

        // 更新按钮文本
        const buttons = document.querySelectorAll('[data-i18n]');
        buttons.forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (key) {
                el.textContent = this.t(key);
            }
        });

        // 更新FAQ
        this.updateFAQ();
    }

    updateFAQ() {
        const faqItems = this.t('faq.items');
        if (Array.isArray(faqItems)) {
            const faqContainer = document.querySelector('.faq-container');
            if (faqContainer) {
                faqContainer.innerHTML = faqItems.map(item => `
                    <div class="faq-item">
                        <h3>${item.question}</h3>
                        <p>${item.answer}</p>
                    </div>
                `).join('');
            }
        }
    }

    createLanguageSelector() {
        const header = document.querySelector('header') || document.querySelector('.header') || document.body;
        if (!header) return;

        let languageSelector = document.getElementById('language-selector');
        if (!languageSelector) {
            languageSelector = document.createElement('div');
            languageSelector.id = 'language-selector';
            languageSelector.className = 'language-selector';
            header.appendChild(languageSelector);
        }

        languageSelector.innerHTML = `
            <select id="languageSelect" class="language-select">
                ${Object.entries(this.supportedLanguages).map(([code, name]) => 
                    `<option value="${code}" ${code === this.currentLanguage ? 'selected' : ''}>${name}</option>`
                ).join('')}
            </select>
        `;

        // 添加样式
        if (!document.getElementById('i18n-styles')) {
            const style = document.createElement('style');
            style.id = 'i18n-styles';
            style.textContent = `
                .language-selector {
                    position: absolute;
                    top: 20px;
                    right: 20px;
                    z-index: 1000;
                }
                
                .language-select {
                    padding: 8px 16px;
                    border: 2px solid #e2e8f0;
                    border-radius: 8px;
                    background: white;
                    color: #2d3748;
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                    outline: none;
                }
                
                .language-select:hover {
                    border-color: #3182ce;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
                }
                
                @media (max-width: 768px) {
                    .language-selector {
                        position: relative;
                        top: 0;
                        right: 0;
                        margin: 10px;
                        text-align: center;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    bindEvents() {
        const languageSelect = document.getElementById('languageSelect');
        if (languageSelect) {
            languageSelect.addEventListener('change', async (e) => {
                const newLanguage = e.target.value;
                if (newLanguage !== this.currentLanguage) {
                    await this.changeLanguage(newLanguage);
                }
            });
        }
    }

    async changeLanguage(newLanguage) {
        if (!this.supportedLanguages[newLanguage]) return;

        this.currentLanguage = newLanguage;
        localStorage.setItem('claude-preferred-language', newLanguage);
        
        await this.loadTranslations();
        this.applyTranslations();
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    new ClaudeI18nManager();
});