// 使Error对象支持JSON序列化
if (!('toJSON' in Error.prototype)) {
    Object.defineProperty(Error.prototype, 'toJSON', {
        value() {
            const alt = {};
            Object.getOwnPropertyNames(this).forEach(function (key) {
                alt[key] = this[key];
            }, this);

            return alt;
        },
        configurable: true,
        writable: true
    });
}

const logType = {
    info: 'info',
    warn: 'warn',
    error: 'error'
}

const timeStr = function() {
    const now = new Date();
    const year = now.getFullYear();
    let month = String(now.getMonth() + 1);
    month = month.length === 1 ? `0${month}` : month;
    let day = String(now.getDate());
    day = day.length === 1 ? `0${day}` : day;
    let hour = String(now.getHours());
    hour = hour.length === 1 ? `0${hour}` : hour;
    let minute = String(now.getMinutes());
    minute = minute.length === 1 ? `0${minute}` : minute;
    let second = String(now.getSeconds());
    second = second.length === 1 ? `0${second}` : second;
    let millisecond = String(now.getMilliseconds());
    if (millisecond.length === 1) {
        millisecond = `00${millisecond}`;
    } else if (millisecond.length === 2) {
        millisecond = `0${millisecond}`;
    }
    return `${year}-${month}-${day} ${hour}:${minute}:${second}.${millisecond}`;
}

const log = function (logType, args) {
    // 如果传入的参数多于 1 个，且最后一个参数是一个 IncomingMessage 对象
    var lastParam,
        currentHeader,
        updateHeader,
        msgArr,
        msgToSet;
    if (args.length > 1) {
        lastParam = args[args.length - 1];
        if (lastParam && lastParam.constructor && lastParam.constructor.name === 'IncomingMessage') {
            // 弹出末尾的 req 对象
            args.pop();
            // 线上环境排除
            if (process.env.NODE_ENV !== 'production') {
                // 响应头设置
                currentHeader = lastParam.res.get('X-Server-Log');
                msgArr = [{
                    time: timeStr(),
                    type: logType,
                    message: args
                }];
                if (currentHeader) {
                    updateHeader = JSON.parse(decodeURIComponent(currentHeader));
                    updateHeader.push(msgArr[0]);
                    msgToSet = encodeURIComponent(JSON.stringify(updateHeader));
                } else {
                    msgToSet = encodeURIComponent(JSON.stringify(msgArr));
                }
                // 响应头长度通常要做限制，如果大于30k就仅返回一行提示
                if (msgToSet.length > 30000) {
                    lastParam.res.set('X-Server-Log', encodeURIComponent(JSON.stringify([{
                        time: require('./date_format').asString(new Date()),
                        type: 'error',
                        message: ['日志太多，不支持直接展示，请登录服务器查看！']
                    }])));
                } else {
                    lastParam.res.set('X-Server-Log', msgToSet);
                }
            }
        }
    }
    console[logType](...args);
}

module.exports = {
    info(...args) {
        log(logType.info, args);
    },

    warn(...args) {
        log(logType.warn, args);
    },

    error(...args) {
        log(logType.error, args);
    }
}