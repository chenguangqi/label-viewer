/**
 * Label类
 * 用于管理标签指令列表，并为每个指令分配唯一ID
 */

class Label {
    constructor() {
        this.instructions = [];
        this.nextId = 1;
    }
    
    /**
     * 添加指令到标签中
     * @param {Object} instruction - 指令对象
     * @returns {number} 分配给指令的唯一ID
     */
    addInstruction(instruction) {
        const id = this.nextId++;
        const instructionWithId = {
            id: id,
            type: instruction.type,
            params: [...instruction.params]
        };
        
        this.instructions.push(instructionWithId);
        return id;
    }
    
    /**
     * 从文本添加指令到标签中
     * @param {string} text - 包含多行指令的文本
     * @returns {Array} 添加的指令ID数组
     */
    addInstructionsFromText(text) {
        const parsedInstructions = InstructionParser.parseText(text);
        const ids = [];
        
        for (const instruction of parsedInstructions) {
            const id = this.addInstruction(instruction);
            ids.push(id);
        }
        
        return ids;
    }
    
    /**
     * 更新指定ID的指令
     * @param {number} id - 指令ID
     * @param {Object} instruction - 新的指令对象
     * @returns {boolean} 更新是否成功
     */
    updateInstruction(id, instruction) {
        const index = this.instructions.findIndex(inst => inst.id === id);
        if (index !== -1) {
            this.instructions[index] = {
                id: id,
                type: instruction.type,
                params: [...instruction.params]
            };
            return true;
        }
        return false;
    }
    
    /**
     * 删除指定ID的指令
     * @param {number} id - 指令ID
     * @returns {boolean} 删除是否成功
     */
    removeInstruction(id) {
        const index = this.instructions.findIndex(inst => inst.id === id);
        if (index !== -1) {
            this.instructions.splice(index, 1);
            return true;
        }
        return false;
    }
    
    /**
     * 获取指定ID的指令
     * @param {number} id - 指令ID
     * @returns {Object|null} 指令对象，如果未找到返回null
     */
    getInstruction(id) {
        const instruction = this.instructions.find(inst => inst.id === id);
        return instruction || null;
    }
    
    /**
     * 获取所有指令
     * @returns {Array} 指令对象数组
     */
    getAllInstructions() {
        return this.instructions.map(inst => ({
            type: inst.type,
            params: [...inst.params]
        }));
    }
    
    /**
     * 获取带ID的所有指令
     * @returns {Array} 带ID的指令对象数组
     */
    getAllInstructionsWithId() {
        return this.instructions.map(inst => ({
            id: inst.id,
            type: inst.type,
            params: [...inst.params]
        }));
    }
    
    /**
     * 清空所有指令
     */
    clear() {
        this.instructions = [];
    }
    
    /**
     * 从指令数组加载
     * @param {Array} instructions - 指令对象数组
     */
    loadFromInstructions(instructions) {
        this.clear();
        for (const instruction of instructions) {
            this.addInstruction(instruction);
        }
    }
    
    /**
     * 转换为文本格式
     * @returns {string} 指令文本
     */
    toText() {
        return this.instructions.map(inst => 
            `${inst.type},${inst.params.join(',')}`
        ).join('\n');
    }
}

// 确保在浏览器环境中将Label附加到window对象
if (typeof window !== 'undefined') {
    window.Label = Label;
}

// 导出模块（用于支持模块化加载）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Label;
}