// lanzou.js - 蓝奏云直链解析 Netlify 函数（支持多种返回格式）

exports.handler = async function(event, context) {
    const url = new URL(event.rawUrl);
    const targetUrl = url.searchParams.get("lanzouwmurl");
    const type = url.searchParams.get("type") || "down";
    
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
                        type: "返回类型(可选: json/down/txt/video, 默认down)"
                    },
                    examples: [
                        `${url.origin}/.netlify/functions/lanzou?url=https://wwi.lanzoup.com/xxxxxxxx`,
                        `${url.origin}/.netlify/functions/lanzou?url=https://wwi.lanzoup.com/xxxxxxxx&type=json`,
                        `${url.origin}/.netlify/functions/lanzou?url=https://wwi.lanzoup.com/xxxxxxxx&type=txt`,
                        `${url.origin}/.netlify/functions/lanzou?url=https://wwi.lanzoup.com/xxxxxxxx&type=video`
                    ]
                }
            }, null, 2),
            headers: {
                "Content-Type": "application/json"
            }
        };
    }

    try {
        // 解析蓝奏云链接
        const finalUrl = await parseLanzouUrl(targetUrl);

        // 根据type参数返回不同格式
        switch (type.toLowerCase()) {
            case "json":
                return {
                    statusCode: 200,
                    body: JSON.stringify({
                        success: true,
                        original_url: targetUrl,
                        direct_url: finalUrl
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
                // 直接返回视频流，让浏览器内置播放器处理
                return {
                    statusCode: 302,
                    headers: {
                        "Location": finalUrl,
                        "Cache-Control": "no-cache",
                        "Content-Type": "video/mp4"
                    }
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
                original_url: targetUrl
            }, null, 2),
            headers: {
                "Content-Type": "application/json"
            }
        };
    }
}

// 解析蓝奏云链接的核心函数
async function parseLanzouUrl(targetUrl) {
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
