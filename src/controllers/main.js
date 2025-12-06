/**
 * 主应用程序入口
 * 负责初始化应用并绑定事件
 */

// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', () => {
    // 获取DOM元素
    const propertiesPanel = document.querySelector('#properties-panel.designer-properties-panel');
    const propertiesContent = document.getElementById('properties-content');
    const toolbox = document.querySelector('#toolbox.designer-toolbox'); // 获取设计器内的工具箱元素
    
    const helpData = window.HelpData || 
                     (typeof require !== 'undefined' ? require('../models/help-data.js') : null);
    
    // 引入工具函数
    const Utils = window.Utils || 
                  (typeof require !== 'undefined' ? require('../models/utils.js') : null);
    
    // 创建共享的Label实例
    const sharedLabel = new Label();
    
    // 创建标签设计器实例
    const designerContainer = document.getElementById('visual-designer');
    let labelDesigner = null;
    
    if (designerContainer) {
        labelDesigner = new LabelDesigner(designerContainer, (instruction) => {
            // 当元素被选中时更新属性面板
            onElementSelected(instruction);
        }, sharedLabel);
    }
    
    // 创建标签预览器实例
    const previewContainer = document.getElementById('preview-tab');
    let labelPreviewer = null;
    
    if (previewContainer) {
        labelPreviewer = new LabelPreviewer(previewContainer, sharedLabel);
    }
    
    // 创建标签编辑器实例
    const editorContainer = document.getElementById('editor-tab');
    let labelEditor = null;
    
    if (editorContainer) {
        labelEditor = new LabelEditor(editorContainer, sharedLabel, (defaultHelp, instruction) => {
            const helpContent = document.getElementById('current-instruction-help');
            if (defaultHelp) {
                helpContent.innerHTML = defaultHelp;
                return;
            }
            
            if (!instruction) {
                helpContent.innerHTML = '<p>请选择一个元素以编辑其属性</p>';
                return;
            }
            
            const helpInfo = helpData.getInstructionHelp(instruction.type);
            if (!helpInfo) {
                helpContent.innerHTML = '<p>未找到该元素的帮助信息</p>';
                return;
            }
            
            helpContent.innerHTML = helpData.generateHelpHTML(helpInfo);
        });
        
        // 从sharedLabel初始化编辑器内容
        labelEditor.syncFromLabel();
    }
    
    // 防止循环同步的标志位
    let isSyncing = false;
    
    // 绑定键盘事件，实现在设计器中按Delete键删除元素
    document.addEventListener('keydown', (event) => {
        // 检查当前是否在设计器标签页
        const activeTab = document.querySelector('.tab-button.active');
        if (activeTab && activeTab.getAttribute('data-tab') === 'designer-tab') {
            // 检查是否按下了Delete键或X键
            if (event.key === 'Delete' || event.key === 'x' || event.key === 'X') {
                // 阻止默认行为
                event.preventDefault();
                
                // 删除选中的元素
                if (labelDesigner && (labelDesigner.selectedElement || labelDesigner.selectedElements.size > 0)) {
                    labelDesigner.deleteSelectedElement();
                    
                    // 同步到编辑器
                    // syncDesignerToEditor();
                }
            }
        }
    });

    // 绑定标签页切换事件
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            
            
            // 更新活动标签按钮
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // 显示对应的标签内容
            tabPanes.forEach(pane => {
                pane.classList.remove('active');
                if (pane.id === tabId) {
                    pane.classList.add('active');
                }
            });
            
            // 特殊处理标签预览器
            if (tabId === 'preview-tab') {
                // 隐藏工具箱和属性面板
                if (toolbox) {
                    toolbox.style.display = 'none';
                }
                if (propertiesPanel) {
                    propertiesPanel.style.display = 'none';
                }
                
                // 触发预览渲染
                if (labelPreviewer) {
                    labelPreviewer.render();
                }
            }
            
            // 特殊处理标签设计器
            if (tabId === 'designer-tab') {
                // 显示工具箱和属性面板
                if (toolbox) {
                    toolbox.style.display = 'block';
                }
                if (propertiesPanel) {
                    propertiesPanel.style.display = 'block';
                }
                
                // 从共享Label实例刷新设计器内容
                if (labelDesigner) {
                    labelDesigner.refreshFromLabel();
                }
            }
            
            // 特殊处理标签编辑器
            if (tabId === 'editor-tab') {
                // 隐藏工具箱和属性面板
                if (toolbox) {
                    toolbox.style.display = 'none';
                }
                if (propertiesPanel) {
                    propertiesPanel.style.display = 'none';
                }
                
                // 从共享Label实例刷新编辑器内容
                if (labelEditor) {
                    labelEditor.syncFromLabel();
                }
            }
        });
    });
    
    // 监听代码同步完成事件
    if (editorContainer) {
        editorContainer.addEventListener('codeSyncComplete', () => {
            // 如果当前在标签设计器标签页，则刷新标签设计器
            const activeTab = document.querySelector('.tab-button.active');
            if (activeTab && activeTab.getAttribute('data-tab') === 'designer-tab') {
                if (labelDesigner) {
                    labelDesigner.refreshFromLabel();
                }
            }
        });
    }
    
    // 同步标签编辑器到标签设计器
    function syncEditorToDesigner() {
        if (isSyncing) return;
        
        try {
            isSyncing = true;
            // 使用共享Label实例获取指令
            const instructions = sharedLabel.getAllInstructions();
            
            if (labelDesigner) {
                labelDesigner.loadInstructions(instructions);
            }
        } catch (e) {
            console.error("同步标签编辑器到标签设计器时出错:", e);
        } finally {
            isSyncing = false;
        }
    }
    
    // 同步标签设计器到标签编辑器
    function syncDesignerToEditor() {
        if (isSyncing) return;
        
        try {
            isSyncing = true;
            if (labelDesigner) {
                // 更新共享Label实例
                const instructions = labelDesigner.getAllInstructions();
                sharedLabel.loadFromInstructions(instructions);
                
                // 更新标签编辑器内容
                if (labelEditor) {
                    labelEditor.syncFromLabel();
                }
            }
        } catch (e) {
            console.error("同步标签设计器到标签编辑器时出错:", e);
        } finally {
            isSyncing = false;
        }
    }
    
    // 当元素被选中时更新属性面板
    function onElementSelected(instruction) {
        if (!instruction) {
            // 清空属性面板内容，但不隐藏面板本身
            if (propertiesContent) {
                propertiesContent.innerHTML = '';
            }
            return;
        }
        
        // 显示属性面板
        if (propertiesPanel) {
            propertiesPanel.style.display = 'block';
        }
        
        // 在编辑器的指令帮助区域显示选中元素的帮助信息
        const helpContent = document.getElementById('current-instruction-help');
        if (helpContent) {
            const helpInfo = helpData.getInstructionHelp(instruction.type);
            if (helpInfo) {
                helpContent.innerHTML = helpData.generateHelpHTML(helpInfo);
            } else {
                helpContent.innerHTML = '<p>未找到该标签指令的帮助信息</p>';
            }
        }
        
        const helpInfo = helpData.getInstructionHelp(instruction.type);
        if (helpInfo) {
            helpContent.innerHTML = helpData.generateHelpHTML(helpInfo);
        } else {
            propertiesContent.innerHTML = '<p>未找到该标签指令的帮助信息</p>';
        }
        
        let html = `<h4>${helpInfo.name}</h4>`;
        html += '<div class="property-groups">';
        
        // 根据元素类型生成属性控件
        switch (instruction.type) {
            case 'text':
                html += createPropertyGroup('位置', [
                    { label: 'X坐标', name: 'x', value: instruction.params[0] || 0 },
                    { label: 'Y坐标', name: 'y', value: instruction.params[1] || 0 },
                    { label: '宽度', name: 'width', value: instruction.params[2] || 100 },
                    { label: '高度', name: 'height', value: instruction.params[3] || 30 }
                ]);

                html += createPropertyGroup('字体', [
                    { label: '字体大小', name: 'font-size', value: instruction.params[4] || 12, type: 'number', min: 1, max: 100 },
                    { label: '字体族', name: 'font-family', value: instruction.params[5] || 'Arial', type: 'select', options: ['Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Verdana', 'Georgia'] },
                    { label: '字体粗细', name: 'font-weight', value: instruction.params[6] || 'normal', type: 'select', options: ['normal', 'bold'] }
                ]);
                
                html += createPropertyGroup('对齐方式', [
                    { label: '文本对齐', name: 'text-align', value: instruction.params[7] || 'left', type: 'select', options: ['left', 'center', 'right'] }
                ]);
                
                html += createPropertyGroup('颜色', [
                    { label: '文本颜色', name: 'color', value: instruction.params[8] || '#000000', type: 'color' }
                ]);
                
                html += createPropertyGroup('文本内容', [
                    { label: '内容', name: 'text', value: instruction.params[9] || '', type: 'text' }
                ]);
                break;
                
            case 'barcode':
                html += createPropertyGroup('位置和尺寸', [
                    { label: 'X坐标', name: 'x', value: instruction.params[1] || 0 },
                    { label: 'Y坐标', name: 'y', value: instruction.params[2] || 0 },
                    { label: '宽度', name: 'width', value: instruction.params[3] || 100 },
                    { label: '高度', name: 'height', value: instruction.params[4] || 30 }
                ]);
                
                html += createPropertyGroup('条码内容', [
                    { label: '内容', name: 'content', value: instruction.params[6] || '', type: 'text' }
                ]);
                break;
                
            case 'qrcode':
                html += createPropertyGroup('位置和尺寸', [
                    { label: 'X坐标', name: 'x', value: instruction.params[0] || 0 },
                    { label: 'Y坐标', name: 'y', value: instruction.params[1] || 0 },
                    { label: '尺寸', name: 'size', value: instruction.params[2] || 50 }
                ]);
                
                html += createPropertyGroup('二维码内容', [
                    { label: '内容', name: 'content', value: instruction.params[4] || '', type: 'text' }
                ]);
                break;
                
            case 'image':
                html += createPropertyGroup('位置和尺寸', [
                    { label: 'X坐标', name: 'x', value: instruction.params[0] || 0 },
                    { label: 'Y坐标', name: 'y', value: instruction.params[1] || 0 },
                    { label: '宽度', name: 'width', value: instruction.params[2] || 50 },
                    { label: '高度', name: 'height', value: instruction.params[3] || 50 }
                ]);
                break;
                
            case 'rectangle':
                html += createPropertyGroup('位置和尺寸', [
                    { label: 'X坐标', name: 'x', value: instruction.params[0] || 0 },
                    { label: 'Y坐标', name: 'y', value: instruction.params[1] || 0 },
                    { label: '宽度', name: 'width', value: instruction.params[2] || 100 },
                    { label: '高度', name: 'height', value: instruction.params[3] || 50 }
                ]);
                break;
                
            case 'line':
                html += createPropertyGroup('起点', [
                    { label: 'X1坐标', name: 'x1', value: instruction.params[0] || 0 },
                    { label: 'Y1坐标', name: 'y1', value: instruction.params[1] || 0 }
                ]);
                
                html += createPropertyGroup('终点', [
                    { label: 'X2坐标', name: 'x2', value: instruction.params[2] || 50 },
                    { label: 'Y2坐标', name: 'y2', value: instruction.params[3] || 50 }
                ]);
                break;
        }
        
        html += '</div>';
        propertiesContent.innerHTML = html;
        
        // 绑定属性控件事件
        bindPropertyControls(instruction);
    }
    
    // 创建属性组
    function createPropertyGroup(title, properties) {
        // 根据参数数量决定是否添加"many-params"类
        const manyParamsClass = properties.length > 4 ? 'many-params' : '';
        
        let html = `<div class="property-group ${manyParamsClass}">
            <h5>${title}</h5>
            <div class="property-items">`;
            
        properties.forEach(prop => {
            // 判断是否为位置相关参数
            const isPositionParam = ['x', 'y', 'width', 'height', 'size', 'x1', 'y1', 'x2', 'y2'].includes(prop.name);
            
            // 为位置参数添加额外属性
            const extraAttrs = isPositionParam ? 'min="0" step="1" oninput="this.value = Math.abs(parseInt(this.value) || 0)"' : '';
            
            // 根据属性类型生成不同的输入控件
            if (prop.type === 'select' && prop.options) {
                // 下拉选择框
                html += `<div class="property-item">
                    <label for="${prop.name}">${prop.label}</label>
                    <select id="${prop.name}" data-property="${prop.name}">`;
                
                prop.options.forEach(option => {
                    const selected = option == prop.value ? 'selected' : '';
                    html += `<option value="${option}" ${selected}>${option}</option>`;
                });
                
                html += `</select>
                </div>`;
            } else if (prop.type === 'color') {
                // 颜色选择器
                html += `<div class="property-item">
                    <label for="${prop.name}">${prop.label}</label>
                    <input type="color" 
                           id="${prop.name}"
                           data-property="${prop.name}" 
                           value="${prop.value}">
                    </div>`;
            } else if (prop.type === 'text') {
                // 文本输入框
                html += `<div class="property-item">
                    <label for="${prop.name}">${prop.label}</label>
                    <input type="text" 
                           id="${prop.name}"
                           data-property="${prop.name}" 
                           value="${prop.value}"
                           style="width: 100%">
                    </div>`;
            } else {
                // 数字输入框（默认）
                const minAttr = prop.min !== undefined ? `min="${prop.min}"` : '';
                const maxAttr = prop.max !== undefined ? `max="${prop.max}"` : '';
                html += `<div class="property-item">
                    <label for="${prop.name}">${prop.label}</label>
                    <input type="number" 
                           id="${prop.name}"
                           data-property="${prop.name}" 
                           value="${prop.value}" 
                           ${minAttr}
                           ${maxAttr}
                           ${extraAttrs}>
                    </div>`;
            }
        });
        
        html += `</div>
        </div>`;
        return html;
    }
    
    // 绑定属性控件事件
    function bindPropertyControls(instruction) {
        const inputs = propertiesContent.querySelectorAll('input, select'); // 包括input和select元素
        inputs.forEach(input => {
            // 添加输入事件监听器，用于实时验证
            if (input.type === 'number') {
                input.addEventListener('input', () => {
                    const property = input.dataset.property;
                    // 检查是否为位置相关参数
                    const isPositionParam = ['x', 'y', 'width', 'height', 'size', 'x1', 'y1', 'x2', 'y2'].includes(property);
                    
                    if (isPositionParam) {
                        // 确保值为非负整数
                        let value = parseInt(input.value) || 0;
                        value = Math.abs(value);
                        input.value = value;
                    }
                });
            }
            
            // 添加更改事件监听器，用于更新属性
            input.addEventListener('change', () => {
                const property = input.dataset.property;
                let value = input.value;
                
                // 检查是否为位置相关参数
                const isPositionParam = ['x', 'y', 'width', 'height', 'size', 'x1', 'y1', 'x2', 'y2'].includes(property);
                
                if (isPositionParam) {
                    // 确保值为非负整数
                    value = parseInt(value) || 0;
                    value = Math.abs(value);
                    input.value = value;
                }
                
                // 更新标签设计器中的元素
                if (labelDesigner && labelDesigner.selectedElement) {
                    // 特殊处理条形码和二维码的值参数
                    if ((instruction.type === 'barcode' || instruction.type === 'qrcode') && property === 'content') {
                        // 对于条形码，更新params[6]
                        if (instruction.type === 'barcode') {
                            instruction.params[6] = value;
                        }
                        // 对于二维码，更新params[4]
                        else if (instruction.type === 'qrcode') {
                            instruction.params[4] = value;
                        }
                        
                        // 更新设计器中的元素显示
                        const elementData = labelDesigner.elements.find(el => el.element === labelDesigner.selectedElement);
                        if (elementData) {
                            // 更新元素显示文本（如果需要）
                            if (instruction.type === 'barcode') {
                                // 条形码不直接显示文本内容，但可以更新其数据
                            } else if (instruction.type === 'qrcode') {
                                // 二维码也不直接显示文本内容
                            }
                        }
                    } else {
                        // 处理其他属性
                        labelDesigner.updateElementProperty(
                            labelDesigner.selectedElement, 
                            property, 
                            value
                        );
                    }
                }
                
                // 更新指令输入框中的文本
                updateInstructionInTextarea(instruction.type, property, value);
                
                // 同步标签设计器到标签编辑器
                if (!isSyncing) {
                    // syncDesignerToEditor();
                }
            });
        });
    }
    
    // 更新文本区域中的指令
    function updateInstructionInTextarea(type, property, value) {
        // 获取指令输入框
        const textarea = document.getElementById('instruction-input');
        if (!textarea) return;
        
        // 获取当前指令文本
        const lines = textarea.value.split('\n');
        
        // 找到正在编辑的指令行（基于当前选中元素）
        if (labelDesigner && labelDesigner.selectedElement) {
            const elementData = labelDesigner.elements.find(el => el.element === labelDesigner.selectedElement);
            if (!elementData) return;
            
            // 查找匹配的指令行
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line || line.startsWith('#')) continue; // 跳过空行和注释
                
                const parts = line.split(',');
                if (parts.length < 2) continue;
                
                const instructionType = parts[0];
                if (instructionType !== type) continue;
                
                // 检查参数是否匹配（简单匹配前几个参数）
                let isMatch = true;
                for (let j = 1; j <= Math.min(parts.length - 1, 5); j++) { // 只比较前5个参数
                    if (parts[j] !== String(elementData.params[j-1])) {
                        isMatch = false;
                        break;
                    }
                }
                
                if (isMatch) {
                    // 更新参数
                    switch (type) {
                        case 'text':
                            switch (property) {
                                case 'x':
                                    parts[1] = value;
                                    break;
                                case 'y':
                                    parts[2] = value;
                                    break;
                                case 'width':
                                    parts[3] = value;
                                    break;
                                case 'height':
                                    parts[4] = value;
                                    break;
                                case 'font-size':
                                    parts[5] = value;
                                    break;
                                case 'font-family':
                                    parts[6] = value;
                                    break;
                                case 'font-weight':
                                    parts[7] = value;
                                    break;
                                case 'text-align':
                                    parts[8] = value;
                                    break;
                                case 'color':
                                    parts[9] = value;
                                    break;
                                case 'text':
                                    parts[10] = value;
                                    break;
                            }
                            break;
                            
                        case 'barcode':
                            if (property === 'content') {
                                parts[7] = value;
                            } else {
                                // 处理其他参数
                                switch (property) {
                                    case 'x':
                                        parts[2] = value;
                                        break;
                                    case 'y':
                                        parts[3] = value;
                                        break;
                                    case 'width':
                                        parts[4] = value;
                                        break;
                                    case 'height':
                                        parts[5] = value;
                                        break;
                                }
                            }
                            break;
                            
                        case 'qrcode':
                            if (property === 'content') {
                                parts[5] = value;
                            } else {
                                // 处理其他参数
                                switch (property) {
                                    case 'x':
                                        parts[1] = value;
                                        break;
                                    case 'y':
                                        parts[2] = value;
                                        break;
                                    case 'size':
                                        parts[3] = value;
                                        break;
                                }
                            }
                            break;
                    }
                    
                    // 更新行内容
                    lines[i] = parts.join(',');
                    textarea.value = lines.join('\n');
                    break;
                }
            }
        }
    }
    
    // 初始渲染
    // 默认切换到标签预览器以显示初始内容
    setTimeout(() => {
        const previewTabButton = document.querySelector('[data-tab="preview-tab"]');
        if (previewTabButton) {
            previewTabButton.click();
        }
    }, 100);
    
    // 添加保存按钮事件处理
    const saveButton = document.getElementById('save-label-btn');
    if (saveButton) {
        saveButton.addEventListener('click', () => {
            try {
                // 从共享Label实例获取所有指令
                const instructions = sharedLabel.getAllInstructions();
                
                // 将指令转换为文本格式
                const labelContent = instructions.map(instruction => 
                    `${instruction.type},${instruction.params.join(',')}`
                ).join('\n');
                
                // 创建Blob对象
                const blob = new Blob([labelContent], { type: 'text/plain;charset=utf-8' });
                
                // 创建下载链接
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'label.txt';
                
                // 触发下载
                document.body.appendChild(a);
                a.click();
                
                // 清理
                setTimeout(() => {
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                }, 100);
            } catch (e) {
                console.error("保存标签指令时出错:", e);
                alert('保存失败，请查看控制台了解详情。');
            }
        });
    }
});