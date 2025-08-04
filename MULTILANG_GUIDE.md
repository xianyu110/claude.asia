# Claude.Asia 多语言实现指南

## 概述

Claude.Asia 项目现已完全支持多语言功能，支持以下5种语言：
- 🇨🇳 中文（简体）
- 🇺🇸 英语
- 🇯🇵 日语
- 🇰🇷 韩语  
- 🇪🇸 西班牙语

## 技术架构

### 1. 文件结构
```
claude.asia/
├── index.html          # 主页面（包含data-i18n属性）
├── js/
│   └── i18n.js        # 增强版国际化管理器
├── languages/         # 语言文件目录
│   ├── zh-CN.json    # 中文翻译
│   ├── en-US.json    # 英文翻译
│   ├── ja-JP.json    # 日文翻译
│   ├── ko-KR.json    # 韩文翻译
│   └── es-ES.json    # 西班牙文翻译
├── script.js         # 主脚本文件
└── styles.css        # 样式文件（包含导航栏样式）
```

### 2. 核心功能
- ✅ 自动检测用户浏览器语言
- ✅ 保存用户语言偏好到localStorage
- ✅ URL参数支持（?lang=en-US）
- ✅ 实时语言切换，无需刷新页面
- ✅ SEO优化（hreflang标签、canonical链接等）
- ✅ 响应式语言选择器

### 3. 使用方法

#### HTML中添加多语言支持
```html
<!-- 文本元素 -->
<h1 data-i18n="hero.title">默认文本</h1>

<!-- 数组元素 -->
<li data-i18n="hero.features.0">功能1</li>
<li data-i18n="hero.features.1">功能2</li>
```

#### 语言文件格式
```json
{
  "nav": {
    "logo": "Claude 4 指南"
  },
  "hero": {
    "title": "标题文本",
    "features": [
      "功能1",
      "功能2"
    ]
  }
}
```

## 测试方法

1. **打开网站**
   - 访问 https://xianyu110.github.io/claude-code/
   - 或本地打开 index.html

2. **测试语言切换**
   - 使用右上角的语言选择器
   - 观察页面内容是否实时更新

3. **测试URL参数**
   - 访问 `index.html?lang=en-US`（英文）
   - 访问 `index.html?lang=ja-JP`（日文）

4. **测试浏览器语言检测**
   - 清除localStorage中的 `preferred-language`
   - 更改浏览器语言设置
   - 刷新页面查看是否自动切换

## 故障排除

如果多语言功能不正常：

1. **检查控制台错误**
   - 打开浏览器开发者工具
   - 查看是否有JavaScript错误

2. **验证文件加载**
   - 确保languages目录下的JSON文件可以访问
   - 检查网络请求是否成功

3. **清除缓存**
   - 清除浏览器缓存
   - 清除localStorage数据

## 扩展新语言

1. 在 `languages/` 目录创建新的语言文件（如 `fr-FR.json`）
2. 复制现有语言文件的结构
3. 翻译所有文本内容
4. 在 `js/i18n.js` 中添加语言到 `supportedLanguages`：
   ```javascript
   this.supportedLanguages = {
       'zh-CN': '中文',
       'en-US': 'English',
       'ja-JP': '日本語',
       'ko-KR': '한국어',
       'es-ES': 'Español',
       'fr-FR': 'Français'  // 新增
   };
   ```

## 维护建议

1. 定期检查所有语言文件的一致性
2. 添加新功能时，同步更新所有语言文件
3. 使用专业翻译服务确保翻译质量
4. 定期测试所有语言版本的显示效果

---

更新日期：2025-08-04