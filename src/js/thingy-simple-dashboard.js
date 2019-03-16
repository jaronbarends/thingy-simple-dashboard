import Thingy from "./vendor/thingy/index.js";

const thingy = new Thingy({logEnabled: true});
const temperatureElm = document.getElementById(`temperature-value`);
const humidityElm = document.getElementById(`humidity-value`);

const metricsToTrack = [];
const metricElms = {};

/**
* format a unit
* @returns {undefined}
*/
const formatUnit = function(unit) {
	let formattedUnit = unit || '';
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
const updateMetric = function(e) {
	console.log(e);
	const metric = e.type;
	const elm = metricElms[metric];
	let detail = e.detail;
	if (metric === 'gas') {
		detail = detail.eCO2;
	}
	elm.value.textContent = detail.value;
	elm.unit.textContent = formatUnit(detail.unit);
};



/**
* start the thingy
* @returns {undefined}
*/
const start = async function(device) {
	try {
		await device.connect();
		metricsToTrack.forEach( async (metric) => {
			device.addEventListener(metric.eventName, updateMetric);
			await device[metric.name].start();
		});
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
		metricsToTrack.forEach( async (metric) => {
			device.removeEventListener(metric.eventName, updateMetric);
		});
	} catch(error)  {
		console.error(error);
	}
};


/**
* find the elements for the metrics
* each metric's element MUST HAVE a data-metric attribute with its type name as value (i.e. temperature, gas). These names will be used to do device.[metricName].start, and to identify its event
* add metric to list of trackable metrics
* and store elm into metricElms variable
* @returns {undefined}
*/
const initMetrics = function() {
	const metrics = ['temperature', 'humidity'];
	const mElms = document.querySelectorAll(`[data-metric]`);
	mElms.forEach((elm) => {
		const name = elm.getAttribute('data-metric');
		const property = elm.getAttribute('data-metric-property');
		const eventName = elm.getAttribute('data-metric-eventname') || name;
		const value = elm.querySelector('[data-value');
		const unit = elm.querySelector('[data-unit');

		const metric = {
			name,
			property,
			eventName
		};

		metricsToTrack.push(metric);
		metricElms[name] = {
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
	initMetrics();
	initConnectScreen();
};

// kick of the script when all dom content has loaded
document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init) : init();
