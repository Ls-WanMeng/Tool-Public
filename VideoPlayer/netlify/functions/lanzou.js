

const axios = require('axios');

exports.handler = async (event, context) => {
  const url = new URL(event.rawUrl);
  const targetUrl = url.searchParams.get("lanzouwmurl");
  const debug = url.searchParams.get("debug");
  
  // 如果没有提供 URL 参数，返回使用说明
  if (!targetUrl) {
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        error: "缺少必要参数",
        usage: "请添加 ?lanzouwmurl=你的蓝奏云链接",
        example: "https://your-site.netlify.app/.netlify/functions/lanzou?lanzouwmurl=https://wwi.lanzoup.com/xxxxxxxx"
      })
    };
  }

  try {
    // 解析蓝奏云链接
    const { finalUrl, logs } = await parseLanzouUrl(targetUrl);

    // 调试模式：返回解析过程
    if (debug) {
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          success: true,
          original_url: targetUrl,
          final_url: finalUrl,
          logs: logs,
          download_url: finalUrl
        })
      };
    }

    // 正常模式：返回直接下载链接
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        success: true,
        original_url: targetUrl,
        download_url: finalUrl
      })
    };

  } catch (error) {
    // 返回错误信息
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        success: false,
        error: error.message,
        original_url: targetUrl
      })
    };
  }
};

// 解析蓝奏云链接的核心函数
async function parseLanzouUrl(targetUrl) {
  const logs = [];
  
  function addLog(message, type = 'info') {
    logs.push({
      time: new Date().toISOString(),
      message,
      type
    });
  }

  addLog('开始解析蓝奏云链接');
  addLog(`目标URL: ${targetUrl}`);

  try {
    // 1. 获取初始页面内容
    addLog('步骤1: 获取初始页面');
    const page1Response = await axios.get(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Linux; Android 10; Pixel 4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36",
        "Referer": "https://www.lanzou.com/"
      }
    });
    
    if (page1Response.status !== 200) {
      throw new Error(`初始页面请求失败: ${page1Response.status}`);
    }

    const page1Html = page1Response.data;
    addLog('初始页面获取成功', 'success');

    // 提取下载链接
    const downUrlMatch = page1Html.match(/<a href="([^"]+)"[^>]*id="downurl"/i);
    if (!downUrlMatch) {
      throw new Error("无法从页面提取下载链接");
    }

    const downUrl = "https://wwi.lanzoup.com" + downUrlMatch[1];
    addLog(`提取到下载链接: ${downUrl}`, 'success');

    // 2. 获取第二页内容
    addLog('步骤2: 获取第二页内容');
    const page2Response = await axios.get(downUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Linux; Android 10; Pixel 4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36",
        "Referer": targetUrl
      }
    });
    
    if (page2Response.status !== 200) {
      throw new Error(`第二页请求失败: ${page2Response.status}`);
    }

    const page2Html = page2Response.data;
    addLog('第二页获取成功', 'success');

    // 提取变量
    addLog('步骤3: 提取URL参数');
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
    addLog('解析完成', 'success');

    return { finalUrl, logs };

  } catch (error) {
    addLog(`解析失败: ${error.message}`, 'error');
    throw error;
  }
}
