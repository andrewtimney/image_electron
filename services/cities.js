var filePath = "C:\\Users\\Andy\\Downloads\\cities1000\\citiesJSON.json";

var cities = require(filePath);

//console.log(cities);

exports.getCities = function(){
	return cities;
};