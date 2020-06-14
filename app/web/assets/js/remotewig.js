document.addEventListener("DOMContentLoaded", function() {
	if (window.navigator.standalone) {
		document.getElementById("messageArea").style.display = "none";
	}
	bitwig.initControls();
});

var port = new osc.WebSocketPort({
	url: "ws://10.0.0.2:8081"
});

var bitwig = {};
bitwig.localState = [];


port.on("bundle", function(oscBundle) {

	console.log("bundle received..." + oscBundle.packets[0].address);

	if (oscBundle.packets[0].address == "/track/position") {
		bitwig.renderTrackInfo(oscBundle);
	} else if (oscBundle.packets[0].address == "/device-slot/devices") {
		bitwig.renderSlotDevices(oscBundle);
	} else if (oscBundle.packets[0].address == "/remote-controls/pages") {
		bitwig.renderRemoteControls(oscBundle);
	}

	// $("#message").text(JSON.stringify(oscMessage, undefined, 2));
	// bitwig.parseMessage(oscMessage);
});


port.on("message", function(oscMessage) {
	// $("#message").text(JSON.stringify(oscMessage, undefined, 2));

	var currentMessage = oscMessage;
	console.log(">> bitwig.parseMessage: " + currentMessage.address);
	console.log(currentMessage.args);

	if (currentMessage.address == "/panel/meter") {
		bitwig.toggle("#pMeter", currentMessage.args[0]);
	} else if (currentMessage.address == "/panel/io") {
		bitwig.toggle("#pIo", currentMessage.args[0]);
	} else if (currentMessage.address == "/device/toggle") {
		bitwig.toggle("#dToggle", currentMessage.args[0]);
	} else if (currentMessage.address == "/device/detail") {
		bitwig.toggle("#dDetail", currentMessage.args[0]);
	} else if (currentMessage.address == "/device/expanded") {
		bitwig.toggle("#dExpanded", currentMessage.args[0]);
	} else if (currentMessage.address == "/device/remote-controls") {
		bitwig.toggle("#dRemoteControls", currentMessage.args[0]);
	} else if (currentMessage.address == "/application/play") {
		bitwig.toggle("#aPlay", currentMessage.args[0]);
	}

});

bitwig.toggle = function(button, onOff) {

	var el = document.querySelector(button);
	if (onOff == true) {
		el.classList.add("bActive");
	} else {
		el.classList.remove("bActive");
	};

};

var sendManual = function() {
	port.send({
		address: "/track",
		args: bitwig.localState
	});
};

bitwig.currentTrackName = function(oscMessage) {

	console.log(">> bitwig.currentTrackName");
	console.log(oscMessage.args[0]);

	var currentTrack = oscMessage;
	var trackName = oscMessage.args[0];
	var currentTrackEl = document.querySelector("#currentTrack");
	currentTrackEl.textContent = trackName;

};

bitwig.currentTrackColor = function(oscMessage) {

	console.log(">> bitwig.currentTrackColor");
	console.log(oscMessage.args[0]);
	console.log(oscMessage.args[1]);
	console.log(oscMessage.args[2]);

	var currentTrack = oscMessage;
	var trackRed = oscMessage.args[0];
	var trackGreen = oscMessage.args[1];
	var trackBlue = oscMessage.args[2];

	var strBegin = "rgb(";
	var strComma = ", ";
	var strEnd = ")";
	var strFull = strBegin.concat(trackRed, strComma, trackGreen, strComma, trackBlue, strEnd);
	console.log(strFull);

	var currentTrackEl = document.querySelector("#currentTrack");
	currentTrackEl.style.backgroundColor = strFull;

};

bitwig.renderTrackInfo = function(oscBundle) {
	// $("#message").text(JSON.stringify(oscBundle, null, 2));

	console.log(oscBundle);

	var trackPosition = oscBundle.packets[0].args[0];
	bitwig.localState[0] = trackPosition;

	var trackName = oscBundle.packets[1].args[0];
	console.log("track name is: " + trackName);
	var currentTrackEl = document.querySelector("#currentTrack");
	currentTrackEl.textContent = trackName;

	var trackColor = oscBundle.packets[2];
	console.log("track color is: " + trackColor);
	var trackRed = trackColor.args[0];
	var trackGreen = trackColor.args[1];
	var trackBlue = trackColor.args[2];
	var strBegin = "rgb(";
	var strComma = ", ";
	var strEnd = ")";
	var strFull = strBegin.concat(trackRed, strComma, trackGreen, strComma, trackBlue, strEnd);
	console.log(strFull);
	currentTrackEl.style.backgroundColor = strFull;

	var devices = oscBundle.packets[3].packets;
	console.log("devices inside this track:");
	console.log(devices);

	// var currentDeviceIndex = devices[0].args[0];
	// console.log("current device index is:");
	// console.log(currentDeviceIndex);

	// devices.splice(0,1);

	var devicesEl = document.querySelector("#devices");
	devicesEl.innerHTML = '';

	devices.forEach(function(value, index) {

		var isActive = value.packets[0].args[1];

		const device = {
			name: value.packets[0].args[0],
			index: index
		};

		const markupDevice = `
		<div>
			<button class="device${isActive ? ' deviceActive' : ''}" data-device-index="${device.index}">
				${device.name}
			</button>
			<span></span>
		</div>
		`;

		devicesEl.insertAdjacentHTML("beforeend", markupDevice);
		var deviceSlots = value.packets[1].packets;

		// console.log("device slots:");
		// console.log(deviceSlots);
		var deviceName = value.packets[0].args[0];
		// console.log(deviceSlots);

		deviceSlots.forEach(function(slotValue, slotIndex) {

			var nthChild = index + 1;
			var selectorString = "#devices div:nth-child(" + nthChild + ") span";
			// console.log("selectorString:" + selectorString);
			var selectorTest = document.querySelector(selectorString);
			// console.log("selectorTest.....: " + selectorTest.childElementCount);

			const slot = {
				deviceSlot: slotValue.args[0],
				slotIndex: slotIndex,
				index: index
			};

			const markupDeviceSlot = `
			<button class="deviceSlot" data-slot-name="${slot.deviceSlot}" data-slot-index="${slot.slotIndex}" data-parent-device-index="${slot.index}">
				${slot.deviceSlot}
			</button>
			`;

			selectorTest.insertAdjacentHTML("beforeend", markupDeviceSlot);

		});
	});

	document.querySelectorAll('.device').forEach(item => {
		item.addEventListener('click', event => {

			document.querySelectorAll('.device').forEach(item => {
				item.classList.remove("deviceActive");
			});
			document.querySelectorAll('.deviceSlot').forEach(item => {
				item.classList.remove("slotActive");
			});
			event.target.classList.add("deviceActive");

			bitwig.localState[1] = parseInt(event.target.getAttribute("data-device-index"));
			bitwig.localState[2] = -1;
			bitwig.localState[3] = -1;

			console.log("bitwig.localState prior to osc send");
			console.log(bitwig.localState[0]);
			console.log(bitwig.localState[1]);
			console.log(bitwig.localState[2]);
			console.log(bitwig.localState[3]);
			port.send({
				address: "/track",
				args: bitwig.localState
			});

		});
	});

	document.querySelectorAll('.deviceSlot').forEach(item => {
		item.addEventListener('click', event => {

			document.querySelectorAll('.device').forEach(item => {
				item.classList.remove("deviceActive");
			});
			document.querySelectorAll('.deviceSlot').forEach(item => {
				item.classList.remove("slotActive");
			});
			event.target.classList.add("slotActive");

			document.querySelectorAll('.deviceSlotDevice').forEach(item => {
				item.remove();
			});

			var deviceSlotIndex = parseInt(event.target.getAttribute("data-slot-index"));
			var parentDeviceIndex = parseInt(event.target.getAttribute("data-parent-device-index"));

			bitwig.localState[1] = parentDeviceIndex;
			bitwig.localState[2] = deviceSlotIndex;
			bitwig.localState[3] = 0;
			console.log("test begin");
			console.log(bitwig.localState[0]);
			console.log(bitwig.localState[1]);
			console.log(bitwig.localState[2]);
			console.log(bitwig.localState[3]);
			console.log("test end");

			// console.log("deviceSlotName is " + deviceSlotName );
			port.send({
				address: "/track",
				args: bitwig.localState
			});

		});
	});
};


bitwig.renderSlotDevices = function(oscBundle) {

	// console.log(oscBundle);
	// var deviceSlotDevicesReversed = oscBundle.packets;
	var deviceSlotDevices = oscBundle.packets;
	console.log(deviceSlotDevices);

	document.querySelectorAll('.deviceSlotDevice').forEach(item => {
		item.remove();
	});

	deviceSlotDevices.forEach(function(value, index) {

		// when there are no device slot devices the array is empty
		if (deviceSlotDevices[index].args[0] == null)
			return;

		var isActive = deviceSlotDevices[index].args[1];

		const slotDevice = {
			name: deviceSlotDevices[index].args[0],
			index: index
		};

		const markupSlotDevice = `
		<button class="deviceSlotDevice${isActive ? ' slotDeviceActive' : ''}" data-slot-device="${slotDevice.index}">
			${slotDevice.name}
		</button>
		`;

		var slotActive = document.querySelector(".slotActive");

		slotActive.parentElement.insertAdjacentHTML("beforeend", markupSlotDevice);

	});

	document.querySelectorAll('.deviceSlotDevice').forEach(item => {
		item.addEventListener('click', event => {

			document.querySelectorAll('.deviceSlotDevice').forEach(item => {
				item.classList.remove("deviceActive");
			});
			document.querySelectorAll('.deviceSlot').forEach(item => {
				item.classList.remove("slotDeviceActive");
			});
			event.target.classList.add("slotDeviceActive");

			var slotDeviceIndex = parseInt(event.target.getAttribute("data-slot-device"));

			bitwig.localState[3] = slotDeviceIndex;

			console.log("sending SLOT DEVICE");
			console.log(bitwig.localState[0]);
			console.log(bitwig.localState[1]);
			console.log(bitwig.localState[2]);
			console.log(bitwig.localState[3]);

			// console.log("deviceSlotName is " + deviceSlotName );
			port.send({
				address: "/track",
				args: bitwig.localState
			});

		});
	});

};

bitwig.renderRemoteControls = function(oscBundle) {

	var isActive = false;

	document.querySelectorAll('#bwRemoteControls button').forEach(item => {
		item.remove();
	});

	var pages = oscBundle.packets;
	console.log("moo");
	console.log(pages);


	var bwRemoteControlsEl = document.querySelector("#bwRemoteControls");
	if (pages.length > 6) {
		bwRemoteControlsEl.style.borderBottom = '5px solid #6e6e6e';
	} else {
		bwRemoteControlsEl.style.borderBottom = 'none';
	}

	pages.forEach(function(value, index) {

		var currentPage = value.args;
		isActive = currentPage[1];

		const page = {
			name: currentPage[0],
			index: index
		};

		const markupPage = `
		<button class="${isActive ? 'pageActive' : ''}" data-page="${page.index}">
			${page.name}
		</button>
		`;

		document.querySelector("#bwRemoteControls").insertAdjacentHTML("beforeend", markupPage);

	});

	document.querySelectorAll('#bwRemoteControls button').forEach(item => {
		item.addEventListener('click', event => {

			document.querySelectorAll('#bwRemoteControls button').forEach(item => {
				item.classList.remove("pageActive");
			});
			event.target.classList.add("pageActive");

			var selectedPage = parseInt(event.target.getAttribute("data-page"));
			port.send({
				address: "/remote-controls/select",
				args: selectedPage
			});

		});
	});
};

bitwig.initControls = function(oscMessage) {

	document.querySelector("#pDevices").addEventListener('click', event => {
		console.log("pDevices pressed");
		var banana = "yellow";
		port.send({
			address: "/panel/devices",
			args: banana
		});
	});

	document.querySelector("#pNotes").addEventListener('click', event => {
		console.log("pNotes pressed");
		var banana = "red";
		port.send({
			address: "/panel/notes",
			args: banana
		});
	});

	document.querySelector("#pMeter").addEventListener('click', event => {
		console.log("pMeter pressed");
		var banana = "green";
		port.send({
			address: "/panel/meter",
			args: banana
		});
	});

	document.querySelector("#pIo").addEventListener('click', event => {
		console.log("pIo pressed");
		var banana = "purple";
		port.send({
			address: "/panel/io",
			args: banana
		});
	});

	document.querySelector("#pInspector").addEventListener('click', event => {
		console.log("pInspector pressed");
		var banana = "cyan";
		port.send({
			address: "/panel/inspector",
			args: banana
		});
	});

	document.querySelector("#dToggle").addEventListener('click', event => {
		console.log("dToggle pressed");
		var banana = "cyan";
		port.send({
			address: "/device/toggle",
			args: banana
		});
	});

	document.querySelector("#dDetail").addEventListener('click', event => {
		console.log("dDetail pressed");
		var banana = "magenta";
		port.send({
			address: "/device/detail",
			args: banana
		});
	});

	document.querySelector("#dExpanded").addEventListener('click', event => {
		console.log("dExpanded pressed");
		var banana = "black";
		port.send({
			address: "/device/expanded",
			args: banana
		});
	});

	document.querySelector("#dRemoteControls").addEventListener('click', event => {
		console.log("dRemoteControls pressed");
		var banana = "grey";
		port.send({
			address: "/device/remote-controls",
			args: banana
		});
	});

	document.querySelector("#aPlay").addEventListener('click', event => {
		console.log("aPlay pressed");
		var banana = "metal";
		port.send({
			address: "/application/play",
			args: banana
		});
	});

};

port.open();