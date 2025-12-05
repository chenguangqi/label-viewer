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
        
        // 创建标签容器，模拟真实标签纸张效果
        const labelContainer = document.createElement('div');
        labelContainer.className = 'label-preview-container';
        labelContainer.style.position = 'relative';
        labelContainer.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.1)';
        labelContainer.style.backgroundColor = '#fff';
        labelContainer.style.border = '1px solid #ddd';
        labelContainer.style.display = 'block';
        labelContainer.style.width = '100%';
        labelContainer.style.height = '100%';
        labelContainer.style.boxSizing = 'border-box';
        // 确保预览区内容不可编辑
        labelContainer.style.userSelect = 'none';
        labelContainer.style.pointerEvents = 'none';
        
        this.container.appendChild(labelContainer);
        
        // 渲染各个元素
        for (const instruction of instructions) {
            try {
                // 跳过标签设置指令，因为它只用于设置尺寸
                if (instruction.type === 'label') {
                    continue;
                }
                
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