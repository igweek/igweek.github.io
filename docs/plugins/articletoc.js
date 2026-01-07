function loadResource(type, attributes) {
    if (type === 'style') {
        const style = document.createElement('style');
        style.textContent = attributes.css;
        document.head.appendChild(style);
    }
}

function createTOC() {
    const tocElement = document.createElement('div');
    tocElement.className = 'toc';
    const contentContainer = document.querySelector('.markdown-body');
    // 防止没有 markdown-body 时报错
    if (!contentContainer) return; 
    contentContainer.appendChild(tocElement);

    const headings = contentContainer.querySelectorAll('h1, h2, h3, h4, h5, h6');
    headings.forEach(heading => {
        if (!heading.id) {
            heading.id = heading.textContent.trim().replace(/\s+/g, '-').toLowerCase();
        }
        const link = document.createElement('a');
        link.href = '#' + heading.id;
        link.textContent = heading.textContent;
        link.className = 'toc-link';
        link.style.paddingLeft = `${(parseInt(heading.tagName.charAt(1)) - 1) * 10}px`;
        tocElement.appendChild(link);
    });
}

function toggleTOC() {
    const tocElement = document.querySelector('.toc');
    const tocIcon = document.querySelector('.toc-icon');
    if (tocElement) {
        tocElement.classList.toggle('show');
        tocIcon.classList.toggle('active');
        tocIcon.textContent = tocElement.classList.contains('show') ? '✖' : '☰';
    }
}

// 新增：回到顶部函数
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

document.addEventListener("DOMContentLoaded", function() {
    createTOC();
    const css = `
        :root {
            --toc-bg: #fff;
            --toc-border: #e1e4e8;
            --toc-text: #24292e;
            --toc-hover: #f6f8fa;
            --toc-icon-bg: #fff;
            --toc-icon-color: #ad6598;
            --toc-icon-active-bg: #813c85;
            --toc-icon-active-color: #fff;
        }

        @media (prefers-color-scheme: dark) {
            :root {
                --toc-bg: #2d333b;
                --toc-border: #444c56;
                --toc-text: #adbac7;
                --toc-hover: #373e47;
                --toc-icon-bg: #22272e;
                --toc-icon-color: #ad6598;
                --toc-icon-active-bg: #813c85;
                --toc-icon-active-color: #adbac7;
            }
        }

        .toc {
            position: fixed;
            bottom: 70px; /* 稍微调高一点，避免遮挡按钮 */
            right: 20px;
            width: 250px;
            max-height: 70vh;
            background-color: var(--toc-bg);
            border: 1px solid var(--toc-border);
            border-radius: 6px;
            padding: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow-y: auto;
            z-index: 1000;
            opacity: 0;
            visibility: hidden;
            transform: translateY(20px) scale(0.9);
            transition: opacity 0.3s ease, transform 0.3s ease, visibility 0.3s;
        }
        .toc.show {
            opacity: 1;
            visibility: visible;
            transform: translateY(0) scale(1);
        }
        .toc a {
            display: block;
            color: var(--toc-text);
            text-decoration: none;
            padding: 5px 0;
            font-size: 14px;
            line-height: 1.5;
            border-bottom: 1px solid var(--toc-border);
            transition: background-color 0.2s ease, padding-left 0.2s ease;
        }
        .toc a:last-child {
            border-bottom: none;
        }
        .toc a:hover {
            background-color: var(--toc-hover);
            padding-left: 5px;
        }
        
        /* 目录按钮样式 */
        .toc-icon {
            position: fixed;
            bottom: 20px;
            right: 20px;
            cursor: pointer;
            font-size: 24px;
            background-color: var(--toc-icon-bg);
            color: var(--toc-icon-color);
            border: 2px solid var(--toc-icon-color);
            border-radius: 50%;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 1px 3px rgba(0,0,0,0.12);
            z-index: 1001;
            transition: all 0.3s ease;
            user-select: none;
            -webkit-tap-highlight-color: transparent;
            outline: none;
        }
        .toc-icon:hover {
            transform: scale(1.1);
        }
        .toc-icon:active {
            transform: scale(0.9);
        }
        .toc-icon.active {
            background-color: var(--toc-icon-active-bg);
            color: var(--toc-icon-active-color);
            border-color: var(--toc-icon-active-bg);
            transform: rotate(90deg);
        }

        /* --- 新增：回到顶部按钮样式 --- */
        .back-to-top {
            position: fixed;
            bottom: 70px; /* 位于目录按钮上方 */
            right: 20px;
            cursor: pointer;
            font-size: 20px;
            background-color: var(--toc-icon-bg);
            color: var(--toc-icon-color);
            border: 2px solid var(--toc-icon-color);
            border-radius: 50%;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 1px 3px rgba(0,0,0,0.12);
            z-index: 1001;
            transition: all 0.3s ease, opacity 0.3s, visibility 0.3s;
            user-select: none;
            
            /* 默认隐藏 */
            opacity: 0;
            visibility: hidden;
            transform: translateY(10px);
        }
        .back-to-top.show {
            opacity: 1;
            visibility: visible;
            transform: translateY(0);
        }
        .back-to-top:hover {
            transform: translateY(0) scale(1.1);
            background-color: var(--toc-icon-active-bg);
            color: var(--toc-icon-active-color);
            border-color: var(--toc-icon-active-bg);
        }
    `;
    loadResource('style', {css: css});

    // 创建目录按钮
    const tocIcon = document.createElement('div');
    tocIcon.className = 'toc-icon';
    tocIcon.textContent = '☰';
    tocIcon.onclick = (e) => {
        e.stopPropagation();
        toggleTOC();
    };
    document.body.appendChild(tocIcon);

    // --- 新增：创建回到顶部按钮 ---
    const backToTopBtn = document.createElement('div');
    backToTopBtn.className = 'back-to-top';
    backToTopBtn.innerHTML = '↑'; // 你可以用 SVG 图标，这里暂时用箭头符号
    backToTopBtn.onclick = scrollToTop;
    document.body.appendChild(backToTopBtn);

    // --- 新增：监听滚动，控制按钮显示 ---
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) { // 滚动超过300px显示
            backToTopBtn.classList.add('show');
        } else {
            backToTopBtn.classList.remove('show');
        }
    });

    // 点击空白处关闭目录
    document.addEventListener('click', (e) => {
        const tocElement = document.querySelector('.toc');
        if (tocElement && tocElement.classList.contains('show') && !tocElement.contains(e.target) && !e.target.classList.contains('toc-icon')) {
            toggleTOC();
        }
    });
});
