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
const rainbowModal = document.getElementById('rainbowModal');
const workspace = document.querySelector('.workspace');
const flipBtn = document.getElementById('flipBtn');
const flipCn = flipBtn.querySelector('.flip-tab-cn');
const flipEn = flipBtn.querySelector('.flip-tab-en');
const editorHighlight = document.getElementById('editorHighlight');
const highlightCode = editorHighlight ? editorHighlight.querySelector('code') : null;

let historyStack = [];
let historyIndex = -1;
let typingTimer;
let isTyping = false;

let rainbowBBCode = '';

let currentColorType = 'text';
let selectedColor = 'Red';
let recentTextColors = ['Maroon', 'DarkOrange', 'DarkKhaki', 'DarkGreen', 'Navy','Indigo'];
let recentBgColors = ['Salmon', 'Tan', 'Cornsilk', 'PaleGreen', 'LightSteelBlue','Thistle'];

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

const rainbowColors = [
'#8B0000', '#A50000', '#C00000', '#DB0000', '#FF0000',
'#FF1A00', '#FF3500', '#FF5000', '#FF6B00', '#FF8600',
'#FFA100', '#FFBB00', '#FFD600', '#FFF100', '#FFFF00',
'#E5FF00', '#CAFF00', '#B0FF00', '#95FF00', '#7AFF00',
'#60FF00', '#45FF00', '#2AFF00', '#0FFF00', '#00FF0F',
'#00FF2A', '#00FF45', '#00FF60', '#00FF7A', '#00FF95',
'#00FFB0', '#00FFCA', '#00FFE5', '#00FFFF', '#00E5FF',
'#00CAFF', '#00B0FF', '#0095FF', '#007AFF', '#0060FF',
'#0045FF', '#002AFF', '#000FFF', '#0F00FF', '#2A00FF',
'#4500FF', '#6000FF', '#7A00FF', '#9500FF', '#B000FF',
'#CA00FF', '#E500FF', '#FF00FF', '#FF00E5', '#FF00CA',
'#FF00B0', '#FF0095', '#FF007A', '#FF0060', '#FF0045',
'#FF002A', '#FF000F', '#FF0000'
];

function saveToLocalStorage() {
    localStorage.setItem('mt_editor_content', editor.value);
}

function updateStats() {
    const counter = document.getElementById('charCount');
    if (counter) {
        counter.textContent = editor.value.length + ' 字';
    }
}

/* ---------- 编辑器内 BBCode 标签高亮 ---------- */

// 覆盖 [b] [/b] [color=Red] [img=300,160] [hr] [hr/] [*] 等所有方括号标签
const BB_TAG_RE = /\[(\/?)([a-zA-Z0-9*]+)(=[^\]\n]*)?(\/?)\]/g;

function escapeHighlightText(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function buildHighlightHtml(raw) {
    const escaped = escapeHighlightText(raw);
    let html = '';
    let cursor = 0;
    let match;

    BB_TAG_RE.lastIndex = 0;
    while ((match = BB_TAG_RE.exec(escaped)) !== null) {
        html += escaped.slice(cursor, match.index);

        const isClose = match[1] === '/';
        const name = match[2];
        const param = match[3];
        const selfClose = match[4] === '/';

        html += '<span class="bb-tag' + (isClose ? ' bb-close' : '') + '">';
        html += '<span class="bb-br">[</span>';
        if (isClose) html += '<span class="bb-br">/</span>';
        html += '<span class="bb-name">' + name + '</span>';
        if (param) {
            html += '<span class="bb-br">=</span>';
            html += '<span class="bb-param">' + param.slice(1) + '</span>';
        }
        if (selfClose) html += '<span class="bb-br">/</span>';
        html += '<span class="bb-br">]</span></span>';

        cursor = match.index + match[0].length;
    }
    html += escaped.slice(cursor);

    // pre 里末尾换行会被吞掉，补一个空格保持行高与 textarea 一致
    if (raw.endsWith('\n')) html += ' ';

    return html;
}

function syncHighlightScroll() {
    if (!editorHighlight) return;
    editorHighlight.scrollTop = editor.scrollTop;
    editorHighlight.scrollLeft = editor.scrollLeft;
}

function syncHighlightBox() {
    if (!editorHighlight) return;
    // clientWidth/Height 已含 padding 且不含滚动条，正好对上 textarea 的可视内容区
    editorHighlight.style.width = editor.clientWidth + 'px';
    editorHighlight.style.height = editor.clientHeight + 'px';
}

function renderEditorHighlight() {
    if (!highlightCode) return;

    highlightCode.innerHTML = buildHighlightHtml(editor.value);
    if (!document.body.classList.contains('has-highlight')) {
        document.body.classList.add('has-highlight');
    }
    syncHighlightScroll();
}

function loadFromLocalStorage() {
    const saved = localStorage.getItem('mt_editor_content');
    if (saved !== null) {
        editor.value = saved;
        generateTags();
    }
}

function initColorPalette() {
    const paletteContent = document.getElementById('colorPaletteContent');
    paletteContent.innerHTML = '';
    
    colorCategories.forEach(category => {
        const categoryTitle = document.createElement('div');
        categoryTitle.className = 'color-category';
        categoryTitle.textContent = category.name;
        paletteContent.appendChild(categoryTitle);
        
        const colorGrid = document.createElement('div');
        colorGrid.className = 'color-palette-grid';
        
        const sortedColors = [...category.colors].sort((a, b) => {
            const brightnessA = getColorBrightness(a.value);
            const brightnessB = getColorBrightness(b.value);
            return brightnessA - brightnessB;
        });
        
        sortedColors.forEach(color => {
            const colorItem = document.createElement('div');
            colorItem.className = 'color-palette-item';
            colorItem.style.backgroundColor = color.value;
            colorItem.dataset.color = color.value;
            colorItem.title = `${color.name} (${color.value})`;
            colorItem.tabIndex = 0;
            colorItem.setAttribute('role', 'button');
            colorItem.setAttribute('aria-label', `${color.name} ${color.value}`);
            colorItem.onclick = function() {
                document.querySelectorAll('.color-palette-item').forEach(item => {
                    item.classList.remove('selected');
                });
                this.classList.add('selected');
                selectedColor = this.dataset.color;
            };
            colorItem.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.click();
                }
            });
            colorGrid.appendChild(colorItem);
        });
        
        paletteContent.appendChild(colorGrid);
    });
}

function getColorBrightness(hex) {
    const r = parseInt(hex.substr(1, 2), 16);
    const g = parseInt(hex.substr(3, 2), 16);
    const b = parseInt(hex.substr(5, 2), 16);
    return (r * 299 + g * 587 + b * 114) / 1000;
}

function applySelectedColor() {
    const btn = currentColorType === 'text' ? textColorBtn : bgColorBtn;
    const recentColors = currentColorType === 'text' ? recentTextColors : recentBgColors;
    
    btn.style.color = selectedColor;
    btn.style.borderColor = selectedColor;
    btn.classList.add('active');
    
    if (!recentColors.includes(selectedColor)) {
        if (currentColorType === 'text') {
            recentTextColors = [selectedColor, ...recentTextColors.filter(c => c !== selectedColor)].slice(0, 5);
            updateRecentColors('recentTextColors', recentTextColors);
        } else {
            recentBgColors = [selectedColor, ...recentBgColors.filter(c => c !== selectedColor)].slice(0, 5);
            updateRecentColors('recentBgColors', recentBgColors);
        }
    }
    
    if (currentColorType === 'text') {
        insertColorTag(selectedColor, true);
    } else {
        insertBgColorTag(selectedColor, true);
    }
    
    closeColorPalette();
}

function openColorPalette(type) {
    currentColorType = type;
    colorPaletteModal.classList.add('show');
    initColorPalette();
    
    const btn = type === 'text' ? textColorBtn : bgColorBtn;
    const defaultColor = btn.style.color || (type === 'text' ? 'Red' : 'Crimson');
    
    const colorItem = Array.from(document.querySelectorAll('.color-palette-item'))
        .find(item => (item.dataset.color || '').toLowerCase() === defaultColor.toLowerCase());
    
    if (colorItem) {
        colorItem.classList.add('selected');
        selectedColor = colorItem.dataset.color;
    }
}

function closeColorPalette() {
    colorPaletteModal.classList.remove('show');
}

function updateRecentColors(elementId, colors) {
    const element = document.getElementById(elementId);
    element.innerHTML = '';
    
    colors.forEach(color => {
        const colorDiv = document.createElement('div');
        colorDiv.className = 'recent-color';
        colorDiv.style.backgroundColor = color;
        colorDiv.title = color;
        colorDiv.tabIndex = 0;
        colorDiv.setAttribute('role', 'button');
        colorDiv.setAttribute('aria-label', `使用颜色 ${color}`);
        colorDiv.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
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

function imageFallback(img) {
    const src = img.getAttribute('data-fallback-src');
    if (!src || img.dataset.fallbackTried) return;
    img.dataset.fallbackTried = '1';
    img.src = 'https://image.baidu.com/search/down?url=' + encodeURIComponent(src);
}

function generateTags() {
    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    const sizeMap = { 1: 12, 2: 13, 3: 15, 4: 16, 5: 18, 6: 22, 7: 30 };

    let text = escapeHtml(editor.value);
    text = text.replace(/\n/g, '<br>');

    text = text.replace(/\[b\]/g, '<b>').replace(/\[\/b\]/g, '</b>');
    text = text.replace(/\[i\]/g, '<i>').replace(/\[\/i\]/g, '</i>');
    text = text.replace(/\[u\]/g, '<u>').replace(/\[\/u\]/g, '</u>');
    text = text.replace(/\[s\]/g, '<s>').replace(/\[\/s\]/g, '</s>');

    text = text.replace(/\[color=([^\]]+)\]/g, function(match, color) {
        if (/^#[0-9A-Fa-f]{6}$/i.test(color)) {
            return `<span style="color: ${color};">`;
        }
        else if (/^#[0-9A-Fa-f]{3}$/i.test(color)) {
            const r = color[1];
            const g = color[2];
            const b = color[3];
            return `<span style="color: #${r}${r}${g}${g}${b}${b};">`;
        }
        else {
            return `<span style="color: ${color};">`;
        }
    }).replace(/\[\/color\]/g, '</span>');

    text = text.replace(/\[backcolor=([^\]]+)\]/g, '<span style="background-color: $1;">').replace(/\[\/backcolor\]/g, '</span>');
    text = text.replace(/\[backcolor\]/g, '<span style="background-color: Crimson;">').replace(/\[\/backcolor\]/g, '</span>');

    text = text.replace(/\[size=([1-7])\]/g, function(match, size) {
        return `<span style="font-size: ${sizeMap[size]}px;">`;
    });
    text = text.replace(/\[size\]/g, '<span style="font-size: 16px;">');
    text = text.replace(/\[\/size\]/g, '</span>');

    text = text.replace(/\[align=left\]/g, '<div style="text-align: left;">').replace(/\[\/align\]/g, '</div>');
    text = text.replace(/\[align=center\]/g, '<div style="text-align: center;">').replace(/\[\/align\]/g, '</div>');
    text = text.replace(/\[align=right\]/g, '<div style="text-align: right;">').replace(/\[\/align\]/g, '</div>');
    text = text.replace(/\[align\]/g, '<div>').replace(/\[\/align\]/g, '</div>');

    text = text.replace(/\[url=([^\]]+)\]/g, '<a href="$1" target="_blank" rel="noopener">').replace(/\[\/url\]/g, '</a>');
    text = text.replace(/\[url\]/g, '<a href="https://example.com" target="_blank" rel="noopener">').replace(/\[\/url\]/g, '</a>');

    text = text.replace(/(?:<br>)?\[hr\/?\](?:<br>)?/g, '<hr class="proof-hr">');

    function imgTag(src, style) {
        const fallback = /^https?:\/\//i.test(src)
            ? ` data-fallback-src="${src}" onerror="imageFallback(this)"`
            : '';
        return `<img src="${src}" style="${style}" alt="图片" referrerpolicy="no-referrer"${fallback}>`;
    }

    text = text.replace(/\[img=(\d+),(\d+)\]([^\[]*)\[\/img\]/g, function(match, width, height, src) {
        return imgTag(src, `width: ${width}px; max-width: 100%; height: auto;`);
    });
    text = text.replace(/\[img\]([^\[]*)\[\/img\]/g, function(match, src) {
        return imgTag(src, 'max-width: 100%;');
    });

    text = text.replace(/\[code\]/g, '<div class="code-block">').replace(/\[\/code\]/g, '</div>');

    text = text.replace(/\[hide\]/g, '<div class="hidden-content">').replace(/\[\/hide\]/g, '</div>');

    text = text.replace(/\[quote\]/g, '<blockquote>')
              .replace(/\[\/quote\]/g, '</blockquote>');

    // 列表：用栈保证 [list] 与 [/list] 成对闭合（无序/有序不混淆）
    const listStack = [];
    text = text.replace(/\[list(=1)?\]|\[\/list\]/g, function(match, ordered) {
        if (match === '[/list]') {
            const type = listStack.pop() || 'ul';
            return type === 'ol' ? '</ol>' : '</ul>';
        }
        const type = ordered ? 'ol' : 'ul';
        listStack.push(type);
        return type === 'ol'
            ? '<ol style="margin-left: 1.4em;">'
            : '<ul style="margin-left: 1.4em;">';
    });
    text = text.replace(/\[\*\]/g, '<li>').replace(/\[\/\*\]/g, '</li>');

    text = text.replace(/\[table\]/g, '<table style="border-collapse: collapse; width: 100%; margin: 10px 0;">')
               .replace(/\[\/table\]/g, '</table>');
    text = text.replace(/\[tr\]/g, '<tr>').replace(/\[\/tr\]/g, '</tr>');
    text = text.replace(/\[td\]/g, '<td style="border: 1px solid var(--border); padding: 8px;">').replace(/\[\/td\]/g, '</td>');

    text = text.replace(/\[font=([^\]]+)\]/g, '<span style="font-family: $1;">').replace(/\[\/font\]/g, '</span>');
    text = text.replace(/\[font\]/g, '<span style="font-family: 黑体;">').replace(/\[\/font\]/g, '</span>');

    text = text.replace(/\[audio\]/g, '<audio controls style="width:100%; max-width:300px;"><source src="').replace(/\[\/audio\]/g, '" type="audio/mpeg">您的浏览器不支持音频元素</audio>');

    preview.innerHTML = text;
    updateStats();
    renderEditorHighlight();
}

function writeClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(text);
    }

    return new Promise(function(resolve) {
        const helper = document.createElement('textarea');
        helper.value = text;
        helper.setAttribute('readonly', '');
        helper.style.position = 'fixed';
        helper.style.top = '-9999px';
        document.body.appendChild(helper);
        helper.select();
        document.execCommand('copy');
        document.body.removeChild(helper);
        resolve();
    });
}

async function copyToClipboard() {
    const text = editor.value;
    if (!text.trim()) {
        showToast('编辑器还是空的，先写点内容吧');
        return;
    }

    try {
        await writeClipboard(text);
        showToast('已复制 ' + text.length + ' 个字符');
    } catch (err) {
        editor.select();
        document.execCommand('copy');
        showToast('内容已复制到剪贴板');
    }
}

/* ---------- Skill 菜单：复制正文 / 正文 + Skill.md ---------- */

let skillTextCache = null;
let skillRequest = null;

function loadSkillText() {
    if (skillTextCache !== null) return Promise.resolve(skillTextCache);
    if (skillRequest) return skillRequest;

    skillRequest = (async function() {
        // 根目录下的 Skill.md；常见的大小写写法都试一遍
        const candidates = ['SKILL.md', 'Skill.md', 'skill.md'];
        for (let i = 0; i < candidates.length; i++) {
            try {
                const res = await fetch(candidates[i], { cache: 'no-store' });
                if (!res.ok) continue;
                const text = (await res.text()).trim();
                if (text) {
                    skillTextCache = text;
                    return text;
                }
            } catch (err) {
                // 本地 file:// 打开或文件不存在，继续试下一个
            }
        }
        skillTextCache = '';
        return '';
    })();

    return skillRequest;
}

// 拼接顺序：先 skill 全文，再一行分隔标记，最后才是文章
const SKILL_ARTICLE_SEPARATOR = '#以下是文章内容';

function composeSkillPayload(text, skill) {
    if (!skill) return text;
    return skill + '\n\n' + SKILL_ARTICLE_SEPARATOR + '\n\n' + text;
}

function timestampSlug() {
    const d = new Date();
    const pad = function(n) { return String(n).padStart(2, '0'); };
    return '' + d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) +
        '-' + pad(d.getHours()) + pad(d.getMinutes());
}

function downloadTextFile(name, text) {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(function() { URL.revokeObjectURL(url); }, 2000);
}

async function copyWithSkill() {
    closeSkillMenu();
    const text = editor.value;
    if (!text.trim()) {
        showToast('编辑器还是空的，先写点内容吧');
        return;
    }

    const skill = await loadSkillText();
    const payload = composeSkillPayload(text, skill);

    try {
        await writeClipboard(payload);
        showToast(skill
            ? '已复制 Skill + 文章，共 ' + payload.length + ' 个字符'
            : '没找到 SKILL.md，这次只复制了正文');
    } catch (err) {
        editor.select();
        document.execCommand('copy');
        showToast('内容已复制到剪贴板');
    }
}

async function downloadWithSkill() {
    closeSkillMenu();
    const text = editor.value;
    if (!text.trim()) {
        showToast('编辑器还是空的，先写点内容吧');
        return;
    }

    const skill = await loadSkillText();
    const payload = composeSkillPayload(text, skill);
    const fileName = 'bbcode-skill-' + timestampSlug() + '.txt';

    try {
        downloadTextFile(fileName, payload);
        showToast(skill
            ? '已导出 ' + fileName
            : '没找到 SKILL.md，已导出纯正文');
    } catch (err) {
        showToast('导出失败，请改用「复制文字+skill」');
    }
}

function toggleSkillMenu(force) {
    const menu = document.getElementById('skillMenu');
    const tab = document.getElementById('skillTab');
    if (!menu || !tab) return;

    const open = typeof force === 'boolean' ? force : menu.hidden;
    menu.hidden = !open;
    tab.setAttribute('aria-expanded', String(open));

    if (open) {
        const first = menu.querySelector('.skill-menu-item');
        if (first) first.focus();
    }
}

function closeSkillMenu() {
    const menu = document.getElementById('skillMenu');
    if (menu && !menu.hidden) toggleSkillMenu(false);
}

function clearEditor() {
    if (confirm('确定要清空编辑器内容吗？')) {
        editor.value = '';
        preview.innerHTML = '<div class="preview-empty">' +
            '<span class="empty-icon" aria-hidden="true">' +
            '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' +
            '<path d="M6 3h8l4 4v14H6z"></path><path d="M14 3v4h4"></path><path d="M9 12h6M9 16h4"></path></svg></span>' +
            '<strong>版面还是空的</strong>' +
            '<span class="empty-copy">在左边写点内容，成品会实时排在这里。</span>' +
            '<span class="empty-specimen" aria-hidden="true"><i></i><i></i><i></i></span>' +
            '</div>';
        updateStats();
        showToast('编辑器已清空');
        saveHistory();
        editor.focus();
    }
}

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
    saveToLocalStorage();
}

function updateUndoRedoButtons() {
    undoBtn.disabled = historyIndex <= 0;
    redoBtn.disabled = historyIndex >= historyStack.length - 1;
    undoBtn.setAttribute('aria-disabled', String(undoBtn.disabled));
    redoBtn.setAttribute('aria-disabled', String(redoBtn.disabled));
}

function undo() {
    if (historyIndex > 0) {
        historyIndex--;
        editor.value = historyStack[historyIndex];
        generateTags();
        updateUndoRedoButtons();
        saveToLocalStorage();
    }
}

function redo() {
    if (historyIndex < historyStack.length - 1) {
        historyIndex++;
        editor.value = historyStack[historyIndex];
        generateTags();
        updateUndoRedoButtons();
        saveToLocalStorage();
    }
}

function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2000);
}

function toggleTagPanel() {
    const isOpen = tagPanel.classList.toggle('show');
    floatingBtn.setAttribute('aria-expanded', String(isOpen));
}

function syncThemeButton(isDark) {
    themeBtn.setAttribute('aria-pressed', String(isDark));
    themeBtn.setAttribute('aria-label', isDark ? '切换到浅色模式' : '切换到深色模式');
    themeBtn.title = isDark ? '切换到浅色模式' : '切换到深色模式';
    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) {
        themeColor.setAttribute('content', isDark ? '#16120e' : '#e8e1d3');
    }
}

function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDark);
    syncThemeButton(isDark);
}

function checkSystemTheme() {
    const savedMode = localStorage.getItem('darkMode');
    // 默认浅色；只有用户手动切到深色时才记住深色
    const isDark = savedMode === 'true';

    document.body.classList.toggle('dark-mode', isDark);
    syncThemeButton(isDark);
}

function toggleExamples() {
    const isOpen = examplesContent.classList.toggle('show');
    if (toggleIcon) toggleIcon.classList.toggle('rotated', isOpen);
    const trigger = document.querySelector('.examples-toggle');
    if (trigger) trigger.setAttribute('aria-expanded', String(isOpen));
}

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

function openRainbowGenerator() {
    rainbowModal.classList.add('show');
    
    const startPos = editor.selectionStart;
    const endPos = editor.selectionEnd;
    const selectedText = editor.value.substring(startPos, endPos);
    
    if (selectedText) {
        document.getElementById('rainbowInputText').value = selectedText;
    }
}

function closeRainbowGenerator() {
    rainbowModal.classList.remove('show');
}

function getRandomStartIndex() {
    return Math.floor(Math.random() * rainbowColors.length);
}

function interpolateColor(color1, color2, factor) {
    if (factor <= 0) return color1;
    if (factor >= 1) return color2;
    
    const r1 = parseInt(color1.substring(1, 3), 16);
    const g1 = parseInt(color1.substring(3, 5), 16);
    const b1 = parseInt(color1.substring(5, 7), 16);
    
    const r2 = parseInt(color2.substring(1, 3), 16);
    const g2 = parseInt(color2.substring(3, 5), 16);
    const b2 = parseInt(color2.substring(5, 7), 16);
    
    const r = Math.round(r1 + factor * (r2 - r1));
    const g = Math.round(g1 + factor * (g2 - g1));
    const b = Math.round(b1 + factor * (b2 - b1));
    
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

function generateRainbowText() {
    const inputText = document.getElementById('rainbowInputText').value;
    if (!inputText.trim()) {
        showToast('请输入要转换的文字！');
        return;
    }
    
    const previewDiv = document.getElementById('rainbowPreview');
    previewDiv.innerHTML = '';
    
    const spanContainer = document.createElement('div');
    const totalChars = inputText.length;
    
    const startIndex = getRandomStartIndex();
    
    let bbcodeOutput = '';
    
    const minRepeat = 1;
    const colorCount = rainbowColors.length;
    let repeatTimes = minRepeat;
    
    if (totalChars < colorCount * minRepeat) {
        repeatTimes = Math.max(1, Math.floor(totalChars / colorCount));
    }
    
    let colorIndex = startIndex;
    let currentRepeat = 0;
    
    for (let i = 0; i < totalChars; i++) {
        const char = inputText[i];
        const span = document.createElement('span');
        
        const color = rainbowColors[colorIndex % rainbowColors.length];
        
        span.style.color = color;
        span.textContent = char;
        spanContainer.appendChild(span);
        
        const hexColor = color.substring(1);
        bbcodeOutput += `[color=#${hexColor}]${char}[/color]`;
        
        currentRepeat++;
        if (currentRepeat >= repeatTimes) {
            colorIndex++;
            currentRepeat = 0;
        }
    }
    
    previewDiv.appendChild(spanContainer);
    
    rainbowBBCode = bbcodeOutput;
}

function insertRainbowText() {
    if (!rainbowBBCode) {
        showToast('请先生成彩虹文字！');
        return;
    }
    
    const startPos = editor.selectionStart;
    const endPos = editor.selectionEnd;
    
    editor.value = editor.value.substring(0, startPos) + rainbowBBCode + editor.value.substring(endPos);
    
    editor.selectionStart = startPos + rainbowBBCode.length;
    editor.selectionEnd = startPos + rainbowBBCode.length;
    
    closeRainbowGenerator();
    
    generateTags();
    
    saveHistory();
    
    showToast('彩虹文字已插入到编辑器！');
}

function enhanceSelect(select) {
    const wrap = document.createElement('div');
    wrap.className = 'pick';
    select.parentNode.insertBefore(wrap, select);
    wrap.appendChild(select);
    select.classList.add('pick-native');
    select.tabIndex = -1;
    select.setAttribute('aria-hidden', 'true');

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'pick-trigger';
    trigger.setAttribute('aria-haspopup', 'listbox');
    trigger.setAttribute('aria-expanded', 'false');
    const triggerLabel = document.querySelector(`label[for="${select.id}"]`);
    trigger.setAttribute('aria-label', triggerLabel ? triggerLabel.childNodes[0].textContent.trim() : select.id);
    const value = document.createElement('span');
    value.className = 'pick-value';
    trigger.appendChild(value);
    wrap.appendChild(trigger);

    const menu = document.createElement('div');
    menu.className = 'pick-menu';
    menu.setAttribute('role', 'listbox');
    wrap.appendChild(menu);

    const options = Array.from(select.options).map(function(opt) {
        const item = document.createElement('button');
        item.type = 'button';
        item.className = 'pick-option';
        item.setAttribute('role', 'option');
        item.textContent = opt.textContent;
        item.addEventListener('click', function() {
            select.value = opt.value;
            select.dispatchEvent(new Event('change', { bubbles: true }));
            sync();
            setOpen(false);
            trigger.focus();
        });
        menu.appendChild(item);
        return { item, opt };
    });

    function sync() {
        value.textContent = select.options[select.selectedIndex].textContent;
        options.forEach(function(o, i) {
            const on = i === select.selectedIndex;
            o.item.classList.toggle('is-selected', on);
            o.item.setAttribute('aria-selected', String(on));
        });
    }

    function setOpen(on) {
        if (on) {
            document.querySelectorAll('.pick.is-open').forEach(function(other) {
                if (other !== wrap) {
                    other.classList.remove('is-open');
                    other.querySelector('.pick-trigger').setAttribute('aria-expanded', 'false');
                }
            });
        }
        wrap.classList.toggle('is-open', on);
        trigger.setAttribute('aria-expanded', String(on));
        if (on) {
            const current = options[select.selectedIndex] || options[0];
            current.item.focus();
        }
    }

    trigger.addEventListener('click', function() {
        setOpen(!wrap.classList.contains('is-open'));
    });

    trigger.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            setOpen(true);
        }
    });

    menu.addEventListener('keydown', function(e) {
        const index = options.findIndex(function(o) { return o.item === document.activeElement; });
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            const step = e.key === 'ArrowDown' ? 1 : -1;
            options[(index + step + options.length) % options.length].item.focus();
        } else if (e.key === 'Home' || e.key === 'End') {
            e.preventDefault();
            options[e.key === 'Home' ? 0 : options.length - 1].item.focus();
        } else if (e.key === 'Escape') {
            setOpen(false);
            trigger.focus();
        } else if (e.key === 'Tab') {
            setOpen(false);
        }
    });

    document.addEventListener('click', function(e) {
        if (!wrap.contains(e.target)) setOpen(false);
    });

    sync();
}

function toggleWorkspace() {
    const toPreview = !workspace.classList.contains('is-preview');
    const from = toPreview ? editor : preview;
    const to = toPreview ? preview : editor;
    const max = from.scrollHeight - from.clientHeight;
    const ratio = max > 0 ? from.scrollTop / max : 0;

    if (toPreview) generateTags();
    workspace.classList.toggle('is-preview', toPreview);
    flipBtn.setAttribute('aria-pressed', String(toPreview));
    flipBtn.setAttribute('aria-label', toPreview ? '切换到编辑' : '切换到预览');
    flipCn.textContent = toPreview ? '编辑' : '预览';
    flipEn.textContent = toPreview ? 'Compose' : 'Proof';

    requestAnimationFrame(function() {
        const target = to.scrollHeight - to.clientHeight;
        if (target > 0) to.scrollTop = ratio * target;
    });
}

document.addEventListener('DOMContentLoaded', function() {
    flipBtn.addEventListener('click', toggleWorkspace);
    ['sizeSelect', 'fontSelect', 'alignSelect'].forEach(function(id) {
        enhanceSelect(document.getElementById(id));
    });

    loadFromLocalStorage();
    checkSystemTheme();
    updateStats();

    // 高亮层先量好尺寸，再铺内容
    syncHighlightBox();
    renderEditorHighlight();
    if (typeof ResizeObserver === 'function') {
        new ResizeObserver(function() {
            syncHighlightBox();
            syncHighlightScroll();
        }).observe(editor);
    }
    window.addEventListener('resize', function() {
        syncHighlightBox();
        syncHighlightScroll();
    });
    editor.addEventListener('scroll', syncHighlightScroll, { passive: true });

    historyStack.push(editor.value);
    historyIndex = 0;
    updateUndoRedoButtons();
    
    textColorBtn.style.color = 'Red';
    textColorBtn.style.borderColor = 'Red';
    bgColorBtn.style.color = 'Crimson';
    bgColorBtn.style.borderColor = 'Crimson';
    updateRecentColors('recentTextColors', recentTextColors);
    updateRecentColors('recentBgColors', recentBgColors);
    
    document.getElementById('rainbowInputText').value = '彩虹文字效果示例';
    generateRainbowText();
    
    editor.addEventListener('input', function() {
        renderEditorHighlight();
        updateStats();
        clearTimeout(typingTimer);
        isTyping = true;
        
        typingTimer = setTimeout(function() {
            isTyping = false;
            saveHistory();
            generateTags();
        }, 400);
    });
    
    floatingBtn.addEventListener('click', toggleTagPanel);
    makeDraggable(floatingBtn);
    
    undoBtn.addEventListener('click', undo);
    redoBtn.addEventListener('click', redo);
    makeDraggable(undoBtn);
    makeDraggable(redoBtn);
    
    themeBtn.addEventListener('click', toggleTheme);
    
    textColorBtn.addEventListener('click', () => openColorPalette('text'));
    bgColorBtn.addEventListener('click', () => openColorPalette('bg'));

    const skillTab = document.getElementById('skillTab');
    const skillMenu = document.getElementById('skillMenu');
    if (skillTab && skillMenu) {
        skillTab.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleSkillMenu();
        });
        skillMenu.addEventListener('keydown', function(e) {
            const items = Array.from(skillMenu.querySelectorAll('.skill-menu-item'));
            const index = items.indexOf(document.activeElement);
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                e.preventDefault();
                const step = e.key === 'ArrowDown' ? 1 : -1;
                items[(index + step + items.length) % items.length].focus();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                closeSkillMenu();
                skillTab.focus();
            }
        });
    }
    
    tagPanel.addEventListener('click', function(e) {
        if (e.target.classList.contains('tag-panel-btn')) {
            setTimeout(() => {
                tagPanel.classList.remove('show');
                floatingBtn.setAttribute('aria-expanded', 'false');
            }, 300);
        }
    });
    
    document.addEventListener('click', function(e) {
        if (!e.target.closest('#copyGroup')) {
            closeSkillMenu();
        }

        if (!tagPanel.contains(e.target) && !floatingBtn.contains(e.target)) {
            if (tagPanel.classList.contains('show')) {
                tagPanel.classList.remove('show');
                floatingBtn.setAttribute('aria-expanded', 'false');
            }
        }
        
        if (!colorPaletteModal.contains(e.target) &&
            !e.target.closest('#textColorBtn') &&
            !e.target.closest('#bgColorBtn')) {
            closeColorPalette();
        }
        
        if (!rainbowModal.contains(e.target) &&
            !e.target.closest('#rainbowBtn')) {
            closeRainbowGenerator();
        }
    });

    // 点击遮罩关闭弹窗
    colorPaletteModal.addEventListener('click', function(e) {
        if (e.target === colorPaletteModal) closeColorPalette();
    });
    rainbowModal.addEventListener('click', function(e) {
        if (e.target === rainbowModal) closeRainbowGenerator();
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeColorPalette();
            closeRainbowGenerator();
            closeSkillMenu();
            if (tagPanel.classList.contains('show')) {
                tagPanel.classList.remove('show');
                floatingBtn.setAttribute('aria-expanded', 'false');
            }
        }

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