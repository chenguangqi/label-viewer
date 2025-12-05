/**
 * 标签代码编辑器类
 * 负责处理标签指令的代码编辑功能
 */

class LabelCodeEditor {
    /**
     * 构造函数
     * @param {HTMLElement} container - 编辑器容器元素
     * @param {Label} sharedLabel - 共享的Label实例
     * @param {Function} onHelpUpdate - 帮助信息更新回调函数
     */
    constructor(container, sharedLabel, onHelpUpdate) {
        this.container = container;
        this.sharedLabel = sharedLabel;
        this.onHelpUpdate = onHelpUpdate;
        this.isSyncing = false;
        
        // 获取DOM元素
        this.textarea = document.getElementById('instruction-input');
        this.helpContent = document.getElementById('current-instruction-help');
        
        // 绑定事件
        this.bindEvents();
    }
    
    /**
     * 绑定事件监听器
     */
    bindEvents() {
        // 绑定输入框光标位置变化事件
        this.textarea.addEventListener('keyup', () => {
            this.updateHelp();
        });
        
        this.textarea.addEventListener('click', () => {
            this.updateHelp();
        });
        
        // 绑定输入框内容变化事件，同步到共享Label实例
        this.textarea.addEventListener('input', () => {
            this.syncToLabel();
        });
        
        // 绑定Ctrl+Enter快捷键渲染
        this.textarea.addEventListener('keydown', (event) => {
            if (event.ctrlKey && event.key === 'Enter') {
                // 触发自定义事件，通知外部切换到预览模式
                this.container.dispatchEvent(new CustomEvent('previewRequest'));
            }
        });
    }
    
    /**
     * 同步代码编辑器内容到Label实例
     */
    syncToLabel() {
        if (this.isSyncing) return;
        
        try {
            this.isSyncing = true;
            const instructionsText = this.textarea.value;
            const parsedInstructions = InstructionParser.parseText(instructionsText);
            
            // 更新共享Label实例
            this.sharedLabel.loadFromInstructions(parsedInstructions);
            
            // 触发同步完成事件
            this.container.dispatchEvent(new CustomEvent('codeSyncComplete'));
        } catch (e) {
            console.error("同步代码到共享Label实例时出错:", e);
        } finally {
            this.isSyncing = false;
        }
    }
    
    /**
     * 从Label实例同步到代码编辑器
     */
    syncFromLabel() {
        if (this.isSyncing) return;
        
        try {
            this.isSyncing = true;
            this.textarea.value = this.sharedLabel.toText();
        } catch (e) {
            console.error("从共享Label实例同步到代码编辑器时出错:", e);
        } finally {
            this.isSyncing = false;
        }
    }
    
    /**
     * 更新帮助信息
     */
    updateHelp() {
        const cursorPosition = this.textarea.selectionStart;
        const text = this.textarea.value;
        const lines = text.substring(0, cursorPosition).split('\n');
        const currentLineIndex = lines.length - 1;
        const currentLine = text.split('\n')[currentLineIndex];
        
        // 如果当前行为空或注释，显示默认提示
        if (!currentLine || currentLine.trim() === '' || currentLine.trim().startsWith('#')) {
            if (this.onHelpUpdate) {
                this.onHelpUpdate('<p><i class="fas fa-info-circle"></i> 将光标定位到指令输入框的某一行，此处将显示该行指令的详细帮助信息。</p>');
            }
            return;
        }
        
        // 解析当前行的指令
        const instruction = InstructionParser.parse(currentLine);
        if (!instruction) {
            if (this.onHelpUpdate) {
                this.onHelpUpdate('<p><i class="fas fa-exclamation-triangle"></i> 无法识别的指令格式。请检查指令语法是否正确。</p>');
            }
            return;
        }
        
        // 触发帮助更新事件
        if (this.onHelpUpdate) {
            this.onHelpUpdate(null, instruction);
        }
    }
    
    /**
     * 设置编辑器内容
     * @param {string} content - 要设置的内容
     */
    setContent(content) {
        this.textarea.value = content;
        this.syncToLabel();
    }
    
    /**
     * 获取编辑器内容
     * @returns {string} 编辑器内容
     */
    getContent() {
        return this.textarea.value;
    }
    
    /**
     * 清空编辑器内容
     */
    clear() {
        this.textarea.value = '';
        this.sharedLabel.clear();
    }
}

// 确保在浏览器环境中将LabelCodeEditor附加到window对象
if (typeof window !== 'undefined') {
    window.LabelCodeEditor = LabelCodeEditor;
}

// 导出模块（用于支持模块化加载）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LabelCodeEditor;
}