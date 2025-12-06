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
        this.selectedElements = new Set(); // 用于存储多选元素
        this.elements = [];
        this.isDragging = false;
        this.isResizing = false;
        this.dragOffset = { x: 0, y: 0 };
        this.resizeDirection = null;
        this.resizeStartSize = { width: 0, height: 0 };
        this.resizeStartPos = { x: 0, y: 0 };
        this.isMarqueeSelecting = false; // 框选状态
        this.marqueeStartPos = { x: 0, y: 0 }; // 框选起始位置
        this.marqueeElement = null; // 框选元素
        this.isCtrlPressed = false; // Ctrl键状态
        
        // 使用传入的Label实例或者创建一个新的实例
        this.label = labelInstance || new Label();
        
        this.init();
    }
    
    init() {
        // 清空容器
        this.container.innerHTML = '';
        
        // 创建元素
        this.createElements();
        
        // 绑定事件
        this.bindEvents();
        
        // 初始化工具箱拖拽事件
        this.initToolboxDrag();
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
    
    initToolboxDrag() {
        // 为工具箱中的所有可拖拽项添加事件监听器
        const toolboxItems = document.querySelectorAll('.designer-toolbox .toolbox-item[draggable="true"]');
        toolboxItems.forEach(item => {
            item.addEventListener('dragstart', (e) => {
                const type = item.getAttribute('data-type');
                e.dataTransfer.setData('text/plain', type);
                
                // 防止拖动时选中文本
                e.dataTransfer.effectAllowed = 'move';
            });
            
            // 防止拖动时选中文本内容
            item.addEventListener('selectstart', (e) => {
                e.preventDefault();
            });
        });
    }
    
    bindEvents() {
        // 鼠标按下事件
        this.canvas.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('draggable-element')) {
                // 检查是否按住Ctrl键进行多选
                if (e.ctrlKey || e.metaKey) {
                    this.toggleElementSelection(e.target);
                } else {
                    this.selectElement(e.target);
                }
                
                // 检查是否在元素边缘（调整大小区域）
                const rect = e.target.getBoundingClientRect();
                const edgeThreshold = 8;
                
                const onRightEdge = e.clientX >= rect.right - edgeThreshold;
                const onBottomEdge = e.clientY >= rect.bottom - edgeThreshold;
                
                if (onRightEdge && onBottomEdge) {
                    this.startResizing(e, 'both'); // 同时调整宽高
                } else if (onRightEdge) {
                    this.startResizing(e, 'width'); // 只调整宽度
                } else if (onBottomEdge) {
                    this.startResizing(e, 'height'); // 只调整高度
                } else {
                    this.startDrag(e);
                }
            } else if (e.target === this.canvas) {
                // 在画布上开始框选
                this.startMarqueeSelection(e);
            } else {
                this.deselectAllElements();
            }
        });
        
        // 双击事件 - 编辑content属性
        this.canvas.addEventListener('dblclick', (e) => {
            if (e.target.classList.contains('draggable-element')) {
                this.editElementContent(e.target);
            }
        });
        
        // 鼠标移动事件
        document.addEventListener('mousemove', (e) => {
            if (this.isDragging && this.selectedElement) {
                this.dragElement(e);
            } else if (this.isResizing && this.selectedElement) {
                this.resizeElement(e);
            } else if (this.isMarqueeSelecting) {
                this.updateMarqueeSelection(e);
            }
            
            // 显示调整大小的光标
            if (this.selectedElement && !this.isDragging && !this.isResizing) {
                const rect = this.selectedElement.getBoundingClientRect();
                const edgeThreshold = 8;
                
                const onRightEdge = e.clientX >= rect.right - edgeThreshold;
                const onBottomEdge = e.clientY >= rect.bottom - edgeThreshold;
                
                if (onRightEdge && onBottomEdge) {
                    this.selectedElement.style.cursor = 'nwse-resize';
                } else if (onRightEdge) {
                    this.selectedElement.style.cursor = 'ew-resize';
                } else if (onBottomEdge) {
                    this.selectedElement.style.cursor = 'ns-resize';
                } else {
                    this.selectedElement.style.cursor = 'move';
                }
            }
        });
        
        // 鼠标释放事件
        document.addEventListener('mouseup', (e) => {
            this.stopDrag();
            this.stopResizing();
            this.stopMarqueeSelection();
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
        
        // 键盘事件
        document.addEventListener('keydown', (e) => {
            // 跟踪Ctrl键状态
            if (e.key === 'Control' || e.key === 'Meta') {
                this.isCtrlPressed = true;
            }
            
            // 检查是否按下了Ctrl+A全选
            if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
                e.preventDefault();
                this.selectAllElements();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            // 跟踪Ctrl键状态
            if (e.key === 'Control' || e.key === 'Meta') {
                this.isCtrlPressed = false;
            }
        });
    }
    
    /**
     * 选择单个元素
     */
    selectElement(element) {
        // 取消之前所有选中元素的高亮
        this.deselectAllElements();
        
        // 选中新元素
        this.selectedElement = element;
        this.selectedElements.add(element);
        element.style.outline = '2px solid #007bff';
        
        // 触发属性面板更新
        if (this.onInstructionChange) {
            const elementData = this.elements.find(el => el.element === element);
            if (elementData) {
                this.onInstructionChange(this.getElementInstruction(elementData));
            }
        }
    }
    
    /**
     * 切换单个元素的选中状态
     */
    toggleElementSelection(element) {
        if (this.selectedElements.has(element)) {
            // 如果已选中，则取消选中
            this.selectedElements.delete(element);
            element.style.outline = '';
            
            // 如果取消选中的是当前主选中元素，则更新主选中元素
            if (this.selectedElement === element) {
                this.selectedElement = this.selectedElements.size > 0 ? 
                    Array.from(this.selectedElements)[0] : null;
            }
        } else {
            // 如果未选中，则添加到选中集合
            this.selectedElements.add(element);
            element.style.outline = '2px solid #007bff';
            
            // 如果这是第一个选中的元素，则设为主选中元素
            if (!this.selectedElement) {
                this.selectedElement = element;
            }
        }
        
        // 触发属性面板更新
        if (this.onInstructionChange) {
            if (this.selectedElement) {
                const elementData = this.elements.find(el => el.element === this.selectedElement);
                if (elementData) {
                    this.onInstructionChange(this.getElementInstruction(elementData));
                }
            } else {
                this.onInstructionChange(null);
            }
        }
    }
    
    /**
     * 取消所有元素的选中状态
     */
    deselectAllElements() {
        // 取消所有元素的高亮
        this.selectedElements.forEach(element => {
            element.style.outline = '';
        });
        
        // 清空选中集合
        this.selectedElements.clear();
        this.selectedElement = null;
        
        // 触发属性面板更新，传入null表示没有选中元素
        if (this.onInstructionChange) {
            this.onInstructionChange(null);
        }
    }
    
    /**
     * 选择所有元素
     */
    selectAllElements() {
        // 清空当前选中状态
        this.deselectAllElements();
        
        // 选中所有元素
        this.elements.forEach(elementData => {
            const element = elementData.element;
            this.selectedElements.add(element);
            element.style.outline = '2px solid #007bff';
        });
        
        // 设置第一个元素为主选中元素
        if (this.elements.length > 0) {
            this.selectedElement = this.elements[0].element;
            
            // 触发属性面板更新
            if (this.onInstructionChange) {
                const elementData = this.elements[0];
                if (elementData) {
                    this.onInstructionChange(this.getElementInstruction(elementData));
                }
            }
        } else {
            // 触发属性面板更新，传入null表示没有选中元素
            if (this.onInstructionChange) {
                this.onInstructionChange(null);
            }
        }
    }
    
    startDrag(e) {
        this.isDragging = true;
        this.isResizing = false; // 确保不是在调整大小
        
        // 获取主元素的边界框
        const rect = this.selectedElement.getBoundingClientRect();
        const containerRect = this.canvas.getBoundingClientRect();
        
        // 计算主元素的拖动偏移量
        this.dragOffset.x = e.clientX - rect.left;
        this.dragOffset.y = e.clientY - rect.top;
    }
    
    startResizing(e, direction) {
        this.isResizing = true;
        this.isDragging = false; // 确保不是在拖拽
        this.resizeDirection = direction;
        
        const rect = this.selectedElement.getBoundingClientRect();
        this.resizeStartSize.width = rect.width;
        this.resizeStartSize.height = rect.height;
        this.resizeStartPos.x = e.clientX;
        this.resizeStartPos.y = e.clientY;
        
        e.preventDefault();
        e.stopPropagation();
    }
    
    dragElement(e) {
        const containerRect = this.canvas.getBoundingClientRect();
        
        // 计算主元素的新位置
        let mainX = e.clientX - containerRect.left - this.dragOffset.x;
        let mainY = e.clientY - containerRect.top - this.dragOffset.y;
        
        // 边界检查
        mainX = Math.max(0, Math.min(mainX, containerRect.width - this.selectedElement.offsetWidth));
        mainY = Math.max(0, Math.min(mainY, containerRect.height - this.selectedElement.offsetHeight));
        
        // 获取主元素的当前位置
        const mainElementRect = this.selectedElement.getBoundingClientRect();
        const mainElementData = this.elements.find(el => el.element === this.selectedElement);
        
        if (!mainElementData) return;
        
        const oldMainX = mainElementData.x;
        const oldMainY = mainElementData.y;
        
        // 计算位置差值
        const deltaX = mainX - oldMainX;
        const deltaY = mainY - oldMainY;
        
        // 网格吸附 - 将元素位置对齐到10x10像素的网格
        const gridSize = 10;
        mainX = Math.round(mainX / gridSize) * gridSize;
        mainY = Math.round(mainY / gridSize) * gridSize;
        
        // 更新所有选中元素的位置
        this.selectedElements.forEach(element => {
            const elementData = this.elements.find(el => el.element === element);
            if (elementData) {
                let newX, newY;
                
                // 如果是主元素，使用计算好的位置
                if (element === this.selectedElement) {
                    newX = mainX;
                    newY = mainY;
                } else {
                    // 其他选中元素根据相对位置移动
                    newX = elementData.x + deltaX;
                    newY = elementData.y + deltaY;
                    
                    // 应用网格吸附
                    newX = Math.round(newX / gridSize) * gridSize;
                    newY = Math.round(newY / gridSize) * gridSize;
                }
                
                // 边界检查
                newX = Math.max(0, Math.min(newX, containerRect.width - element.offsetWidth));
                newY = Math.max(0, Math.min(newY, containerRect.height - element.offsetHeight));
                
                // 更新元素位置
                element.style.left = `${newX}px`;
                element.style.top = `${newY}px`;
                
                // 更新元素数据
                elementData.x = newX;
                elementData.y = newY;
                
                // 更新指令参数
                this.updateInstructionParams(elementData, newX, newY);
            }
        });
    }
    
    resizeElement(e) {
        if (!this.selectedElement) return;
        
        const elementData = this.elements.find(el => el.element === this.selectedElement);
        if (!elementData) return;
        
        // 计算尺寸变化
        const widthDiff = e.clientX - this.resizeStartPos.x;
        const heightDiff = e.clientY - this.resizeStartPos.y;
        
        let newWidth = this.resizeStartSize.width;
        let newHeight = this.resizeStartSize.height;
        
        // 根据调整方向更新尺寸
        if (this.resizeDirection === 'both' || this.resizeDirection === 'width') {
            newWidth = this.resizeStartSize.width + widthDiff;
        }
        
        if (this.resizeDirection === 'both' || this.resizeDirection === 'height') {
            newHeight = this.resizeStartSize.height + heightDiff;
        }
        
        // 确保最小尺寸
        newWidth = Math.max(10, newWidth);
        newHeight = Math.max(10, newHeight);
        
        // 网格吸附 - 将尺寸对齐到10x10像素的网格
        const gridSize = 10;
        newWidth = Math.round(newWidth / gridSize) * gridSize;
        newHeight = Math.round(newHeight / gridSize) * gridSize;
        
        // 应用新尺寸
        if (this.resizeDirection === 'both' || this.resizeDirection === 'width') {
            this.selectedElement.style.width = `${newWidth}px`;
        }
        
        if (this.resizeDirection === 'both' || this.resizeDirection === 'height') {
            this.selectedElement.style.height = `${newHeight}px`;
        }
        
        // 更新元素数据
        elementData.width = newWidth;
        elementData.height = newHeight;
        
        // 更新参数
        this.updateElementSize(elementData, newWidth, newHeight);
    }
    
    stopDrag() {
        this.isDragging = false;
        // 拖拽结束后触发更新回调
        if (this.onUpdate) {
            this.onUpdate();
        }
        
        // 更新共享Label实例中的指令
        this.selectedElements.forEach(element => {
            const elementData = this.elements.find(el => el.element === element);
            if (elementData) {
                // 查找对应的指令并更新
                const instructions = this.label.getAllInstructionsWithId();
                const instructionToUpdate = instructions.find(inst => 
                    inst.type === elementData.type && 
                    JSON.stringify(inst.params) === JSON.stringify(elementData.originalParams));
                
                if (instructionToUpdate) {
                    this.label.updateInstruction(instructionToUpdate.id, {
                        type: elementData.type,
                        params: elementData.params
                    });
                }
            }
        });
    }
    
    stopResizing() {
        if (this.isResizing) {
            this.isResizing = false;
            this.resizeDirection = null;
            
            // 调整大小结束后触发更新回调
            if (this.onUpdate) {
                this.onUpdate();
            }
            
            // 更新共享Label实例中的指令
            if (this.selectedElement) {
                const elementData = this.elements.find(el => el.element === this.selectedElement);
                if (elementData) {
                    // 查找对应的指令并更新
                    const instructions = this.label.getAllInstructionsWithId();
                    const instructionToUpdate = instructions.find(inst => 
                        inst.type === elementData.type && 
                        JSON.stringify(inst.params) === JSON.stringify(elementData.originalParams));
                    
                    if (instructionToUpdate) {
                        this.label.updateInstruction(instructionToUpdate.id, {
                            type: elementData.type,
                            params: elementData.params
                        });
                    }
                }
            }
        }
    }
    
    addElementFromToolbox(type, clientX, clientY) {
        const containerRect = this.canvas.getBoundingClientRect();
        let x = clientX - containerRect.left;
        let y = clientY - containerRect.top;
        
        // 根据类型创建默认参数
        let params = [];
        let defaultWidth = 100;
        let defaultHeight = 30;
        
        switch (type) {
            case 'text':
                defaultWidth = 100;
                defaultHeight = 30;
                params = [x, y, defaultWidth, defaultHeight, 12, 'Arial', 'normal', 'left', '#000000', '文本'];
                break;
            case 'barcode':
                defaultWidth = 100;
                defaultHeight = 30;
                params = ['CODE128', x, y, defaultWidth, defaultHeight, 'true', '1234567890128'];
                break;
            case 'qrcode':
                defaultWidth = 50;
                defaultHeight = 50;
                params = [x, y, defaultWidth, 'Q', 'https://example.com'];
                break;
            case 'image':
                defaultWidth = 50;
                defaultHeight = 50;
                params = [x, y, defaultWidth, defaultHeight, 'image.png'];
                break;
            case 'line':
                defaultWidth = 50;
                defaultHeight = 1; // 线条高度为1
                params = [x, y, x + defaultWidth, y, 1, '#000000'];
                break;
            case 'rectangle':
                defaultWidth = 100;
                defaultHeight = 50;
                params = [x, y, defaultWidth, defaultHeight, 1, 'transparent', '#000000'];
                break;
        }
        
        // 调整坐标使元素以鼠标位置为中心点
        x = x - defaultWidth / 2;
        y = y - defaultHeight / 2;
        
        // 根据网格间距调整坐标（网格吸附）
        const gridSize = 10; // 与拖拽时使用的网格大小保持一致
        x = Math.round(x / gridSize) * gridSize;
        y = Math.round(y / gridSize) * gridSize;
        
        // 根据元素大小调整坐标，确保元素完全在画布内
        x = Math.max(0, Math.min(x, containerRect.width - defaultWidth));
        y = Math.max(0, Math.min(y, containerRect.height - defaultHeight));
        
        // 更新参数中的坐标
        switch (type) {
            case 'text':
                params[0] = x;
                params[1] = y;
                break;
            case 'barcode':
                params[1] = x;
                params[2] = y;
                break;
            case 'qrcode':
                params[0] = x;
                params[1] = y;
                break;
            case 'image':
                params[0] = x;
                params[1] = y;
                break;
            case 'line':
                const lineLength = params[2] - params[0]; // 保存线段长度
                params[0] = x;
                params[1] = y;
                params[2] = x + lineLength; // 保持线段长度不变
                params[3] = y;
                break;
            case 'rectangle':
                params[0] = x;
                params[1] = y;
                break;
        }
        
        // 创建元素
        const elementData = this.createElement(type, params);
        
        // 确保元素位置准确设置
        elementData.element.style.left = `${x}px`;
        elementData.element.style.top = `${y}px`;
        
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
        
        // 保存原始参数以便后续查找和更新
        elementData.originalParams = [...params];
        
        this.elements.push(elementData);
        this.canvas.appendChild(elementData.element);
        
        return elementData;
    }
    
    updateElementSize(elementData, width, height) {
        // 更新参数
        switch (elementData.type) {
            case 'text':
                elementData.params[2] = width;
                elementData.params[3] = height;
                break;
            case 'barcode':
                elementData.params[3] = width;
                elementData.params[4] = height;
                break;
            case 'qrcode':
                // 二维码是正方形，只需要更新一个尺寸参数
                elementData.params[2] = width;
                break;
            case 'image':
                elementData.params[2] = width;
                elementData.params[3] = height;
                break;
            case 'rectangle':
                elementData.params[2] = width;
                elementData.params[3] = height;
                break;
        }
        
        this.updateInstruction(elementData);
    }
    
    /**
     * 编辑元素的content属性
     */
    editElementContent(element) {
        const elementData = this.elements.find(el => el.element === element);
        if (!elementData) return;
        
        // 检查元素类型是否支持content属性编辑
        if (!['text', 'barcode', 'qrcode'].includes(elementData.type)) {
            return;
        }
        
        // 获取当前content值
        let currentValue = '';
        switch (elementData.type) {
            case 'text':
                currentValue = elementData.params[9] || '';
                break;
            case 'barcode':
                currentValue = elementData.params[6] || '';
                break;
            case 'qrcode':
                currentValue = elementData.params[4] || '';
                break;
        }
        
        // 创建输入框
        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentValue;
        input.style.position = 'absolute';
        input.style.left = element.style.left;
        input.style.top = element.style.top;
        input.style.width = element.style.width;
        input.style.height = element.style.height;
        input.style.zIndex = '1000';
        input.style.fontSize = elementData.type === 'text' ? element.style.fontSize : '12px';
        input.style.textAlign = elementData.type === 'text' ? 
            (element.style.justifyContent === 'center' ? 'center' : 
             element.style.justifyContent === 'flex-end' ? 'right' : 'left') : 'left';
        
        // 添加到画布中
        this.canvas.appendChild(input);
        
        // 聚焦并全选文本
        input.focus();
        input.select();
        
        // 处理输入完成事件
        const finishEditing = () => {
            const newValue = input.value;
            
            // 移除输入框
            input.remove();
            
            // 更新元素内容
            this.updateElementProperty(element, 'content', newValue);
            
            // 更新共享Label实例
            if (this.onUpdate) {
                this.onUpdate();
            }
        };
        
        // 绑定事件
        input.addEventListener('blur', finishEditing);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                finishEditing();
            } else if (e.key === 'Escape') {
                input.remove();
            }
        });
    }
    
    /**
     * 更新元素属性
     */
    updateElementProperty(element, property, value) {
        const elementData = this.elements.find(el => el.element === element);
        if (elementData) {
            const index = this.elements.indexOf(elementData);
            if (index !== -1) {
                // 创建指令对象
                const instructionObj = { type: elementData.type, params: [...elementData.params] };
                
                // 创建指令类实例
                const instructionInstance = InstructionParser.createInstructionInstance(instructionObj);
                
                // 特殊处理content属性
                if (property === 'content') {
                    switch (elementData.type) {
                        case 'text':
                            elementData.params[9] = value;
                            elementData.text = value;
                            elementData.element.textContent = value;
                            break;
                        case 'barcode':
                            elementData.params[6] = value;
                            break;
                        case 'qrcode':
                            elementData.params[4] = value;
                            break;
                    }
                } else {
                    // 更新标签设计器元素属性
                    instructionInstance.updateDesignerElementProperty(elementData, property, value);
                }
                
                this.updateInstruction(elementData);
                
                // 同步更新到共享Label实例
                const instructions = this.label.getAllInstructionsWithId();
                const instructionToUpdate = instructions.find(inst => 
                    inst.type === elementData.type && 
                    JSON.stringify(inst.params) === JSON.stringify(elementData.originalParams));
                
                if (instructionToUpdate) {
                    this.label.updateInstruction(instructionToUpdate.id, {
                        type: elementData.type,
                        params: elementData.params
                    });
                    // 更新原始参数记录
                    elementData.originalParams = [...elementData.params];
                }
            }
        }
    }
    
    updateInstructionParams(elementData, x, y) {
        // 根据元素类型更新参数中的位置信息
        switch (elementData.type) {
            case 'text':
                elementData.params[0] = x;
                elementData.params[1] = y;
                break;
            case 'barcode':
                elementData.params[1] = x;
                elementData.params[2] = y;
                break;
            case 'qrcode':
                elementData.params[0] = x;
                elementData.params[1] = y;
                break;
            case 'image':
                elementData.params[0] = x;
                elementData.params[1] = y;
                break;
            case 'rectangle':
                elementData.params[0] = x;
                elementData.params[1] = y;
                break;
            case 'line':
                // 对于线条，我们只更新起点位置，保持相对位置
                const dx = elementData.params[2] - elementData.params[0];
                const dy = elementData.params[3] - elementData.params[1];
                elementData.params[0] = x;
                elementData.params[1] = y;
                elementData.params[2] = x + dx;
                elementData.params[3] = y + dy;
                break;
        }
        
        this.updateInstruction(elementData);
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
        // 先保存当前选中的元素信息，以便在重新加载后恢复选中状态
        const selectedElementData = this.selectedElement ? 
            this.elements.find(el => el.element === this.selectedElement) : null;
        
        // 清空画布和元素数组
        this.canvas.innerHTML = '';
        this.elements = [];
        
        // 重新创建所有元素
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
            
            // 创建元素
            const elementData = this.createElement(instruction.type, params);
            
            // 添加到Label实例中
            this.label.addInstruction(instruction);
        }
        
        // 恢复选中状态
        if (selectedElementData) {
            const newElementData = this.elements.find(el => 
                el.type === selectedElementData.type && 
                JSON.stringify(el.params) === JSON.stringify(selectedElementData.params)
            );
            
            if (newElementData) {
                this.selectElement(newElementData.element);
            }
        }
        
        // 如果没有找到匹配的元素，清空选中状态
        if (!this.selectedElement && this.onInstructionChange) {
            this.onInstructionChange(null);
        }
    }
    
    getAllInstructions() {
        return this.label.getAllInstructions();
    }
    
    getLabel() {
        return this.label;
    }
    
    get selectedElement() {
        return this._selectedElement;
    }
    
    set selectedElement(element) {
        this._selectedElement = element;
    }
    
    /**
     * 从共享Label实例刷新设计器内容
     * 用于在标签页切换时保持设计器与共享数据同步
     */
    refreshFromLabel() {
        // 保存当前选中元素的信息
        const selectedElementData = this.selectedElement ? 
            this.elements.find(el => el.element === this.selectedElement) : null;
        
        // 清空画布和元素数组
        this.canvas.innerHTML = '';
        this.elements = [];
        
        // 从共享Label实例获取所有指令
        const instructions = this.label.getAllInstructions();
        
        // 重新创建所有元素
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
            
            // 创建元素
            const elementData = this.createElement(instruction.type, params);
        }
        
        // 恢复选中状态
        if (selectedElementData) {
            const newElementData = this.elements.find(el => 
                el.type === selectedElementData.type && 
                JSON.stringify(el.params) === JSON.stringify(selectedElementData.params)
            );
            
            if (newElementData) {
                this.selectElement(newElementData.element);
            }
        }
        
        // 如果没有找到匹配的元素，清空选中状态
        if (!this.selectedElement && this.onInstructionChange) {
            this.onInstructionChange(null);
        }
    }
    
    /**
     * 删除选中的元素
     */
    deleteSelectedElement() {
        if (this.selectedElements.size === 0) return;
        
        // 创建要删除的元素数组副本，因为我们会修改selectedElements集合
        const elementsToDelete = Array.from(this.selectedElements);
        
        elementsToDelete.forEach(element => {
            // 从elements数组中找到要删除的元素
            const elementIndex = this.elements.findIndex(el => el.element === element);
            if (elementIndex === -1) return;
            
            const elementData = this.elements[elementIndex];
            
            // 从canvas中移除元素
            this.canvas.removeChild(element);
            
            // 从elements数组中移除
            this.elements.splice(elementIndex, 1);
            
            // 从selectedElements集合中移除
            this.selectedElements.delete(element);
        });
        
        // 从label实例中移除对应的指令
        const instructions = this.label.getAllInstructionsWithId();
        elementsToDelete.forEach(element => {
            const elementData = this.elements.find(el => el.element === element);
            if (elementData) {
                const instructionToRemove = instructions.find(inst => 
                    inst.type === elementData.type && 
                    JSON.stringify(inst.params) === JSON.stringify(elementData.originalParams));
                    
                if (instructionToRemove) {
                    this.label.removeInstruction(instructionToRemove.id);
                }
            }
        });
        
        // 更新选中状态
        if (this.selectedElements.size === 0) {
            this.selectedElement = null;
        } else if (!this.selectedElements.has(this.selectedElement)) {
            // 如果主选中元素被删除了，选择集合中的第一个元素作为新的主选中元素
            this.selectedElement = Array.from(this.selectedElements)[0];
        }
        
        // 触发属性面板更新
        if (this.onInstructionChange) {
            if (this.selectedElement) {
                const elementData = this.elements.find(el => el.element === this.selectedElement);
                if (elementData) {
                    this.onInstructionChange(this.getElementInstruction(elementData));
                }
            } else {
                this.onInstructionChange(null);
            }
        }
        
        // 触发更新回调
        if (this.onUpdate) {
            this.onUpdate();
        }
    }
    
    /**
     * 开始框选
     */
    startMarqueeSelection(e) {
        this.isMarqueeSelecting = true;
        const containerRect = this.canvas.getBoundingClientRect();
        this.marqueeStartPos.x = e.clientX - containerRect.left;
        this.marqueeStartPos.y = e.clientY - containerRect.top;
        
        // 创建框选元素
        this.marqueeElement = document.createElement('div');
        this.marqueeElement.style.position = 'absolute';
        this.marqueeElement.style.border = '2px dashed #007bff';
        this.marqueeElement.style.backgroundColor = 'rgba(0, 123, 255, 0.1)';
        this.marqueeElement.style.pointerEvents = 'none';
        this.marqueeElement.style.zIndex = '9999';
        this.marqueeElement.style.left = this.marqueeStartPos.x + 'px';
        this.marqueeElement.style.top = this.marqueeStartPos.y + 'px';
        this.marqueeElement.style.width = '0px';
        this.marqueeElement.style.height = '0px';
        
        this.canvas.appendChild(this.marqueeElement);
    }
    
    /**
     * 更新框选区域
     */
    updateMarqueeSelection(e) {
        if (!this.isMarqueeSelecting || !this.marqueeElement) return;
        
        const containerRect = this.canvas.getBoundingClientRect();
        const currentX = e.clientX - containerRect.left;
        const currentY = e.clientY - containerRect.top;
        
        const left = Math.min(this.marqueeStartPos.x, currentX);
        const top = Math.min(this.marqueeStartPos.y, currentY);
        const width = Math.abs(currentX - this.marqueeStartPos.x);
        const height = Math.abs(currentY - this.marqueeStartPos.y);
        
        this.marqueeElement.style.left = left + 'px';
        this.marqueeElement.style.top = top + 'px';
        this.marqueeElement.style.width = width + 'px';
        this.marqueeElement.style.height = height + 'px';
    }
    
    /**
     * 结束框选
     */
    stopMarqueeSelection() {
        if (!this.isMarqueeSelecting) return;
        
        this.isMarqueeSelecting = false;
        
        if (this.marqueeElement) {
            // 获取框选区域相对于画布的位置
            const marqueeRect = this.marqueeElement.getBoundingClientRect();
            const canvasRect = this.canvas.getBoundingClientRect();
            
            const marqueeLeft = marqueeRect.left - canvasRect.left;
            const marqueeTop = marqueeRect.top - canvasRect.top;
            const marqueeRight = marqueeLeft + marqueeRect.width;
            const marqueeBottom = marqueeTop + marqueeRect.height;
            
            // 移除框选元素
            this.marqueeElement.remove();
            this.marqueeElement = null;
            
            // 检查哪些元素在框选区域内
            const elementsInMarquee = [];
            this.elements.forEach(elementData => {
                const element = elementData.element;
                const elementRect = element.getBoundingClientRect();
                
                const elementLeft = elementRect.left - canvasRect.left;
                const elementTop = elementRect.top - canvasRect.top;
                const elementRight = elementLeft + elementRect.width;
                const elementBottom = elementTop + elementRect.height;
                
                // 检查元素是否与框选区域相交
                if (!(elementRight < marqueeLeft || 
                      elementLeft > marqueeRight || 
                      elementBottom < marqueeTop || 
                      elementTop > marqueeBottom)) {
                    elementsInMarquee.push(element);
                }
            });
            
            // 如果有元素在框选区域内，则选中它们
            if (elementsInMarquee.length > 0) {
                // 如果没有按住Ctrl键，则先清空之前的选中状态
                if (!this.isCtrlPressed) {
                    this.deselectAllElements();
                }
                
                // 选中框选区域内的所有元素
                elementsInMarquee.forEach(element => {
                    this.selectedElements.add(element);
                    element.style.outline = '2px solid #007bff';
                });
                
                // 设置第一个元素为主选中元素
                this.selectedElement = elementsInMarquee[0];
                
                // 触发属性面板更新
                if (this.onInstructionChange) {
                    const elementData = this.elements.find(el => el.element === this.selectedElement);
                    if (elementData) {
                        this.onInstructionChange(this.getElementInstruction(elementData));
                    }
                }
            }
        }
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