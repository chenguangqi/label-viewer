/**
 * 标签渲染器
 * 负责将解析后的指令对象渲染为可视化元素
 */

class LabelRenderer {
    /**
     * 构造函数
     * @param {HTMLElement} container - 渲染容器
     */
    constructor(container) {
        this.container = container;
        this.context = null; // 用于Canvas渲染的上下文
    }
    
    /**
     * 渲染标签
     * @param {Array} instructions - 指令对象数组
     */
    render(instructions) {
        // 清空容器
        this.container.innerHTML = '';
        
        // 创建标签容器，宽度和高度设为100%以适应父容器
        const labelContainer = document.createElement('div');
        labelContainer.style.width = '100%';
        labelContainer.style.height = '100%';
        labelContainer.style.position = 'relative';
        labelContainer.style.border = '1px solid #ccc';
        
        this.container.appendChild(labelContainer);
        
        // 渲染各个元素
        for (const instruction of instructions) {
            try {
                // 创建指令类实例并渲染
                const instructionInstance = InstructionParser.createInstructionInstance(instruction);
                instructionInstance.render(labelContainer);
            } catch (error) {
                console.error(`渲染指令失败: ${instruction.type}`, error);
            }
        }
    }
}

// 确保在浏览器环境中将LabelRenderer附加到window对象
if (typeof window !== 'undefined') {
    window.LabelRenderer = LabelRenderer;
}

// 导出模块（用于支持模块化加载）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LabelRenderer;
}