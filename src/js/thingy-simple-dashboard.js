import Thingy from "./vendor/thingy/index.js";

const thingy = new Thingy({logEnabled: true});
const temperatureElm = document.getElementById(`temperature-value`);
const humidityElm = document.getElementById(`humidity-value`);

const metricElms = {};

/**
* format a unit
* @returns {undefined}
*/
const formatUnit = function(unit) {
	let formattedUnit = unit;
	switch (unit.toLowerCase()) {
		case 'celsius':
			formattedUnit = '°C';
			break;
		case 'fahrenheit':
			formattedUnit = 'F';
			break;
	}
	return formattedUnit;
};


/**
* update a metric
* @returns {undefined}
*/
const updateMetric = function(metric, detail) {
	// console.log(detail);
	const elm = metricElms[metric];
	elm.value.textContent = detail.value;
	elm.unit.textContent = formatUnit(detail.unit);
};



/**
* handle temperature notification
* @returns {undefined}
*/
const temperatureHandler = function(e) {
	console.log(e);
	updateMetric('temperature', e.detail);
	// temperatureElm.textContent = e.detail.value;
};

/**
 * handle temperature notification
 * @returns {undefined}
 */
const humidityHandler = function(e) {
	console.log(e);
	updateMetric('humidity', e.detail);
	// humidityElm.textContent = e.detail.value;
};



/**
* start the thingy
* @returns {undefined}
*/
const start = async function(device) {
	try {
	  await device.connect();
	  device.addEventListener('temperature', temperatureHandler);
	  device.addEventListener('humidity', humidityHandler);
	  
	  await device.temperature.start();
	  await device.humidity.start();
	} catch (error) {
	  console.error(error);
	}
};


/**
* 
* @returns {undefined}
*/
const stop = async function(device) {
	try {
		await device.disconnect();
		device.removeEventListener('temperature', temperatureHandler);
	} catch(error)  {
		console.error(error);
	}
};


/**
* find the elements for the metrics and store them into metricElms variable
* @returns {undefined}
*/
const initMetricElements = function() {
	const metrics = ['temperature', 'humidity'];
	metrics.forEach((metric) => {
		const elm = document.querySelector(`[data-metric="${metric}"]`);
		const value = elm.querySelector('[data-value');
		const unit = elm.querySelector('[data-unit');

		metricElms[metric] = {
			value,
			unit
		};
	});
	console.log(metricElms);
};


/**
* 
* @returns {undefined}
*/
const initConnectScreen = function() {
	document.getElementById(`connect-btn`).addEventListener('click', async () => {
		start(thingy);
	});
	document.getElementById(`disconnect-btn`).addEventListener('click', async () => {
		stop(thingy);
	});
};



/**
* initialize all
* @param {string} varname Description
* @returns {undefined}
*/
const init = function() {
	initMetricElements();
	initConnectScreen();
};

// kick of the script when all dom content has loaded
document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init) : init();
