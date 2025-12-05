/**
 * 主应用程序入口
 * 负责初始化应用并绑定事件
 */

// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', () => {
    // 获取DOM元素
    const instructionInput = document.getElementById('instruction-input');
    const labelPreview = document.getElementById('label-preview');
    const helpContent = document.getElementById('current-instruction-help');
    const propertiesPanel = document.getElementById('properties-panel');
    const propertiesContent = document.getElementById('properties-content');
    
    // 初始化模块
    const renderer = new LabelRenderer(labelPreview);
    const helpData = window.HelpData || 
                     (typeof require !== 'undefined' ? require('../models/help-data.js') : null);
    
    // 创建可视化设计器实例
    const visualDesignerContainer = document.getElementById('visual-designer');
    let visualDesigner = null;
    
    if (visualDesignerContainer) {
        visualDesigner = new VisualDesigner(visualDesignerContainer, (instruction) => {
            // 当元素被选中时更新属性面板
            onElementSelected(instruction);
        });
    }
    
    // 同步标志，防止循环更新
    let isSyncing = false;
    
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
            
            // 特殊处理预览标签
            if (tabId === 'preview-tab') {
                const instructionsText = instructionInput.value;
                const instructions = InstructionParser.parseText(instructionsText);
                renderer.render(instructions);
            }
            
            // 特殊处理设计器标签
            if (tabId === 'designer-tab') {
                // 显示属性面板
                if (propertiesPanel) {
                    propertiesPanel.style.display = 'block';
                }
                
                // 同步代码到设计器
                syncEditorToDesigner();
            } else {
                // 隐藏属性面板
                if (propertiesPanel) {
                    propertiesPanel.style.display = 'none';
                }
            }
        });
    });
    
    // 绑定输入框光标位置变化事件
    instructionInput.addEventListener('keyup', () => {
        updateHelp();
    });
    
    instructionInput.addEventListener('click', () => {
        updateHelp();
    });
    
    // 绑定Ctrl+Enter快捷键渲染
    instructionInput.addEventListener('keydown', (event) => {
        if (event.ctrlKey && event.key === 'Enter') {
            // 切换到预览模式
            const previewTabButton = document.querySelector('[data-tab="preview-tab"]');
            if (previewTabButton) {
                previewTabButton.click();
            }
        }
    });
    
    // 同步代码模式到可视化编辑模式
    function syncEditorToDesigner() {
        if (isSyncing) return;
        
        try {
            isSyncing = true;
            const instructionsText = instructionInput.value;
            const instructions = InstructionParser.parseText(instructionsText);
            
            if (visualDesigner) {
                visualDesigner.loadInstructions(instructions);
            }
        } catch (e) {
            console.error("同步代码模式到可视化编辑模式时出错:", e);
        } finally {
            isSyncing = false;
        }
    }
    
    // 同步可视化编辑模式到代码模式
    function syncDesignerToEditor() {
        if (isSyncing) return;
        
        try {
            isSyncing = true;
            if (visualDesigner) {
                const instructions = visualDesigner.getAllInstructions();
                let instructionsText = '';
                
                // 添加所有指令
                instructions.forEach(instruction => {
                    instructionsText += instruction.type + ',' + instruction.params.join(',') + '\n';
                });
                
                instructionInput.value = instructionsText.trim();
            }
        } catch (e) {
            console.error("同步可视化编辑模式到代码模式时出错:", e);
        } finally {
            isSyncing = false;
        }
    }
    
    // 当元素被选中时更新属性面板
    function onElementSelected(instruction) {
        // 显示属性面板
        if (propertiesPanel) {
            propertiesPanel.style.display = 'block';
        }
        
        if (!instruction) {
            propertiesContent.innerHTML = '<p>请选择一个元素以编辑其属性</p>';
            return;
        }
        
        const helpInfo = helpData.getInstructionHelp(instruction.type);
        if (!helpInfo) {
            propertiesContent.innerHTML = '<p>未找到该元素的帮助信息</p>';
            return;
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
                
                html += createPropertyGroup('文本', [
                    { label: '文字内容', name: 'text', value: instruction.params[9] || '', type: 'text' }
                ]);
                break;
                
            case 'barcode':
                html += createPropertyGroup('位置和尺寸', [
                    { label: 'X坐标', name: 'x', value: instruction.params[1] || 0 },
                    { label: 'Y坐标', name: 'y', value: instruction.params[2] || 0 },
                    { label: '宽度', name: 'width', value: instruction.params[3] || 100 },
                    { label: '高度', name: 'height', value: instruction.params[4] || 30 }
                ]);
                break;
                
            case 'qrcode':
                html += createPropertyGroup('位置和尺寸', [
                    { label: 'X坐标', name: 'x', value: instruction.params[0] || 0 },
                    { label: 'Y坐标', name: 'y', value: instruction.params[1] || 0 },
                    { label: '尺寸', name: 'size', value: instruction.params[2] || 50 }
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
        let html = `<div class="property-group">
            <h5>${title}</h5>`;
            
        properties.forEach(prop => {
            html += `<label>${prop.label}</label>
            <input type="${prop.type || 'number'}" 
                   data-property="${prop.name}" 
                   value="${prop.value}" 
                   ${prop.type === 'text' ? 'style="width: 100%"' : ''}>`;
        });
        
        html += '</div>';
        return html;
    }
    
    // 绑定属性控件事件
    function bindPropertyControls(instruction) {
        const inputs = propertiesContent.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('change', () => {
                const property = input.dataset.property;
                const value = input.value;
                
                // 更新设计器中的元素
                if (visualDesigner && visualDesigner.selectedElement) {
                    visualDesigner.updateElementProperty(
                        visualDesigner.selectedElement, 
                        property, 
                        value
                    );
                }
                
                // 更新指令输入框中的文本
                updateInstructionInTextarea(instruction.type, property, value);
                
                // 同步设计器到编辑器
                if (!isSyncing) {
                    syncDesignerToEditor();
                }
            });
        });
    }
    
    // 更新文本区域中的指令
    function updateInstructionInTextarea(type, property, value) {
        // 这里应该更新文本区域中的指令，暂时留空
        // 实际实现需要解析和重构指令文本
    }
    
    // 更新帮助信息
    function updateHelp() {
        const cursorPosition = instructionInput.selectionStart;
        const text = instructionInput.value;
        const lines = text.substring(0, cursorPosition).split('\n');
        const currentLineIndex = lines.length - 1;
        const currentLine = text.split('\n')[currentLineIndex];
        
        // 如果当前行为空或注释，显示默认提示
        if (!currentLine || currentLine.trim() === '' || currentLine.trim().startsWith('#')) {
            helpContent.innerHTML = '<p><i class="fas fa-info-circle"></i> 将光标定位到指令输入框的某一行，此处将显示该行指令的详细帮助信息。</p>';
            return;
        }
        
        // 解析当前行的指令
        const instruction = InstructionParser.parse(currentLine);
        if (!instruction) {
            helpContent.innerHTML = '<p><i class="fas fa-exclamation-triangle"></i> 无法识别的指令格式。请检查指令语法是否正确。</p>';
            return;
        }
        
        // 检查helpData是否存在
        if (!helpData) {
            helpContent.innerHTML = '<p><i class="fas fa-exclamation-circle"></i> 帮助数据未加载。</p>';
            return;
        }
        
        // 获取并显示帮助信息
        const helpInfo = helpData.getInstructionHelp(instruction.type);
        if (helpInfo) {
            helpContent.innerHTML = helpData.generateHelpHTML(helpInfo);
        } else {
            helpContent.innerHTML = '<p><i class="fas fa-question-circle"></i> 未找到相关指令的帮助信息。</p>';
        }
    }
    
    // 初始渲染
    // 默认切换到预览模式以显示初始内容
    setTimeout(() => {
        const previewTabButton = document.querySelector('[data-tab="preview-tab"]');
        if (previewTabButton) {
            previewTabButton.click();
        }
    }, 100);
});