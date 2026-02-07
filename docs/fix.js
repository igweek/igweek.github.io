// Gweek 首页跳转修复脚本
console.log("Gweek Fix Loaded from static");

function makeClickable() {
    // 1. 修复标题
    var title = document.querySelector('.blogTitle');
    if (title) {
        title.style.cursor = 'pointer';
        title.onclick = function() {
            window.location.href = '/';
        };
    }

    // 2. 修复头像
    var avatar = document.querySelector('.avatar');
    if (avatar) {
        avatar.style.cursor = 'pointer';
        avatar.onclick = function() {
            window.location.href = '/';
        };
    }
}

// 页面加载完成后执行
document.addEventListener("DOMContentLoaded", makeClickable);
// 每0.5秒强制检查一次（防止被其他脚本覆盖）
setInterval(makeClickable, 500);
