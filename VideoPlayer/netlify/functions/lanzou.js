// lanzou.js - 蓝奏云直链解析 Netlify 函数（多API支持）

exports.handler = async function(event, context) {
    const url = new URL(event.rawUrl);
    const targetUrl = url.searchParams.get("lanzouwmurl");
    const type = url.searchParams.get("type") || "down";
    const apiChoice = url.searchParams.get("api") || "auto";
    
    // 如果没有提供 URL 参数，返回 JSON 格式的使用说明
    if (!targetUrl) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                error: "缺少URL参数",
                usage: {
                    description: "蓝奏云直链解析服务（多API支持版）",
                    parameters: {
                        url: "蓝奏云分享链接(必填)",
                        type: "返回类型(可选: json/down/txt/video, 默认down)",
                        api: "API选择(可选: auto/local/api1/api2/api3, 默认auto)"
                    },
                    examples: [
                        `${url.origin}/.netlify/functions/lanzou?lanzouwmurl=https://wwi.lanzoup.com/xxxxxxxx`,
                        `${url.origin}/.netlify/functions/lanzou?lanzouwmurl=https://wwi.lanzoup.com/xxxxxxxx&type=json`,
                        `${url.origin}/.netlify/functions/lanzou?lanzouwmurl=https://wwi.lanzoup.com/xxxxxxxx&type=txt&api=api2`,
                        `${url.origin}/.netlify/functions/lanzou?lanzouwmurl=https://wwi.lanzoup.com/xxxxxxxx&type=video`
                    ],
                    available_apis: {
                        local: "本地解析API（内置解析逻辑）",
                        api1: "BugAPI (https://api.bugpk.com/api/lanzou)",
                        api2: "云智API (https://api.jkyai.top/API/lzypjx.php)",
                        api3: "看戏仔API (https://api.kxzjoker.cn/api/lanzou)"
                    }
                }
            }, null, 2),
            headers: {
                "Content-Type": "application/json"
            }
        };
    }

    try {
        let finalUrl;
        let usedApi = "unknown";
        
        // 根据API选择参数决定使用哪个解析方式
        switch (apiChoice.toLowerCase()) {
            case "local":
                finalUrl = await parseWithLocalApi(targetUrl);
                usedApi = "local";
                break;
                
            case "api1":
                finalUrl = await parseWithExternalApi(targetUrl, "api1");
                usedApi = "api1";
                break;
                
            case "api2":
                finalUrl = await parseWithExternalApi(targetUrl, "api2");
                usedApi = "api2";
                break;
                
            case "api3":
                finalUrl = await parseWithExternalApi(targetUrl, "api3");
                usedApi = "api3";
                break;
                
            case "auto":
            default:
                // 自动模式：先尝试本地API，失败后依次尝试其他API
                try {
                    finalUrl = await parseWithLocalApi(targetUrl);
                    usedApi = "local";
                } catch (localError) {
                    console.log("本地API解析失败，尝试外部API:", localError.message);
                    
                    // 尝试API1
                    try {
                        finalUrl = await parseWithExternalApi(targetUrl, "api1");
                        usedApi = "api1";
                    } catch (api1Error) {
                        console.log("API1解析失败:", api1Error.message);
                        
                        // 尝试API2
                        try {
                            finalUrl = await parseWithExternalApi(targetUrl, "api2");
                            usedApi = "api2";
                        } catch (api2Error) {
                            console.log("API2解析失败:", api2Error.message);
                            
                            // 尝试API3
                            try {
                                finalUrl = await parseWithExternalApi(targetUrl, "api3");
                                usedApi = "api3";
                            } catch (api3Error) {
                                console.log("API3解析失败:", api3Error.message);
                                throw new Error("所有API尝试均失败");
                            }
                        }
                    }
                }
                break;
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
                        used_api: usedApi
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
<p style="position:absolute;bottom:10px;left:10px;color:white;font-size:12px;">Used API: ${usedApi}</p>
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
                        "Cache-Control": "no-cache",
                        "X-Used-API": usedApi
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
                tried_apis: ["local", "api1", "api2", "api3"]
            }, null, 2),
            headers: {
                "Content-Type": "application/json"
            }
        };
    }
}

// 使用本地解析逻辑
async function parseWithLocalApi(targetUrl) {
    try {
        // 1. 获取初始页面内容
        const page1Response = await fetch(targetUrl, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Linux; Android 10; Pixel 4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36",
                "Referer": "https://www.lanzou.com/"
            }
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

        const downUrl = "https://wwi.lanzoup.com" + downUrlMatch[1];

        // 2. 获取第二页内容
        const page2Response = await fetch(downUrl, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Linux; Android 10; Pixel 4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36",
                "Referer": targetUrl
            }
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

// 使用外部API解析
async function parseWithExternalApi(targetUrl, apiName) {
    let apiUrl, params, responseKey;
    
    // 配置不同API的参数
    switch (apiName) {
        case "api1":
            apiUrl = "https://api.bugpk.com/api/lanzou";
            params = { type: "down" };
            responseKey = "data.url";
            break;
            
        case "api2":
            apiUrl = "https://api.jkyai.top/API/lzypjx.php";
            params = {};
            responseKey = "data.direct_url";
            break;
            
        case "api3":
            apiUrl = "https://api.kxzjoker.cn/api/lanzou";
            params = { type: "down" };
            responseKey = "data.url";
            break;
            
        default:
            throw new Error("未知的API名称");
    }
    
    try {
        const url = new URL(apiUrl);
        url.searchParams.append("url", targetUrl);
        
        // 添加额外参数
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                url.searchParams.append(key, value);
            });
        }
        
        const response = await fetch(url.toString(), {
            headers: {
                "User-Agent": "Mozilla/5.0 (Linux; Android 10; Pixel 4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36"
            }
        });
        
        if (!response.ok) {
            throw new Error(`${apiName}请求失败: ${response.status}`);
        }
        
        const data = await response.json();
        
        // 根据responseKey获取下载链接
        const keys = responseKey.split('.');
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
            return downloadUrl;
        } else {
            throw new Error(`${apiName}返回的链接无效`);
        }
    } catch (error) {
        throw error;
    }
}
