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
            height: 100,
            background: '#FFFFFF',
            padding: 0
        };
        
        // 查找标签设置指令
        const labelInstruction = instructions.find(inst => inst.type === 'label');
        if (labelInstruction) {
            labelSettings = this._parseLabelSettings(labelInstruction.params);
        }
        
        // 创建标签容器
        const labelContainer = document.createElement('div');
        labelContainer.style.width = `${labelSettings.width}px`;
        labelContainer.style.height = `${labelSettings.height}px`;
        labelContainer.style.backgroundColor = labelSettings.background;
        labelContainer.style.padding = `${labelSettings.padding}px`;
        labelContainer.style.position = 'relative';
        labelContainer.style.border = '1px solid #ccc';
        
        this.container.appendChild(labelContainer);
        
        // 渲染各个元素
        for (const instruction of instructions) {
            if (instruction.type === 'label') {
                // 标签设置已经处理过了
                continue;
            }
            
            try {
                this._renderElement(labelContainer, instruction);
            } catch (error) {
                console.error(`渲染指令失败: ${instruction.type}`, error);
            }
        }
    }
    
    /**
     * 解析标签设置
     * @param {Array} params - 参数数组
     * @returns {Object} 标签设置对象
     */
    _parseLabelSettings(params) {
        return {
            width: parseFloat(params[0]) || 200,
            height: parseFloat(params[1]) || 100,
            background: params[2] || '#FFFFFF',
            padding: parseFloat(params[3]) || 0
        };
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
                console.warn(`未知指令类型: ${instruction.type}`);
        }
    }
    
    /**
     * 渲染文本元素
     * @param {HTMLElement} container - 容器元素
     * @param {Array} params - 参数数组
     */
    _renderText(container, params) {
        // text,<X坐标>,<Y坐标>,<宽度>,<高度>,<字体大小>,<字体族>,<字体粗细>,<对齐方式>,<颜色>,<文本内容>
        const element = document.createElement('div');
        
        const x = parseFloat(params[0]) || 0;
        const y = parseFloat(params[1]) || 0;
        const width = parseFloat(params[2]) || undefined;
        const height = parseFloat(params[3]) || undefined;
        const fontSize = parseFloat(params[4]) || 12;
        const fontFamily = params[5] || 'Arial';
        const fontWeight = params[6] || 'normal';
        const textAlign = params[7] || 'left';
        const color = params[8] || '#000000';
        const text = params[9] || '';
        
        element.textContent = text;
        element.style.position = 'absolute';
        element.style.left = `${x}px`;
        element.style.top = `${y}px`;
        element.style.fontSize = `${fontSize}px`;
        element.style.fontFamily = fontFamily;
        element.style.fontWeight = fontWeight;
        element.style.color = color;
        element.style.textAlign = textAlign;
        
        if (width) {
            element.style.width = `${width}px`;
        }
        
        if (height) {
            element.style.height = `${height}px`;
        }
        
        container.appendChild(element);
    }
    
    /**
     * 渲染条形码元素
     * @param {HTMLElement} container - 容器元素
     * @param {Array} params - 参数数组
     */
    _renderBarcode(container, params) {
        // barcode,<条码类型>,<X坐标>,<Y坐标>,<宽度>,<高度>,<是否显示值>,<条码数据>
        const element = document.createElement('div');
        
        const type = params[0] || 'CODE128';
        const x = parseFloat(params[1]) || 0;
        const y = parseFloat(params[2]) || 0;
        const width = parseFloat(params[3]) || 50;
        const height = parseFloat(params[4]) || 10;
        const displayValue = params[5] === 'true';
        const data = params[6] || '';
        
        element.textContent = displayValue ? data : '';
        element.style.position = 'absolute';
        element.style.left = `${x}px`;
        element.style.top = `${y}px`;
        element.style.width = `${width}px`;
        element.style.height = `${height}px`;
        element.style.border = '1px solid #000';
        element.style.display = 'flex';
        element.style.alignItems = 'center';
        element.style.justifyContent = 'center';
        element.style.fontSize = '10px';
        
        container.appendChild(element);
    }
    
    /**
     * 渲染二维码元素
     * @param {HTMLElement} container - 容器元素
     * @param {Array} params - 参数数组
     */
    _renderQRCode(container, params) {
        // qrcode,<X坐标>,<Y坐标>,<尺寸>,<纠错等级>,<二维码数据>
        const element = document.createElement('div');
        
        const x = parseFloat(params[0]) || 0;
        const y = parseFloat(params[1]) || 0;
        const size = parseFloat(params[2]) || 20;
        const ecc = params[3] || 'M';
        const data = params[4] || '';
        
        element.textContent = '[QR]';
        element.style.position = 'absolute';
        element.style.left = `${x}px`;
        element.style.top = `${y}px`;
        element.style.width = `${size}px`;
        element.style.height = `${size}px`;
        element.style.border = '1px solid #000';
        element.style.display = 'flex';
        element.style.alignItems = 'center';
        element.style.justifyContent = 'center';
        element.style.fontSize = '10px';
        
        container.appendChild(element);
    }
    
    /**
     * 渲染图片元素
     * @param {HTMLElement} container - 容器元素
     * @param {Array} params - 参数数组
     */
    _renderImage(container, params) {
        // image,<X坐标>,<Y坐标>,<宽度>,<高度>,<图片路径>
        const element = document.createElement('div');
        
        const x = parseFloat(params[0]) || 0;
        const y = parseFloat(params[1]) || 0;
        const width = parseFloat(params[2]) || 50;
        const height = parseFloat(params[3]) || 50;
        const src = params[4] || '';
        
        element.textContent = '[IMG]';
        element.style.position = 'absolute';
        element.style.left = `${x}px`;
        element.style.top = `${y}px`;
        element.style.width = `${width}px`;
        element.style.height = `${height}px`;
        element.style.border = '1px dashed #999';
        element.style.display = 'flex';
        element.style.alignItems = 'center';
        element.style.justifyContent = 'center';
        element.style.fontSize = '10px';
        
        container.appendChild(element);
    }
    
    /**
     * 渲染直线元素
     * @param {HTMLElement} container - 容器元素
     * @param {Array} params - 参数数组
     */
    _renderLine(container, params) {
        // line,<起点X>,<起点Y>,<终点X>,<终点Y>,<线条粗细>,<颜色>
        const element = document.createElement('div');
        
        const x1 = parseFloat(params[0]) || 0;
        const y1 = parseFloat(params[1]) || 0;
        const x2 = parseFloat(params[2]) || 0;
        const y2 = parseFloat(params[3]) || 0;
        const stroke = parseFloat(params[4]) || 1;
        const color = params[5] || '#000000';
        
        // 计算线段长度和角度
        const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
        
        element.style.position = 'absolute';
        element.style.left = `${x1}px`;
        element.style.top = `${y1}px`;
        element.style.width = `${length}px`;
        element.style.height = `${stroke}px`;
        element.style.backgroundColor = color;
        element.style.transformOrigin = 'left center';
        element.style.transform = `rotate(${angle}deg)`;
        
        container.appendChild(element);
    }
    
    /**
     * 渲染矩形元素
     * @param {HTMLElement} container - 容器元素
     * @param {Array} params - 参数数组
     */
    _renderRectangle(container, params) {
        // rectangle,<X坐标>,<Y坐标>,<宽度>,<高度>,<边框粗细>,<填充颜色>,<边框颜色>
        const element = document.createElement('div');
        
        const x = parseFloat(params[0]) || 0;
        const y = parseFloat(params[1]) || 0;
        const width = parseFloat(params[2]) || 50;
        const height = parseFloat(params[3]) || 30;
        const strokeWidth = parseFloat(params[4]) || 1;
        const fillColor = params[5] || 'transparent';
        const strokeColor = params[6] || '#000000';
        
        element.style.position = 'absolute';
        element.style.left = `${x}px`;
        element.style.top = `${y}px`;
        element.style.width = `${width}px`;
        element.style.height = `${height}px`;
        element.style.backgroundColor = fillColor;
        element.style.border = `${strokeWidth}px solid ${strokeColor}`;
        
        container.appendChild(element);
    }
}

// 导出模块（用于支持模块化加载）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LabelRenderer;
}