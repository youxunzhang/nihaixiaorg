// 倪海厦中医传承网站主要JavaScript文件 - 优化版

// 性能优化：使用 Intersection Observer API
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

// 性能优化：防抖函数
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 性能优化：节流函数
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
    // 初始化所有功能
    initNavigation();
    initBackToTop();
    initScrollAnimations();
    initMobileMenu();
    initFormHandling();
    initTooltips();
    initCategoryFilter();
    initShareButtons();
    initSearchFunctionality();
    initLazyLoading();
    initPerformanceOptimizations();
    initMedicineInfoTabs();
});

// 导航栏功能
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    navLinks.forEach(link => {
        // 移除所有active类
        link.classList.remove('active');
        
        // 检查当前页面并添加active类
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
    });
}

// 返回顶部按钮
function initBackToTop() {
    const backToTopBtn = document.getElementById('back-to-top');
    
    if (!backToTopBtn) return;
    
    // 监听滚动事件
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    });
    
    // 点击返回顶部
    backToTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// 滚动动画
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
            }
        });
    }, observerOptions);
    
    // 观察所有需要动画的元素
    const animateElements = document.querySelectorAll('.scroll-animate, .feature-card, .course-card, .resource-card, .news-card');
    animateElements.forEach(el => {
        observer.observe(el);
    });
}

// 移动端菜单
function initMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (!hamburger || !navMenu) return;
    
    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
    
    // 点击菜单项时关闭菜单
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });
    
    // 点击外部区域关闭菜单
    document.addEventListener('click', function(e) {
        if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });
}

// 表单处理
function initFormHandling() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // 获取表单数据
            const formData = new FormData(form);
            const data = Object.fromEntries(formData);
            
            // 显示提交状态
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = '提交中...';
            submitBtn.disabled = true;
            
            // 模拟提交过程
            setTimeout(() => {
                // 显示成功消息
                showMessage('提交成功！我们会尽快与您联系。', 'success');
                
                // 重置表单
                form.reset();
                
                // 恢复按钮状态
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }, 2000);
        });
    });
}

// 工具提示
function initTooltips() {
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    
    tooltipElements.forEach(element => {
        element.addEventListener('mouseenter', function() {
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = this.getAttribute('data-tooltip');
            
            document.body.appendChild(tooltip);
            
            const rect = this.getBoundingClientRect();
            tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
            tooltip.style.top = rect.top - tooltip.offsetHeight - 10 + 'px';
        });
        
        element.addEventListener('mouseleave', function() {
            const tooltip = document.querySelector('.tooltip');
            if (tooltip) {
                tooltip.remove();
            }
        });
    });
}

// 分类筛选
function initCategoryFilter() {
    const filterTabs = document.querySelectorAll('.filter-tab');
    const filterItems = document.querySelectorAll('.filter-item');
    
    if (!filterTabs.length) return;
    
    filterTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            
            // 更新活动标签
            filterTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // 筛选项目
            filterItems.forEach(item => {
                if (category === 'all' || item.getAttribute('data-category') === category) {
                    item.style.display = 'block';
                    item.classList.add('fade-in-up');
                } else {
                    item.style.display = 'none';
                    item.classList.remove('fade-in-up');
                }
            });
        });
    });
}

// 分享按钮
function initShareButtons() {
    const shareButtons = document.querySelectorAll('.share-btn');
    
    shareButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            const platform = this.getAttribute('data-platform');
            const url = encodeURIComponent(window.location.href);
            const title = encodeURIComponent(document.title);
            
            let shareUrl = '';
            
            switch (platform) {
                case 'wechat':
                    showMessage('请使用微信扫描二维码分享', 'info');
                    break;
                case 'weibo':
                    shareUrl = `https://service.weibo.com/share/share.php?url=${url}&title=${title}`;
                    break;
                case 'qq':
                    shareUrl = `https://connect.qq.com/widget/shareqq/index.html?url=${url}&title=${title}`;
                    break;
                case 'douyin':
                    showMessage('请复制链接到抖音分享', 'info');
                    break;
            }
            
            if (shareUrl) {
                window.open(shareUrl, '_blank', 'width=600,height=400');
            }
        });
    });
}

// 搜索功能
function initSearchFunctionality() {
    const searchInput = document.querySelector('.search-input');
    const searchResults = document.querySelector('.search-results');
    
    if (!searchInput) return;
    
    let searchTimeout;
    
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        
        searchTimeout = setTimeout(() => {
            const query = this.value.trim();
            
            if (query.length < 2) {
                if (searchResults) {
                    searchResults.style.display = 'none';
                }
                return;
            }
            
            // 模拟搜索
            performSearch(query);
        }, 300);
    });
    
    // 点击外部关闭搜索结果
    document.addEventListener('click', function(e) {
        if (!searchInput.contains(e.target) && searchResults && !searchResults.contains(e.target)) {
            searchResults.style.display = 'none';
        }
    });
}

// 执行搜索
function performSearch(query) {
    // 这里可以连接到实际的搜索API
    // 目前使用模拟数据
    const mockResults = [
        { title: '倪海厦《伤寒论》精讲', url: 'courses.html#伤寒论', type: '课程' },
        { title: '中医脉诊技巧详解', url: 'courses.html#脉诊', type: '课程' },
        { title: '倪海厦老师生平介绍', url: 'articles/ni-haixia-intro.html', type: '文章' },
        { title: '中医基础理论', url: 'resources.html#基础理论', type: '资料' }
    ].filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.type.toLowerCase().includes(query.toLowerCase())
    );
    
    displaySearchResults(mockResults);
}

// 显示搜索结果
function displaySearchResults(results) {
    const searchResults = document.querySelector('.search-results');
    
    if (!searchResults) return;
    
    if (results.length === 0) {
        searchResults.innerHTML = '<div class="no-results">没有找到相关结果</div>';
    } else {
        searchResults.innerHTML = results.map(result => `
            <div class="search-result">
                <a href="${result.url}">
                    <div class="result-title">${result.title}</div>
                    <div class="result-type">${result.type}</div>
                </a>
            </div>
        `).join('');
    }
    
    searchResults.style.display = 'block';
}

// 显示消息
function showMessage(message, type = 'info') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message message-${type}`;
    messageDiv.textContent = message;
    
    // 添加样式
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        max-width: 300px;
    `;
    
    // 根据类型设置背景色
    switch (type) {
        case 'success':
            messageDiv.style.backgroundColor = '#4caf50';
            break;
        case 'error':
            messageDiv.style.backgroundColor = '#f44336';
            break;
        case 'warning':
            messageDiv.style.backgroundColor = '#ff9800';
            break;
        default:
            messageDiv.style.backgroundColor = '#2196f3';
    }
    
    document.body.appendChild(messageDiv);
    
    // 3秒后自动移除
    setTimeout(() => {
        messageDiv.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 300);
    }, 3000);
}

// 添加动画样式
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .search-results {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: white;
        border: 1px solid #ddd;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        z-index: 1000;
        display: none;
    }
    
    .search-result {
        padding: 10px 15px;
        border-bottom: 1px solid #eee;
    }
    
    .search-result:last-child {
        border-bottom: none;
    }
    
    .search-result a {
        text-decoration: none;
        color: inherit;
    }
    
    .result-title {
        font-weight: 500;
        margin-bottom: 2px;
    }
    
    .result-type {
        font-size: 0.8em;
        color: #666;
    }
    
    .no-results {
        padding: 15px;
        text-align: center;
        color: #666;
    }
`;
document.head.appendChild(style);

// 页面加载完成后的初始化
window.addEventListener('load', function() {
    // 移除加载动画
    const loadingElements = document.querySelectorAll('.loading');
    loadingElements.forEach(el => {
        el.style.display = 'none';
    });
    
    // 触发初始动画
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        heroContent.classList.add('fade-in-up');
    }
});

// 导出函数供其他脚本使用
window.NiHaiXiaWebsite = {
    showMessage,
    performSearch,
    initNavigation,
    initBackToTop
};

// 本草纲目数据
const bencaoData = [
    {
        id: 1,
        name: "人参",
        pinyin: "Rén Shēn",
        category: "补气药",
        nature: "甘、微苦，微温",
        meridian: "心、肺、脾、肾经",
        effects: "大补元气，复脉固脱，补脾益肺，生津养血，安神益智",
        usage: "3-9g，大剂量可用至15g",
        contraindications: "实证、热证忌服",
        description: "人参为五加科植物人参的干燥根。主产于吉林、辽宁、黑龙江等地。具有大补元气、复脉固脱、补脾益肺、生津养血、安神益智的功效。",
        tags: ["补气", "安神", "生津", "固脱"]
    },
    {
        id: 2,
        name: "黄芪",
        pinyin: "Huáng Qí",
        category: "补气药",
        nature: "甘，微温",
        meridian: "肺、脾经",
        effects: "补气升阳，益卫固表，利水消肿，生津养血，行气活血，托毒排脓，敛疮生肌",
        usage: "9-30g",
        contraindications: "表实邪盛、气滞湿阻、食积内停、阴虚阳亢、热毒炽盛者忌服",
        description: "黄芪为豆科植物蒙古黄芪或膜荚黄芪的干燥根。主产于内蒙古、山西、甘肃等地。具有补气升阳、益卫固表、利水消肿等功效。",
        tags: ["补气", "固表", "利水", "托毒"]
    },
    {
        id: 3,
        name: "当归",
        pinyin: "Dāng Guī",
        category: "补血药",
        nature: "甘、辛，温",
        meridian: "心、肝、脾经",
        effects: "补血活血，调经止痛，润燥滑肠",
        usage: "6-15g",
        contraindications: "湿盛中满、大便溏泄者慎服",
        description: "当归为伞形科植物当归的干燥根。主产于甘肃、云南、四川等地。具有补血活血、调经止痛、润燥滑肠的功效。",
        tags: ["补血", "活血", "调经", "止痛"]
    },
    {
        id: 4,
        name: "白芍",
        pinyin: "Bái Sháo",
        category: "补血药",
        nature: "苦、酸，微寒",
        meridian: "肝、脾经",
        effects: "养血调经，敛阴止汗，柔肝止痛，平抑肝阳",
        usage: "6-15g",
        contraindications: "虚寒腹痛泄泻者慎服",
        description: "白芍为毛茛科植物芍药的干燥根。主产于浙江、安徽、四川等地。具有养血调经、敛阴止汗、柔肝止痛的功效。",
        tags: ["补血", "调经", "止痛", "敛阴"]
    },
    {
        id: 5,
        name: "川芎",
        pinyin: "Chuān Xiōng",
        category: "活血化瘀药",
        nature: "辛，温",
        meridian: "肝、胆、心包经",
        effects: "活血行气，祛风止痛",
        usage: "3-10g",
        contraindications: "阴虚火旺、月经过多者慎服",
        description: "川芎为伞形科植物川芎的干燥根茎。主产于四川、云南、贵州等地。具有活血行气、祛风止痛的功效。",
        tags: ["活血", "行气", "祛风", "止痛"]
    },
    {
        id: 6,
        name: "丹参",
        pinyin: "Dān Shēn",
        category: "活血化瘀药",
        nature: "苦，微寒",
        meridian: "心、肝经",
        effects: "活血祛瘀，通经止痛，清心除烦，凉血消痈",
        usage: "10-15g",
        contraindications: "无瘀血者慎服",
        description: "丹参为唇形科植物丹参的干燥根及根茎。主产于四川、安徽、江苏等地。具有活血祛瘀、通经止痛、清心除烦的功效。",
        tags: ["活血", "祛瘀", "通经", "止痛"]
    },
    {
        id: 7,
        name: "茯苓",
        pinyin: "Fú Líng",
        category: "利水渗湿药",
        nature: "甘、淡，平",
        meridian: "心、肺、脾、肾经",
        effects: "利水渗湿，健脾，宁心",
        usage: "9-15g",
        contraindications: "虚寒精滑者忌服",
        description: "茯苓为多孔菌科真菌茯苓的干燥菌核。主产于云南、安徽、湖北等地。具有利水渗湿、健脾、宁心的功效。",
        tags: ["利水", "渗湿", "健脾", "宁心"]
    },
    {
        id: 8,
        name: "白术",
        pinyin: "Bái Zhú",
        category: "补气药",
        nature: "苦、甘，温",
        meridian: "脾、胃经",
        effects: "健脾益气，燥湿利水，止汗，安胎",
        usage: "6-12g",
        contraindications: "阴虚内热、津液亏耗者慎服",
        description: "白术为菊科植物白术的干燥根茎。主产于浙江、安徽、湖南等地。具有健脾益气、燥湿利水、止汗、安胎的功效。",
        tags: ["健脾", "益气", "燥湿", "利水"]
    },
    {
        id: 9,
        name: "甘草",
        pinyin: "Gān Cǎo",
        category: "补气药",
        nature: "甘，平",
        meridian: "心、肺、脾、胃经",
        effects: "补脾益气，清热解毒，祛痰止咳，缓急止痛，调和诸药",
        usage: "2-10g",
        contraindications: "湿盛胀满、浮肿者忌服",
        description: "甘草为豆科植物甘草、胀果甘草或光果甘草的干燥根及根茎。主产于内蒙古、甘肃、新疆等地。具有补脾益气、清热解毒等功效。",
        tags: ["补脾", "益气", "解毒", "调和"]
    },
    {
        id: 10,
        name: "陈皮",
        pinyin: "Chén Pí",
        category: "理气药",
        nature: "苦、辛，温",
        meridian: "肺、脾经",
        effects: "理气健脾，燥湿化痰",
        usage: "3-10g",
        contraindications: "阴虚燥咳、吐血者慎服",
        description: "陈皮为芸香科植物橘及其栽培变种的干燥成熟果皮。主产于广东、福建、四川等地。具有理气健脾、燥湿化痰的功效。",
        tags: ["理气", "健脾", "燥湿", "化痰"]
    },
    {
        id: 11,
        name: "半夏",
        pinyin: "Bàn Xià",
        category: "化痰止咳平喘药",
        nature: "辛，温；有毒",
        meridian: "脾、胃、肺经",
        effects: "燥湿化痰，降逆止呕，消痞散结",
        usage: "3-10g",
        contraindications: "阴虚燥咳、血证、热痰、燥痰者慎服",
        description: "半夏为天南星科植物半夏的干燥块茎。主产于四川、湖北、河南等地。具有燥湿化痰、降逆止呕、消痞散结的功效。",
        tags: ["化痰", "降逆", "止呕", "消痞"]
    },
    {
        id: 12,
        name: "柴胡",
        pinyin: "Chái Hú",
        category: "解表药",
        nature: "苦、辛，微寒",
        meridian: "肝、胆经",
        effects: "疏散退热，疏肝解郁，升举阳气",
        usage: "3-10g",
        contraindications: "肝阳上亢、肝风内动、阴虚火旺者慎服",
        description: "柴胡为伞形科植物柴胡或狭叶柴胡的干燥根。主产于河北、山西、陕西等地。具有疏散退热、疏肝解郁、升举阳气的功效。",
        tags: ["解表", "疏肝", "退热", "升阳"]
    },
    {
        id: 13,
        name: "黄连",
        pinyin: "Huáng Lián",
        category: "清热药",
        nature: "苦，寒",
        meridian: "心、脾、胃、肝、胆、大肠经",
        effects: "清热燥湿，泻火解毒",
        usage: "2-5g",
        contraindications: "脾胃虚寒者忌服",
        description: "黄连为毛茛科植物黄连、三角叶黄连或云连的干燥根茎。主产于四川、湖北、云南等地。具有清热燥湿、泻火解毒的功效。",
        tags: ["清热", "燥湿", "泻火", "解毒"]
    },
    {
        id: 14,
        name: "金银花",
        pinyin: "Jīn Yín Huā",
        category: "清热药",
        nature: "甘，寒",
        meridian: "肺、心、胃经",
        effects: "清热解毒，疏散风热",
        usage: "6-15g",
        contraindications: "脾胃虚寒者慎服",
        description: "金银花为忍冬科植物忍冬的干燥花蕾或带初开的花。主产于河南、山东、河北等地。具有清热解毒、疏散风热的功效。",
        tags: ["清热", "解毒", "疏散", "风热"]
    },
    {
        id: 15,
        name: "枸杞子",
        pinyin: "Gǒu Qǐ Zǐ",
        category: "补阴药",
        nature: "甘，平",
        meridian: "肝、肾经",
        effects: "滋补肝肾，益精明目",
        usage: "6-12g",
        contraindications: "外感实热、脾虚有湿及泄泻者忌服",
        description: "枸杞子为茄科植物宁夏枸杞的干燥成熟果实。主产于宁夏、甘肃、青海等地。具有滋补肝肾、益精明目的功效。",
        tags: ["滋补", "肝肾", "明目", "益精"]
    }
];

// 本草纲目功能
function initBencaoSection() {
    const bencaoSection = document.querySelector('.bencao-section');
    if (!bencaoSection) return;

    let currentPage = 1;
    let itemsPerPage = 6;
    let filteredData = [...bencaoData];
    let currentCategory = 'all';

    // 初始化搜索和筛选
    const searchInput = bencaoSection.querySelector('.bencao-search input');
    const filterButtons = bencaoSection.querySelectorAll('.bencao-filter');
    const bencaoGrid = bencaoSection.querySelector('.bencao-grid');
    const pagination = bencaoSection.querySelector('.bencao-pagination');
    const stats = bencaoSection.querySelector('.bencao-stats');

    // 搜索功能
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const query = this.value.toLowerCase();
            filterBencao(query, currentCategory);
        });
    }

    // 筛选功能
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const category = this.dataset.category;
            currentCategory = category;
            
            // 更新按钮状态
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // 筛选数据
            filterBencao(searchInput ? searchInput.value.toLowerCase() : '', category);
        });
    });

    // 筛选本草数据
    function filterBencao(query, category) {
        filteredData = bencaoData.filter(item => {
            const matchesQuery = !query || 
                item.name.toLowerCase().includes(query) ||
                item.pinyin.toLowerCase().includes(query) ||
                item.effects.toLowerCase().includes(query) ||
                item.category.toLowerCase().includes(query);
            
            const matchesCategory = category === 'all' || item.category === category;
            
            return matchesQuery && matchesCategory;
        });

        currentPage = 1;
        renderBencaoGrid();
        renderPagination();
        updateStats();
    }

    // 渲染本草网格
    function renderBencaoGrid() {
        if (!bencaoGrid) return;

        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const pageData = filteredData.slice(startIndex, endIndex);

        if (pageData.length === 0) {
            bencaoGrid.innerHTML = `
                <div class="bencao-no-results">
                    <h3>没有找到相关本草</h3>
                    <p>请尝试其他搜索关键词或筛选条件</p>
                </div>
            `;
            return;
        }

        bencaoGrid.innerHTML = pageData.map(item => `
            <div class="bencao-item" data-id="${item.id}">
                <div class="bencao-item-header">
                    <h3>${item.name}</h3>
                    <div class="pinyin">${item.pinyin}</div>
                </div>
                <div class="bencao-item-content">
                    <div class="bencao-property">
                        <h4>分类</h4>
                        <p>${item.category}</p>
                    </div>
                    <div class="bencao-property">
                        <h4>性味</h4>
                        <p>${item.nature}</p>
                    </div>
                    <div class="bencao-property">
                        <h4>功效</h4>
                        <p>${item.effects}</p>
                    </div>
                    <div class="bencao-tags">
                        ${item.tags.map(tag => `<span class="bencao-tag">${tag}</span>`).join('')}
                    </div>
                </div>
            </div>
        `).join('');

        // 添加点击事件
        bencaoGrid.querySelectorAll('.bencao-item').forEach(item => {
            item.addEventListener('click', function() {
                const id = parseInt(this.dataset.id);
                showBencaoDetail(id);
            });
        });
    }

    // 渲染分页
    function renderPagination() {
        if (!pagination) return;

        const totalPages = Math.ceil(filteredData.length / itemsPerPage);
        
        if (totalPages <= 1) {
            pagination.innerHTML = '';
            return;
        }

        let paginationHTML = '';
        
        // 上一页按钮
        paginationHTML += `
            <button ${currentPage === 1 ? 'disabled' : ''} onclick="changePage(${currentPage - 1})">
                上一页
            </button>
        `;

        // 页码按钮
        const startPage = Math.max(1, currentPage - 2);
        const endPage = Math.min(totalPages, currentPage + 2);

        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `
                <button class="${i === currentPage ? 'current-page' : ''}" onclick="changePage(${i})">
                    ${i}
                </button>
            `;
        }

        // 下一页按钮
        paginationHTML += `
            <button ${currentPage === totalPages ? 'disabled' : ''} onclick="changePage(${currentPage + 1})">
                下一页
            </button>
        `;

        pagination.innerHTML = paginationHTML;
    }

    // 更新统计信息
    function updateStats() {
        if (!stats) return;
        stats.textContent = `共找到 ${filteredData.length} 种本草，当前显示第 ${currentPage} 页`;
    }

    // 切换页面
    window.changePage = function(page) {
        const totalPages = Math.ceil(filteredData.length / itemsPerPage);
        if (page >= 1 && page <= totalPages) {
            currentPage = page;
            renderBencaoGrid();
            renderPagination();
            updateStats();
            
            // 滚动到顶部
            bencaoSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    // 显示本草详情
    function showBencaoDetail(id) {
        const item = bencaoData.find(item => item.id === id);
        if (!item) return;

        // 创建模态框
        const modal = document.createElement('div');
        modal.className = 'bencao-modal';
        modal.innerHTML = `
            <div class="bencao-modal-content">
                <div class="bencao-modal-header">
                    <h2>${item.name} (${item.pinyin})</h2>
                    <button class="bencao-modal-close">&times;</button>
                </div>
                <div class="bencao-modal-body">
                    <div class="bencao-detail-section">
                        <h3>基本信息</h3>
                        <p><strong>分类：</strong>${item.category}</p>
                        <p><strong>性味：</strong>${item.nature}</p>
                        <p><strong>归经：</strong>${item.meridian}</p>
                        <p><strong>用量：</strong>${item.usage}</p>
                    </div>
                    <div class="bencao-detail-section">
                        <h3>功效主治</h3>
                        <p>${item.effects}</p>
                    </div>
                    <div class="bencao-detail-section">
                        <h3>详细描述</h3>
                        <p>${item.description}</p>
                    </div>
                    <div class="bencao-detail-section">
                        <h3>使用注意</h3>
                        <p><strong>禁忌：</strong>${item.contraindications}</p>
                    </div>
                    <div class="bencao-detail-section">
                        <h3>相关标签</h3>
                        <div class="bencao-tags">
                            ${item.tags.map(tag => `<span class="bencao-tag">${tag}</span>`).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // 显示模态框
        setTimeout(() => {
            modal.classList.add('active');
        }, 10);

        // 关闭模态框
        const closeBtn = modal.querySelector('.bencao-modal-close');
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('active');
            setTimeout(() => {
                document.body.removeChild(modal);
            }, 300);
        });

        // 点击背景关闭
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
                setTimeout(() => {
                    document.body.removeChild(modal);
                }, 300);
            }
        });
    }

    // 初始化渲染
    renderBencaoGrid();
    renderPagination();
    updateStats();
}

// 页面加载完成后初始化本草纲目功能
document.addEventListener('DOMContentLoaded', function() {
    initBencaoSection();
}); 

// 复制到剪贴板功能
function copyToClipboard(text) {
    // 使用现代浏览器的 Clipboard API
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(() => {
            showMessage('已复制到剪贴板！', 'success');
        }).catch(err => {
            console.error('复制失败:', err);
            fallbackCopyToClipboard(text);
        });
    } else {
        // 降级方案：使用传统的 document.execCommand
        fallbackCopyToClipboard(text);
    }
}

// 降级复制方案
function fallbackCopyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        const successful = document.execCommand('copy');
        if (successful) {
            showMessage('已复制到剪贴板！', 'success');
        } else {
            showMessage('复制失败，请手动复制', 'error');
        }
    } catch (err) {
        console.error('复制失败:', err);
        showMessage('复制失败，请手动复制', 'error');
    }
    
    document.body.removeChild(textArea);
}

// 轮播功能 - 已移除

// 轮播控制函数 - 已移除

// 图片懒加载功能
function initLazyLoading() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
}

// 轮播图片优化功能 - 已移除

// 性能优化功能
function initPerformanceOptimizations() {
    // 导航栏滚动效果
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        const handleScroll = throttle(() => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }, 100);

        window.addEventListener('scroll', handleScroll);
    }

    // 预加载关键资源
    preloadCriticalResources();

    // 优化字体加载
    optimizeFontLoading();
}

// 预加载关键资源
function preloadCriticalResources() {
    const criticalImages = [
        'img/微信图片_2025-07-29_114127_664.png',
        'img/微信图片_2025-07-29_114202_704.png',
        'img/微信图片_2025-07-29_114227_868.png'
    ];

    criticalImages.forEach(src => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = src;
        document.head.appendChild(link);
    });
}

// 优化字体加载
function optimizeFontLoading() {
    if ('fonts' in document) {
        Promise.all([
            document.fonts.load('1em KaiTi'),
            document.fonts.load('1em SimSun')
        ]).then(() => {
            document.documentElement.classList.add('fonts-loaded');
        });
    }
}

// 页面可见性API优化
function initPageVisibilityOptimizations() {
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            // 页面不可见时暂停动画
            document.body.classList.add('page-hidden');
        } else {
            // 页面可见时恢复动画
            document.body.classList.remove('page-hidden');
        }
    });
}

// 错误监控
function initErrorMonitoring() {
    // 监听全局错误
    window.addEventListener('error', function(e) {
        console.error('页面错误:', e.error);
        // 这里可以添加错误上报逻辑
    });
    
    // 监听未处理的Promise拒绝
    window.addEventListener('unhandledrejection', function(e) {
        console.error('未处理的Promise拒绝:', e.reason);
        // 这里可以添加错误上报逻辑
    });
}

// 药物信息标签页功能
function initMedicineInfoTabs() {
    const medicineTabs = document.querySelectorAll('.medicine-tab');
    const medicinePanels = document.querySelectorAll('.medicine-info-panel');
    
    if (!medicineTabs.length || !medicinePanels.length) return;
    
    medicineTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // 移除所有活动状态
            medicineTabs.forEach(t => t.classList.remove('active'));
            medicinePanels.forEach(p => p.classList.remove('active'));
            
            // 添加当前活动状态
            this.classList.add('active');
            const targetPanel = document.getElementById(targetTab + '-panel');
            if (targetPanel) {
                targetPanel.classList.add('active');
                
                // 添加动画效果
                targetPanel.style.animation = 'none';
                targetPanel.offsetHeight; // 触发重排
                targetPanel.style.animation = 'fadeInUp 0.5s ease-out';
            }
        });
    });
    
    // 添加键盘导航支持
    medicineTabs.forEach((tab, index) => {
        tab.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                const nextTab = medicineTabs[(index + 1) % medicineTabs.length];
                nextTab.focus();
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                const prevTab = medicineTabs[(index - 1 + medicineTabs.length) % medicineTabs.length];
                prevTab.focus();
            }
        });
    });
    
    // 添加触摸滑动支持（移动端）
    let startX = 0;
    let currentTabIndex = 0;
    
    const medicineInfoContent = document.querySelector('.medicine-info-content');
    if (medicineInfoContent) {
        medicineInfoContent.addEventListener('touchstart', function(e) {
            startX = e.touches[0].clientX;
        });
        
        medicineInfoContent.addEventListener('touchend', function(e) {
            const endX = e.changedTouches[0].clientX;
            const diffX = startX - endX;
            const threshold = 50;
            
            if (Math.abs(diffX) > threshold) {
                if (diffX > 0) {
                    // 向左滑动，切换到下一个标签
                    currentTabIndex = (currentTabIndex + 1) % medicineTabs.length;
                } else {
                    // 向右滑动，切换到上一个标签
                    currentTabIndex = (currentTabIndex - 1 + medicineTabs.length) % medicineTabs.length;
                }
                
                medicineTabs[currentTabIndex].click();
            }
        });
    }
} 