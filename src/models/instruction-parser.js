/**
 * 标签指令解析器
 * 负责解析标签伪指令字符串为可渲染的对象
 */

class InstructionParser {
    /**
     * 解析指令字符串
     * @param {string} instruction - 指令字符串，如 "text,10,5,40,8,12,Arial,bold,center,#000000,产品名称"
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
    
    /**
     * 创建指令类实例
     * @param {Object} instructionObj - 指令对象 {type, params}
     * @returns {Instruction} 对应的指令类实例
     */
    static createInstructionInstance(instructionObj) {
        // 确保已加载指令类
        if (typeof window === 'undefined') {
            // Node.js环境
            const { 
                TextInstruction, 
                BarcodeInstruction, 
                QRCodeInstruction, 
                ImageInstruction, 
                LineInstruction, 
                RectangleInstruction 
            } = require('./instruction.js');
            
            switch (instructionObj.type) {
                case 'text':
                    return new TextInstruction(instructionObj.params);
                case 'barcode':
                    return new BarcodeInstruction(instructionObj.params);
                case 'qrcode':
                    return new QRCodeInstruction(instructionObj.params);
                case 'image':
                    return new ImageInstruction(instructionObj.params);
                case 'line':
                    return new LineInstruction(instructionObj.params);
                case 'rectangle':
                    return new RectangleInstruction(instructionObj.params);
                default:
                    throw new Error(`Unknown instruction type: ${instructionObj.type}`);
            }
        } else {
            // 浏览器环境
            switch (instructionObj.type) {
                case 'text':
                    return new window.TextInstruction(instructionObj.params);
                case 'barcode':
                    return new window.BarcodeInstruction(instructionObj.params);
                case 'qrcode':
                    return new window.QRCodeInstruction(instructionObj.params);
                case 'image':
                    return new window.ImageInstruction(instructionObj.params);
                case 'line':
                    return new window.LineInstruction(instructionObj.params);
                case 'rectangle':
                    return new window.RectangleInstruction(instructionObj.params);
                default:
                    throw new Error(`Unknown instruction type: ${instructionObj.type}`);
            }
        }
    }
}

// 确保在浏览器环境中将InstructionParser附加到window对象
if (typeof window !== 'undefined') {
    window.InstructionParser = InstructionParser;
}

// 导出模块（用于支持模块化加载）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = InstructionParser;
}