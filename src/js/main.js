

// update service from query param "service"

const urlParams = new URLSearchParams(window.location.search);

if (urlParams.get('service')) {
	let $service;
	document.getElementById('aprico').addEventListener('aprico:main', (e) => {

		console.log('main event');
		$service = document.getElementById('ap-service');
		$service.value = urlParams.get('service');

		$service.dispatchEvent(new Event('blur'));

		document.getElementById('ap-pass').focus();

	}, {'once': true});
}


// Hide logo if query param "nologo"

if (urlParams.get('nologo')) {
	document.getElementById('aprico-logo').classList.add('xs-hide');
}


// render aprico

const apricoUi = require('aprico-ui');

apricoUi('#aprico');



// Display version table

let versionTree = apricoUi.version;

const VERSION = require('./version.js');

Object.assign(versionTree, {'aprico-pwa': VERSION});

let versionTable = JSON.stringify(
	apricoUi.version, 
	(key, value) => (typeof value === "string") ? " v" + value : value, 
	""
);

versionTable = versionTable.replace(/{|}|"/g, '');

if (document.getElementById('aprico-version')) document.getElementById('aprico-version').textContent = versionTable.replace(/,/g, "\r\n");



// add Service worker/offline support

if ('serviceWorker' in navigator) {
	//console.log('[SW]: service worker registration in progress.');
	navigator.serviceWorker.register('service-worker.js').then(function() {
		//console.log('[SW]: service worker registration complete.');
		document.getElementById('aprico-version').textContent += ' (offline support)'; 
	}, function() {
		console.log('[SW]: service worker registration failure.');
	});
} else {
	console.log('[SW]: service worker is not supported.');
}

