var querystring = require('querystring');

// For cmcd logging
var fs = require('fs');
var cmcdLogPath = '/var/log/nginx/cmcd.log';

function writeToLog(msg) {
    var dateTime = new Date().toLocaleString();
    var logLine = ('\n[' + dateTime + '] ' + msg);
    try {
        fs.appendFileSync(cmcdLogPath, logLine);
    } catch (e) {
        // do not log
    }
}

//
// Sample query: 
//   http://localhost:8080/cmcd-njs/bufferBasedRateControl/media/vod/bbb2/bbb.mpd?CMCD=bl%3D21300%2Cbs%2Cd%3D2000%2Csid%3D%226e2fb550-c457-11e9-bb97-0800200c9a66%22
// Dash obj uri:
//   '/media/vod/bbb2/bbb.mpd'
// Params string:
//   'bl=21300,bs,d=2000,sid="6e2fb550-c457-11e9-bb97-0800200c9a66"'
//
function bufferBasedRateControl(r) {
    writeToLog('');
    writeToLog('### New request: ' + r.uri + ' ###');
    writeToLog('args: ' + r.variables.args);
    var dashObjUri = r.uri.split('/cmcd-njs/bufferBasedRateControl')[1];
    function done(res) {
        r.return(res.status, res.responseBody);
    }

    // Retrieve requested Dash resource
    r.subrequest(dashObjUri, r.variables.args, done);

    r.finish();
}

//
// Triggered via bufferBasedRateControl.limit_rate setting in nginx.conf
//
function getBufferBasedRate(r) {
    writeToLog('getBufferBasedRate() triggered!');
    var paramsObj = processQueryArgs(r);

    // If required args are not present in query, skip rate control
    if (!('bl' in paramsObj) || !('com.example-bmx' in paramsObj) || !('com.example-bmn' in paramsObj) || !('ot' in paramsObj)) {
        writeToLog('- missing "bl", "com.example-bmx", "com.example-bmn" or "ot" params, ignoring rate limiting..');
        return 0;   // disables rate limiting
    }

    // If not video type, skip rate control
    if (paramsObj['ot'] != 'v' && paramsObj['ot'] != 'av') {
        writeToLog('- object is not video type, ignoring rate limiting..');
        return 0;   // disables rate limiting
    }

    // To configure
    // var maxCapacityBitsPerS = 20 * 1000 * 1000;     // bps

    var maxCapacityBitsPerS = 40 * 1000 * 1000;     // 10c_Cascade
    // var maxCapacityBitsPerS = 80 * 1000 * 1000;     // 20c_Cascade
    // var maxCapacityBitsPerS = 120 * 1000 * 1000;    // 30c_Cascade

    // var maxCapacityBitsPerS = 25 * 1000 * 1000;     // 4c_Cascade
    // var maxCapacityBitsPerS = 30 * 1000 * 1000;     // 8c_Cascade_v1
    // var maxCapacityBitsPerS = 40 * 1000 * 1000;     // 8c_Cascade
    // var maxCapacityBitsPerS = 60 * 1000 * 1000;     // 12c_Cascade
    // var maxCapacityBitsPerS = 108 * 1000 * 1000;    // 24c_Cascade
    // var maxCapacityBitsPerS = 144 * 1000 * 1000;    // 32c_Cascade
    // var maxCapacityBitsPerS = 168 * 1000 * 1000;    // 40c_Cascade
    // var maxCapacityBitsPerS = 180 * 1000 * 1000;    // 48c_Cascade


    // Determine speed for nginx's limit_rate variable
    var speed;                                              // bytes per s
    var maxCapacity = Math.round(maxCapacityBitsPerS / 8);  // convert to bytes per s for njs limit_rate
    var cMin = maxCapacity * 0.1;
    var cMax = maxCapacity * 0.9;
    var bMin = Number(paramsObj['com.example-bmn']);
    var bMax = Number(paramsObj['com.example-bmx']);
    var bufferLength = Number(paramsObj['bl']);
 
    var bStarvation = ('bs' in paramsObj && (paramsObj['bs'].includes('true')));
    writeToLog('- Args: bufferLength: ' + bufferLength + ', bMin: ' + bMin + ', bMax: ' + bMax + ', bStarvation: ' + bStarvation);

    // Case 1: If client buffer is in danger
    if (bufferLength < bMin || bStarvation) {
        speed = cMax;
        writeToLog('- Case 1: Client buffer is in danger, rate control speed: ' + speed);
    }

    // Case 2: If client buffer is in excess
    else if (bufferLength > bMax) {
        speed = cMin;
        writeToLog('- Case 2: Client buffer is in excess, rate control speed: ' + speed);
    }

    // Case 3: If client buffer is in cushion zone
    else {
        var bRange = bMax - bMin;
        var cRange = cMax - cMin;
        speed = Math.round(((1 - ((bufferLength - bMin) / bRange)) * cRange) + cMin);
        writeToLog('- Case 3: Client buffer is in cushion zone, rate control speed: ' + speed);
    }

    return speed;
}

//
// Process query args into Javascript object
//
function processQueryArgs(r) {
    var decodedQueryString = querystring.decode(r.variables.query_string);

    // For dash.js-cmcd version differences
    var cmcdKey;
    if (r.variables.query_string.includes('Common-Media-Client-Data'))
        cmcdKey = 'Common-Media-Client-Data';
    else cmcdKey = 'CMCD';

    var paramsArr = decodedQueryString[cmcdKey].split(',');
    var paramsObj = {};
    for (var i = 0; i < paramsArr.length; i++) {
        if (paramsArr[i].includes('=')) {
            var key = paramsArr[i].split('=')[0];
            var value = paramsArr[i].split('=')[1];
        } 
        else {  // e.g. `bs` key does not have a value in CMCD query arg format
            var key = paramsArr[i];
            var value = 'true';
        }
        paramsObj[key] = value;
    }
    
    return paramsObj;
}

//
// Sample query: 
//   http://localhost:8080/cmcd-njs/testProcessQuery?CMCD=bl%3D21300%2Csid%3D%226e2fb550-c457-11e9-bb97-0800200c9a66%22
//   http://localhost:8080/cmcd-njs/testProcessQuery?Common-Media-Client-Data=bl%3D21300%2Csid%3D%226e2fb550-c457-11e9-bb97-0800200c9a66%22
// Params string:
//   'bl=21300,sid="6e2fb550-c457-11e9-bb97-0800200c9a66"'
//
function testProcessQuery(r) {
    // Process Params string into Javascript object
    var decodedQueryString = querystring.decode(r.variables.query_string);

    // For dash.js-cmcd version differences
    var cmcdKey;
    if (r.variables.query_string.includes('Common-Media-Client-Data'))
        cmcdKey = 'Common-Media-Client-Data';
    else cmcdKey = 'CMCD';

    var paramsArr = decodedQueryString[cmcdKey].split(',');
    var paramsObj = {};
    for (var i = 0; i < paramsArr.length; i++) {
        if (paramsArr[i].includes('=')) {
            var key = paramsArr[i].split('=')[0];
            var value = paramsArr[i].split('=')[1];
        } 
        else {  // e.g. `bs` key does not have a value in CMCD query arg format
            var key = paramsArr[i];
            var value = 'true';
        }
        paramsObj[key] = value;
    }

    // Prints test output on browser for debugging
    r.status = 200;
    r.headersOut['Content-Type'] = 'text/plain; charset=utf-8';
    r.headersOut['Content-Length'] = 100;
    r.sendHeader();
    // r.send(JSON.stringify(decodedQueryString));
    for (var k in paramsObj) {
        r.send(k);
        r.send(' : ')
        r.send(paramsObj[k]);
        r.send('\n');
    }
    r.send('====================================================================================================');
    // End debugging

    r.finish();
}

//
// Sample query: 
//    http://localhost:8080/cmcd-njs/testRateControl/media/vod/bbb1/bbb.mpd?speed=vslow
//    http://localhost:8080/cmcd-njs/testRateControl/media/vod/bbb1/segment_bbb_4807.m4s?speed=slow
//
function testRateControl(r) {
    function done(res) {
        r.return(res.status, res.responseBody);
    }
    r.subrequest(r.uri.split('/cmcd-njs/testRateControl')[1], r.variables.args, done);
}

//
// Triggered via testRateControl.limit_rate setting in nginx.conf
// doc: http://nginx.org/en/docs/http/ngx_http_core_module.html#limit_rate
//
function getTestRate(r) {
    var decodedQueryString = querystring.decode(r.variables.query_string);
    var speedString = decodedQueryString.speed;

    // Determine speed for nginx's limit_rate variable
    var speed;
    switch (speedString) {
        case 'vslow':
            speed = 1000;
            break;
        case 'slow':
            speed = 256000;     // 256kBps
            break;
        case 'medium':
            speed = 542000;     // 542kBps
            break;
        case 'fast':
            speed = 1627000;    // 1627kBps
            break;
        default:
            speed = 0;          // disables rate limiting
            break;
    }
    return speed;
}


// Note: We need to add the function to nginx.conf file too for HTTP access
export default { bufferBasedRateControl, getBufferBasedRate, testProcessQuery, testRateControl, getTestRate };

