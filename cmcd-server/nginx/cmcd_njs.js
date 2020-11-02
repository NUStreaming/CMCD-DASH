var querystring = require('querystring');

//
// Sample query: 
//   http://localhost:8080/cmcd-njs/testProcessQuery?CMCD=bl%3D21300%2Csid%3D%226e2fb550-c457-11e9-bb97-0800200c9a66%22
// Params string:
//   'bl=21300,sid="6e2fb550-c457-11e9-bb97-0800200c9a66"'
//
function testProcessQuery(r) {
    // Process Params string into Javascript object
    var decodedQueryString = querystring.decode(r.variables.query_string);
    var paramsArr = decodedQueryString.CMCD.split(',');
    var paramsObj = {};
    for (var i = 0; i < paramsArr.length; i++) {
        var key = paramsArr[i].split('=')[0];
        var value = paramsArr[i].split('=')[1];
        paramsObj[key] = value;
    }

    // Prints test output on browser for debugging
    r.status = 200;
    r.headersOut['Content-Type'] = 'text/plain; charset=utf-8';
    r.headersOut['Content-Length'] = 100;
    r.sendHeader();
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
function getRate(r) {
    var decodedQueryString = querystring.decode(r.variables.query_string);
    var speedString = decodedQueryString.speed;

    // Determine speed for nginx's limit_rate variable
    var speed;
    switch (speedString) {
        case 'vslow':
            speed = 1000;
            break;
        case 'slow':
            speed = 256000;     // 256kbps
            break;
        case 'medium':
            speed = 542000;     // 542kbps
            break;
        case 'fast':
            speed = 1627000;    // 1627kbps
            break;
        default:
            speed = 'off';
            break;
    }
    return speed;
}
function testRateControl(r) {
    function done(res) {
        r.return(res.status, res.responseBody);
    }
    r.subrequest(r.uri.split('/cmcd-njs/testRateControl')[1], r.variables.args, done);
}

export default { testProcessQuery, getRate, testRateControl };