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
        
        // 默认标签设置
        let labelSettings = {
            width: 200,
            height: 100
        };
        
        // 创建标签容器
        const labelContainer = document.createElement('div');
        labelContainer.style.width = `${labelSettings.width}px`;
        labelContainer.style.height = `${labelSettings.height}px`;
        labelContainer.style.position = 'relative';
        labelContainer.style.border = '1px solid #ccc';
        
        this.container.appendChild(labelContainer);
        
        // 渲染各个元素
        for (const instruction of instructions) {
            try {
                this._renderElement(labelContainer, instruction);
            } catch (error) {
                console.error(`渲染指令失败: ${instruction.type}`, error);
            }
        }
    }
    
    /**
     * 渲染单个元素
     * @param {HTMLElement} container - 容器元素
     * @param {Object} instruction - 指令对象
     */
    _renderElement(container, instruction) {
        switch (instruction.type) {
            case 'text':
                this._renderText(container, instruction.params);
                break;
            case 'barcode':
                this._renderBarcode(container, instruction.params);
                break;
            case 'qrcode':
                this._renderQRCode(container, instruction.params);
                break;
            case 'image':
                this._renderImage(container, instruction.params);
                break;
            case 'line':
                this._renderLine(container, instruction.params);
                break;
            case 'rectangle':
                this._renderRectangle(container, instruction.params);
                break;
            default:
                console.warn(`未知的指令类型: ${instruction.type}`);
        }
    }
    
    /**
     * 渲染文本元素
     * @param {HTMLElement} container - 容器元素
     * @param {Array} params - 参数数组
     */
    _renderText(container, params) {
        const element = document.createElement('div');
        element.style.position = 'absolute';
        element.style.left = `${parseFloat(params[0])}px`;
        element.style.top = `${parseFloat(params[1])}px`;
        element.style.width = `${parseFloat(params[2])}px`;
        element.style.height = `${parseFloat(params[3])}px`;
        element.style.fontSize = `${parseFloat(params[4])}pt`;
        element.style.fontFamily = params[5];
        element.style.fontWeight = params[6];
        element.style.textAlign = params[7];
        element.style.color = params[8];
        element.style.display = 'flex';
        element.style.alignItems = 'center';
        element.style.justifyContent = params[7]; // center, flex-start(left), flex-end(right)
        element.textContent = params[9] || '';
        element.style.wordWrap = 'break-word';
        element.style.overflow = 'hidden';
        
        container.appendChild(element);
    }
    
    /**
     * 渲染条形码元素
     * @param {HTMLElement} container - 容器元素
     * @param {Array} params - 参数数组
     */
    _renderBarcode(container, params) {
        const element = document.createElement('div');
        element.style.position = 'absolute';
        element.style.left = `${parseFloat(params[1])}px`;
        element.style.top = `${parseFloat(params[2])}px`;
        element.style.width = `${parseFloat(params[3])}px`;
        element.style.height = `${parseFloat(params[4])}px`;
        element.style.border = '1px solid #000';
        element.style.display = 'flex';
        element.style.flexDirection = 'column';
        element.style.alignItems = 'center';
        element.style.justifyContent = 'center';
        element.style.backgroundColor = '#fff';
        element.style.fontSize = '10px';
        
        const barcodePattern = document.createElement('div');
        barcodePattern.style.width = '90%';
        barcodePattern.style.height = params[5] === 'true' ? '70%' : '100%';
        barcodePattern.style.background = 'repeating-linear-gradient(90deg, #000, #000 2px, #fff 2px, #fff 4px)';
        
        element.appendChild(barcodePattern);
        
        if (params[5] === 'true') {
            const value = document.createElement('div');
            value.textContent = params[6];
            value.style.marginTop = '4px';
            element.appendChild(value);
        }
        
        container.appendChild(element);
    }
    
    /**
     * 渲染二维码元素
     * @param {HTMLElement} container - 容器元素
     * @param {Array} params - 参数数组
     */
    _renderQRCode(container, params) {
        const element = document.createElement('div');
        element.style.position = 'absolute';
        element.style.left = `${parseFloat(params[0])}px`;
        element.style.top = `${parseFloat(params[1])}px`;
        element.style.width = `${parseFloat(params[2])}px`;
        element.style.height = `${parseFloat(params[2])}px`; // 正方形
        element.style.border = '1px solid #000';
        element.style.display = 'flex';
        element.style.alignItems = 'center';
        element.style.justifyContent = 'center';
        element.style.backgroundColor = '#fff';
        element.style.fontSize = '10px';
        element.textContent = '[QR]';
        
        container.appendChild(element);
    }
    
    /**
     * 渲染图片元素
     * @param {HTMLElement} container - 容器元素
     * @param {Array} params - 参数数组
     */
    _renderImage(container, params) {
        const element = document.createElement('div');
        element.style.position = 'absolute';
        element.style.left = `${parseFloat(params[0])}px`;
        element.style.top = `${parseFloat(params[1])}px`;
        element.style.width = `${parseFloat(params[2])}px`;
        element.style.height = `${parseFloat(params[3])}px`;
        element.style.border = '1px dashed #999';
        element.style.display = 'flex';
        element.style.alignItems = 'center';
        element.style.justifyContent = 'center';
        element.style.backgroundColor = '#eee';
        element.style.fontSize = '10px';
        element.textContent = '[IMG]';
        
        container.appendChild(element);
    }
    
    /**
     * 渲染直线元素
     * @param {HTMLElement} container - 容器元素
     * @param {Array} params - 参数数组
     */
    _renderLine(container, params) {
        const element = document.createElement('div');
        element.style.position = 'absolute';
        element.style.left = `${parseFloat(params[0])}px`;
        element.style.top = `${parseFloat(params[1])}px`;
        element.style.width = `${Math.abs(parseFloat(params[2]) - parseFloat(params[0]))}px`;
        element.style.height = `${parseFloat(params[4])}px`;
        element.style.backgroundColor = params[5] || '#000';
        
        // 计算旋转角度
        const x1 = parseFloat(params[0]);
        const y1 = parseFloat(params[1]);
        const x2 = parseFloat(params[2]);
        const y2 = parseFloat(params[3]);
        
        if (x1 !== x2 || y1 !== y2) {
            const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
            element.style.transform = `rotate(${angle}deg)`;
            element.style.transformOrigin = 'left center';
        }
        
        container.appendChild(element);
    }
    
    /**
     * 渲染矩形元素
     * @param {HTMLElement} container - 容器元素
     * @param {Array} params - 参数数组
     */
    _renderRectangle(container, params) {
        const element = document.createElement('div');
        element.style.position = 'absolute';
        element.style.left = `${parseFloat(params[0])}px`;
        element.style.top = `${parseFloat(params[1])}px`;
        element.style.width = `${parseFloat(params[2])}px`;
        element.style.height = `${parseFloat(params[3])}px`;
        element.style.border = `${parseFloat(params[4])}px solid ${params[6]}`;
        element.style.backgroundColor = params[5];
        
        container.appendChild(element);
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