var querystring = require('querystring');

//
// Sample query: 
//   http://localhost:8080/cmcd
//
function hello(r) {
    r.status = 200;
    r.headersOut.foo = 1234;
    r.headersOut['Content-Type'] = 'text/plain; charset=utf-8';
    r.headersOut['Content-Length'] = 25;
    r.sendHeader();
    r.send('hello from nginx-');
    r.send('js-');
    r.send('cmcd!');

    r.finish();
}

//
// Sample query: 
//   http://localhost:8080/cmcd/testProcessQuery?CMCD=bl%3D21300%2Csid%3D%226e2fb550-c457-11e9-bb97-0800200c9a66%22
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
//   http://localhost:8080/cmcd/testRateControl
//
function testRateControl(r) {
    // Todo   
    r.status = 200;
    r.headersOut['Content-Type'] = 'text/plain; charset=utf-8';
    r.headersOut['Content-Length'] = 20;
    r.sendHeader();
    r.send('testRateControl TODO');

    r.finish();
}

export default { hello, testProcessQuery, testRateControl };