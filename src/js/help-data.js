/**
 * 指令帮助数据
 * 包含所有支持的标签指令的详细定义
 */

const HelpData = {
    // 指令定义数据，来源于LABEL_INSTRUCTIONS.md
    instructions: {
        'label': {
            name: '标签整体设置指令 (label)',
            syntax: 'label,<宽度>,<高度>[,<背景色>][,<内边距>]',
            description: '用于设置整个标签的基本属性',
            parameters: [
                { name: 'width', type: 'number', required: '是', validValues: '数值 > 0', description: '标签宽度' },
                { name: 'height', type: 'number', required: '是', validValues: '数值 > 0', description: '标签高度' },
                { name: 'background', type: 'string', required: '否', validValues: '十六进制颜色值，如#FFFFFF', description: '标签背景色，默认为#FFFFFF' },
                { name: 'padding', type: 'number', required: '否', validValues: '数值 ≥ 0', description: '标签内边距，默认为0' }
            ],
            remark: '一般放在标签内容的最前面，决定标签的整体尺寸和背景',
            samples: [
                'label,70,40,#F0F0F0,2'
            ]
        },
        'text': {
            name: '文本指令 (text)',
            syntax: 'text,<X坐标>,<Y坐标>[,<宽度>][,<高度>][,<字体大小>][,<字体族>][,<字体粗细>][,<对齐方式>][,<颜色>,<文本内容>]',
            description: '用于在标签上显示文本内容',
            parameters: [
                { name: 'x', type: 'number', required: '是', validValues: '数值 ≥ 0', description: '文本左上角X坐标' },
                { name: 'y', type: 'number', required: '是', validValues: '数值 ≥ 0', description: '文本左上角Y坐标' },
                { name: 'width', type: 'number', required: '否', validValues: '数值 > 0', description: '文本区域宽度' },
                { name: 'height', type: 'number', required: '否', validValues: '数值 > 0', description: '文本区域高度' },
                { name: 'font-size', type: 'number', required: '否', validValues: '1-100', description: '字体大小(pt)，默认为12' },
                { name: 'font-family', type: 'string', required: '否', validValues: 'Arial,Helvetica,Times New Roman等常用字体', description: '字体族，默认为Arial' },
                { name: 'font-weight', type: 'string', required: '否', validValues: 'normal,bold', description: '字体粗细，默认为normal' },
                { name: 'text-align', type: 'string', required: '否', validValues: 'left,center,right', description: '文本对齐方式，默认为left' },
                { name: 'color', type: 'string', required: '否', validValues: '十六进制颜色值，如#FF0000', description: '文本颜色，默认为#000000' },
                { name: 'text', type: 'string', required: '是', validValues: '任意字符串', description: '要显示的文本内容' }
            ],
            remark: '当指定width且文本超出时会自动换行；支持Unicode字符，可显示中文等多语言文本；文本内容参数调整至最后，便于处理包含逗号的文本内容',
            samples: [
                'text,10,5,40,8,12,Arial,bold,center,#000000,产品名称'
            ]
        },
        'barcode': {
            name: '条形码指令 (barcode)',
            syntax: 'barcode,<条码类型>,<X坐标>,<Y坐标>[,<宽度>][,<高度>][,<是否显示值>,<条码数据>]',
            description: '用于在标签上生成条形码',
            parameters: [
                { name: 'type', type: 'string', required: '是', validValues: 'CODE128,EAN13,EAN8,CODE39,CODE93等标准条码类型', description: '条形码类型' },
                { name: 'x', type: 'number', required: '是', validValues: '数值 ≥ 0', description: '条形码左上角X坐标' },
                { name: 'y', type: 'number', required: '是', validValues: '数值 ≥ 0', description: '条形码左上角Y坐标' },
                { name: 'width', type: 'number', required: '否', validValues: '数值 > 0', description: '条形码宽度' },
                { name: 'height', type: 'number', required: '否', validValues: '数值 > 0', description: '条形码高度' },
                { name: 'display-value', type: 'boolean', required: '否', validValues: 'true,false', description: '是否显示条码值，默认为false' },
                { name: 'data', type: 'string', required: '是', validValues: '符合对应条码类型规则的字符串', description: '条形码数据' }
            ],
            remark: '不同条码类型对数据格式有不同要求；CODE128支持ASCII全部128个字符；条码数据参数调整至最后，避免数据中包含逗号导致解析错误',
            samples: [
                'barcode,CODE128,5,15,50,10,true,1234567890128'
            ]
        },
        'qrcode': {
            name: '二维码指令 (qrcode)',
            syntax: 'qrcode,<X坐标>,<Y坐标>[,<尺寸>][,<纠错等级>,<二维码数据>]',
            description: '用于在标签上生成二维码',
            parameters: [
                { name: 'x', type: 'number', required: '是', validValues: '数值 ≥ 0', description: '二维码左上角X坐标' },
                { name: 'y', type: 'number', required: '是', validValues: '数值 ≥ 0', description: '二维码左上角Y坐标' },
                { name: 'size', type: 'number', required: '否', validValues: '数值 > 0', description: '二维码尺寸' },
                { name: 'ecc', type: 'string', required: '否', validValues: 'L,M,Q,H', description: '纠错等级，默认为M' },
                { name: 'data', type: 'string', required: '是', validValues: '任意字符串', description: '二维码数据' }
            ],
            remark: '数据长度影响二维码密度；纠错等级越高可纠正的错误越多，但会降低数据容量；二维码数据参数调整至最后，避免数据中包含逗号导致解析错误',
            samples: [
                'qrcode,45,15,20,Q,https://example.com/product/12345'
            ]
        },
        'image': {
            name: '图片指令 (image)',
            syntax: 'image,<X坐标>,<Y坐标>[,<宽度>][,<高度>,<图片路径>]',
            description: '用于在标签上插入图片',
            parameters: [
                { name: 'x', type: 'number', required: '是', validValues: '数值 ≥ 0', description: '图片左上角X坐标' },
                { name: 'y', type: 'number', required: '是', validValues: '数值 ≥ 0', description: '图片左上角Y坐标' },
                { name: 'width', type: 'number', required: '否', validValues: '数值 > 0', description: '图片宽度' },
                { name: 'height', type: 'number', required: '否', validValues: '数值 > 0', description: '图片高度' },
                { name: 'src', type: 'string', required: '是', validValues: '本地图片路径或Base64编码字符串', description: '图片路径或Base64编码' }
            ],
            remark: '支持JPG、PNG、GIF等常见格式；若未指定宽高，则按原图比例显示；图片路径参数调整至最后，便于处理包含逗号的路径',
            samples: [
                'image,5,5,15,10,logo.png'
            ]
        },
        'line': {
            name: '直线指令 (line)',
            syntax: 'line,<起点X>,<起点Y>,<终点X>,<终点Y>[,<线条粗细>][,<颜色>]',
            description: '用于在标签上绘制直线',
            parameters: [
                { name: 'x1', type: 'number', required: '是', validValues: '数值 ≥ 0', description: '起点X坐标' },
                { name: 'y1', type: 'number', required: '是', validValues: '数值 ≥ 0', description: '起点Y坐标' },
                { name: 'x2', type: 'number', required: '是', validValues: '数值 ≥ 0', description: '终点X坐标' },
                { name: 'y2', type: 'number', required: '是', validValues: '数值 ≥ 0', description: '终点Y坐标' },
                { name: 'stroke', type: 'number', required: '否', validValues: '数值 > 0', description: '线条粗细，默认为0.2' },
                { name: 'color', type: 'string', required: '否', validValues: '十六进制颜色值，如#FF0000', description: '线条颜色，默认为#000000' }
            ],
            remark: '可用于分隔不同信息区域',
            samples: [
                'line,0,30,70,30,0.5,#FF0000'
            ]
        },
        'rectangle': {
            name: '矩形指令 (rectangle)',
            syntax: 'rectangle,<X坐标>,<Y坐标>,<宽度>,<高度>[,<边框粗细>][,<填充颜色>][,<边框颜色>]',
            description: '用于在标签上绘制矩形',
            parameters: [
                { name: 'x', type: 'number', required: '是', validValues: '数值 ≥ 0', description: '矩形左上角X坐标' },
                { name: 'y', type: 'number', required: '是', validValues: '数值 ≥ 0', description: '矩形左上角Y坐标' },
                { name: 'width', type: 'number', required: '是', validValues: '数值 > 0', description: '矩形宽度' },
                { name: 'height', type: 'number', required: '是', validValues: '数值 > 0', description: '矩形高度' },
                { name: 'stroke', type: 'number', required: '否', validValues: '数值 ≥ 0', description: '边框粗细，默认为0.2，为0时表示无边框' },
                { name: 'fill', type: 'string', required: '否', validValues: '十六进制颜色值或transparent', description: '填充颜色，默认为transparent' },
                { name: 'color', type: 'string', required: '否', validValues: '十六进制颜色值，如#FF0000', description: '边框颜色，默认为#000000' }
            ],
            remark: '可用于突出显示重要内容或作为背景装饰',
            samples: [
                'rectangle,0,0,70,40,0.3,#FFFF00,#000000'
            ]
        }
    },

    /**
     * 获取指令帮助信息
     * @param {string} instructionName - 指令名称
     * @returns {Object|null} 指令帮助信息对象，如果找不到返回null
     */
    getInstructionHelp(instructionName) {
        return this.instructions[instructionName] || null;
    },

    /**
     * 生成指令帮助HTML
     * @param {Object} helpData - 指令帮助数据
     * @returns {string} HTML字符串
     */
    generateHelpHTML(helpData) {
        if (!helpData) {
            return '<p>未找到相关指令的帮助信息。</p>';
        }

        let html = `
            <div class="help-item">
                <h3>${helpData.name}</h3>
                <div class="help-section">
                    <h4>指令语法</h4>
                    <p><code>${helpData.syntax}</code></p>
                </div>
                <div class="help-section">
                    <h4>指令描述</h4>
                    <p>${helpData.description}</p>
                </div>
        `;

        // 参数表格
        html += `
                <div class="help-section">
                    <h4>指令参数</h4>
                    <table>
                        <thead>
                            <tr>
                                <th>参数名</th>
                                <th>类型</th>
                                <th>必填</th>
                                <th>有效值</th>
                                <th>描述</th>
                            </tr>
                        </thead>
                        <tbody>
        `;

        helpData.parameters.forEach(param => {
            html += `
                            <tr>
                                <td>${param.name}</td>
                                <td>${param.type}</td>
                                <td>${param.required}</td>
                                <td>${param.validValues}</td>
                                <td>${param.description}</td>
                            </tr>
            `;
        });

        html += `
                        </tbody>
                    </table>
                </div>
        `;

        // 备注
        html += `
                <div class="help-section">
                    <h4>指令备注</h4>
                    <p>${helpData.remark}</p>
                </div>
        `;

        // 示例
        html += `
                <div class="help-section">
                    <h4>示例</h4>
        `;

        helpData.samples.forEach(sample => {
            html += `<p><code>${sample}</code></p>`;
        });

        html += `
                </div>
            </div>
        `;

        return html;
    }
};

// 导出模块（用于支持模块化加载）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HelpData;
}