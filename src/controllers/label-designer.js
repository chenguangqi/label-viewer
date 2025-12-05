/**
 * 标签设计器
 * 提供拖拽和属性编辑功能
 */

class LabelDesigner {
    constructor(container, onInstructionChange, labelInstance) {
        this.container = container;
        this.onInstructionChange = onInstructionChange;
        this.onUpdate = null; // 添加更新回调
        this.selectedElement = null;
        this.elements = [];
        this.isDragging = false;
        this.dragOffset = { x: 0, y: 0 };
        
        // 使用传入的Label实例或者创建一个新的实例
        this.label = labelInstance || new Label();
        
        this.init();
    }
    
    init() {
        // 清空容器
        this.container.innerHTML = '';
        
        // 创建元素
        this.createElements();
        
        // 设置样式
        this.setupStyles();
        
        // 绑定事件
        this.bindEvents();
    }
    
    createElements() {
        // 创建标签设计器容器
        this.designerContainer = document.createElement('div');
        this.designerContainer.className = 'designer-container';
        
        // 创建标签画布
        this.canvas = document.createElement('div');
        this.canvas.className = 'designer-canvas';
        
        this.designerContainer.appendChild(this.canvas);
        this.container.appendChild(this.designerContainer);
    }
    
    setupStyles() {
        // 设置设计器容器样式
        Object.assign(this.designerContainer.style, {
            position: 'relative',
            width: '100%',
            height: '100%',
            border: '1px solid #ccc',
            backgroundColor: '#f9f9f9',
            overflow: 'hidden'
        });
        
        // 设置画布样式
        Object.assign(this.canvas.style, {
            position: 'relative',
            width: '100%',
            height: '100%'
        });
    }
    
    bindEvents() {
        // 鼠标按下事件
        this.canvas.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('draggable-element')) {
                this.selectElement(e.target);
                this.startDrag(e);
            } else {
                this.deselectElement();
            }
        });
        
        // 鼠标移动事件
        document.addEventListener('mousemove', (e) => {
            if (this.isDragging && this.selectedElement) {
                this.dragElement(e);
            }
        });
        
        // 鼠标释放事件
        document.addEventListener('mouseup', () => {
            this.stopDrag();
        });
        
        // 拖拽放置事件
        this.canvas.addEventListener('dragover', (e) => {
            e.preventDefault();
        });
        
        this.canvas.addEventListener('drop', (e) => {
            e.preventDefault();
            const type = e.dataTransfer.getData('text/plain');
            if (type) {
                this.addElementFromToolbox(type, e.clientX, e.clientY);
                // 触发更新回调
                if (this.onUpdate) {
                    this.onUpdate();
                }
            }
        });
    }
    
    selectElement(element) {
        // 取消之前选中元素的高亮
        if (this.selectedElement) {
            this.selectedElement.style.outline = '';
        }
        
        // 选中新元素
        this.selectedElement = element;
        this.selectedElement.style.outline = '2px solid #007bff';
        
        // 触发属性面板更新
        if (this.onInstructionChange) {
            this.onInstructionChange(this.getElementInstruction(element));
        }
    }
    
    deselectElement() {
        if (this.selectedElement) {
            this.selectedElement.style.outline = '';
            this.selectedElement = null;
        }
    }
    
    startDrag(e) {
        this.isDragging = true;
        const rect = this.selectedElement.getBoundingClientRect();
        const containerRect = this.canvas.getBoundingClientRect();
        
        this.dragOffset.x = e.clientX - rect.left;
        this.dragOffset.y = e.clientY - rect.top;
    }
    
    dragElement(e) {
        const containerRect = this.canvas.getBoundingClientRect();
        
        let x = e.clientX - containerRect.left - this.dragOffset.x;
        let y = e.clientY - containerRect.top - this.dragOffset.y;
        
        // 边界检查
        x = Math.max(0, Math.min(x, containerRect.width - this.selectedElement.offsetWidth));
        y = Math.max(0, Math.min(y, containerRect.height - this.selectedElement.offsetHeight));
        
        this.selectedElement.style.left = `${x}px`;
        this.selectedElement.style.top = `${y}px`;
        
        // 更新元素数据
        const elementData = this.elements.find(el => el.element === this.selectedElement);
        if (elementData) {
            elementData.x = x;
            elementData.y = y;
            this.updateInstruction(elementData);
        }
    }
    
    stopDrag() {
        this.isDragging = false;
        // 拖拽结束后触发更新回调
        if (this.onUpdate) {
            this.onUpdate();
        }
    }
    
    addElementFromToolbox(type, clientX, clientY) {
        const containerRect = this.canvas.getBoundingClientRect();
        const x = clientX - containerRect.left;
        const y = clientY - containerRect.top;
        
        // 根据类型创建默认参数
        let params = [];
        switch (type) {
            case 'text':
                params = [x, y, 100, 30, 12, 'Arial', 'normal', 'left', '#000000', '文本'];
                break;
            case 'barcode':
                params = ['CODE128', x, y, 100, 30, 'true', '1234567890128'];
                break;
            case 'qrcode':
                params = [x, y, 50, 'Q', 'https://example.com'];
                break;
            case 'image':
                params = [x, y, 50, 50, 'image.png'];
                break;
            case 'line':
                params = [x, y, x + 50, y, 1, '#000000'];
                break;
            case 'rectangle':
                params = [x, y, 100, 50, 1, 'transparent', '#000000'];
                break;
        }
        
        // 创建元素
        const elementData = this.createElement(type, params);
        
        // 添加到Label实例中
        const instruction = {
            type: type,
            params: params
        };
        this.label.addInstruction(instruction);
        
        return elementData;
    }
    
    createElement(type, params) {
        // 创建指令对象
        const instructionObj = { type, params };
        
        // 创建指令类实例
        const instructionInstance = InstructionParser.createInstructionInstance(instructionObj);
        
        // 创建标签设计器元素
        let elementData;
        switch (type) {
            case 'text':
                elementData = instructionInstance.createDesignerElement(
                    parseFloat(params[0]) || 0, 
                    parseFloat(params[1]) || 0
                );
                break;
            case 'barcode':
                elementData = instructionInstance.createDesignerElement(
                    parseFloat(params[1]) || 0, 
                    parseFloat(params[2]) || 0
                );
                break;
            case 'qrcode':
                elementData = instructionInstance.createDesignerElement(
                    parseFloat(params[0]) || 0, 
                    parseFloat(params[1]) || 0
                );
                break;
            case 'image':
                elementData = instructionInstance.createDesignerElement(
                    parseFloat(params[0]) || 0, 
                    parseFloat(params[1]) || 0
                );
                break;
            case 'rectangle':
                elementData = instructionInstance.createDesignerElement(
                    parseFloat(params[0]) || 0, 
                    parseFloat(params[1]) || 0
                );
                break;
            case 'line':
                elementData = instructionInstance.createDesignerElement(
                    parseFloat(params[0]) || 0, 
                    parseFloat(params[1]) || 0
                );
                break;
        }
        
        this.elements.push(elementData);
        this.canvas.appendChild(elementData.element);
        
        return elementData;
    }
    
    updateElementProperty(elementData, property, value) {
        const index = this.elements.indexOf(elementData);
        if (index !== -1) {
            // 创建指令对象
            const instructionObj = { type: elementData.type, params: elementData.params };
            
            // 创建指令类实例
            const instructionInstance = InstructionParser.createInstructionInstance(instructionObj);
            
            // 更新标签设计器元素属性
            instructionInstance.updateDesignerElementProperty(elementData, property, value);
            
            this.updateInstruction(elementData);
        }
    }
    
    getElementInstruction(elementData) {
        return {
            type: elementData.type,
            params: elementData.params
        };
    }
    
    updateInstruction(elementData) {
        if (this.onInstructionChange) {
            this.onInstructionChange(this.getElementInstruction(elementData));
        }
    }
    
    clear() {
        this.canvas.innerHTML = '';
        this.elements = [];
        this.label.clear();
        this.deselectElement();
    }
    
    loadInstructions(instructions) {
        this.clear();
        
        for (const instruction of instructions) {
            // 创建指令类实例
            const instructionInstance = InstructionParser.createInstructionInstance(instruction);
            
            // 根据指令类型提取坐标参数
            let params = instruction.params;
            let x, y;
            
            switch (instruction.type) {
                case 'text':
                    x = parseFloat(params[0]) || 0;
                    y = parseFloat(params[1]) || 0;
                    break;
                case 'barcode':
                    x = parseFloat(params[1]) || 0;
                    y = parseFloat(params[2]) || 0;
                    break;
                case 'qrcode':
                    x = parseFloat(params[0]) || 0;
                    y = parseFloat(params[1]) || 0;
                    break;
                case 'image':
                    x = parseFloat(params[0]) || 0;
                    y = parseFloat(params[1]) || 0;
                    break;
                case 'rectangle':
                    x = parseFloat(params[0]) || 0;
                    y = parseFloat(params[1]) || 0;
                    break;
                case 'line':
                    x = parseFloat(params[0]) || 0;
                    y = parseFloat(params[1]) || 0;
                    break;
            }
            
            // 创建标签设计器元素
            const elementData = instructionInstance.createDesignerElement(x, y);
            this.elements.push(elementData);
            this.canvas.appendChild(elementData.element);
        }
        
        // 加载到Label实例中
        this.label.loadFromInstructions(instructions);
    }
    
    getAllInstructions() {
        return this.label.getAllInstructions();
    }
    
    getLabel() {
        return this.label;
    }
}

// 确保在浏览器环境中将LabelDesigner附加到window对象
if (typeof window !== 'undefined') {
    window.LabelDesigner = LabelDesigner;
}

// 导出模块（用于支持模块化加载）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LabelDesigner;
}