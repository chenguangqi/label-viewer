/**
 * 可视化设计器
 * 提供拖拽和属性编辑功能
 */

class VisualDesigner {
    constructor(container, onInstructionChange) {
        this.container = container;
        this.onInstructionChange = onInstructionChange;
        this.selectedElement = null;
        this.elements = [];
        this.isDragging = false;
        this.dragOffset = { x: 0, y: 0 };
        
        this.init();
    }
    
    init() {
        // 创建设计器容器
        this.designerContainer = document.createElement('div');
        this.designerContainer.className = 'designer-container';
        this.designerContainer.style.position = 'relative';
        this.designerContainer.style.width = '100%';
        this.designerContainer.style.height = '400px';
        this.designerContainer.style.border = '1px solid #ccc';
        this.designerContainer.style.backgroundColor = '#f9f9f9';
        this.designerContainer.style.overflow = 'hidden';
        
        // 创建标签画布
        this.canvas = document.createElement('div');
        this.canvas.className = 'designer-canvas';
        this.canvas.style.position = 'relative';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        
        this.designerContainer.appendChild(this.canvas);
        this.container.appendChild(this.designerContainer);
        
        // 绑定事件
        this.bindEvents();
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
        return elementData;
    }
    
    createElement(type, params) {
        const element = document.createElement('div');
        element.className = 'draggable-element';
        element.style.position = 'absolute';
        element.style.cursor = 'move';
        
        let elementData = {
            element: element,
            type: type,
            params: [...params]
        };
        
        switch (type) {
            case 'text':
                elementData.x = parseFloat(params[0]) || 0;
                elementData.y = parseFloat(params[1]) || 0;
                elementData.width = parseFloat(params[2]) || 100;
                elementData.height = parseFloat(params[3]) || 30;
                elementData.text = params[9] || '文本';
                
                element.style.left = `${elementData.x}px`;
                element.style.top = `${elementData.y}px`;
                element.style.width = `${elementData.width}px`;
                element.style.height = `${elementData.height}px`;
                element.style.backgroundColor = '#fff';
                element.style.border = '1px solid #ccc';
                element.style.display = 'flex';
                element.style.alignItems = 'center';
                element.style.justifyContent = 'center';
                element.style.fontSize = `${parseFloat(params[4]) || 12}px`;
                element.textContent = elementData.text;
                break;
                
            case 'barcode':
                elementData.x = parseFloat(params[1]) || 0;
                elementData.y = parseFloat(params[2]) || 0;
                elementData.width = parseFloat(params[3]) || 100;
                elementData.height = parseFloat(params[4]) || 30;
                
                element.style.left = `${elementData.x}px`;
                element.style.top = `${elementData.y}px`;
                element.style.width = `${elementData.width}px`;
                element.style.height = `${elementData.height}px`;
                element.style.backgroundColor = '#fff';
                element.style.border = '1px solid #000';
                element.style.display = 'flex';
                element.style.alignItems = 'center';
                element.style.justifyContent = 'center';
                element.textContent = '[BARCODE]';
                element.style.fontSize = '10px';
                break;
                
            case 'qrcode':
                elementData.x = parseFloat(params[0]) || 0;
                elementData.y = parseFloat(params[1]) || 0;
                elementData.size = parseFloat(params[2]) || 50;
                
                element.style.left = `${elementData.x}px`;
                element.style.top = `${elementData.y}px`;
                element.style.width = `${elementData.size}px`;
                element.style.height = `${elementData.size}px`;
                element.style.backgroundColor = '#fff';
                element.style.border = '1px solid #000';
                element.style.display = 'flex';
                element.style.alignItems = 'center';
                element.style.justifyContent = 'center';
                element.textContent = '[QR]';
                element.style.fontSize = '10px';
                break;
                
            case 'image':
                elementData.x = parseFloat(params[0]) || 0;
                elementData.y = parseFloat(params[1]) || 0;
                elementData.width = parseFloat(params[2]) || 50;
                elementData.height = parseFloat(params[3]) || 50;
                
                element.style.left = `${elementData.x}px`;
                element.style.top = `${elementData.y}px`;
                element.style.width = `${elementData.width}px`;
                element.style.height = `${elementData.height}px`;
                element.style.backgroundColor = '#eee';
                element.style.border = '1px dashed #999';
                element.style.display = 'flex';
                element.style.alignItems = 'center';
                element.style.justifyContent = 'center';
                element.textContent = '[IMG]';
                element.style.fontSize = '10px';
                break;
                
            case 'rectangle':
                elementData.x = parseFloat(params[0]) || 0;
                elementData.y = parseFloat(params[1]) || 0;
                elementData.width = parseFloat(params[2]) || 100;
                elementData.height = parseFloat(params[3]) || 50;
                
                element.style.left = `${elementData.x}px`;
                element.style.top = `${elementData.y}px`;
                element.style.width = `${elementData.width}px`;
                element.style.height = `${elementData.height}px`;
                element.style.backgroundColor = params[5] || 'transparent';
                element.style.border = `${parseFloat(params[4]) || 1}px solid ${params[6] || '#000'}`;
                break;
                
            case 'line':
                elementData.x1 = parseFloat(params[0]) || 0;
                elementData.y1 = parseFloat(params[1]) || 0;
                elementData.x2 = parseFloat(params[2]) || 50;
                elementData.y2 = parseFloat(params[3]) || 50;
                elementData.stroke = parseFloat(params[4]) || 1;
                
                // 计算线段长度和角度
                const length = Math.sqrt(Math.pow(elementData.x2 - elementData.x1, 2) + Math.pow(elementData.y2 - elementData.y1, 2));
                const angle = Math.atan2(elementData.y2 - elementData.y1, elementData.x2 - elementData.x1) * 180 / Math.PI;
                
                element.style.left = `${elementData.x1}px`;
                element.style.top = `${elementData.y1}px`;
                element.style.width = `${length}px`;
                element.style.height = `${elementData.stroke}px`;
                element.style.backgroundColor = params[5] || '#000';
                element.style.transformOrigin = 'left center';
                element.style.transform = `rotate(${angle}deg)`;
                break;
        }
        
        this.elements.push(elementData);
        this.canvas.appendChild(element);
        
        return elementData;
    }
    
    updateElementProperty(elementData, property, value) {
        const index = this.elements.indexOf(elementData);
        if (index !== -1) {
            switch (property) {
                case 'x':
                    elementData.x = parseFloat(value) || 0;
                    elementData.element.style.left = `${elementData.x}px`;
                    // 更新参数数组中的值
                    if (elementData.type === 'text' || elementData.type === 'rectangle') {
                        elementData.params[0] = value;
                    } else if (elementData.type === 'barcode') {
                        elementData.params[1] = value;
                    } else if (elementData.type === 'qrcode' || elementData.type === 'image') {
                        elementData.params[0] = value;
                    } else if (elementData.type === 'line') {
                        elementData.params[0] = value;
                        this.redrawLine(elementData);
                    }
                    break;
                    
                case 'y':
                    elementData.y = parseFloat(value) || 0;
                    elementData.element.style.top = `${elementData.y}px`;
                    // 更新参数数组中的值
                    if (elementData.type === 'text' || elementData.type === 'rectangle') {
                        elementData.params[1] = value;
                    } else if (elementData.type === 'barcode') {
                        elementData.params[2] = value;
                    } else if (elementData.type === 'qrcode' || elementData.type === 'image') {
                        elementData.params[1] = value;
                    } else if (elementData.type === 'line') {
                        elementData.params[1] = value;
                        this.redrawLine(elementData);
                    }
                    break;
                    
                case 'width':
                    if (elementData.type !== 'line' && elementData.type !== 'qrcode') {
                        elementData.width = parseFloat(value) || 0;
                        elementData.element.style.width = `${elementData.width}px`;
                        
                        if (elementData.type === 'text') {
                            elementData.params[2] = value;
                        } else if (elementData.type === 'barcode') {
                            elementData.params[3] = value;
                        } else if (elementData.type === 'image') {
                            elementData.params[2] = value;
                        } else if (elementData.type === 'rectangle') {
                            elementData.params[2] = value;
                        }
                    }
                    break;
                    
                case 'height':
                    if (elementData.type !== 'line' && elementData.type !== 'qrcode') {
                        elementData.height = parseFloat(value) || 0;
                        elementData.element.style.height = `${elementData.height}px`;
                        
                        if (elementData.type === 'text') {
                            elementData.params[3] = value;
                        } else if (elementData.type === 'barcode') {
                            elementData.params[4] = value;
                        } else if (elementData.type === 'image') {
                            elementData.params[3] = value;
                        } else if (elementData.type === 'rectangle') {
                            elementData.params[3] = value;
                        }
                    }
                    break;
                    
                case 'text':
                    if (elementData.type === 'text') {
                        elementData.text = value;
                        elementData.element.textContent = value;
                        elementData.params[9] = value;
                    }
                    break;
            }
            
            this.updateInstruction(elementData);
        }
    }
    
    redrawLine(elementData) {
        if (elementData.type === 'line') {
            const length = Math.sqrt(Math.pow(elementData.x2 - elementData.x1, 2) + Math.pow(elementData.y2 - elementData.y1, 2));
            const angle = Math.atan2(elementData.y2 - elementData.y1, elementData.x2 - elementData.x1) * 180 / Math.PI;
            
            elementData.element.style.left = `${elementData.x1}px`;
            elementData.element.style.top = `${elementData.y1}px`;
            elementData.element.style.width = `${length}px`;
            elementData.element.style.transform = `rotate(${angle}deg)`;
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
        this.deselectElement();
    }
    
    loadInstructions(instructions) {
        this.clear();
        
        for (const instruction of instructions) {
            if (instruction.type !== 'label') {
                this.createElement(instruction.type, instruction.params);
            }
        }
    }
    
    getAllInstructions() {
        return this.elements.map(elementData => ({
            type: elementData.type,
            params: elementData.params
        }));
    }
}

// 确保在浏览器环境中将VisualDesigner附加到window对象
if (typeof window !== 'undefined') {
    window.VisualDesigner = VisualDesigner;
}

// 导出模块（用于支持模块化加载）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VisualDesigner;
}