// netlify/functions/mirror.js
const builtInLinks = [
    'https://gh.ptoe.cc/',
    'https://ghproxy.net/',
    'https://ghfast.top/',
    'https://tvv.tw/',
    'https://gh.ptoe.cc/',
    'https://ghproxy.net/',
    'https://bgithub.xyz/',
    'https://dgithub.xyz/',
    'https://ghfast.top/',
    'https://gh.llkk.cc/',
    'https://git.yylx.win/',
    'https://github.dpik.top/',
    'https://gh.dpik.top/',
    'https://ghfile.geekertao.top/',
    'https://gh.felicity.ac.cn/',
    'https://gh.927223.xyz/',
    'https://github-proxy.teach-english.tech/',
    'https://github-proxy.memory-echoes.cn/',
    'https://github.tbedu.top/',
    'https://ghm.078465.xyz/',
    'https://j.1lin.dpdns.org/',
    'https://j.1win.ggff.net/',
    'https://ghf.xn--eqrr82bzpe.top/',
    'https://jiashu.1win.eu.org/',
    'https://tvv.tw/',
    'https://gitproxy.127731.xyz/',
    'https://gh.catmak.name/',
    'https://hub.gitmirror.com/',
    'https://ghproxy.fangkuai.fun/',
    'https://gh.bugdey.us.kg/',
    'https://gh.wsmdn.dpdns.org/'
];

// 检查字符串是否为Base64编码
function isBase64(str) {
    try {
        return btoa(atob(str)) == str;
    } catch (err) {
        return false;
    }
}

// 测试单个链接
async function testLink(link, testUrl) {
    const fullLink = link + testUrl;
    const startTime = Date.now();

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        const response = await fetch(fullLink, {
            method: 'HEAD',
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok && response.status !== 404) {
            throw new Error(`HTTP ${response.status}`);
        }

        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        return {
            link: link,
            time: responseTime,
            success: true
        };

    } catch (error) {
        return {
            link: link,
            time: null,
            success: false,
            error: error.message
        };
    }
}

exports.handler = async function(event, context) {
    const params = event.queryStringParameters;
    const encodedUrl = params.url;
    
    if (!encodedUrl) {
        return {
            statusCode: 400,
            body: 'Missing url parameter. Usage: ?url=https://github.com/...'
        };
    }

    try {
        // 解析输入URL
        let inputContent = encodedUrl;
        try {
            if (isBase64(encodedUrl)) {
                inputContent = atob(encodedUrl);
            } else {
                inputContent = decodeURIComponent(encodedUrl);
            }
        } catch (e) {
            inputContent = encodedUrl;
        }

        // 确保URL格式正确
        if (!inputContent.startsWith('http')) {
            inputContent = 'https://github.com/' + inputContent.replace(/^https?:\/\/github\.com\//, '');
        }

        const testUrl = "https://raw.githubusercontent.com/Ls-WanMeng/imagebed/main/README.md";
        let fastestResult = null;

        console.log('开始测试镜像节点...');

        // 串行测试（避免并发过高被限制）
        for (const link of builtInLinks) {
            if (!link.trim()) continue;

            const result = await testLink(link, testUrl);
            
            if (result.success) {
                fastestResult = {
                    ...result,
                    fullLink: link + inputContent
                };
                console.log(`找到最快镜像: ${fastestResult.link}, 响应时间: ${fastestResult.time}ms`);
                break; // 找到第一个可用的就停止
            }
        }

        if (fastestResult) {
            // 返回302重定向
            return {
                statusCode: 302,
                headers: {
                    'Location': fastestResult.fullLink,
                    'Cache-Control': 'no-cache'
                },
                body: ''
            };
        } else {
            console.log('所有镜像测试失败，使用默认镜像');
            // 使用第一个有效镜像作为备用
            const validLink = builtInLinks.find(link => link.trim());
            if (validLink) {
                const fallbackLink = validLink + inputContent;
                return {
                    statusCode: 302,
                    headers: {
                        'Location': fallbackLink,
                        'Cache-Control': 'no-cache'
                    },
                    body: ''
                };
            } else {
                return {
                    statusCode: 503,
                    body: 'No available mirrors found'
                };
            }
        }

    } catch (error) {
        console.error('Function error:', error);
        return {
            statusCode: 500,
            body: 'Internal Server Error'
        };
    }
};