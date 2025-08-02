// 增强版国际化管理器 - 集成SEO优化
class EnhancedI18nManager {
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
        this.seoConfig = {};
        this.init();
    }

    async init() {
        this.detectLanguage();
        await this.loadTranslations();
        this.applySEOOptimizations();
        this.applyTranslations();
        this.createLanguageSelector();
        this.bindEvents();
        this.trackLanguageChange();
    }

    // 检测并设置语言
    detectLanguage() {
        // URL参数优先
        const urlParams = new URLSearchParams(window.location.search);
        const langParam = urlParams.get('lang');
        if (langParam && this.supportedLanguages[langParam]) {
            this.currentLanguage = langParam;
            return;
        }

        // localStorage其次
        const savedLanguage = localStorage.getItem('preferred-language');
        if (savedLanguage && this.supportedLanguages[savedLanguage]) {
            this.currentLanguage = savedLanguage;
            return;
        }

        // 浏览器语言最后
        const browserLanguage = navigator.language || navigator.userLanguage;
        if (this.supportedLanguages[browserLanguage]) {
            this.currentLanguage = browserLanguage;
            return;
        }

        // 语言代码匹配
        const languageCode = browserLanguage.split('-')[0];
        const matchedLanguage = Object.keys(this.supportedLanguages).find(key => 
            key.startsWith(languageCode + '-')
        );
        
        if (matchedLanguage) {
            this.currentLanguage = matchedLanguage;
        }
    }

    // 加载翻译文件
    async loadTranslations() {
        try {
            const response = await fetch(`./languages/${this.currentLanguage}.json`);
            if (!response.ok) {
                throw new Error(`Failed to load ${this.currentLanguage}.json`);
            }
            this.translations = await response.json();
            this.seoConfig = this.translations.meta || {};
        } catch (error) {
            console.error('Error loading translations:', error);
            if (this.currentLanguage !== 'zh-CN') {
                this.currentLanguage = 'zh-CN';
                const response = await fetch('./languages/zh-CN.json');
                this.translations = await response.json();
                this.seoConfig = this.translations.meta || {};
            }
        }
    }

    // 应用SEO优化
    applySEOOptimizations() {
        // 更新页面标题
        if (this.seoConfig.title) {
            document.title = this.seoConfig.title;
        }

        // 更新meta描述
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription && this.seoConfig.description) {
            metaDescription.setAttribute('content', this.seoConfig.description);
        }

        // 更新语言属性
        document.documentElement.lang = this.currentLanguage;

        // 更新canonical链接
        this.updateCanonicalLink();

        // 更新Open Graph标签
        this.updateOpenGraphTags();

        // 更新结构化数据
        this.updateStructuredData();

        // 添加hreflang链接
        this.addHreflangLinks();
    }

    // 更新canonical链接
    updateCanonicalLink() {
        let canonical = document.querySelector('link[rel="canonical"]');
        if (!canonical) {
            canonical = document.createElement('link');
            canonical.rel = 'canonical';
            document.head.appendChild(canonical);
        }
        
        const baseUrl = window.location.origin + window.location.pathname;
        const canonicalUrl = this.currentLanguage === 'zh-CN' ? baseUrl : `${baseUrl}?lang=${this.currentLanguage}`;
        canonical.href = canonicalUrl;
    }

    // 更新Open Graph标签
    updateOpenGraphTags() {
        const ogTags = {
            'og:title': this.seoConfig.title,
            'og:description': this.seoConfig.description,
            'og:url': window.location.href,
            'og:locale': this.currentLanguage.replace('-', '_')
        };

        Object.entries(ogTags).forEach(([property, content]) => {
            if (content) {
                let tag = document.querySelector(`meta[property="${property}"]`);
                if (!tag) {
                    tag = document.createElement('meta');
                    tag.setAttribute('property', property);
                    document.head.appendChild(tag);
                }
                tag.setAttribute('content', content);
            }
        });
    }

    // 添加hreflang链接
    addHreflangLinks() {
        // 移除现有的hreflang链接
        document.querySelectorAll('link[rel="alternate"][hreflang]').forEach(link => {
            link.remove();
        });

        const baseUrl = window.location.origin + window.location.pathname;
        
        // 为每种语言添加hreflang链接
        Object.keys(this.supportedLanguages).forEach(lang => {
            const link = document.createElement('link');
            link.rel = 'alternate';
            link.hreflang = lang;
            link.href = lang === 'zh-CN' ? baseUrl : `${baseUrl}?lang=${lang}`;
            document.head.appendChild(link);
        });

        // 添加x-default
        const defaultLink = document.createElement('link');
        defaultLink.rel = 'alternate';
        defaultLink.hreflang = 'x-default';
        defaultLink.href = baseUrl;
        document.head.appendChild(defaultLink);
    }

    // 更新结构化数据
    updateStructuredData() {
        let structuredDataScript = document.querySelector('script[type="application/ld+json"]');
        if (structuredDataScript) {
            try {
                const data = JSON.parse(structuredDataScript.textContent);
                data.name = this.seoConfig.title || data.name;
                data.description = this.seoConfig.description || data.description;
                data.inLanguage = Object.keys(this.supportedLanguages);
                structuredDataScript.textContent = JSON.stringify(data, null, 2);
            } catch (error) {
                console.error('Error updating structured data:', error);
            }
        }
    }

    // 获取翻译文本
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

    // 应用翻译
    applyTranslations() {
        this.updateContent();
    }

    // 更新页面内容
    updateContent() {
        // 更新所有带有data-i18n属性的元素
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (key) {
                const translation = this.t(key);
                if (translation && translation !== key) {
                    element.textContent = translation;
                }
            }
        });

        // 更新FAQ内容
        this.updateFAQ();
    }

    // 更新FAQ
    updateFAQ() {
        const faqItems = this.t('faq.items');
        if (Array.isArray(faqItems)) {
            const faqContainer = document.querySelector('.faq-container');
            if (faqContainer) {
                faqContainer.innerHTML = faqItems.map(item => `
                    <div class="faq-item">
                        <h3 class="faq-question">${item.question}</h3>
                        <p class="faq-answer">${item.answer}</p>
                    </div>
                `).join('');
            }
        }
    }

    // 创建语言选择器
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
            <label for="languageSelect" class="sr-only">${this.t('ui.languageSelector', '选择语言')}</label>
            <select id="languageSelect" class="language-select" aria-label="${this.t('ui.languageSelector', '选择语言')}">
                ${Object.entries(this.supportedLanguages).map(([code, name]) => 
                    `<option value="${code}" ${code === this.currentLanguage ? 'selected' : ''}>${name}</option>`
                ).join('')}
            </select>
        `;

        // 添加样式
        this.addLanguageSelectorStyles();
    }

    // 添加语言选择器样式
    addLanguageSelectorStyles() {
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
                
                .language-select:focus {
                    border-color: #3182ce;
                    box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.1);
                }
                
                .sr-only {
                    position: absolute;
                    width: 1px;
                    height: 1px;
                    padding: 0;
                    margin: -1px;
                    overflow: hidden;
                    clip: rect(0, 0, 0, 0);
                    white-space: nowrap;
                    border: 0;
                }
                
                @media (max-width: 768px) {
                    .language-selector {
                        position: relative;
                        top: 0;
                        right: 0;
                        margin: 10px;
                        text-align: center;
                    }
                    
                    .language-select {
                        width: 200px;
                        max-width: 100%;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    // 绑定事件
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

    // 切换语言
    async changeLanguage(newLanguage) {
        if (!this.supportedLanguages[newLanguage]) return;

        this.currentLanguage = newLanguage;
        
        // 保存用户偏好
        localStorage.setItem('preferred-language', newLanguage);
        
        // 更新URL（不刷新页面）
        const url = new URL(window.location);
        if (newLanguage === 'zh-CN') {
            url.searchParams.delete('lang');
        } else {
            url.searchParams.set('lang', newLanguage);
        }
        window.history.replaceState({}, '', url.toString());
        
        // 重新加载翻译并应用
        await this.loadTranslations();
        this.applySEOOptimizations();
        this.applyTranslations();
        
        // 触发语言变更事件
        this.trackLanguageChange();
    }

    // 跟踪语言变更
    trackLanguageChange() {
        // Google Analytics 4 事件跟踪
        if (typeof gtag !== 'undefined') {
            gtag('event', 'language_change', {
                'language': this.currentLanguage,
                'page_title': document.title,
                'page_location': window.location.href
            });
        }

        // 自定义事件
        const event = new CustomEvent('languageChanged', {
            detail: {
                language: this.currentLanguage,
                translations: this.translations
            }
        });
        window.dispatchEvent(event);
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    window.i18nManager = new EnhancedI18nManager();
});