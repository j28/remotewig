function DeviceHandler(cursorTrack, cursorDevice) {

	// println ("cursor device is yooo ");
	if (cursorTrack)
		this.cursorTrack = cursorTrack;

	this.cursorDevice = cursorDevice;

	this.listingInProgress = false;
	this.isNested = null;

	// this.cursorDevice.isEnabled ().markInterested ();
	// this.cursorDevice.isExpanded ().markInterested ();
	// this.cursorDevice.isWindowOpen ().markInterested ();

	this.cursorDevice.isEnabled().addValueObserver(cursorDeviceEnabledObserver);
	this.cursorDevice.isExpanded().addValueObserver(cursorDeviceDetailObserver);
	this.cursorDevice.isWindowOpen().addValueObserver(cursorDeviceExpandedObserver);
	this.cursorDevice.isRemoteControlsSectionVisible().addValueObserver(cursorDeviceRemoteControlsObserver);

	this.cursorDevice.slotNames().markInterested();
	this.cursorDevice.getCursorSlot().name().markInterested();

	deviceBank = cursorTrack.createDeviceBank(16);
	for (var i = 0; i < deviceBank.getSizeOfBank(); i++) {
		deviceBank.getDevice(i).name().markInterested();
		deviceBank.getDevice(i).slotNames().markInterested();
		deviceBank.getDevice(i).hasLayers().markInterested();
	}

	chainSelector = this.cursorDevice.createChainSelector();
	chainSelector.activeChainIndex().markInterested();
	chainSelector.chainCount().markInterested();
	chainSelector.exists().markInterested();

	this.layerBank = this.cursorDevice.createLayerBank(8);
	for (var i = 0; i < this.layerBank.getSizeOfBank(); i++) {
		this.layerBank.getItemAt(i).name().markInterested();
	}

	this.cursorDevice.name().addValueObserver(cursorDeviceNameObserver);
	// this.cursorDevice.position ().addValueObserver(cursorDevicePositionObserver);
	// this.cursorDevice.isNested ().addValueObserver(cursorDeviceNestedObserver);
	this.cursorDevice.isNested().markInterested();
	this.cursorDevice.name().markInterested();
	// this.cursorDevice.channel ().markInterested ();
	this.cursorDevice.position().markInterested();
}

DeviceHandler.prototype.cursorDeviceNested = function() {

	println("\ncurrentDevices isNested: " + this.isNested);

	this.isNested = this.cursorDevice.isNested().get();
	println("\nisNestedObserver is nested: " + this.isNested);

	if (this.isNested) {
		this.cursorDeviceIsRoot = false;
	} else {
		this.cursorDeviceIsRoot = true;
	}
	println("isNestedObserver cursor device is root: " + this.cursorDeviceIsRoot);
};

// triggered from inside device slot device
DeviceHandler.prototype.updateLocalState = function() {

	host.scheduleTask(function() {

		deviceHandler.cursorDeviceNested();

		if (deviceHandler.onHold == true) {

			var cursorDevicePosition = deviceHandler.cursorDevice.position().get();

			deviceHandler.newName = deviceHandler.cursorDevice.name().get();
			if (deviceHandler.originalName == deviceHandler.newName && deviceHandler.cursorDeviceIsRoot == true) {

				localState[1] = cursorDevicePosition;
				localState[2] = -2;
				localState[3] = -2;

			} else {

				localState[1] = cursorDevicePosition;

				println("\deviceHandler.newName is: " + deviceHandler.newName);

				localState[2] = browserState[2];

				println("slotName is: " + deviceHandler.deviceSlotList[r]);
				println('after select browserState[2]: ' + browserState[2]);
				println('after select browserState[3]: ' + browserState[3]);

				localState[3] = browserState[3];
				if (browserState[3] > -1) {
					deviceHandler.cursorDevice.selectDevice(deviceBank.getDevice(browserState[3]));
					localState[3] = browserState[3];
				}

			}
			host.scheduleTask(function() {
				deviceHandler.updateBrowserSlotDevices();
			}, 50);

			deviceHandler.onHold = false;
		}

		// var cursorDevicePosition = deviceHandler.cursorDevice.position ().get ();
		// deviceHandler.cursorDeviceNested();
		// // select root device
		// if(deviceHandler.cursorDeviceIsRoot == true){
		// 	localState[1] = cursorDevicePosition;
		// 	localState[2] = -1;
		// 	localState[3] = -1;
		// 	// println('after update, when root device selected: ' + localState[0]);
		// 	// println('after update, when root device selected: ' + localState[1]);
		// 	// println('after update, when root device selected: ' + localState[2]);
		// 	// println('after update, when root device selected: ' + localState[3]);
		// } else if (deviceHandler.cursorDeviceIsRoot == false ){
		// 	localState[1] = -2;
		// 	localState[2] = -2;
		// 	localState[3] = cursorDevicePosition;
		// 	// println('after update, when nested device selected: ' + localState[0]);
		// 	// println('after update, when nested device selected: ' + localState[1]);
		// 	// println('after update, when nested device selected: ' + localState[2]);
		// 	// println('after update, when nested device selected: ' + localState[3]);		
		// }

	}, 50);

};

// parsing the browser message
DeviceHandler.prototype.browserSelectDevice = function() {

	println('\n\n');

	// we have to select parent device first
	this.cursorDevice.selectParent();

	host.scheduleTask(function() {
		// println ("parent device name: " + deviceHandler.cursorDevice.name (). get());
		// println ("browser state: " + browserState[1]);

		// selecting the root device
		deviceHandler.cursorDevice.selectDevice(deviceBank.getDevice(browserState[1]));
		localState[1] = browserState[1];

		// localState[2] = -1;
		// localState[3] = -1;

		println('after select localState[0]: ' + localState[0]);
		println('after select localState[1]: ' + localState[1]);

		// select device inside device slot if this is what's coming from browser
		if (browserState[2] > -1) {
			host.scheduleTask(function() {
				println('ACTIVE slot is: ' + browserState[2]);

				// no reverse method so reversing manually
				deviceHandler.deviceSlotListReversed = deviceHandler.cursorDevice.slotNames().get();
				deviceHandler.deviceSlotList = [];
				if (deviceHandler.deviceSlotListReversed.length > 1) {
					deviceHandler.deviceSlotList[0] = deviceHandler.deviceSlotListReversed[1];
					deviceHandler.deviceSlotList[1] = deviceHandler.deviceSlotListReversed[0];
				} else {
					deviceHandler.deviceSlotList = deviceHandler.deviceSlotListReversed;
				}
				println("\ndeviceSlotList");
				println(deviceHandler.deviceSlotList[0]);
				println(deviceHandler.deviceSlotList[1]);

				if (deviceHandler.deviceSlotList.length > 0) {

					for (r = 0; r < deviceHandler.deviceSlotList.length; r++) {
						if (r == browserState[2]) {

							deviceHandler.originalName = deviceHandler.cursorDevice.name().get();
							println("\ndeviceHandler.originalName is: " + deviceHandler.originalName);

							deviceHandler.cursorDevice.selectFirstInSlot(deviceHandler.deviceSlotList[r]);

							deviceHandler.onHold = true;
						}

					}
				}

			}, 50);

		} else {

			deviceHandler.updateBrowserRoot();

		}

	}, 50);

};

DeviceHandler.prototype.selectChain = function(chainIndex) {

	var times;
	var selectChain = chainIndex;
	var activeChainIndex = chainSelector.activeChainIndex().get();
	// var chainCount = chainSelector.chainCount().get();
	// println("chainCount: " + chainCount);

	if (selectChain == activeChainIndex){
		return;
	} else if (selectChain > activeChainIndex){
		times = selectChain - activeChainIndex;
		for (var l = 0; l < times; l++) {
			chainSelector.cycleNext();
		}
	} else if (activeChainIndex > selectChain){
		times = activeChainIndex - selectChain;
		for (var l = 0; l < times; l++) {
			chainSelector.cyclePrevious();
		}
	}

};

// update devices and slots
DeviceHandler.prototype.updateBrowserRoot = function() {

	trackHandler.tracksColorsSend();

	host.scheduleTask(function() {
		deviceHandler.currentDeviceName = deviceHandler.cursorDevice.name().get();
		host.showPopupNotification(deviceHandler.currentDeviceName);

		sender.startBundle();

			println("start outer bundle...");
			trackHandler.cursorTrackPositionSend();
			trackHandler.cursorTrackNameSend();
			trackHandler.cursorTrackColorSend();

			// send top devices only
			sender.startBundle();

				for (var d = 0; d < 15; d++) {
					var deviceName = deviceBank.getDevice(d).name().get();
					if (deviceName) {

						println("\nlooping through device bank... index: " + d);
						var deviceSlotListReversed = deviceBank.getDevice(d).slotNames().get();
						var deviceSlotList = [];
						println("deviceSlotListReversed.length is: " + deviceSlotListReversed.length);
						if (deviceSlotListReversed.length > 1) {
							deviceSlotList[0] = deviceSlotListReversed[1];
							deviceSlotList[1] = deviceSlotListReversed[0];
						} else {
							deviceSlotList = deviceSlotListReversed;
						}

						sender.startBundle();

							var deviceNameArgs = [];
							deviceNameArgs[0] = deviceName;

							if (localState[1] == d) {
								deviceNameArgs[1] = true;
							} else {
								deviceNameArgs[1] = false;
							}
							println("localState[1] is: " + localState[1]);

							try {
								sender.sendMessage('/track/device', deviceNameArgs);
							} catch (err) {
								println("error sending level: " + err);
							}

							if (deviceSlotList.length > 0) {

								println("device slot List exists....");
								println("\nstart inner bundle...");
								sender.startBundle();
									for (r = 0; r < deviceSlotList.length; r++) {

										if (deviceSlotList[r]) {

											try {
												sender.sendMessage('/track/device/slots', deviceSlotList[r]);
											} catch (err) {
												println("error sending level: " + err);
											}
										}

									}
								sender.endBundle();
								println("inner bundle ended...");

							}

							var deviceIsChain = chainSelector.exists().get();
							println("deviceIsChain: " + deviceIsChain);
							if (deviceIsChain && d ==0){

								var chainCount = chainSelector.chainCount().get();
								println("chainCount: " + chainCount);
								var activeChainIndex = chainSelector.activeChainIndex().get();

								sender.startBundle();
									for (l = 0; l < chainCount; l++) {

										var isActive;
										if (l == activeChainIndex){
											isActive = true;
										} else {
											isActive = false;
										}

										var currentLayer = deviceHandler.layerBank.getItemAt(l);
										var currentLayerName = currentLayer.name().get();
										// println("currentLayerName: " + currentLayerName);

										var layerArgs = [];
										layerArgs[0] = currentLayerName;
										layerArgs[1] = isActive;
										// println("layerArgs[0]: " + layerArgs[0]);
										// println("layerArgs[1]: " + layerArgs[1]);

										try {
											sender.sendMessage('/track/device/layer', layerArgs);
										} catch (err) {
											println("error sending level: " + err);
										}

									}
								sender.endBundle();

							}

						sender.endBundle();

					}
				}
			sender.endBundle();

		sender.endBundle();

	}, 50);

};

// update device slot devices
DeviceHandler.prototype.updateBrowserSlotDevices = function() {


	println('after select localState[1]: ' + localState[1]);
	println('after select localState[2]: ' + localState[2]);
	println('after select localState[3]: ' + localState[3]);

	println('after select browserState[1]: ' + browserState[1]);
	println('after select browserState[2]: ' + browserState[2]);
	println('after select browserState[3]: ' + browserState[3]);


	host.scheduleTask(function() {
		deviceHandler.currentDeviceName = deviceHandler.cursorDevice.name().get();
		host.showPopupNotification(deviceHandler.currentDeviceName);
	}, 50);

	var slotDevices = [];

	sender.startBundle();

	deviceHandler.newName = deviceHandler.cursorDevice.name().get();
	if (deviceHandler.originalName != deviceHandler.newName) {

		for (var d = 0; d < 15; d++) {

			var currentSlotDevice = [];

			var deviceName = deviceBank.getDevice(d).name().get();
			var isActive = null;
			if (deviceName) {
				if (d == localState[3]) {
					isActive = true;
				} else {
					isActive = false;
				}

				slotDevices.push(deviceName);

				currentSlotDevice[0] = deviceName;
				currentSlotDevice[1] = isActive;

				try {
					sender.sendMessage('/device-slot/devices', currentSlotDevice);
				} catch (err) {
					println("error sending level: " + err);
				}

			}
		}

	} else {

		try {
			sender.sendMessage('/device-slot/devices', null);
		} catch (err) {
			println("error sending level: " + err);
		}

	}

	sender.endBundle();

};

DeviceHandler.prototype.deviceToggle = function() {

	this.cursorDevice.isEnabled().toggle();
	// this.deviceToggleUpdate ();

};

DeviceHandler.prototype.deviceToggleUpdate = function() {

	var onOff = this.cursorDevice.isEnabled().get();

	println("this.cursorDevice.isEnabled ().get(): " + onOff);
	var oscArgs = [];
	oscArgs[0] = onOff;

	try {
		sender.sendMessage('/device/toggle', oscArgs);
	} catch (err) {
		println("error sending level: " + err);
	}

};

DeviceHandler.prototype.deviceDetail = function() {

	this.cursorDevice.isExpanded().toggle();
	// this.deviceDetailUpdate ();

};

DeviceHandler.prototype.deviceDetailUpdate = function() {

	var onOff = this.cursorDevice.isExpanded().get();

	println("this.cursorDevice.isEnabled ().get(): " + onOff);
	var oscArgs = [];
	oscArgs[0] = onOff;

	try {
		sender.sendMessage('/device/detail', oscArgs);
	} catch (err) {
		println("error sending level: " + err);
	}

};

DeviceHandler.prototype.deviceExpanded = function() {

	this.cursorDevice.isWindowOpen().toggle();
	// this.deviceExpandedUpdate ();

};

DeviceHandler.prototype.deviceExpandedUpdate = function() {

	var onOff = this.cursorDevice.isWindowOpen().get();

	println("this.cursorDevice.isWindowOpen ().get(): " + onOff);
	var oscArgs = [];
	oscArgs[0] = onOff;

	try {
		sender.sendMessage('/device/expanded', oscArgs);
	} catch (err) {
		println("error sending level: " + err);
	}

};

DeviceHandler.prototype.deviceRemoteControls = function() {

	this.cursorDevice.isRemoteControlsSectionVisible().toggle();

};

DeviceHandler.prototype.deviceRemoteControlsUpdate = function() {

	var onOff = this.cursorDevice.isRemoteControlsSectionVisible().get();

	// println("this.cursorDevice.isRemoteControlsSectionVisible ().get(): " + onOff);
	var oscArgs = [];
	oscArgs[0] = onOff;

	try {
		sender.sendMessage('/device/remote-controls', oscArgs);
	} catch (err) {
		println("error sending level: " + err);
	}

};