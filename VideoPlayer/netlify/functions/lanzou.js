<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PvZ2工具箱</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        *{margin:0;padding:0;box-sizing:border-box;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif}
        body{background:linear-gradient(135deg,#1a2a6c,#b21f1f,#fdbb2d);color:#333;line-height:1.6;min-height:100vh;padding:20px}
        .container{max-width:1200px;margin:0 auto}
        header{text-align:center;padding:40px 20px;color:white;margin-bottom:30px}
        header h1{font-size:3rem;margin-bottom:10px;text-shadow:2px 2px 4px rgba(0,0,0,0.3)}
        header p{font-size:1.1rem;max-width:700px;margin:0 auto;opacity:0.9}
        .app-icon{width:80px;height:80px;margin:0 auto 20px;border-radius:20px;background:linear-gradient(45deg,#4a90e2,#5e60ce);display:flex;align-items:center;justify-content:center;box-shadow:0 8px 20px rgba(0,0,0,0.3);overflow:hidden}
        .app-icon img{width:100%;height:100%;object-fit:contain;display:block}
        .version-card{background:rgba(255,255,255,0.95);border-radius:15px;padding:20px;margin-bottom:15px;box-shadow:0 5px 15px rgba(0,0,0,0.1);transition:transform 0.3s ease}
        .version-card:hover{transform:translateY(-3px);box-shadow:0 8px 20px rgba(0,0,0,0.15)}
        .version-card.latest{border:2px solid #27ae60;box-shadow:0 8px 20px rgba(39,174,96,0.2)}
        .version-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:15px;cursor:pointer}
        .version-title{display:flex;align-items:center;gap:10px}
        .version-badge{background:linear-gradient(45deg,#4a90e2,#5e60ce);color:white;padding:6px 15px;border-radius:50px;font-weight:bold;font-size:1.1rem}
        .version-badge.latest{background:linear-gradient(45deg,#27ae60,#2ecc71)}
        .version-badge.old{background:linear-gradient(45deg,#95a5a6,#7f8c8d)}
        .version-date{color:#666;font-size:1rem}
        .version-content{margin-top:15px;display:none}
        .version-features h3{margin-bottom:10px;color:#2c3e50;font-size:1.2rem;border-bottom:2px solid #eee;padding-bottom:5px}
        .feature-list{list-style-type:none}
        .feature-list li{padding:8px 0;padding-left:25px;position:relative;border-bottom:1px dashed #eee}
        .feature-list li:before{content:"\f00c";font-family:"Font Awesome 5 Free";font-weight:900;position:absolute;left:0;color:#27ae60}
        .version-footer{margin-top:15px;padding-top:15px;border-top:1px solid #f0f0f0;text-align:center}
        .download-btn{background:linear-gradient(45deg,#27ae60,#2ecc71);color:white;border:none;padding:10px 20px;border-radius:50px;cursor:pointer;font-weight:bold;display:inline-flex;align-items:center;gap:8px;text-decoration:none;margin-top:10px;transition:all 0.3s ease}
        .download-btn:hover{transform:translateY(-2px);box-shadow:0 5px 15px rgba(39,174,96,0.4)}
        .old-version-toggle{text-align:center;margin:15px 0}
        .toggle-btn{background:rgba(255,255,255,0.2);color:white;border:none;padding:8px 16px;border-radius:50px;cursor:pointer;font-weight:bold;transition:all 0.3s ease}
        .toggle-btn:hover{background:rgba(255,255,255,0.3)}
        footer{text-align:center;padding:20px;color:rgba(255,255,255,0.8);margin-top:20px}
        .loading{text-align:center;color:white;font-size:1.2rem;padding:40px}
        .error-message{background:rgba(255,255,255,0.9);border-radius:15px;padding:30px;margin-bottom:40px;text-align:center;color:#e74c3c;font-weight:bold}
        .author-info{color:rgba(255,255,255,0.7);font-size:0.9rem;margin-top:10px}
        .author-info a{color:#4a90e2;text-decoration:none;font-weight:bold}
        .api-status{font-size:0.8rem;color:#666;margin-top:5px}
        @media (max-width:768px){
            header h1{font-size:2rem}
            .version-header{flex-direction:column;align-items:flex-start;gap:10px}
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <div class="app-icon">
                <img src="icon.png" alt="PvZ2工具箱图标">
            </div>
            <h1>PvZToolsBox</h1>
            <p>便携插件工具 - 历史版本发布</p>
            <div class="author-info">作者: <a href="https://wmyj.netlify.app">挽梦遗酒</a></div>
        </header>

        <div id="versions-container">
            <div class="loading">
                <i class="fas fa-spinner fa-spin"></i> 正在加载...
            </div>
        </div>
        
        <footer>
            <p id="footer-text">© 2025 PvZ2工具箱 | 版本发布</p>
        </footer>
    </div>

    
</body>
<script>
    // 蓝奏云解析API列表
    const LANZOU_API_LIST = [
        {
            name: '1',
            originalName: 'BugAPI',
            url: 'https://api.bugpk.com/api/lanzou',
            params: { type: 'down' },
            responseKey: 'data.url'
        },
        {
            name: '2',
            originalName: '云智API',
            url: 'https://api.jkyai.top/API/lzypjx.php',
            responseKey: 'data.direct_url'
        },
        {
            name: '3',
            originalName: '看戏仔API',
            url: 'https://api.kxzjoker.cn/api/lanzou',
            params: { type: 'down' },
            responseKey: 'data.url'
        }
    ];

    // 本地存储键名
    const STORAGE_KEY = 'preferred_lanzou_api';

    // 超时时间（毫秒）
    const TIMEOUT_DURATION = 6000;

    // 从JSON文件加载版本数据
    async function loadVersionData() {
        try {
            const response = await fetch('LastVersion.json');
            
            if (!response.ok) {
                throw new Error(`HTTP错误! 状态码: ${response.status}`);
            }
            
            const data = await response.json();
            
            // 验证JSON数据格式
            if (!Array.isArray(data)) {
                throw new Error('JSON数据格式不正确，应该是一个数组');
            }
            
            // 按版本号排序 (降序)
            data.sort((a, b) => {
                return b.version.localeCompare(a.version, undefined, {numeric: true});
            });
            
            return data;
        } catch (error) {
            console.error('加载版本数据失败:', error);
            showError(`加载版本数据失败: ${error.message}`);
            return [];
        }
    }

    // 显示错误信息
    function showError(message) {
        const container = document.getElementById('versions-container');
        container.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i> ${message}
            </div>
        `;
    }

    // 获取首选API索引
    function getPreferredApiIndex() {
        const preferredApi = localStorage.getItem(STORAGE_KEY);
        if (preferredApi) {
            const index = LANZOU_API_LIST.findIndex(api => api.originalName === preferredApi);
            if (index !== -1) return index;
        }
        return null;
    }

    // 设置首选API
    function setPreferredApi(apiOriginalName) {
        localStorage.setItem(STORAGE_KEY, apiOriginalName);
    }

    // 移除首选API
    function removePreferredApi() {
        localStorage.removeItem(STORAGE_KEY);
    }

    // 解析蓝奏云链接
    async function parseLanzouUrl(originalUrl, password = '') {
        const preferredIndex = getPreferredApiIndex();
        let triedIndices = new Set();
        let result = null;
        
        // 如果有首选API，先尝试它
        if (preferredIndex !== null) {
            result = await tryParseWithApi(preferredIndex, originalUrl, password);
            triedIndices.add(preferredIndex);
            
            if (result.success) {
                return {
                    fastest: result,
                    allResults: [result]
                };
            } else {
                // 首选API失败，从本地存储中移除
                removePreferredApi();
            }
        }
        
        // 随机尝试其他API
        while (triedIndices.size < LANZOU_API_LIST.length) {
            // 获取未尝试的API索引
            const availableIndices = LANZOU_API_LIST.map((_, index) => index)
                .filter(index => !triedIndices.has(index));
            
            // 随机选择一个API
            const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
            result = await tryParseWithApi(randomIndex, originalUrl, password);
            triedIndices.add(randomIndex);
            
            if (result.success) {
                // 成功的API存入本地存储（使用原始名称）
                setPreferredApi(LANZOU_API_LIST[randomIndex].originalName);
                return {
                    fastest: result,
                    allResults: [result]
                };
            }
        }
        
        // 所有API都尝试失败，清除本地存储并重新尝试
        removePreferredApi();
        
        // 重新尝试所有API（最多尝试3次）
        let retryCount = 0;
        const maxRetries = 3;
        
        while (retryCount < maxRetries) {
            // 随机选择一个API再次尝试
            const randomIndex = Math.floor(Math.random() * LANZOU_API_LIST.length);
            result = await tryParseWithApi(randomIndex, originalUrl, password);
            
            if (result.success) {
                setPreferredApi(LANZOU_API_LIST[randomIndex].originalName);
                return {
                    fastest: result,
                    allResults: [result]
                };
            }
            
            retryCount++;
        }
        
        // 最终仍然失败
        return {
            fastest: null,
            allResults: Array.from({length: LANZOU_API_LIST.length}, (_, index) => ({
                api: LANZOU_API_LIST[index].name,
                url: null,
                time: 0,
                success: false,
                error: '所有API尝试失败'
            }))
        };
    }

    // 使用指定API尝试解析
    async function tryParseWithApi(index, originalUrl, password) {
        const api = LANZOU_API_LIST[index];
        const url = new URL(api.url);
        const startTime = performance.now();
        
        // 添加基本参数
        url.searchParams.append('url', originalUrl);
        if (password) {
            url.searchParams.append('pwd', password);
        }
        
        // 添加额外参数
        if (api.params) {
            Object.entries(api.params).forEach(([key, value]) => {
                url.searchParams.append(key, value);
            });
        }
        
        try {
            // 创建AbortController用于超时控制
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_DURATION);
            
            const response = await fetch(url.toString(), {
                signal: controller.signal
            });
            
            // 清除超时定时器
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`${api.originalName}请求失败: ${response.status}`);
            }
            
            const data = await response.json();
            const responseTime = performance.now() - startTime;
            
            // 根据responseKey获取下载链接
            const keys = api.responseKey.split('.');
            let downloadUrl = data;
            for (const key of keys) {
                if (downloadUrl && downloadUrl[key] !== undefined) {
                    downloadUrl = downloadUrl[key];
                } else {
                    downloadUrl = null;
                    break;
                }
            }
            
            if (downloadUrl && downloadUrl.startsWith('http')) {
                return {
                    api: api.name,
                    originalApi: api.originalName,
                    url: downloadUrl,
                    time: responseTime,
                    success: true
                };
            } else {
                throw new Error(`${api.originalName}返回的链接无效`);
            }
        } catch (error) {
            console.error(`${api.originalName}解析失败:`, error);
            return {
                api: api.name,
                originalApi: api.originalName,
                url: null,
                time: performance.now() - startTime,
                success: false,
                error: error.name === 'AbortError' ? '请求超时 (6秒)' : error.message
            };
        }
    }

    // 渲染版本卡片
    function renderVersionCards(versionData) {
        const container = document.getElementById('versions-container');
        const footer = document.getElementById('footer-text');
        
        if (versionData.length === 0) {
            container.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-info-circle"></i> 暂无版本数据
                </div>
            `;
            return;
        }
        
        // 更新页脚显示最新版本
        footer.textContent = `© 2025 PvZ2工具箱 丨 最新版本: v${versionData[0].version}`;
        
        // 清空容器
        container.innerHTML = '';
        
        // 添加最新版本卡片
        if (versionData.length > 0) {
            const latestVersion = versionData[0];
            const card = createVersionCard(latestVersion, true);
            container.appendChild(card);
            
            // 默认展开最新版本内容
            const content = card.querySelector('.version-content');
            content.style.display = 'block';
        }
        
        // 如果有旧版本，添加折叠按钮和旧版本卡片
        if (versionData.length > 1) {
            const toggleBtn = document.createElement('div');
            toggleBtn.className = 'old-version-toggle';
            toggleBtn.innerHTML = `
                <button class="toggle-btn" id="toggle-old-versions">
                    <i class="fas fa-chevron-down"></i> 显示历史版本
                </button>
            `;
            container.appendChild(toggleBtn);
            
            const oldVersionsContainer = document.createElement('div');
            oldVersionsContainer.id = 'old-versions-container';
            oldVersionsContainer.style.display = 'none';
            
            for (let i = 1; i < versionData.length; i++) {
                const card = createVersionCard(versionData[i], false);
                oldVersionsContainer.appendChild(card);
            }
            
            container.appendChild(oldVersionsContainer);
            
            // 添加切换按钮事件
            document.getElementById('toggle-old-versions').addEventListener('click', function() {
                const oldVersions = document.getElementById('old-versions-container');
                const icon = this.querySelector('i');
                
                if (oldVersions.style.display === 'none') {
                    oldVersions.style.display = 'block';
                    this.innerHTML = '<i class="fas fa-chevron-up"></i> 隐藏历史版本';
                } else {
                    oldVersions.style.display = 'none';
                    this.innerHTML = '<i class="fas fa-chevron-down"></i> 显示历史版本';
                }
            });
        }
        
        // 添加版本标题点击事件
        document.querySelectorAll('.version-header').forEach(header => {
            header.addEventListener('click', function() {
                const content = this.parentElement.querySelector('.version-content');
                if (content.style.display === 'none') {
                    content.style.display = 'block';
                } else {
                    content.style.display = 'none';
                }
            });
        });
    }

    // 创建版本卡片
    function createVersionCard(version, isLatest) {
        const card = document.createElement('div');
        card.className = 'version-card' + (isLatest ? ' latest' : '');
        
        // 格式化日期
        const formattedDate = formatDate(version.release_date);
        
        card.innerHTML = `
            <div class="version-header">
                <div class="version-title">
                    <div class="version-badge ${isLatest ? 'latest' : 'old'}">v${version.version}</div>
                    <div class="version-date">${formattedDate}</div>
                </div>
                <i class="fas fa-chevron-down"></i>
            </div>
            
            <div class="version-content">
                <div class="version-features">
                    <h3>更新内容</h3>
                    <ul class="feature-list">
                        ${(version.update_content || []).map(item => `<li>${item}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="version-footer">
                    ${version.update_url ? `
                    <a href="#" class="download-btn" data-url="${version.update_url}" data-pwd="${version.password || ''}">
                        <i class="fas fa-download"></i> 下载 v${version.version} (${version.file_size || '未知'})
                    </a>
                    <div class="api-status" id="status-${version.version}"></div>
                    ` : `
                    <button class="download-btn" disabled>
                        <i class="fas fa-ban"></i> 暂无下载
                    </button>
                    `}
                </div>
            </div>
        `;
        
        // 添加下载按钮事件
        if (version.update_url) {
            const btn = card.querySelector('.download-btn');
            btn.addEventListener('click', async function(e) {
                e.preventDefault();
                const lanzouUrl = this.getAttribute('data-url');
                const password = this.getAttribute('data-pwd');
                const statusElement = document.getElementById(`status-${version.version}`);
                
                statusElement.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 正在解析下载链接...';
                
                try {
                    const { fastest } = await parseLanzouUrl(lanzouUrl, password);
                    
                    if (fastest) {
                        statusElement.innerHTML = `<i class="fas fa-check-circle" style="color:#27ae60"></i>  获取 ${fastest.api}号 下载链接成功`;
                        // 延迟一下让用户看到成功消息
                        setTimeout(() => {
                            window.open(fastest.url, '_blank');
                        }, 500);
                    } else {
                        statusElement.innerHTML = '<i class="fas fa-times-circle" style="color:#e74c3c"></i> 获取下载链接失败，请稍后再试';
                    }
                } catch (error) {
                    statusElement.innerHTML = '<i class="fas fa-times-circle" style="color:#e74c3c"></i> 解析过程中出错，请稍后再试';
                }
            });
        }
        
        return card;
    }

    // 格式化日期为 YYYY年MM月DD日
    function formatDate(dateString) {
        if (!dateString) return '日期未知';
        
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return dateString;
            
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            const day = date.getDate();
            return `${year}年${month}月${day}日`;
        } catch (e) {
            return dateString;
        }
    }

    // 页面加载完成后加载并渲染版本数据
    document.addEventListener('DOMContentLoaded', async () => {
        const versionData = await loadVersionData();
        renderVersionCards(versionData);
    });
</script>

</html>
