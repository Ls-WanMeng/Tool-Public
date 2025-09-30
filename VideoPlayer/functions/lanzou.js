// lanzou.js - 蓝奏云直链解析 Netlify 函数

exports.handler = async function(event, context) {
    const url = new URL(event.rawUrl);
    const targetUrl = url.searchParams.get("url");
    const debug = url.searchParams.get("debug");
    
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
                        debug: "设置为1启用调试模式(可选)"
                    },
                    example: `${url.origin}/.netlify/functions/lanzou?url=https://wwi.lanzoup.com/xxxxxxxx`
                }
            }, null, 2),
            headers: {
                "Content-Type": "application/json"
            }
        };
    }

    try {
        // 解析蓝奏云链接
        const { finalUrl, logs } = await parseLanzouUrl(targetUrl);

        // 调试模式：返回详细的解析过程
        if (debug) {
            return {
                statusCode: 200,
                body: JSON.stringify({
                    success: true,
                    original_url: targetUrl,
                    direct_url: finalUrl,
                    debug_logs: logs
                }, null, 2),
                headers: {
                    "Content-Type": "application/json"
                }
            };
        }

        // 正常模式：返回直链信息
        return {
            statusCode: 200,
            body: JSON.stringify({
                success: true,
                original_url: targetUrl,
                direct_url: finalUrl
            }),
            headers: {
                "Content-Type": "application/json"
            }
        };

    } catch (error) {
        // 返回错误信息
        return {
            statusCode: 500,
            body: JSON.stringify({
                success: false,
                error: error.message,
                original_url: targetUrl
            }),
            headers: {
                "Content-Type": "application/json"
            }
        };
    }
}

// 解析蓝奏云链接的核心函数
async function parseLanzouUrl(targetUrl) {
    const logs = [];
    
    function addLog(message, type = 'info') {
        logs.push({
            time: new Date().toLocaleTimeString(),
            message,
            type
        });
    }

    addLog('开始解析蓝奏云链接', 'info');
    addLog(`目标URL: ${targetUrl}`, 'info');

    try {
        // 1. 获取初始页面内容
        addLog('步骤1: 获取初始页面', 'info');
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
        addLog('初始页面获取成功', 'success');

        // 提取下载链接
        const downUrlMatch = page1Html.match(/<a href="([^"]+)"[^>]*id="downurl"/i);
        if (!downUrlMatch) {
            throw new Error("无法从页面提取下载链接");
        }

        const downUrl = "https://wwi.lanzoup.com" + downUrlMatch[1];
        addLog(`提取到下载链接: ${downUrl}`, 'success');

        // 2. 获取第二页内容
        addLog('步骤2: 获取第二页内容', 'info');
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
        addLog('第二页获取成功', 'success');

        // 提取变量
        addLog('步骤3: 提取URL参数', 'info');
        const part1Match = page2Html.match(/(?:var\s+)?vkjxld\s*=\s*['"]([^'"]+)/i);
        const part2Match = page2Html.match(/(?:var\s+)?hyggid\s*=\s*['"]([^'"]+)/i);
        
        if (!part1Match || !part2Match) {
            throw new Error("无法提取URL参数");
        }

        const part1 = part1Match[1];
        const part2 = part2Match[1];
        addLog(`提取参数: vkjxld=${part1.substring(0, 20)}..., hyggid=${part2.substring(0, 20)}...`, 'success');

        const finalUrl = part1 + part2;
        addLog(`拼接最终URL: ${finalUrl}`, 'success');
        addLog('✅ 解析完成！', 'success');

        return { finalUrl, logs };

    } catch (error) {
        addLog(`解析失败: ${error.message}`, 'error');
        throw error;
    }
}
