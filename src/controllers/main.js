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
    }
    
    // 同步标志，防止循环更新
    let isSyncing = false;
    
    // 绑定标签页切换事件
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            
            // 检查是否正在切换到预览标签页，并且有未保存的更改
            if (tabId === 'preview-tab') {
                // 检查标签设计器或标签编辑器是否有未同步的更改
                const hasUnsavedChanges = (labelDesigner && labelDesigner.hasUnsavedChanges()) || 
                                        (labelEditor && labelEditor.hasUnsavedChanges());
                
                // 如果有未保存的更改，提示用户
                if (hasUnsavedChanges) {
                    const confirmed = window.confirm('检测到未保存的更改，切换到预览将丢失这些更改，是否继续？');
                    if (!confirmed) {
                        // 如果用户取消，则阻止切换，保持当前标签页
                        return;
                    }
                }
            }
            
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
                
                // 同步标签编辑器到标签设计器
                syncEditorToDesigner();
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
                
                // 同步标签设计器到标签编辑器
                syncDesignerToEditor();
            }
        });
    });
    
    // 监听代码同步完成事件
    if (editorContainer) {
        editorContainer.addEventListener('codeSyncComplete', () => {
            // 如果当前在标签设计器标签页，则同步到标签设计器
            const activeTab = document.querySelector('.tab-button.active');
            if (activeTab && activeTab.getAttribute('data-tab') === 'designer-tab') {
                syncEditorToDesigner();
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
                
                // 更新标签设计器中的元素
                if (labelDesigner && labelDesigner.selectedElement) {
                    labelDesigner.updateElementProperty(
                        labelDesigner.selectedElement, 
                        property, 
                        value
                    );
                }
                
                // 更新指令输入框中的文本
                updateInstructionInTextarea(instruction.type, property, value);
                
                // 同步标签设计器到标签编辑器
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
    
    // 初始渲染
    // 默认切换到标签预览器以显示初始内容
    setTimeout(() => {
        const previewTabButton = document.querySelector('[data-tab="preview-tab"]');
        if (previewTabButton) {
            previewTabButton.click();
        }
    }, 100);
});