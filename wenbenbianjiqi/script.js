// 获取DOM元素
const editor = document.getElementById('editor');
const preview = document.getElementById('preview');
const toast = document.getElementById('toast');
const floatingBtn = document.getElementById('floatingBtn');
const tagPanel = document.getElementById('tagPanel');
const themeBtn = document.getElementById('themeBtn');
const undoBtn = document.getElementById('undoBtn');
const redoBtn = document.getElementById('redoBtn');
const examplesContent = document.getElementById('examplesContent');
const toggleIcon = document.querySelector('.toggle-icon');
const textColorBtn = document.getElementById('textColorBtn');
const bgColorBtn = document.getElementById('bgColorBtn');
const colorPaletteModal = document.getElementById('colorPaletteModal');
const colorPaletteGrid = document.getElementById('colorPaletteGrid');

// 历史记录相关变量
let historyStack = [];
let historyIndex = -1;
let typingTimer;
let isTyping = false;

// 颜色相关变量
let currentColorType = 'text'; // 'text' 或 'bg'
let selectedColor = 'Red'; // 默认选中颜色
let recentTextColors = ['Maroon', 'DarkOrange', 'DarkKhaki', 'DarkGreen', 'Navy','Indigo'];
let recentBgColors = ['Salmon', 'Tan', 'Cornsilk', 'PaleGreen', 'LightSteelBlue','Thistle'];
// 修改颜色分类数据
const colorCategories = [
    {
        name: "红色系",
        colors: [
            {name: "#800000", value: "Maroon"}, {name: "#8B0000", value: "DarkRed"}, 
            {name: "#B22222", value: "FireBrick"}, {name: "#DC143C", value: "Crimson"}, 
            {name: "#FF0000", value: "Red"}, {name: "#FF6347", value: "Tomato"}, 
            {name: "#FF7F50", value: "Coral"}, {name: "#F08080", value: "LightCoral"}, 
            {name: "#FA8072", value: "Salmon"}, {name: "#E9967A", value: "DarkSalmon"}, 
            {name: "#FFA07A", value: "LightSalmon"}, {name: "#BC8F8F", value: "RosyBrown"}
        ]
    },
    {
        name: "橙色系",
        colors: [
            {name: "#FF8C00", value: "DarkOrange"}, {name: "#FFA500", value: "Orange"}, 
            {name: "#F4A460", value: "SandyBrown"}, {name: "#B8860B", value: "DarkGoldenrod"}, 
            {name: "#DAA520", value: "Goldenrod"}, {name: "#FFD700", value: "Gold"}, 
            {name: "#FF4500", value: "OrangeRed"}, {name: "#CD853F", value: "Peru"}, 
            {name: "#D2691E", value: "Chocolate"}, {name: "#A0522D", value: "Sienna"}, 
            {name: "#DEB887", value: "BurlyWood"}, {name: "#D2B48C", value: "Tan"}
        ]
    },
    {
        name: "黄色系",
        colors: [
            {name: "#BDB76B", value: "DarkKhaki"}, {name: "#F0E68C", value: "Khaki"}, 
            {name: "#FFFF00", value: "Yellow"}, {name: "#FFFFE0", value: "LightYellow"}, 
            {name: "#FFFACD", value: "LemonChiffon"}, {name: "#EEDD82", value: "LightGoldenrod"}, 
            {name: "#EEE8AA", value: "PaleGoldenrod"}, {name: "#FFE4B5", value: "Moccasin"}, 
            {name: "#FFEFD5", value: "PapayaWhip"}, {name: "#FFEBCD", value: "BlanchedAlmond"}, 
            {name: "#FFE4C4", value: "Bisque"}, {name: "#FFF8DC", value: "Cornsilk"}
        ]
    },
    {
        name: "绿色系",
        colors: [
            {name: "#006400", value: "DarkGreen"}, {name: "#008000", value: "Green"}, 
            {name: "#228B22", value: "ForestGreen"}, {name: "#2E8B57", value: "SeaGreen"}, 
            {name: "#3CB371", value: "MediumSeaGreen"}, {name: "#20B2AA", value: "LightSeaGreen"}, 
            {name: "#8FBC8F", value: "DarkSeaGreen"}, {name: "#32CD32", value: "LimeGreen"}, 
            {name: "#00FF00", value: "Lime"}, {name: "#00FF7F", value: "SpringGreen"}, 
            {name: "#00FA9A", value: "MediumSpringGreen"}, {name: "#98FB98", value: "PaleGreen"}
        ]
    },
    {
        name: "蓝色系",
        colors: [
            {name: "#000080", value: "Navy"}, {name: "#00008B", value: "DarkBlue"}, 
            {name: "#0000CD", value: "MediumBlue"}, {name: "#0000FF", value: "Blue"}, 
            {name: "#4169E1", value: "RoyalBlue"}, {name: "#4682B4", value: "SteelBlue"}, 
            {name: "#1E90FF", value: "DodgerBlue"}, {name: "#00BFFF", value: "DeepSkyBlue"}, 
            {name: "#6495ED", value: "CornflowerBlue"}, {name: "#87CEEB", value: "SkyBlue"}, 
            {name: "#87CEFA", value: "LightSkyBlue"}, {name: "#B0C4DE", value: "LightSteelBlue"}
        ]
    },
    {
        name: "紫色系",
        colors: [
            {name: "#4B0082", value: "Indigo"}, {name: "#800080", value: "Purple"}, 
            {name: "#8B008B", value: "DarkMagenta"}, {name: "#9400D3", value: "DarkViolet"}, 
            {name: "#8A2BE2", value: "BlueViolet"}, {name: "#9932CC", value: "DarkOrchid"}, 
            {name: "#BA55D3", value: "MediumOrchid"}, {name: "#9370DB", value: "MediumPurple"}, 
            {name: "#DA70D6", value: "Orchid"}, {name: "#EE82EE", value: "Violet"}, 
            {name: "#DDA0DD", value: "Plum"}, {name: "#D8BFD8", value: "Thistle"}
        ]
    },
    {
        name: "粉色系",
        colors: [
            {name: "#C71585", value: "MediumVioletRed"}, {name: "#FF1493", value: "DeepPink"}, 
            {name: "#DB7093", value: "PaleVioletRed"}, {name: "#FF69B4", value: "HotPink"}, 
            {name: "#FFB6C1", value: "LightPink"}, {name: "#FFC0CB", value: "Pink"}, 
            {name: "#FFE4E1", value: "MistyRose"}, {name: "#FFF0F5", value: "LavenderBlush"}
        ]
    },
    {
        name: "中性色",
        colors: [
            {name: "#000000", value: "Black"}, {name: "#2F4F4F", value: "DarkSlateGray"}, 
            {name: "#696969", value: "DimGray"}, {name: "#708090", value: "SlateGray"}, 
            {name: "#808080", value: "Gray"}, {name: "#778899", value: "LightSlateGray"}, 
            {name: "#A9A9A9", value: "DarkGray"}, {name: "#C0C0C0", value: "Silver"}, 
            {name: "#D3D3D3", value: "LightGray"}, {name: "#DCDCDC", value: "Gainsboro"}, 
            {name: "#F5F5F5", value: "WhiteSmoke"}, {name: "#FFFFFF", value: "White"}
        ]
    }
];


// 修改初始化调色盘函数
function initColorPalette() {
    const paletteContent = document.getElementById('colorPaletteContent');
    paletteContent.innerHTML = '';
    
    colorCategories.forEach(category => {
        // 添加分类标题
        const categoryTitle = document.createElement('div');
        categoryTitle.className = 'color-category';
        categoryTitle.textContent = category.name;
        paletteContent.appendChild(categoryTitle);
        
        // 添加颜色网格
        const colorGrid = document.createElement('div');
        colorGrid.className = 'color-palette-grid';
        
        // 按亮度排序颜色（从深到浅）
        const sortedColors = [...category.colors].sort((a, b) => {
            const brightnessA = getColorBrightness(a.value);
            const brightnessB = getColorBrightness(b.value);
            return brightnessA - brightnessB;
        });
        
        // 添加颜色项
        sortedColors.forEach(color => {
            const colorItem = document.createElement('div');
            colorItem.className = 'color-palette-item';
            colorItem.style.backgroundColor = color.value;
            colorItem.dataset.color = color.value;
            colorItem.title = `${color.name} (${color.value})`;
            colorItem.onclick = function() {
                document.querySelectorAll('.color-palette-item').forEach(item => {
                    item.classList.remove('selected');
                });
                this.classList.add('selected');
                selectedColor = this.dataset.color;
            };
            colorGrid.appendChild(colorItem);
        });
        
        paletteContent.appendChild(colorGrid);
    });
}

// 辅助函数：计算颜色亮度
function getColorBrightness(hex) {
    // 转换hex为RGB
    const r = parseInt(hex.substr(1, 2), 16);
    const g = parseInt(hex.substr(3, 2), 16);
    const b = parseInt(hex.substr(5, 2), 16);
    
    // 计算亮度（使用加权公式）
    return (r * 299 + g * 587 + b * 114) / 1000;
}

// 应用选中的颜色
function applySelectedColor() {
    const btn = currentColorType === 'text' ? textColorBtn : bgColorBtn;
    const recentColors = currentColorType === 'text' ? recentTextColors : recentBgColors;
    
    btn.style.color = selectedColor;
    btn.style.borderColor = selectedColor;
    btn.classList.add('active');
    
    if (!recentColors.includes(selectedColor)) {
        recentColors.unshift(selectedColor);
        if (currentColorType === 'text') {
            recentTextColors = recentColors.slice(0, 5);
        } else {
            recentBgColors = recentColors.slice(0, 5);
        }
        updateRecentColors(currentColorType === 'text' ? 'recentTextColors' : 'recentBgColors', recentColors);
    }
    
    if (currentColorType === 'text') {
        insertColorTag(selectedColor, true);
    } else {
        insertBgColorTag(selectedColor, true);
    }
    
    closeColorPalette();
}

// 打开调色盘
function openColorPalette(type) {
    currentColorType = type;
    colorPaletteModal.classList.add('show');
    initColorPalette();
    
    const btn = type === 'text' ? textColorBtn : bgColorBtn;
    const defaultColor = btn.style.color || (type === 'text' ? 'Red' : 'Crimson');
    
    const colorItem = Array.from(document.querySelectorAll('.color-palette-item'))
        .find(item => item.style.backgroundColor.toLowerCase() === defaultColor.toLowerCase());
    
    if (colorItem) {
        colorItem.classList.add('selected');
        selectedColor = colorItem.dataset.color;
    }
}

// 关闭调色盘
function closeColorPalette() {
    colorPaletteModal.classList.remove('show');
}

// 更新最近使用颜色显示
function updateRecentColors(elementId, colors) {
    const element = document.getElementById(elementId);
    element.innerHTML = '';
    
    colors.forEach(color => {
        const colorDiv = document.createElement('div');
        colorDiv.className = 'recent-color';
        colorDiv.style.backgroundColor = color;
        colorDiv.title = color;
        colorDiv.onclick = function() {
            const isTextColor = elementId === 'recentTextColors';
            const btn = isTextColor ? textColorBtn : bgColorBtn;
            
            btn.style.color = color;
            btn.style.borderColor = color;
            btn.classList.add('active');
            
            if (isTextColor) {
                insertColorTag(color, true);
            } else {
                insertBgColorTag(color, true);
            }
        };
        element.appendChild(colorDiv);
    });
}

// 插入标签
function insertTag(tag, content) {
    const startPos = editor.selectionStart;
    const endPos = editor.selectionEnd;
    const selectedText = editor.value.substring(startPos, endPos);
    const cursorPos = startPos;
    
    let tagStart = `[${tag}]`;
    let tagEnd = `[/${tag.split('=')[0]}]`;
    
    if (selectedText) {
        editor.value = editor.value.substring(0, startPos) + tagStart + selectedText + tagEnd + editor.value.substring(endPos);
        editor.selectionStart = startPos;
        editor.selectionEnd = startPos + tagStart.length + selectedText.length + tagEnd.length;
    } else {
        editor.value = editor.value.substring(0, startPos) + tagStart + content + tagEnd + editor.value.substring(endPos);
        editor.selectionStart = cursorPos + tagStart.length;
        editor.selectionEnd = cursorPos + tagStart.length + content.length;
    }
    
    editor.focus();
    generateTags();
    saveHistory();
    tagPanel.classList.remove('show');
}

// 插入颜色标签
function insertColorTag(color, withValue) {
    const startPos = editor.selectionStart;
    const endPos = editor.selectionEnd;
    const selectedText = editor.value.substring(startPos, endPos);
    
    let tagStart = '[color';
    if (withValue && color) {
        tagStart += `=${color}`;
    }
    tagStart += ']';
    
    const tagEnd = '[/color]';
    
    if (selectedText) {
        editor.value = editor.value.substring(0, startPos) + tagStart + selectedText + tagEnd + editor.value.substring(endPos);
        editor.selectionStart = startPos;
        editor.selectionEnd = startPos + tagStart.length + selectedText.length + tagEnd.length;
    } else {
        editor.value = editor.value.substring(0, startPos) + tagStart + '彩色文字' + tagEnd + editor.value.substring(endPos);
        editor.selectionStart = startPos + tagStart.length;
        editor.selectionEnd = startPos + tagStart.length + 4;
    }
    
    editor.focus();
    generateTags();
    saveHistory();
}

// 插入背景颜色标签
function insertBgColorTag(color, withValue) {
    const startPos = editor.selectionStart;
    const endPos = editor.selectionEnd;
    const selectedText = editor.value.substring(startPos, endPos);
    
    let tagStart = '[backcolor';
    if (withValue && color) {
        tagStart += `=${color}`;
    }
    tagStart += ']';
    
    const tagEnd = '[/backcolor]';
    
    if (selectedText) {
        editor.value = editor.value.substring(0, startPos) + tagStart + selectedText + tagEnd + editor.value.substring(endPos);
        editor.selectionStart = startPos;
        editor.selectionEnd = startPos + tagStart.length + selectedText.length + tagEnd.length;
    } else {
        editor.value = editor.value.substring(0, startPos) + tagStart + '背景文字' + tagEnd + editor.value.substring(endPos);
        editor.selectionStart = startPos + tagStart.length;
        editor.selectionEnd = startPos + tagStart.length + 4;
    }
    
    editor.focus();
    generateTags();
    saveHistory();
}

// 插入字号标签
function insertSizeTag(size, withValue) {
    const startPos = editor.selectionStart;
    const endPos = editor.selectionEnd;
    const selectedText = editor.value.substring(startPos, endPos);
    
    let tagStart = '[size';
    if (withValue && size) {
        tagStart += `=${size}`;
    }
    tagStart += ']';
    
    const tagEnd = '[/size]';
    
    if (selectedText) {
        editor.value = editor.value.substring(0, startPos) + tagStart + selectedText + tagEnd + editor.value.substring(endPos);
        editor.selectionStart = startPos;
        editor.selectionEnd = startPos + tagStart.length + selectedText.length + tagEnd.length;
    } else {
        editor.value = editor.value.substring(0, startPos) + tagStart + '文字' + tagEnd + editor.value.substring(endPos);
        editor.selectionStart = startPos + tagStart.length;
        editor.selectionEnd = startPos + tagStart.length + 2;
    }
    
    editor.focus();
    generateTags();
    saveHistory();
}

// 插入对齐标签
function insertAlignTag(align, withValue) {
    const startPos = editor.selectionStart;
    const endPos = editor.selectionEnd;
    const selectedText = editor.value.substring(startPos, endPos);
    
    let tagStart = '[align';
    if (withValue && align) {
        tagStart += `=${align}`;
    }
    tagStart += ']';
    
    const tagEnd = '[/align]';
    
    if (selectedText) {
        editor.value = editor.value.substring(0, startPos) + tagStart + selectedText + tagEnd + editor.value.substring(endPos);
        editor.selectionStart = startPos;
        editor.selectionEnd = startPos + tagStart.length + selectedText.length + tagEnd.length;
    } else {
        editor.value = editor.value.substring(0, startPos) + tagStart + '对齐文字' + tagEnd + editor.value.substring(endPos);
        editor.selectionStart = startPos + tagStart.length;
        editor.selectionEnd = startPos + tagStart.length + 4;
    }
    
    editor.focus();
    generateTags();
    saveHistory();
}

// 生成标签预览
function generateTags() {
    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    let text = escapeHtml(editor.value);
    text = text.replace(/\n/g, '<br>');
    
    // 基本样式
    text = text.replace(/\[b\]/g, '<b>').replace(/\[\/b\]/g, '</b>');
    text = text.replace(/\[i\]/g, '<i>').replace(/\[\/i\]/g, '</i>');
    text = text.replace(/\[u\]/g, '<u>').replace(/\[\/u\]/g, '</u>');
    text = text.replace(/\[s\]/g, '<s>').replace(/\[\/s\]/g, '</s>');
    
    // 颜色
    text = text.replace(/\[color=([^\]]+)\]/g, '<span style="color: $1;">').replace(/\[\/color\]/g, '</span>');
    text = text.replace(/\[color\]/g, '<span style="color: Red;">').replace(/\[\/color\]/g, '</span>');
    
    // 背景颜色
    text = text.replace(/\[backcolor=([^\]]+)\]/g, '<span style="background-color: $1;">').replace(/\[\/backcolor\]/g, '</span>');
    text = text.replace(/\[backcolor\]/g, '<span style="background-color: Crimson;">').replace(/\[\/backcolor\]/g, '</span>');
    
    // 字号
    text = text.replace(/\[size=1\]/g, '<span style="font-size: 10px;">').replace(/\[\/size\]/g, '</span>');
    text = text.replace(/\[size=2\]/g, '<span style="font-size: 14px;">').replace(/\[\/size\]/g, '</span>');
    text = text.replace(/\[size=3\]/g, '<span style="font-size: 18px;">').replace(/\[\/size\]/g, '</span>');
    text = text.replace(/\[size=4\]/g, '<span style="font-size: 22px;">').replace(/\[\/size\]/g, '</span>');
    text = text.replace(/\[size=5\]/g, '<span style="font-size: 26px;">').replace(/\[\/size\]/g, '</span>');
    text = text.replace(/\[size=6\]/g, '<span style="font-size: 30px;">').replace(/\[\/size\]/g, '</span>');
    text = text.replace(/\[size=7\]/g, '<span style="font-size: 34px;">').replace(/\[\/size\]/g, '</span>');
    text = text.replace(/\[size\]/g, '<span style="font-size: 20px;">').replace(/\[\/size\]/g, '</span>');
    
    // 对齐
    text = text.replace(/\[align=left\]/g, '<div style="text-align: left;">').replace(/\[\/align\]/g, '</div>');
    text = text.replace(/\[align=center\]/g, '<div style="text-align: center;">').replace(/\[\/align\]/g, '</div>');
    text = text.replace(/\[align=right\]/g, '<div style="text-align: right;">').replace(/\[\/align\]/g, '</div>');
    text = text.replace(/\[align\]/g, '<div>').replace(/\[\/align\]/g, '</div>');
    
    // 链接
    text = text.replace(/\[url=([^\]]+)\]/g, '<a href="$1" target="_blank">').replace(/\[\/url\]/g, '</a>');
    text = text.replace(/\[url\]/g, '<a href="https://example.com" target="_blank">').replace(/\[\/url\]/g, '</a>');
    
    // 图片
    text = text.replace(/\[img\]/g, '<img src="').replace(/\[\/img\]/g, '" style="max-width: 100%;">');
    
    // 代码
    text = text.replace(/\[code\]/g, '<div class="code-block">').replace(/\[\/code\]/g, '</div>');
    
    // 隐藏内容
    text = text.replace(/\[hide\]/g, '<div class="hidden-content">').replace(/\[\/hide\]/g, '</div>');
    
    // 引用
    text = text.replace(/\[quote\]/g, '<blockquote style="border-left: 3px solid #ccc; padding-left: 10px; margin: 10px 0; color: #666;">')
              .replace(/\[\/quote\]/g, '</blockquote>');
    
    // 列表
    text = text.replace(/\[list(=1)?\]/g, function(match, isOrdered) { 
        return isOrdered ? '<ol style="margin-left: 20px;">' : '<ul style="margin-left: 20px;">'; 
    }).replace(/\[\/list\]/g, '</ol>');
    text = text.replace(/\[\*\]/g, '<li>').replace(/\[\/\*\]/g, '</li>');
    
    // 表格
    text = text.replace(/\[table\]/g, '<table style="border-collapse: collapse; width: 100%; margin: 10px 0;">')
               .replace(/\[\/table\]/g, '</table>');
    text = text.replace(/\[tr\]/g, '<tr>').replace(/\[\/tr\]/g, '</tr>');
    text = text.replace(/\[td\]/g, '<td style="border: 1px solid #ddd; padding: 8px;">').replace(/\[\/td\]/g, '</td>');
    
    // 字体
    text = text.replace(/\[font=([^\]]+)\]/g, '<span style="font-family: $1;">').replace(/\[\/font\]/g, '</span>');
    text = text.replace(/\[font\]/g, '<span style="font-family: 黑体;">').replace(/\[\/font\]/g, '</span>');
    
    // 音频
    text = text.replace(/\[audio\]/g, '<audio controls style="width:100%; max-width:300px;"><source src="').replace(/\[\/audio\]/g, '" type="audio/mpeg">您的浏览器不支持音频元素</audio>');

    preview.innerHTML = text;
}

// 复制到剪贴板
function copyToClipboard() {
    editor.select();
    document.execCommand('copy');
    showToast('内容已复制到剪贴板!');
}

// 清空编辑器
function clearEditor() {
    if (confirm('确定要清空编辑器内容吗？')) {
        editor.value = '';
        preview.innerHTML = '<p>预览区域 - 生成的标签效果将显示在这里</p><br><br><div style="text-align: center; padding: 20px; background-color: var(--light-color); border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.05);"><a href="https://bbs.binmt.cc/home.php?mod=space&uid=145182&do=profile" style="color: var(--primary-color); text-decoration: none; font-weight: 500; transition: color 0.3s ease;">MT 挽梦遗酒   制</a></div>';
        showToast('编辑器已清空');
        saveHistory();
    }
}

// 保存历史记录
function saveHistory() {
    const text = editor.value;
    
    if (historyIndex >= 0 && historyStack[historyIndex] === text) return;
    
    if (historyIndex < historyStack.length - 1) {
        historyStack = historyStack.slice(0, historyIndex + 1);
    }
    
    historyStack.push(text);
    historyIndex = historyStack.length - 1;
    
    if (historyStack.length > 50) {
        historyStack.shift();
        historyIndex--;
    }
    
    updateUndoRedoButtons();
}

// 更新回退/重做按钮状态
function updateUndoRedoButtons() {
    undoBtn.disabled = historyIndex <= 0;
    redoBtn.disabled = historyIndex >= historyStack.length - 1;
    undoBtn.style.opacity = undoBtn.disabled ? "0.5" : "0.8";
    redoBtn.style.opacity = redoBtn.disabled ? "0.5" : "0.8";
}

// 回退
function undo() {
    if (historyIndex > 0) {
        historyIndex--;
        editor.value = historyStack[historyIndex];
        generateTags();
        updateUndoRedoButtons();
    }
}

// 重做
function redo() {
    if (historyIndex < historyStack.length - 1) {
        historyIndex++;
        editor.value = historyStack[historyIndex];
        generateTags();
        updateUndoRedoButtons();
    }
}

// 显示提示
function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2000);
}

// 切换标签面板
function toggleTagPanel() {
    tagPanel.classList.toggle('show');
}

// 切换主题
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDark);
    themeBtn.textContent = isDark ? '🌞' : '🌓';
}

// 检查系统主题
function checkSystemTheme() {
    const savedMode = localStorage.getItem('darkMode');
    const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedMode === 'true' || (savedMode === null && systemPrefersDark)) {
        document.body.classList.add('dark-mode');
        themeBtn.textContent = '🌞';
    } else {
        themeBtn.textContent = '🌓';
    }
}

// 切换示例内容显示
function toggleExamples() {
    examplesContent.classList.toggle('show');
    toggleIcon.classList.toggle('rotated');
}

// 使悬浮按钮可拖动
function makeDraggable(element) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    
    element.onmousedown = dragMouseDown;
    
    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }
    
    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        element.style.top = (element.offsetTop - pos2) + "px";
        element.style.left = (element.offsetLeft - pos1) + "px";
    }
    
    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    checkSystemTheme();

    // 初始化历史记录
    historyStack.push(editor.value);
    historyIndex = 0;
    updateUndoRedoButtons();
    
    // 初始化颜色选择器
    textColorBtn.style.color = 'Red';
    textColorBtn.style.borderColor = 'Red';
    bgColorBtn.style.color = 'Crimson';
    bgColorBtn.style.borderColor = 'Crimson';
    updateRecentColors('recentTextColors', recentTextColors);
    updateRecentColors('recentBgColors', recentBgColors);
    
    // 编辑器输入事件
    editor.addEventListener('input', function() {
        clearTimeout(typingTimer);
        isTyping = true;
        
        typingTimer = setTimeout(function() {
            isTyping = false;
            saveHistory();
            generateTags();
        }, 500);
    });
    
    // 悬浮按钮事件
    floatingBtn.addEventListener('click', toggleTagPanel);
    makeDraggable(floatingBtn);
    
    // 回退/重做按钮事件
    undoBtn.addEventListener('click', undo);
    redoBtn.addEventListener('click', redo);
    makeDraggable(undoBtn);
    makeDraggable(redoBtn);
    
    // 主题按钮事件
    themeBtn.addEventListener('click', toggleTheme);
    
    // 颜色按钮事件
    textColorBtn.addEventListener('click', () => openColorPalette('text'));
    bgColorBtn.addEventListener('click', () => openColorPalette('bg'));
    
    // 点击标签面板中的按钮后自动关闭面板
    tagPanel.addEventListener('click', function(e) {
        if (e.target.classList.contains('tag-panel-btn')) {
            setTimeout(() => {
                tagPanel.classList.remove('show');
            }, 300);
        }
    });
    
    // 点击页面其他地方关闭面板
    document.addEventListener('click', function(e) {
        if (!tagPanel.contains(e.target) && e.target !== floatingBtn) {
            tagPanel.classList.remove('show');
        }
        
        if (!colorPaletteModal.contains(e.target) && 
            e.target !== textColorBtn && 
            e.target !== bgColorBtn) {
            closeColorPalette();
        }
    });
    
    // 添加键盘快捷键 (Ctrl+Z 和 Ctrl+Y)
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey || e.metaKey) {
            if (e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                undo();
            } else if ((e.key === 'y' || (e.key === 'z' && e.shiftKey)) && !e.altKey) {
                e.preventDefault();
                redo();
            }
        }
    });
});
