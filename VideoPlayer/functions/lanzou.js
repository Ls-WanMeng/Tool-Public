const axios = require('axios');

exports.handler = async (event) => {
  const url = new URL(`https://example.com${event.rawUrl}`);
  const targetUrl = url.searchParams.get("lanzouwmurl");
  const debug = url.searchParams.get("debug");
  
  // 如果没有提供 URL 参数，返回使用说明
  if (!targetUrl) {
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8"
      },
      body: `
        <!DOCTYPE html>
        <html>
        <head>
          <title>蓝奏云直链下载工具</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              max-width: 800px; 
              margin: 50px auto; 
              padding: 20px; 
            }
            .container { 
              background: #f8f9fa; 
              padding: 30px; 
              border-radius: 10px; 
            }
            code { 
              background: #eee; 
              padding: 2px 5px; 
              border-radius: 3px; 
            }
            .example { 
              background: #e8f4f8; 
              padding: 15px; 
              border-left: 4px solid #007bff;
              margin: 15px 0;
            }
            .debug { 
              background: #fff3cd; 
              padding: 15px; 
              border-left: 4px solid #ffc107;
              margin: 15px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🔗 蓝奏云直链下载工具</h1>
            <p>使用方式：在URL后添加 <code>?url=你的蓝奏云链接</code></p>
            
            <div class="example">
              <strong>示例：</strong><br>
              <code>https://你的网站域名/.netlify/functions/lanzou?url=https://wwi.lanzoup.com/xxxxxxxx</code>
            </div>
            
            <p>📝 功能：</p>
            <ul>
              <li>自动解析蓝奏云分享链接</li>
              <li>直接重定向到文件下载</li>
            </ul>
            
            <div class="debug">
              <p>🔍 <strong>调试模式</strong>：添加 <code>&debug=1</code> 参数查看解析过程</p>
              <code>https://你的网站域名/.netlify/functions/lanzou?url=蓝奏云链接&debug=1</code>
            </div>
          </div>
        </body>
        </html>
      `
    };
  }

  try {
    // 解析蓝奏云链接
    const { finalUrl, logs } = await parseLanzouUrl(targetUrl);

    // 调试模式：显示解析过程
    if (debug) {
      return {
        statusCode: 200,
        headers: {
          "Content-Type": "text/html; charset=utf-8"
        },
        body: `
          <!DOCTYPE html>
          <html>
          <head>
            <title>蓝奏云解析调试模式</title>
            <style>
              body { 
                font-family: 'Courier New', monospace; 
                background: #000; 
                color: #00ff00; 
                padding: 20px; 
              }
              .log-entry { 
                margin: 10px 0; 
                padding: 5px; 
                border-left: 3px solid transparent; 
              }
              .info { border-left-color: #17a2b8; color: #17a2b8; }
              .success { border-left-color: #28a745; color: #28a745; }
              .warning { border-left-color: #ffc107; color: #ffc107; }
              .error { border-left-color: #dc3545; color: #dc3545; }
              .timestamp { 
                color: #6c757d; 
                font-size: 12px; 
                margin-right: 10px; 
              }
              .result { 
                background: #155724; 
                padding: 15px; 
                border-radius: 5px; 
                margin: 20px 0; 
              }
              .final-url { 
                color: #00ffff; 
                word-break: break-all; 
              }
              .action-buttons { 
                margin: 20px 0; 
              }
              button { 
                background: #007bff; 
                color: white; 
                border: none; 
                padding: 10px 15px; 
                border-radius: 5px; 
                cursor: pointer; 
                margin-right: 10px; 
              }
              button:hover { 
                background: #0056b3; 
              }
            </style>
          </head>
          <body>
            <h1>🔍 蓝奏云解析调试模式</h1>
            
            <div id="logs">
              ${logs.map(log => `
                <div class="log-entry ${log.type}">
                  <span class="timestamp">${log.time}</span> ${log.message}
                </div>
              `).join('')}
            </div>

            <div class="result">
              <h3>✅ 解析成功！</h3>
              <p><strong>最终直链：</strong></p>
              <p class="final-url">${finalUrl}</p>
            </div>

            <div class="action-buttons">
              <button onclick="window.open('${finalUrl}')">⬇️ 直接下载</button>
              <button onclick="window.location.href='${event.rawUrl.split('?')[0]}?url=${encodeURIComponent(targetUrl)}'">🚀 直接访问（非调试模式）</button>
              <button onclick="copyToClipboard('${finalUrl}')">📋 复制直链</button>
            </div>

            <script>
              function copyToClipboard(text) {
                navigator.clipboard.writeText(text).then(() => {
                  alert('已复制到剪贴板！');
                });
              }
            </script>
          </body>
          </html>
        `
      };
    }

    // 正常模式：直接重定向到下载链接
    return {
      statusCode: 302,
      headers: {
        "Location": finalUrl
      }
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "text/html; charset=utf-8"
      },
      body: \`
        <!DOCTYPE html>
        <html>
        <head>
          <title>解析失败</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              text-align: center; 
              padding: 50px; 
            }
            .error { 
              color: #dc3545; 
              background: #f8d7da; 
              padding: 20px; 
              border-radius: 5px; 
            }
            .debug-link { 
              color: #007bff; 
              text-decoration: underline; 
              cursor: pointer; 
            }
          </style>
        </head>
        <body>
          <h1>❌ 解析失败</h1>
          <div class="error">
            <p><strong>错误信息:</strong> ${error.message}</p>
            <p><strong>目标链接:</strong> ${targetUrl}</p>
          </div>
          <p>💡 请检查链接是否正确</p>
          <p>
            <a href="${event.rawUrl.split('?')[0]}">返回首页</a> | 
            <span class="debug-link" onclick="location.href=location.href + '&debug=1'">查看详细错误信息</span>
          </p>
        </body>
        </html>
      \`
    };
  }
};

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
  addLog(\`目标URL: \${targetUrl}\`, 'info');

  try {
    // 这里添加你的蓝奏云解析逻辑
    // 示例代码 - 需要根据实际API调整
    
    addLog('解析完成（示例）', 'success');
    const finalUrl = "https://example.com/parsed-url"; // 替换为实际解析结果
    
    return { finalUrl, logs };

  } catch (error) {
    addLog(\`解析失败: \${error.message}\`, 'error');
    throw error;
  }
}
