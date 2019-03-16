import Thingy from "./vendor/thingy/index.js";

const thingy = new Thingy({logEnabled: true});
const metricsToTrack = new Map();


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
	const metric = metricsToTrack.get(e.type);
	const detail = metric.detailObject ? e.detail[metric.detailObject] : e.detail;
	const value = metric.detailValueProperty ? detail[metric.detailValueProperty] : detail.value;
	const unit = detail.unit;
	
	metric.elms.value.textContent = value;
	if (metric.elms.unit && unit) {
		metric.elms.unit.textContent = formatUnit(unit);
	}
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
	const mElms = document.querySelectorAll(`[data-metric]`);
	mElms.forEach((elm) => {
		const name = elm.getAttribute('data-metric');
		const detailObject = elm.getAttribute('data-metric-detail-object');// sometimes (e.g. for gas) detail has multiple objects; specify which one to pick
		const detailValueProperty = elm.getAttribute('data-metric-value-property');// sometimes (e.g. for battery) detail stores value in other property; specify which one to pick
		const eventName = elm.getAttribute('data-metric-eventname') || name;
		const value = elm.querySelector('[data-value');
		const unit = elm.querySelector('[data-unit');

		const metric = {
			name,
			eventName,
			detailObject,
			detailValueProperty,
			elms: {
				value,
				unit
			}
		};

		metricsToTrack.set(name, metric);
	});
};


/**
* 
* @returns {undefined}
*/
const initConnectButtons = function() {
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
	initConnectButtons();
};

// kick of the script when all dom content has loaded
document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init) : init();
