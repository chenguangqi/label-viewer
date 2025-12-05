/**
 * 标签指令解析器
 * 负责解析标签伪指令字符串为可渲染的对象
 */

class InstructionParser {
    /**
     * 解析指令字符串
     * @param {string} instruction - 指令字符串，如 "text:10,5,40,8,产品名称"
     * @returns {Object|null} 解析后的指令对象，如果解析失败返回null
     */
    static parse(instruction) {
        // 移除首尾空格
        instruction = instruction.trim();
        
        // 跳过空行和注释行
        if (instruction === '' || instruction.startsWith('#')) {
            return null;
        }
        
        // 按逗号分割指令名和参数
        const parts = instruction.split(',');
        if (parts.length < 1) {
            return null;
        }
        
        const instructionName = parts[0];
        const params = parts.slice(1);
        
        return {
            type: instructionName,
            params: params
        };
    }
    
    /**
     * 解析整个指令文本
     * @param {string} text - 包含多行指令的文本
     * @returns {Array} 解析后的指令对象数组
     */
    static parseText(text) {
        const lines = text.split('\n');
        const instructions = [];
        
        for (const line of lines) {
            // 跳过空行和注释行
            if (line.trim() === '' || line.trim().startsWith('#')) {
                continue;
            }
            
            const instruction = this.parse(line);
            if (instruction) {
                instructions.push(instruction);
            }
        }
        
        return instructions;
    }
}

// 导出模块（用于支持模块化加载）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = InstructionParser;
}