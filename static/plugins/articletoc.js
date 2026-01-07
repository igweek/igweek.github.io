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
    // 默认不需要 show，点击按钮再 show
    // tocElement.classList.add('show'); 
        
    const contentContainer = document.querySelector('.markdown-body');
    if (!contentContainer) return; // 安全检查

    contentContainer.appendChild(tocElement);

    const headings = contentContainer.querySelectorAll('h1, h2, h3, h4, h5, h6');
    headings.forEach(heading => {
        if (!heading.id) {
            heading.id = heading.textContent.trim().replace(/\s+/g, '-').toLowerCase();
        }
        const link = document.createElement('a');
        link.href = '#' + heading.id;
        link.textContent = heading.textContent;
        link.setAttribute('data-id', heading.id);
        link.className = 'toc-link';
        link.style.paddingLeft = `${(parseInt(heading.tagName.charAt(1)) - 1) * 10}px`;
        tocElement.appendChild(link);
    });

    // --- 修改点：虽然还是放在末尾，但配合 CSS 的 sticky 属性即可固定 ---
    tocElement.insertAdjacentHTML('beforeend', '<a class="toc-end" onclick="window.scrollTo({top:0,behavior: \'smooth\'});">⬆ 返回顶部</a>');
    
    // 注意：prepend 会把元素移到最前面，如果你已经在上面 appendChild 过了，这里会移动它
    contentContainer.prepend(tocElement);
}

function highlightTOC() {
    const tocLinks = document.querySelectorAll('.toc-link');
    const fromTop = window.scrollY + 100; // 稍微增加一点偏移量，让高亮更自然

    let currentHeading = null;

    tocLinks.forEach(link => {
        const section = document.getElementById(link.getAttribute('data-id'));
        if (section && section.offsetTop <= fromTop) {
            currentHeading = link;
        }
    });

    tocLinks.forEach(link => {
        link.classList.remove('active-toc');
    });

    if (currentHeading) {
        currentHeading.classList.add('active-toc');
        currentHeading.scrollIntoView({
            block: 'center',
            inline: 'nearest'
        });
    }
}

function toggleTOC() {
    const tocElement = document.querySelector('.toc');
    const tocIcon = document.querySelector('.toc-icon');
    if (tocElement) {
        tocElement.classList.toggle('show');
        if (tocIcon) {
            tocIcon.classList.toggle('active');
            tocIcon.textContent = tocElement.classList.contains('show') ? '✖' : '☰';
        }
    }
}

// --- 新增：专门处理回到顶部按钮显示的函数 ---
function handleBackToTopVisibility() {
    const backToTopButton = document.querySelector('.toc-end');
    if (!backToTopButton) return;

    // 当页面向下滚动超过 100px 时显示按钮，否则隐藏
    if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
        backToTopButton.classList.add('visible');
    } else {
        backToTopButton.classList.remove('visible');
    }
}

document.addEventListener("DOMContentLoaded", function() {
    createTOC();
    
    const css = `
       :root {
            --toc-bg: rgba(237, 239, 233, 0.95); /* 稍微加深不透明度 */
            --toc-border: #e1e4e8;
            --toc-text: #24292e;
            --toc-hover: #8ae9c4;
            --toc-icon-bg: #fff;
            --toc-icon-color: #ad6598;
            --toc-icon-active-bg: #813c85;
            --toc-icon-active-color: #fff;
        }

        .toc {
            position: fixed;
            bottom: 60px;
            right: 20px;
            width: 230px;
            max-height: 70vh;
            background-color: var(--toc-bg);
            border: 1px solid var(--toc-border);
            border-radius: 8px;
            padding: 10px;
            /* 增加 padding-bottom 给 sticky 按钮留空间，防止内容被遮挡 */
            padding-bottom: 0; 
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow-y: auto;
            z-index: 1000;
            opacity: 0;
            visibility: hidden;
            transform: translateY(20px) scale(0.9);
            transition: opacity 0.3s ease, transform 0.3s ease, visibility 0.3s;
            /* 关键：确保 sticky 生效 */
            display: flex;
            flex-direction: column;
        }
        
        /* 这里的 toc a 是指普通的目录链接 */
        .toc a:not(.toc-end) {
            display: block;
            border-radius: 8px;
            color: var(--toc-text);
            text-decoration: none;
            padding: 5px 0;
            font-size: 14px;
            line-height: 1.5;
            border-bottom: 1px solid var(--toc-border);
            transition: background-color 0.2s ease, padding-left 0.2s ease;
            flex-shrink: 0; /* 防止链接被压缩 */
        }
        
        .toc.show {
            opacity: 1;
            visibility: visible;
            transform: translateY(0) scale(1);
        }

        .toc a:not(.toc-end):hover {
            background-color: var(--toc-hover);
            padding-left: 5px;
            border-radius: 8px;
        }

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
            outline: none;
        }
        .toc-icon:hover {
            transform: scale(0.9);
        }
        .toc-icon.active {
            background-color: var(--toc-icon-active-bg);
            color: var(--toc-icon-active-color);
            border-color: var(--toc-icon-active-bg);
            transform: rotate(90deg);
        }

        /* --- 核心修改：回到顶部按钮样式 --- */
        .toc-end {
            font-weight: bold;
            text-align: center;
            cursor: pointer;
            background-color: #fff; /* 必须有背景色，否则文字会重叠 */
            padding: 10px;
            border-radius: 0 0 8px 8px;
            border-top: 2px solid var(--toc-border);
            color: var(--toc-icon-active-color);
            background: var(--toc-icon-active-bg);
            margin-top: auto; /* 在 flex 布局中推到底部 */
            
            /* 关键：吸附在容器底部 */
            position: sticky; 
            bottom: 0;
            z-index: 10;
            
            /* 初始状态隐藏 */
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.3s, visibility 0.3s;
        }

        .toc-end.visible {
            opacity: 1;
            visibility: visible;
        }
        
        .active-toc {
            font-weight: bold;
            border-radius: 8px;
            background-color: var(--toc-hover);
            padding-left: 5px;
        }
    `;
    loadResource('style', {css: css});

    const tocIcon = document.createElement('div');
    tocIcon.className = 'toc-icon';
    tocIcon.textContent = '☰'; // 初始显示菜单图标
    tocIcon.onclick = (e) => {
        e.stopPropagation();
        toggleTOC();
    };
    document.body.appendChild(tocIcon);

    // 绑定滚动事件
    document.addEventListener('scroll', () => {
        highlightTOC();
        handleBackToTopVisibility();
    });
    
    // 点击空白处关闭
    document.addEventListener('click', (e) => {
        const tocElement = document.querySelector('.toc');
        const tocIcon = document.querySelector('.toc-icon');
        // 如果点击的不是 toc 内部，也不是 icon，且 toc 是打开状态，则关闭
        if (tocElement && tocElement.classList.contains('show') && 
            !tocElement.contains(e.target) && 
            e.target !== tocIcon) {
            toggleTOC();
        }
    });
});
