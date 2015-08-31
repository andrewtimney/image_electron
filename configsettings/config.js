var http = require('http');
var Promise = require('promise');

function getConfig(){
	
	return new Promise(function (fulfill, reject){
      try {
		http.request({
				host: 'localhost',
				method: 'GET',
				port: '8080',
				path: "/api/config"
			}, function(response) {
				//response.setEncoding("utf8");
				
				var str = '';
				  response.on('data', function (chunk) {
				    str += chunk;
				  });
				
				  response.on('end', function () {
				    fulfill(JSON.parse(str));
				  });
		}).end();
      } 
	  catch (ex) {
        reject(ex);
      }
  });
}

exports.getConfig = getConfig;