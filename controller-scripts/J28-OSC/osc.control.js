loadAPI(11);
load("polyfill.js");
load("TransportHandler.js");
load("PanelHandler.js");
load("TrackHandler.js");
load("DeviceHandler.js");
load("RemoteControlHandler.js");

// Remove this if you want to be able to use deprecated methods without causing script to stop.
// This is useful during development.
host.setShouldFailOnDeprecatedUse(true);

host.defineController("J28", "OSC", "0.1", "090e6d3a-d7f0-4371-b0c4-59363cedf35d");

var sender = null;
var isEngineOn = false;

function cursorDevicePositionObserver() {
	// deviceHandler.currentDevices();
}

function cursorDeviceNameObserver() {
	// the scheduling is needed because otherwise the isNested state is not updated prior to requesting it
	deviceHandler.updateLocalState();
}

function cursorDeviceNestedObserver() {
	deviceHandler.cursorDeviceNested();
}

function cursorDeviceEnabledObserver() {
	deviceHandler.deviceToggleUpdate();
}

function cursorDeviceDetailObserver() {
	deviceHandler.deviceDetailUpdate();
}

function cursorDeviceExpandedObserver() {
	deviceHandler.deviceExpandedUpdate();
}

function cursorDeviceRemoteControlsObserver() {
	deviceHandler.deviceRemoteControlsUpdate();
}

function applicationPlayObserver() {
	transportHandler.applicationPlayUpdate();
}

function remoteControlsPageNamesObserver() {
	remoteControlHandler.sendPagesNames();
}

function init() {

	localState = [];
	browserState = [];

	application = host.createApplication();
	mixer = host.createMixer();

	transportHandler = new TransportHandler(host.createTransport());

	panelHandler = new PanelHandler();

	cursorTrack = host.createCursorTrack("OSC_CURSOR_TRACK", "Cursor Track", 0, 0, true);
	trackHandler = new TrackHandler(host.createMainTrackBank(16, 0, 0), cursorTrack);

	var cursorDevice = cursorTrack.createCursorDevice("OSC_CURSOR_DEVICE", "Cursor Device", 0, CursorDeviceFollowMode.FOLLOW_SELECTION);
	deviceHandler = new DeviceHandler(cursorTrack, cursorDevice);

	remoteControlHandler = new RemoteControlHandler(cursorDevice.createCursorRemoteControlsPage(8));

	var osc = host.getOscModule();
	sender = osc.connectToUdpServer('127.0.0.1', 7400, null);


	// TODO: Perform further initialization here.
	println("initialized" +
		' - ' + host.getHostVendor() +
		' - ' + host.getHostProduct() +
		' - ' + host.getHostVersion()
	);

	var transport = host.createTransport();
	var position = transport.getPosition();
	// position is a SettableBeatTimeValue
	// file:///C:/Program%20Files/Bitwig%20Studio/resources/doc/control-surface/api/a00176.html

	// send osc for transport
	position.addValueObserver(function(v) {
		try {
			// sender.sendMessage('/transport/position', v);
			// testBundle();
		} catch (err) {
			println('error sending transport position: ' + err);
		}
	});

	// send osc for track
	var masterTrack = host.createMasterTrack(1);
	masterTrack.addVuMeterObserver(256, -1, false, function(v) {
		try {
			// sender.sendMessage('/track/master/meter', v);
		} catch (err) {
			println("error sending level: " + err);
		}
	});

	// Configure osc. AddressSpace is a term from the OSC spec. It means
	var oscModule = host.getOscModule();
	var as = oscModule.createAddressSpace();

	// handler (OscConnection source, OscMessage message)
	as.registerDefaultMethod(function(connection, msg) {
		println('- unregistered method: con - ' + connection);
		println('- unregistered method: msg typetag - ' + msg.getTypeTag());
		println('- unregistered method: msg adr pat- ' + msg.getAddressPattern());
		println('- unregistered method: msg args - ' + msg.getArguments()[0]);

	});

	as.registerMethod('/track',
		',ffff',
		'Select track',
		function(c, msg) {
			// println("c coming from browser is: " + c);
			browserState = msg.getArguments();
			// println('- track method: msg args - ' + msg.getArguments ()[0]);
			// println('- track method: msg args - ' + msg.getArguments ()[1]);
			// println('- track method: msg args - ' + msg.getArguments ()[2]);
			// println('- track method: msg args - ' + msg.getArguments ()[3]);

			println('- track method: msg args - ' + localState[0]);
			println('- track method: msg args - ' + localState[1]);
			println('- track method: msg args - ' + localState[2]);
			println('- track method: msg args - ' + localState[3]);

			deviceHandler.browserSelectDevice();

		});

	as.registerMethod('/track/select',
		',f',
		'Select track',
		function(c, msg) {
			// println("c coming from browser is: " + c);
			var trackPosition = msg.getFloat(0);
			trackHandler.selectTrack(trackPosition);

		});

	as.registerMethod('/panel/devices',
		',s',
		'Select device slot',
		function(c, msg) {
			panelHandler.togglePanelDevices();
			// println("c coming from browser is: " + c);
			// var someMsg = msg.getString(0);
			// println("msg is: " + someMsg);
		});

	as.registerMethod('/panel/notes',
		',s',
		'Toggle Panel Notes',
		function(c, msg) {
			panelHandler.togglePanelNotes();
		});

	as.registerMethod('/panel/meter',
		',s',
		'Toggle Panel Meter',
		function(c, msg) {
			panelHandler.togglePanelMeter();
		});

	as.registerMethod('/panel/io',
		',s',
		'Toggle Panel IO',
		function(c, msg) {
			panelHandler.togglePanelIo();
		});

	as.registerMethod('/panel/inspector',
		',s',
		'Toggle Panel Inspector',
		function(c, msg) {
			panelHandler.togglePanelInspector();
		});

	as.registerMethod('/device/toggle',
		',s',
		'Device Toggle',
		function(c, msg) {
			deviceHandler.deviceToggle();
		});

	as.registerMethod('/device/detail',
		',s',
		'Device Detail',
		function(c, msg) {
			deviceHandler.deviceDetail();
		});

	as.registerMethod('/device/expanded',
		',s',
		'Device Expanded',
		function(c, msg) {
			deviceHandler.deviceExpanded();
		});

	as.registerMethod('/device/remote-controls',
		',s',
		'Device Remote Controls',
		function(c, msg) {
			deviceHandler.deviceRemoteControls();
		});

	as.registerMethod('/application/play',
		',s',
		'Application Play',
		function(c, msg) {
			transportHandler.applicationPlay();
		});

	as.registerMethod('/remote-controls/select',
		',f',
		'Remote Controls Select',
		function(c, msg) {
			var pageIndex = msg.getFloat(0);
			remoteControlHandler.selectPage(pageIndex);
		});

	// as.registerMethod('/track',
	// 	',f',
	// 	'Select track',
	// 	function(c, msg){
	// 		// println("c coming from browser is: " + c);
	// 		var trackIndex = msg.getFloat(0);			
	// 		println("track index coming from browser is: " + trackIndex);
	// });

	//	as.registerMethod('/test/',
	//		'#bundle',
	//		'can i use a bundle?',
	//		function(c, msg) {
	//		println('bundle: ' + msg);
	//	});

	oscModule.createUdpServer(7500, as);

}

function flush() {
	// TODO: Flush any output to your controller here.
	// deviceHandler.currentDevices();
}

function exit() {

}