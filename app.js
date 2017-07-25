const express = require('express');
const app = express();
const logger = require('./logger');

app.get('/', (req, res, next) => {
    logger.info(`接收到请求：${req.protocol}://${req.get('Host')}${req.url}`, req);
    logger.warn('这是一条警告', req);
    try {
        JSON.parse('test');
    } catch(e) {
        logger.error('JSON转换出错！', e, req);
    }

    res.set('Content-Type', 'text/html');
    res.end(`
    <html>
        <head>
            <title>Demo</title>
        </head>
        <body>
            <h2>chrome-extension-server-log</h2>
            <h3>node.js实现示例</h3>
            <h4>安装扩展后，按F12，在Server Log标签下查看服务器端日志</h4>
        </body>
    </html>
    `);
});

app.listen(3000);