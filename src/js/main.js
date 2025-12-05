/**
 * 主应用程序入口
 * 负责初始化应用并绑定事件
 */

// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', () => {
    // 获取DOM元素
    const instructionInput = document.getElementById('instruction-input');
    const renderButton = document.getElementById('render-btn');
    const clearButton = document.getElementById('clear-btn');
    const labelPreview = document.getElementById('label-preview');
    const helpContent = document.getElementById('current-instruction-help');
    
    // 初始化模块
    const parser = window.InstructionParser || 
                  (typeof require !== 'undefined' ? require('./instruction-parser.js') : null);
    const renderer = new LabelRenderer(labelPreview);
    const helpData = window.HelpData || 
                     (typeof require !== 'undefined' ? require('./help-data.js') : null);
    
    // 绑定渲染按钮事件
    renderButton.addEventListener('click', () => {
        const instructionsText = instructionInput.value;
        const instructions = InstructionParser.parseText(instructionsText);
        renderer.render(instructions);
    });
    
    // 绑定清空按钮事件
    clearButton.addEventListener('click', () => {
        instructionInput.value = '';
        labelPreview.innerHTML = '';
        helpContent.innerHTML = '<p><i class="fas fa-info-circle"></i> 将光标定位到指令输入框的某一行，此处将显示该行指令的详细帮助信息。</p>';
        instructionInput.focus();
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
            renderButton.click();
        }
    });
    
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
    renderButton.click();
});