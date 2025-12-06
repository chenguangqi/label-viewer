/**
 * 工具函数模块
 * 提供通用的工具函数
 */

class Utils {
    /**
     * HTML转义函数
     * @param {string} text - 需要转义的文本
     * @returns {string} 转义后的文本
     */
    static escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        
        return String(text).replace(/[&<>"']/g, function(m) {
            return map[m];
        });
    }
}

// 确保在浏览器环境中将工具函数附加到window对象
if (typeof window !== 'undefined') {
    window.Utils = Utils;
}

// 导出模块（用于支持模块化加载）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Utils };
}