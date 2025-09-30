// 使用Node.js原生模块
const https = require('https');
const { URL } = require('url');

// 配置API列表
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

const TIMEOUT = 6000; // 6秒超时

// 封装原生fetch请求（Node.js 18+）
async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeout || TIMEOUT);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json, */*',
        ...options.headers
      }
    });
    
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error.name === 'AbortError' ? new Error(`请求超时 (${options.timeout || TIMEOUT}ms)`) : error;
  }
}

// 主解析函数
async function parseLanzouUrl(originalUrl, password = '') {
  const results = [];
  
  for (const api of LANZOU_API_LIST) {
    const startTime = Date.now();
    try {
      const apiUrl = new URL(api.url);
      apiUrl.searchParams.append('url', originalUrl);
      if (password) apiUrl.searchParams.append('pwd', password);
      
      // 添加API特定参数
      Object.entries(api.params || {}).forEach(([k, v]) => {
        apiUrl.searchParams.append(k, v);
      });

      const response = await fetchWithTimeout(apiUrl.toString(), { timeout: TIMEOUT });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      const downloadUrl = api.responseKey.split('.').reduce((obj, key) => obj?.[key], data);
      
      if (downloadUrl?.startsWith('http')) {
        return {
          fastest: {
            api: api.name,
            originalApi: api.originalName,
            url: downloadUrl,
            time: Date.now() - startTime,
            success: true
          },
          allResults: [...results, {
            api: api.name,
            originalApi: api.originalName,
            url: downloadUrl,
            time: Date.now() - startTime,
            success: true
          }]
        };
      }
      throw new Error('无效的下载链接');
    } catch (error) {
      results.push({
        api: api.name,
        originalApi: api.originalName,
        url: null,
        time: Date.now() - startTime,
        success: false,
        error: error.message
      });
    }
  }

  return {
    fastest: null,
    allResults: results
  };
}

// Netlify函数入口
exports.handler = async (event) => {
  const params = new URL(event.rawUrl).searchParams;
  const targetUrl = params.get('url');
  const password = params.get('pwd') || '';
  const type = params.get('type') || 'json';

  if (!targetUrl) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: "缺少URL参数",
        usage: "?url=蓝奏云链接&pwd=密码(可选)&type=json|down(默认json)"
      }),
      headers: { 'Content-Type': 'application/json' }
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
        headers: { 'Content-Type': 'application/json' }
      };
    }

    return type.toLowerCase() === 'down'
      ? {
          statusCode: 302,
          headers: {
            Location: fastest.url,
            'X-Used-API': fastest.originalApi
          }
        }
      : {
          statusCode: 200,
          body: JSON.stringify({
            success: true,
            original_url: targetUrl,
            direct_url: fastest.url,
            used_api: fastest.originalApi,
            response_time: fastest.time
          }, null, 2),
          headers: { 'Content-Type': 'application/json' }
        };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message
      }),
      headers: { 'Content-Type': 'application/json' }
    };
  }
};
