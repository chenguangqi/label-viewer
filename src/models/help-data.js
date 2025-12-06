/**
 * 帮助数据模块
 * 提供各种指令的帮助信息
 */

// 引入工具函数
const utils = window.utils || 
              (typeof require !== 'undefined' ? require('./utils.js') : null);
var escapeHtml = utils && utils.escapeHtml ? utils.escapeHtml : function(text) { return text; };

class HelpData {
    // 指令定义数据，来源于LABEL_INSTRUCTIONS.md
    static instructions = {
        'text': {
            name: '文本指令 (text)',
            syntax: 'text,<x>,<y>,<width>,<height>,<font-size>,<font-family>,<font-weight>,<text-align>,<color>,<content>',
            description: '用于在标签上显示文本内容',
            parameters: [
                { name: 'x', type: 'number', required: '是', validValues: '数值 ≥ 0', description: '文本左上角X坐标' },
                { name: 'y', type: 'number', required: '是', validValues: '数值 ≥ 0', description: '文本左上角Y坐标' },
                { name: 'width', type: 'number', required: '是', validValues: '数值 > 0', description: '文本区域宽度' },
                { name: 'height', type: 'number', required: '是', validValues: '数值 > 0', description: '文本区域高度' },
                { name: 'font-size', type: 'number', required: '是', validValues: '1-100', description: '字体大小(pt)' },
                { name: 'font-family', type: 'string', required: '是', validValues: 'Arial,Helvetica,Times New Roman等常用字体', description: '字体族' },
                { name: 'font-weight', type: 'string', required: '是', validValues: 'normal,bold', description: '字体粗细' },
                { name: 'text-align', type: 'string', required: '是', validValues: 'left,center,right', description: '文本对齐方式' },
                { name: 'color', type: 'string', required: '是', validValues: '十六进制颜色值，如#FF0000', description: '文本颜色' },
                { name: 'content', type: 'string', required: '是', validValues: '任意字符串', description: '要显示的文本内容' }
            ],
            remark: '支持Unicode字符，可显示中文等多语言文本',
            samples: [
                'text,10,5,40,8,12,Arial,bold,center,#000000,产品名称'
            ]
        },
        'barcode': {
            name: '条形码指令 (barcode)',
            syntax: 'barcode,<type>,<x>,<y>,<width>,<height>,<display-value>,<content>',
            description: '用于在标签上生成条形码',
            parameters: [
                { name: 'type', type: 'string', required: '是', validValues: 'CODE128,EAN13,EAN8,CODE39,CODE93等标准条码类型', description: '条形码类型' },
                { name: 'x', type: 'number', required: '是', validValues: '数值 ≥ 0', description: '条形码左上角X坐标' },
                { name: 'y', type: 'number', required: '是', validValues: '数值 ≥ 0', description: '条形码左上角Y坐标' },
                { name: 'width', type: 'number', required: '是', validValues: '数值 > 0', description: '条形码宽度' },
                { name: 'height', type: 'number', required: '是', validValues: '数值 > 0', description: '条形码高度' },
                { name: 'display-value', type: 'boolean', required: '是', validValues: 'true,false', description: '是否显示条码值' },
                { name: 'content', type: 'string', required: '是', validValues: '符合对应条码类型规则的字符串', description: '条形码内容' }
            ],
            remark: '不同条码类型对数据格式有不同要求',
            samples: [
                'barcode,CODE128,5,15,50,10,true,1234567890128'
            ]
        },
        'qrcode': {
            name: '二维码指令 (qrcode)',
            syntax: 'qrcode,<x>,<y>,<size>,<ecc>,<content>',
            description: '用于在标签上生成二维码',
            parameters: [
                { name: 'x', type: 'number', required: '是', validValues: '数值 ≥ 0', description: '二维码左上角X坐标' },
                { name: 'y', type: 'number', required: '是', validValues: '数值 ≥ 0', description: '二维码左上角Y坐标' },
                { name: 'size', type: 'number', required: '是', validValues: '数值 > 0', description: '二维码尺寸' },
                { name: 'ecc', type: 'string', required: '是', validValues: 'L,M,Q,H', description: '纠错等级' },
                { name: 'content', type: 'string', required: '是', validValues: '任意字符串', description: '二维码内容' }
            ],
            remark: '纠错等级越高可纠正的错误越多，但会降低数据容量',
            samples: [
                'qrcode,45,15,20,Q,https://example.com/product/12345'
            ]
        },
        'image': {
            name: '图片指令 (image)',
            syntax: 'image,<x>,<y>,<width>,<height>,<src>',
            description: '用于在标签上插入图片',
            parameters: [
                { name: 'x', type: 'number', required: '是', validValues: '数值 ≥ 0', description: '图片左上角X坐标' },
                { name: 'y', type: 'number', required: '是', validValues: '数值 ≥ 0', description: '图片左上角Y坐标' },
                { name: 'width', type: 'number', required: '是', validValues: '数值 > 0', description: '图片宽度' },
                { name: 'height', type: 'number', required: '是', validValues: '数值 > 0', description: '图片高度' },
                { name: 'src', type: 'string', required: '是', validValues: '本地图片路径或Base64编码字符串', description: '图片路径或Base64编码' }
            ],
            remark: '支持JPG、PNG、GIF等常见格式',
            samples: [
                'image,5,5,15,10,logo.png'
            ]
        },
        'line': {
            name: '直线指令 (line)',
            syntax: 'line,<x1>,<y1>,<x2>,<y2>,<stroke>,<color>',
            description: '用于在标签上绘制直线',
            parameters: [
                { name: 'x1', type: 'number', required: '是', validValues: '数值 ≥ 0', description: '起点X坐标' },
                { name: 'y1', type: 'number', required: '是', validValues: '数值 ≥ 0', description: '起点Y坐标' },
                { name: 'x2', type: 'number', required: '是', validValues: '数值 ≥ 0', description: '终点X坐标' },
                { name: 'y2', type: 'number', required: '是', validValues: '数值 ≥ 0', description: '终点Y坐标' },
                { name: 'stroke', type: 'number', required: '是', validValues: '数值 > 0', description: '线条粗细' },
                { name: 'color', type: 'string', required: '是', validValues: '十六进制颜色值，如#FF0000', description: '线条颜色' }
            ],
            remark: '可用于分隔不同信息区域',
            samples: [
                'line,0,30,70,30,0.5,#FF0000'
            ]
        },
        'rectangle': {
            name: '矩形指令 (rectangle)',
            syntax: 'rectangle,<x>,<y>,<width>,<height>,<stroke>,<fill>,<color>',
            description: '用于在标签上绘制矩形',
            parameters: [
                { name: 'x', type: 'number', required: '是', validValues: '数值 ≥ 0', description: '矩形左上角X坐标' },
                { name: 'y', type: 'number', required: '是', validValues: '数值 ≥ 0', description: '矩形左上角Y坐标' },
                { name: 'width', type: 'number', required: '是', validValues: '数值 > 0', description: '矩形宽度' },
                { name: 'height', type: 'number', required: '是', validValues: '数值 > 0', description: '矩形高度' },
                { name: 'stroke', type: 'number', required: '是', validValues: '数值 ≥ 0', description: '边框粗细' },
                { name: 'fill', type: 'string', required: '是', validValues: '十六进制颜色值或transparent', description: '填充颜色' },
                { name: 'color', type: 'string', required: '是', validValues: '十六进制颜色值，如#FF0000', description: '边框颜色' }
            ],
            remark: '可用于突出显示重要内容或作为背景装饰',
            samples: [
                'rectangle,0,0,70,40,0.3,#FFFF00,#000000'
            ]
        }
    };

    /**
     * 获取指令帮助信息
     * @param {string} instructionType - 指令类型
     * @returns {Object|null} 帮助信息对象，如果未找到返回null
     */
    static getInstructionHelp(instructionType) {
        return this.instructions[instructionType] || null;
    }

    /**
     * 生成帮助信息的HTML
     * @param {Object} helpInfo - 帮助信息对象
     * @returns {string} HTML字符串
     */
    static generateHelpHTML(helpInfo) {
        let html = `
        <div class="help-item">
            <h3>${helpInfo.name}</h3>
            <h4>指令语法</h4>
            <p><code>${HelpData.escapeHtml(helpInfo.syntax)}</code></p>
            
            <h4>指令描述</h4>
            <p>${helpInfo.description}</p>
            
            <h4>参数说明</h4>
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

        for (const param of helpInfo.parameters) {
            html += `
                <tr>
                    <td>${param.name}</td>
                    <td>${param.type}</td>
                    <td>${param.required}</td>
                    <td>${param.validValues}</td>
                    <td>${param.description}</td>
                </tr>
            `;
        }

        html += `
                </tbody>
            </table>
            
            <h4>备注</h4>
            <p>${helpInfo.remark}</p>
            
            <h4>示例</h4>
        `;

        for (const sample of helpInfo.samples) {
            html += `<p><code>${sample}</code></p>`;
        }

        html += `
        </div>
        `;

        return html;
    }
}

// 确保在浏览器环境中将HelpData附加到window对象
if (typeof window !== 'undefined') {
    window.HelpData = HelpData;
}

// 导出模块（用于支持模块化加载）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HelpData;
}