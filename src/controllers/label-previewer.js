/**
 * 标签预览器类
 * 负责标签指令的预览渲染功能
 */

class LabelPreviewer {
    /**
     * 构造函数
     * @param {HTMLElement} container - 预览器容器元素
     * @param {Label} sharedLabel - 共享的Label实例
     */
    constructor(container, sharedLabel) {
        this.container = container;
        this.sharedLabel = sharedLabel;
        
        // 获取预览渲染容器
        this.previewContainer = document.getElementById('label-preview');
        
        // 初始化渲染器
        this.renderer = new LabelRenderer(this.previewContainer);
        
        // 绑定事件
        this.bindEvents();
    }
    
    /**
     * 绑定事件监听器
     */
    bindEvents() {
        // 监听预览请求事件
        this.container.addEventListener('previewRequest', () => {
            this.render();
        });
    }
    
    /**
     * 渲染标签预览
     */
    render() {
        try {
            // 使用共享Label实例获取指令
            const instructions = this.sharedLabel.getAllInstructions();
            this.renderer.render(instructions);
        } catch (e) {
            console.error("渲染标签预览时出错:", e);
        }
    }
    
    /**
     * 清空预览
     */
    clear() {
        if (this.previewContainer) {
            this.previewContainer.innerHTML = '';
        }
    }
}

// 确保在浏览器环境中将LabelPreviewer附加到window对象
if (typeof window !== 'undefined') {
    window.LabelPreviewer = LabelPreviewer;
}

// 导出模块（用于支持模块化加载）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LabelPreviewer;
}