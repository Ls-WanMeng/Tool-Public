// lanzou.js - Netlify Function
exports.handler = async function(event, context) {
    const { url, type = "down" } = event.queryStringParameters;
    
    if (!url) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                error: "缺少URL参数",
                usage: "使用示例: /?url=蓝奏云链接&type=[json|down|txt|video]"
            }),
            headers: { "Content-Type": "application/json" }
        };
    }

    try {
        const finalUrl = await parseLanzouUrl(url);

        switch (type.toLowerCase()) {
            case "json":
                return {
                    statusCode: 200,
                    body: JSON.stringify({ 
                        success: true,
                        direct_url: finalUrl 
                    }),
                    headers: { "Content-Type": "application/json" }
                };
            
            case "txt":
                return {
                    statusCode: 200,
                    body: finalUrl,
                    headers: { "Content-Type": "text/plain" }
                };
            
            case "video":
                return {
                    statusCode: 200,
                    body: `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>蓝奏云视频播放器</title>
    <style>
        body { margin: 0; background: #000; }
        video { width: 100%; height: 100vh; }
    </style>
</head>
<body>
    <video controls autoplay>
        <source src="${finalUrl}" type="video/mp4">
        您的浏览器不支持视频播放
    </video>
</body>
</html>`,
                    headers: { "Content-Type": "text/html" }
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
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                success: false,
                error: error.message 
            }),
            headers: { "Content-Type": "application/json" }
        };
    }
}

async function parseLanzouUrl(targetUrl) {
    // 添加对蓝奏云域名的验证
    if (!targetUrl.includes('lanzou') && !targetUrl.includes('lanzoux')) {
        throw new Error("无效的蓝奏云链接");
    }

    const page1Response = await fetch(targetUrl, {
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Referer": "https://www.lanzou.com/"
        }
    });
    
    if (!page1Response.ok) {
        throw new Error(`页面请求失败: ${page1Response.status}`);
    }
    
    const page1Html = await page1Response.text();
    const downUrlMatch = page1Html.match(/<a href="(\/[^"]+)"[^>]*id="downurl"/i);
    
    if (!downUrlMatch) {
        throw new Error("无法从页面提取下载链接");
    }
    
    const downUrl = "https://wwi.lanzoup.com" + downUrlMatch[1];
    const page2Response = await fetch(downUrl, {
        headers: { 
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Referer": targetUrl 
        }
    });
    
    if (!page2Response.ok) {
        throw new Error(`下载页面请求失败: ${page2Response.status}`);
    }
    
    const page2Html = await page2Response.text();
    const part1 = page2Html.match(/var\s+vkjxld\s*=\s*['"]([^'"]+)['"]/i)?.[1];
    const part2 = page2Html.match(/var\s+hyggid\s*=\s*['"]([^'"]+)['"]/i)?.[1];
    
    if (!part1 || !part2) {
        throw new Error("无法提取下载参数");
    }
    
    return part1 + part2;
}