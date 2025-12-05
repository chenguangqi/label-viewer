/**
 * 指令基类
 * 所有具体指令类型都继承自此类
 */
class Instruction {
    /**
     * 构造函数
     * @param {Array} params - 指令参数数组
     */
    constructor(params) {
        this.params = params;
    }
    
    /**
     * 获取指令类型
     * @returns {string} 指令类型名称
     */
    getType() {
        return this.constructor.name.toLowerCase().replace('instruction', '');
    }
    
    /**
     * 渲染指令到指定容器
     * @param {HTMLElement} container - 渲染容器
     */
    render(container) {
        throw new Error('render方法必须在子类中实现');
    }
    
    /**
     * 创建可视化设计器元素
     * @returns {Object} 元素数据对象
     */
    createDesignerElement() {
        throw new Error('createDesignerElement方法必须在子类中实现');
    }
    
    /**
     * 更新设计器元素属性
     * @param {Object} elementData - 元素数据对象
     * @param {string} property - 属性名
     * @param {any} value - 属性值
     */
    updateDesignerElementProperty(elementData, property, value) {
        throw new Error('updateDesignerElementProperty方法必须在子类中实现');
    }
}

/**
 * 文本指令类
 */
class TextInstruction extends Instruction {
    /**
     * 渲染文本指令到指定容器
     * @param {HTMLElement} container - 渲染容器
     */
    render(container) {
        const element = document.createElement('div');
        element.style.position = 'absolute';
        element.style.left = `${parseFloat(this.params[0])}px`;
        element.style.top = `${parseFloat(this.params[1])}px`;
        element.style.width = `${parseFloat(this.params[2])}px`;
        element.style.height = `${parseFloat(this.params[3])}px`;
        element.style.fontSize = `${parseFloat(this.params[4])}pt`;
        element.style.fontFamily = this.params[5];
        element.style.fontWeight = this.params[6];
        element.style.textAlign = this.params[7];
        element.style.color = this.params[8];
        element.style.display = 'flex';
        element.style.alignItems = 'center';
        element.style.justifyContent = this.params[7]; // center, flex-start(left), flex-end(right)
        element.textContent = this.params[9] || '';
        element.style.wordWrap = 'break-word';
        element.style.overflow = 'hidden';
        
        container.appendChild(element);
    }
    
    /**
     * 创建可视化设计器元素
     * @returns {Object} 元素数据对象
     */
    createDesignerElement(x, y) {
        const element = document.createElement('div');
        element.className = 'draggable-element';
        element.style.position = 'absolute';
        element.style.cursor = 'move';
        element.style.left = `${x}px`;
        element.style.top = `${y}px`;
        element.style.width = `${parseFloat(this.params[2]) || 100}px`;
        element.style.height = `${parseFloat(this.params[3]) || 30}px`;
        element.style.backgroundColor = '#fff';
        element.style.border = '1px solid #ccc';
        element.style.display = 'flex';
        element.style.alignItems = 'center';
        element.style.justifyContent = 'center';
        element.style.fontSize = `${parseFloat(this.params[4]) || 12}px`;
        element.textContent = this.params[9] || '文本';
        
        return {
            element: element,
            type: this.getType(),
            params: [...this.params],
            x: x,
            y: y,
            width: parseFloat(this.params[2]) || 100,
            height: parseFloat(this.params[3]) || 30,
            text: this.params[9] || '文本'
        };
    }
    
    /**
     * 更新设计器元素属性
     * @param {Object} elementData - 元素数据对象
     * @param {string} property - 属性名
     * @param {any} value - 属性值
     */
    updateDesignerElementProperty(elementData, property, value) {
        switch (property) {
            case 'x':
                elementData.x = parseFloat(value) || 0;
                elementData.element.style.left = `${elementData.x}px`;
                elementData.params[0] = value;
                break;
            case 'y':
                elementData.y = parseFloat(value) || 0;
                elementData.element.style.top = `${elementData.y}px`;
                elementData.params[1] = value;
                break;
            case 'width':
                elementData.width = parseFloat(value) || 0;
                elementData.element.style.width = `${elementData.width}px`;
                elementData.params[2] = value;
                break;
            case 'height':
                elementData.height = parseFloat(value) || 0;
                elementData.element.style.height = `${elementData.height}px`;
                elementData.params[3] = value;
                break;
            case 'text':
                elementData.text = value;
                elementData.element.textContent = value;
                elementData.params[9] = value;
                break;
        }
    }
}

/**
 * 条形码指令类
 */
class BarcodeInstruction extends Instruction {
    /**
     * 渲染条形码指令到指定容器
     * @param {HTMLElement} container - 渲染容器
     */
    render(container) {
        const element = document.createElement('div');
        element.style.position = 'absolute';
        element.style.left = `${parseFloat(this.params[1])}px`;
        element.style.top = `${parseFloat(this.params[2])}px`;
        element.style.width = `${parseFloat(this.params[3])}px`;
        element.style.height = `${parseFloat(this.params[4])}px`;
        element.style.border = '1px solid #000';
        element.style.display = 'flex';
        element.style.flexDirection = 'column';
        element.style.alignItems = 'center';
        element.style.justifyContent = 'center';
        element.style.backgroundColor = '#fff';
        element.style.fontSize = '10px';
        
        const barcodePattern = document.createElement('div');
        barcodePattern.style.width = '90%';
        barcodePattern.style.height = this.params[5] === 'true' ? '70%' : '100%';
        barcodePattern.style.background = 'repeating-linear-gradient(90deg, #000, #000 2px, #fff 2px, #fff 4px)';
        
        element.appendChild(barcodePattern);
        
        if (this.params[5] === 'true') {
            const value = document.createElement('div');
            value.textContent = this.params[6];
            value.style.marginTop = '4px';
            element.appendChild(value);
        }
        
        container.appendChild(element);
    }
    
    /**
     * 创建可视化设计器元素
     * @returns {Object} 元素数据对象
     */
    createDesignerElement(x, y) {
        const element = document.createElement('div');
        element.className = 'draggable-element';
        element.style.position = 'absolute';
        element.style.cursor = 'move';
        element.style.left = `${x}px`;
        element.style.top = `${y}px`;
        element.style.width = `${parseFloat(this.params[3]) || 100}px`;
        element.style.height = `${parseFloat(this.params[4]) || 30}px`;
        element.style.backgroundColor = '#fff';
        element.style.border = '1px solid #000';
        element.style.display = 'flex';
        element.style.alignItems = 'center';
        element.style.justifyContent = 'center';
        element.textContent = '[BARCODE]';
        element.style.fontSize = '10px';
        
        return {
            element: element,
            type: this.getType(),
            params: [...this.params],
            x: x,
            y: y,
            width: parseFloat(this.params[3]) || 100,
            height: parseFloat(this.params[4]) || 30
        };
    }
    
    /**
     * 更新设计器元素属性
     * @param {Object} elementData - 元素数据对象
     * @param {string} property - 属性名
     * @param {any} value - 属性值
     */
    updateDesignerElementProperty(elementData, property, value) {
        switch (property) {
            case 'x':
                elementData.x = parseFloat(value) || 0;
                elementData.element.style.left = `${elementData.x}px`;
                elementData.params[1] = value;
                break;
            case 'y':
                elementData.y = parseFloat(value) || 0;
                elementData.element.style.top = `${elementData.y}px`;
                elementData.params[2] = value;
                break;
            case 'width':
                elementData.width = parseFloat(value) || 0;
                elementData.element.style.width = `${elementData.width}px`;
                elementData.params[3] = value;
                break;
            case 'height':
                elementData.height = parseFloat(value) || 0;
                elementData.element.style.height = `${elementData.height}px`;
                elementData.params[4] = value;
                break;
        }
    }
}

/**
 * 二维码指令类
 */
class QRCodeInstruction extends Instruction {
    /**
     * 渲染二维码指令到指定容器
     * @param {HTMLElement} container - 渲染容器
     */
    render(container) {
        const element = document.createElement('div');
        element.style.position = 'absolute';
        element.style.left = `${parseFloat(this.params[0])}px`;
        element.style.top = `${parseFloat(this.params[1])}px`;
        element.style.width = `${parseFloat(this.params[2])}px`;
        element.style.height = `${parseFloat(this.params[2])}px`; // 正方形
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
     * 创建可视化设计器元素
     * @returns {Object} 元素数据对象
     */
    createDesignerElement(x, y) {
        const element = document.createElement('div');
        element.className = 'draggable-element';
        element.style.position = 'absolute';
        element.style.cursor = 'move';
        element.style.left = `${x}px`;
        element.style.top = `${y}px`;
        element.style.width = `${parseFloat(this.params[2]) || 50}px`;
        element.style.height = `${parseFloat(this.params[2]) || 50}px`;
        element.style.backgroundColor = '#fff';
        element.style.border = '1px solid #000';
        element.style.display = 'flex';
        element.style.alignItems = 'center';
        element.style.justifyContent = 'center';
        element.textContent = '[QR]';
        element.style.fontSize = '10px';
        
        return {
            element: element,
            type: this.getType(),
            params: [...this.params],
            x: x,
            y: y,
            size: parseFloat(this.params[2]) || 50
        };
    }
    
    /**
     * 更新设计器元素属性
     * @param {Object} elementData - 元素数据对象
     * @param {string} property - 属性名
     * @param {any} value - 属性值
     */
    updateDesignerElementProperty(elementData, property, value) {
        switch (property) {
            case 'x':
                elementData.x = parseFloat(value) || 0;
                elementData.element.style.left = `${elementData.x}px`;
                elementData.params[0] = value;
                break;
            case 'y':
                elementData.y = parseFloat(value) || 0;
                elementData.element.style.top = `${elementData.y}px`;
                elementData.params[1] = value;
                break;
            case 'size':
                elementData.size = parseFloat(value) || 0;
                elementData.element.style.width = `${elementData.size}px`;
                elementData.element.style.height = `${elementData.size}px`;
                elementData.params[2] = value;
                break;
        }
    }
}

/**
 * 图片指令类
 */
class ImageInstruction extends Instruction {
    /**
     * 渲染图片指令到指定容器
     * @param {HTMLElement} container - 渲染容器
     */
    render(container) {
        const element = document.createElement('div');
        element.style.position = 'absolute';
        element.style.left = `${parseFloat(this.params[0])}px`;
        element.style.top = `${parseFloat(this.params[1])}px`;
        element.style.width = `${parseFloat(this.params[2])}px`;
        element.style.height = `${parseFloat(this.params[3])}px`;
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
     * 创建可视化设计器元素
     * @returns {Object} 元素数据对象
     */
    createDesignerElement(x, y) {
        const element = document.createElement('div');
        element.className = 'draggable-element';
        element.style.position = 'absolute';
        element.style.cursor = 'move';
        element.style.left = `${x}px`;
        element.style.top = `${y}px`;
        element.style.width = `${parseFloat(this.params[2]) || 50}px`;
        element.style.height = `${parseFloat(this.params[3]) || 50}px`;
        element.style.backgroundColor = '#eee';
        element.style.border = '1px dashed #999';
        element.style.display = 'flex';
        element.style.alignItems = 'center';
        element.style.justifyContent = 'center';
        element.textContent = '[IMG]';
        element.style.fontSize = '10px';
        
        return {
            element: element,
            type: this.getType(),
            params: [...this.params],
            x: x,
            y: y,
            width: parseFloat(this.params[2]) || 50,
            height: parseFloat(this.params[3]) || 50
        };
    }
    
    /**
     * 更新设计器元素属性
     * @param {Object} elementData - 元素数据对象
     * @param {string} property - 属性名
     * @param {any} value - 属性值
     */
    updateDesignerElementProperty(elementData, property, value) {
        switch (property) {
            case 'x':
                elementData.x = parseFloat(value) || 0;
                elementData.element.style.left = `${elementData.x}px`;
                elementData.params[0] = value;
                break;
            case 'y':
                elementData.y = parseFloat(value) || 0;
                elementData.element.style.top = `${elementData.y}px`;
                elementData.params[1] = value;
                break;
            case 'width':
                elementData.width = parseFloat(value) || 0;
                elementData.element.style.width = `${elementData.width}px`;
                elementData.params[2] = value;
                break;
            case 'height':
                elementData.height = parseFloat(value) || 0;
                elementData.element.style.height = `${elementData.height}px`;
                elementData.params[3] = value;
                break;
        }
    }
}

/**
 * 直线指令类
 */
class LineInstruction extends Instruction {
    /**
     * 渲染直线指令到指定容器
     * @param {HTMLElement} container - 渲染容器
     */
    render(container) {
        const element = document.createElement('div');
        element.style.position = 'absolute';
        element.style.left = `${parseFloat(this.params[0])}px`;
        element.style.top = `${parseFloat(this.params[1])}px`;
        element.style.width = `${Math.abs(parseFloat(this.params[2]) - parseFloat(this.params[0]))}px`;
        element.style.height = `${parseFloat(this.params[4])}px`;
        element.style.backgroundColor = this.params[5] || '#000';
        
        // 计算旋转角度
        const x1 = parseFloat(this.params[0]);
        const y1 = parseFloat(this.params[1]);
        const x2 = parseFloat(this.params[2]);
        const y2 = parseFloat(this.params[3]);
        
        if (x1 !== x2 || y1 !== y2) {
            const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
            element.style.transform = `rotate(${angle}deg)`;
            element.style.transformOrigin = 'left center';
        }
        
        container.appendChild(element);
    }
    
    /**
     * 创建可视化设计器元素
     * @returns {Object} 元素数据对象
     */
    createDesignerElement(x1, y1) {
        const x2 = parseFloat(this.params[2]) || (x1 + 50);
        const y2 = parseFloat(this.params[3]) || y1;
        
        // 计算线段长度和角度
        const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
        
        const element = document.createElement('div');
        element.className = 'draggable-element';
        element.style.position = 'absolute';
        element.style.cursor = 'move';
        element.style.left = `${x1}px`;
        element.style.top = `${y1}px`;
        element.style.width = `${length}px`;
        element.style.height = `${parseFloat(this.params[4]) || 1}px`;
        element.style.backgroundColor = this.params[5] || '#000';
        element.style.transformOrigin = 'left center';
        element.style.transform = `rotate(${angle}deg)`;
        
        return {
            element: element,
            type: this.getType(),
            params: [...this.params],
            x1: x1,
            y1: y1,
            x2: x2,
            y2: y2,
            stroke: parseFloat(this.params[4]) || 1
        };
    }
    
    /**
     * 更新设计器元素属性
     * @param {Object} elementData - 元素数据对象
     * @param {string} property - 属性名
     * @param {any} value - 属性值
     */
    updateDesignerElementProperty(elementData, property, value) {
        switch (property) {
            case 'x1':
                elementData.x1 = parseFloat(value) || 0;
                elementData.params[0] = value;
                this.redrawLine(elementData);
                break;
            case 'y1':
                elementData.y1 = parseFloat(value) || 0;
                elementData.params[1] = value;
                this.redrawLine(elementData);
                break;
            case 'x2':
                elementData.x2 = parseFloat(value) || 0;
                elementData.params[2] = value;
                this.redrawLine(elementData);
                break;
            case 'y2':
                elementData.y2 = parseFloat(value) || 0;
                elementData.params[3] = value;
                this.redrawLine(elementData);
                break;
        }
    }
    
    /**
     * 重绘直线元素
     * @param {Object} elementData - 元素数据对象
     */
    redrawLine(elementData) {
        const length = Math.sqrt(Math.pow(elementData.x2 - elementData.x1, 2) + Math.pow(elementData.y2 - elementData.y1, 2));
        const angle = Math.atan2(elementData.y2 - elementData.y1, elementData.x2 - elementData.x1) * 180 / Math.PI;
        
        elementData.element.style.left = `${elementData.x1}px`;
        elementData.element.style.top = `${elementData.y1}px`;
        elementData.element.style.width = `${length}px`;
        elementData.element.style.transform = `rotate(${angle}deg)`;
    }
}

/**
 * 矩形指令类
 */
class RectangleInstruction extends Instruction {
    /**
     * 渲染矩形指令到指定容器
     * @param {HTMLElement} container - 渲染容器
     */
    render(container) {
        const element = document.createElement('div');
        element.style.position = 'absolute';
        element.style.left = `${parseFloat(this.params[0])}px`;
        element.style.top = `${parseFloat(this.params[1])}px`;
        element.style.width = `${parseFloat(this.params[2])}px`;
        element.style.height = `${parseFloat(this.params[3])}px`;
        element.style.border = `${parseFloat(this.params[4])}px solid ${this.params[6]}`;
        element.style.backgroundColor = this.params[5];
        
        container.appendChild(element);
    }
    
    /**
     * 创建可视化设计器元素
     * @returns {Object} 元素数据对象
     */
    createDesignerElement(x, y) {
        const element = document.createElement('div');
        element.className = 'draggable-element';
        element.style.position = 'absolute';
        element.style.cursor = 'move';
        element.style.left = `${x}px`;
        element.style.top = `${y}px`;
        element.style.width = `${parseFloat(this.params[2]) || 100}px`;
        element.style.height = `${parseFloat(this.params[3]) || 50}px`;
        element.style.backgroundColor = this.params[5] || 'transparent';
        element.style.border = `${parseFloat(this.params[4]) || 1}px solid ${this.params[6] || '#000'}`;
        
        return {
            element: element,
            type: this.getType(),
            params: [...this.params],
            x: x,
            y: y,
            width: parseFloat(this.params[2]) || 100,
            height: parseFloat(this.params[3]) || 50
        };
    }
    
    /**
     * 更新设计器元素属性
     * @param {Object} elementData - 元素数据对象
     * @param {string} property - 属性名
     * @param {any} value - 属性值
     */
    updateDesignerElementProperty(elementData, property, value) {
        switch (property) {
            case 'x':
                elementData.x = parseFloat(value) || 0;
                elementData.element.style.left = `${elementData.x}px`;
                elementData.params[0] = value;
                break;
            case 'y':
                elementData.y = parseFloat(value) || 0;
                elementData.element.style.top = `${elementData.y}px`;
                elementData.params[1] = value;
                break;
            case 'width':
                elementData.width = parseFloat(value) || 0;
                elementData.element.style.width = `${elementData.width}px`;
                elementData.params[2] = value;
                break;
            case 'height':
                elementData.height = parseFloat(value) || 0;
                elementData.element.style.height = `${elementData.height}px`;
                elementData.params[3] = value;
                break;
        }
    }
}

// 确保在浏览器环境中将Instruction类附加到window对象
if (typeof window !== 'undefined') {
    window.Instruction = Instruction;
    window.TextInstruction = TextInstruction;
    window.BarcodeInstruction = BarcodeInstruction;
    window.QRCodeInstruction = QRCodeInstruction;
    window.ImageInstruction = ImageInstruction;
    window.LineInstruction = LineInstruction;
    window.RectangleInstruction = RectangleInstruction;
}

// 导出模块（用于支持模块化加载）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        Instruction,
        TextInstruction,
        BarcodeInstruction,
        QRCodeInstruction,
        ImageInstruction,
        LineInstruction,
        RectangleInstruction
    };
}