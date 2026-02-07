/* Gweek 首页跳转修复脚本 */
console.log("Gweek Fix Loaded - v2");

function makeClickable() {
    // 1. 找到标题
    var title = document.querySelector('.blogTitle');
    if (title) {
        title.style.cursor = 'pointer';
        title.setAttribute('title', '返回首页');
        title.onclick = function() {
            window.location.href = '/';
        };
    }

    // 2. 找到头像
    var avatar = document.querySelector('.avatar');
    if (avatar) {
        avatar.style.cursor = 'pointer';
        avatar.onclick = function() {
            window.location.href = '/';
        };
    }
}

// 确保在页面加载完成后执行，并且每隔0.5秒检查一次（防止被覆盖）
document.addEventListener("DOMContentLoaded", makeClickable);
setInterval(makeClickable, 500);
