// lanzou.js - 蓝奏云直链解析 Netlify 函数（支持多种返回格式）

exports.handler = async function(event, context) {
    const url = new URL(event.rawUrl);
    const targetUrl = url.searchParams.get("lanzouwmurl");
    const type = url.searchParams.get("type") || "down";
    const apiSource = url.searchParams.get("api"); // 可选参数：指定API源
    
    // 如果没有提供 URL 参数，返回 JSON 格式的使用说明
    if (!targetUrl) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                error: "缺少URL参数",
                usage: {
                    description: "蓝奏云直链解析服务",
                    parameters: {
                        url: "蓝奏云分享链接(必填)",
                        type: "返回类型(可选: json/down/txt/video, 默认down)",
                        api: "API源(可选: local/api1, 默认随机)"
                    },
                    examples: [
                        `${url.origin}/.netlify/functions/lanzou?lanzouwmurl=链接2/xxxxxxxx`,
                        `${url.origin}/.netlify/functions/lanzou?lanzouwmurl=链接2/xxxxxxxx&type=json`,
                        `${url.origin}/.netlify/functions/lanzou?lanzouwmurl=链接2/xxxxxxxx&type=txt&api=api1`,
                        `${url.origin}/.netlify/functions/lanzou?lanzouwmurl=链接2/xxxxxxxx&type=video&api=local`
                    ]
                }
            }, null, 2),
            headers: {
                "Content-Type": "application/json"
            }
        };
    }

    try {
        let finalUrl;
        let usedApiSource = apiSource;
        
        // 如果指定了API源，直接使用指定的
        if (apiSource) {
            finalUrl = await parseWithSelectedAPI(targetUrl, apiSource);
        } else {
            // 随机选择API源，超时5秒后切换
            const result = await parseWithRandomAPI(targetUrl);
            finalUrl = result.url;
            usedApiSource = result.apiSource;
        }

        // 根据type参数返回不同格式
        switch (type.toLowerCase()) {
            case "json":
                return {
                    statusCode: 200,
                    body: JSON.stringify({
                        success: true,
                        original_url: targetUrl,
                        direct_url: finalUrl,
                        api_source: usedApiSource
                    }, null, 2),
                    headers: {
                        "Content-Type": "application/json"
                    }
                };
            
            case "txt":
                return {
                    statusCode: 200,
                    body: finalUrl,
                    headers: {
                        "Content-Type": "text/plain"
                    }
                };
            
            case "video":
                // 返回超简易HTML视频播放器
                const html = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>视频播放</title></head>
<body style="margin:0;background:#000;">
<video src="${finalUrl}" controls autoplay style="width:100%;height:100vh;">
</video>
</body>
</html>`;
                return {
                    statusCode: 200,
                    body: html,
                    headers: {"Content-Type": "text/html"}
                };
            
            case "down":
            default:
                return {
                    statusCode: 302,
                    headers: {
                        "Location": finalUrl,
                        "Cache-Control": "no-cache"
                    }
                };
        }

    } catch (error) {
        // 错误时总是返回JSON格式
        return {
            statusCode: 500,
            body: JSON.stringify({
                success: false,
                error: error.message,
                original_url: targetUrl,
                tried_apis: error.triedApis || []
            }, null, 2),
            headers: {
                "Content-Type": "application/json"
            }
        };
    }
}

// 随机选择API进行解析
async function parseWithRandomAPI(targetUrl) {
    const apis = ['local', 'api1'];
    const triedApis = [];
    const errors = [];
    
    // 随机打乱API顺序
    const shuffledApis = [...apis].sort(() => Math.random() - 0.5);
    
    for (const api of shuffledApis) {
        triedApis.push(api);
        try {
            const result = await Promise.race([
                parseWithSelectedAPI(targetUrl, api),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error(`API ${api} 请求超时`)), 5000)
                )
            ]);
            
            return {
                url: result,
                apiSource: api
            };
            
        } catch (error) {
            errors.push(`${api}: ${error.message}`);
            // 继续尝试下一个API
            continue;
        }
    }
    
    // 所有API都失败
    const error = new Error('所有解析API均失败');
    error.triedApis = triedApis;
    error.details = errors;
    throw error;
}

// 根据选择的API进行解析
async function parseWithSelectedAPI(targetUrl, apiSource) {
    switch (apiSource.toLowerCase()) {
        case 'api1':
            return await parseWithAPI1(targetUrl);
        case 'local':
        default:
            return await parseLanzouUrl(targetUrl);
    }
}

// API1 外部解析
async function parseWithAPI1(targetUrl) {
    // 使用API1进行解析
    const apiUrl = `https://api.example.com/lanzou/parse?url=${encodeURIComponent(targetUrl)}`;
    
    const response = await fetch(apiUrl, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json'
        },
        timeout: 5000
    });
    
    if (!response.ok) {
        throw new Error(`API1请求失败: ${response.status}`);
    }
    
    const data = await response.json();
    
    // 根据API1的实际返回格式进行调整
    if ((data.code !== undefined && data.code !== 0) || !data.data || !data.data.url) {
        throw new Error('API1解析失败');
    }
    
    return data.data.url;
}

// 原有的内部解析函数（local）
async function parseLanzouUrl(targetUrl) {
    try {
        // 1. 获取初始页面内容
        const page1Response = await fetch(targetUrl, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Linux; Android 10; Pixel 4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36",
                "Referer": "链接1"
            },
            timeout: 5000
        });
        
        if (!page1Response.ok) {
            throw new Error(`初始页面请求失败: ${page1Response.status}`);
        }

        const page1Html = await page1Response.text();

        // 提取下载链接
        const downUrlMatch = page1Html.match(/<a href="([^"]+)"[^>]*id="downurl"/i);
        if (!downUrlMatch) {
            throw new Error("无法从页面提取下载链接");
        }

        const downUrl = "链接2" + downUrlMatch[1];

        // 2. 获取第二页内容
        const page2Response = await fetch(downUrl, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Linux; Android 10; Pixel 4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36",
                "Referer": targetUrl
            },
            timeout: 5000
        });
        
        if (!page2Response.ok) {
            throw new Error(`第二页请求失败: ${page2Response.status}`);
        }

        const page2Html = await page2Response.text();

        // 提取变量
        const part1Match = page2Html.match(/(?:var\s+)?vkjxld\s*=\s*['"]([^'"]+)['"]/i);
        const part2Match = page2Html.match(/(?:var\s+)?hyggid\s*=\s*['"]([^'"]+)['"]/i);
        
        if (!part1Match || !part2Match) {
            throw new Error("无法提取URL参数");
        }

        const part1 = part1Match[1];
        const part2 = part2Match[1];

        return part1 + part2;

    } catch (error) {
        throw error;
    }
}

// 简单的fetch超时包装
function fetchWithTimeout(url, options = {}) {
    const { timeout = 5000, ...fetchOptions } = options;
    
    return Promise.race([
        fetch(url, fetchOptions),
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error('请求超时')), timeout)
        )
    ]);
}
