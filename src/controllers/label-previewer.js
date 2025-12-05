/**
 * 标签预览器类
 * 用于实时预览标签打印指令的渲染效果
 * 通过事件驱动机制响应预览请求，并利用LabelRenderer进行可视化渲染
 */
class LabelPreviewer {
    /**
     * 创建标签预览器实例
     * @param {HTMLElement} container - 主容器元素，用于监听预览请求事件
     * @param {Label} sharedLabel - 共享的Label对象实例，提供标签指令数据
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
     * 绑定DOM事件监听器
     * 设置对预览请求事件的监听，触发时执行渲染操作
     */
    bindEvents() {
        // 监听来自容器的预览请求事件
        this.container.addEventListener('previewRequest', () => {
            this.render();
        });
    }
    
    /**
     * 执行标签预览渲染
     * 从共享的Label实例获取所有打印指令，并交由渲染器绘制到预览区域
     * 包含异常处理，确保渲染失败时不影响主流程
     */
    render() {
        try {
            // 从共享的Label实例获取完整的标签指令集
            const instructions = this.sharedLabel.getAllInstructions();
            this.renderer.render(instructions);
        } catch (e) {
            console.error("渲染标签预览时出错:", e);
        }
    }
    
    /**
     * 清空预览内容
     * 清除预览容器内的所有HTML内容，恢复初始状态
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