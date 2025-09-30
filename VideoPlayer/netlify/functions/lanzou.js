const axios = require('axios');
const { CookieJar } = require('tough-cookie');
const { HttpsProxyAgent } = require('https-proxy-agent');

// 配置相同的API列表
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

// 超时时间6秒
const TIMEOUT = 6000;

// 创建带Cookie的axios实例
const cookieJar = new CookieJar();
const axiosInstance = axios.create({
    jar: cookieJar,
    withCredentials: true,
    timeout: TIMEOUT,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Referer': 'https://www.lanzou.com/',
        'X-Requested-With': 'XMLHttpRequest'
    }
});

// 主解析函数
async function parseLanzouUrl(originalUrl, password = '') {
    let preferredApiIndex = getPreferredApiIndex();
    let triedIndices = new Set();
    let result = null;

    // 尝试首选API
    if (preferredApiIndex !== null) {
        result = await tryParseWithApi(preferredApiIndex, originalUrl, password);
        triedIndices.add(preferredApiIndex);
        
        if (result.success) {
            return {
                fastest: result,
                allResults: [result]
            };
        } else {
            removePreferredApi();
        }
    }

    // 随机尝试其他API
    while (triedIndices.size < LANZOU_API_LIST.length) {
        const availableIndices = LANZOU_API_LIST.map((_, index) => index)
            .filter(index => !triedIndices.has(index));
        
        const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
        result = await tryParseWithApi(randomIndex, originalUrl, password);
        triedIndices.add(randomIndex);
        
        if (result.success) {
            setPreferredApi(LANZOU_API_LIST[randomIndex].originalName);
            return {
                fastest: result,
                allResults: [result]
            };
        }
    }

    // 所有API都失败后的重试逻辑
    let retryCount = 0;
    const maxRetries = 2;
    
    while (retryCount < maxRetries) {
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

    // 最终失败
    return {
        fastest: null,
        allResults: LANZOU_API_LIST.map((api, index) => ({
            api: api.name,
            originalApi: api.originalName,
            url: null,
            time: 0,
            success: false,
            error: '所有API尝试失败'
        }))
    };
}

// 尝试使用指定API解析
async function tryParseWithApi(index, originalUrl, password) {
    const api = LANZOU_API_LIST[index];
    const startTime = Date.now();
    
    try {
        const params = {
            url: originalUrl,
            ...(password && { pwd: password }),
            ...api.params
        };

        // 使用AbortController实现超时
        const source = axios.CancelToken.source();
        const timeoutId = setTimeout(() => {
            source.cancel(`API请求超时 (${TIMEOUT}ms)`);
        }, TIMEOUT);

        const response = await axiosInstance.get(api.url, {
            params,
            cancelToken: source.token,
            // 可添加代理配置（如果需要）
            // httpsAgent: new HttpsProxyAgent('http://proxy.example.com:8080')
        });

        clearTimeout(timeoutId);
        const responseTime = Date.now() - startTime;

        // 解析响应数据
        const keys = api.responseKey.split('.');
        let downloadUrl = response.data;
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
            throw new Error('返回的链接无效');
        }
    } catch (error) {
        return {
            api: api.name,
            originalApi: api.originalName,
            url: null,
            time: Date.now() - startTime,
            success: false,
            error: axios.isCancel(error) ? error.message : error.response?.data?.message || error.message
        };
    }
}

// 本地存储相关函数
function getPreferredApiIndex() {
    const preferredApi = process.env.PREFERRED_API || null;
    if (preferredApi) {
        const index = LANZOU_API_LIST.findIndex(api => api.originalName === preferredApi);
        if (index !== -1) return index;
    }
    return null;
}

function setPreferredApi(apiOriginalName) {
    // 在实际环境中可以存储到数据库或配置文件
    process.env.PREFERRED_API = apiOriginalName;
}

function removePreferredApi() {
    delete process.env.PREFERRED_API;
}

// Netlify函数入口
exports.handler = async function(event, context) {
    const url = new URL(event.rawUrl);
    const targetUrl = url.searchParams.get("url");
    const password = url.searchParams.get("pwd") || '';
    const type = url.searchParams.get("type") || "json";

    if (!targetUrl) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                error: "缺少URL参数",
                usage: "?url=蓝奏云链接&pwd=密码(可选)&type=json|down(默认json)"
            }),
            headers: { "Content-Type": "application/json" }
        };
    }

    try {
        const { fastest, allResults } = await parseLanzouUrl(targetUrl, password);
        
        if (!fastest) {
            return {
                statusCode: 500,
                body: JSON.stringify({
                    success: false,
                    error: "所有API解析失败",
                    details: allResults
                }),
                headers: { "Content-Type": "application/json" }
            };
        }

        if (type.toLowerCase() === "down") {
            return {
                statusCode: 302,
                headers: {
                    "Location": fastest.url,
                    "X-Used-API": fastest.originalApi,
                    "X-Response-Time": `${fastest.time}ms`
                }
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify({
                success: true,
                original_url: targetUrl,
                direct_url: fastest.url,
                used_api: fastest.originalApi,
                response_time: fastest.time,
                all_apis_status: allResults
            }, null, 2),
            headers: { "Content-Type": "application/json" }
        };

    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                success: false,
                error: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            }),
            headers: { "Content-Type": "application/json" }
        };
    }
};
