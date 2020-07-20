function TrackHandler(trackbank, cursorTrack) {

	this.trackbank = trackbank;
	this.cursorTrack = cursorTrack;

	this.devicesAmount = [];

	for (i = 0; i < this.trackbank.getSizeOfBank(); i++) {

		var track = this.trackbank.getItemAt(i);
		var vol = track.volume();
		vol.markInterested();
		vol.setIndication(true);

		var name = track.name();
		name.markInterested();

		var color = track.color();
		color.markInterested();

	}

	this.trackbank.followCursorTrack(this.cursorTrack);

	this.cursorTrack.name().addValueObserver(this.updateLocalState);
	this.cursorTrack.color().markInterested();
	this.cursorTrack.position().markInterested();

}

TrackHandler.prototype.updateLocalState = function() {

	// localState[0] = trackHandler.cursorTrack.position().get();
	// println("track POSITION is: " + localState[0]);

	var cursorTrackName = this.cursorTrack.name().get();
	for (i = 0; i < trackHandler.trackbank.getSizeOfBank(); i++) {

		var track = trackHandler.trackbank.getItemAt(i);
		var trackName = track.name().get();

		if(cursorTrackName == trackName){
			localState[0] = i;
		} 

	}

	host.scheduleTask(function() {
		deviceHandler.updateBrowserRoot();
	}, 50);
};


TrackHandler.prototype.selectTrack = function(trackPosition) {

	// println("track POSITION is: " + trackPosition);
	this.trackbank.getItemAt (trackPosition).select ();

};


TrackHandler.prototype.cursorTrackPositionSend = function() {

	// var trackPositionAPI = this.cursorTrack.position().get();
	// println("track name is: " + trackName);

	var cursorTrackName = this.cursorTrack.name().get();
	var trackPosition;
	for (i = 0; i < this.trackbank.getSizeOfBank(); i++) {

		var track = this.trackbank.getItemAt(i);
		var trackName = track.name().get();
		// println("track name is: " + trackName);
		if(cursorTrackName == trackName){
			trackPosition = i;
		} else {
			trackPosition = -1;
		}

	}

	// println("cursorTrack name is: " + cursorTrackName);
	// println("track position based on api: " + trackPositionAPI);
	println("track position based on calc: " + trackPosition);

	var oscArgs = [];
	oscArgs[0] = trackPosition;

	try {
		sender.sendMessage('/track/position', oscArgs);
	} catch (err) {
		println("error sending level: " + err);
	}

};

TrackHandler.prototype.cursorTrackNameSend = function() {

	var trackName = this.cursorTrack.name().get();
	// println("track name is: " + trackName);

	var oscArgs = [];
	oscArgs[0] = trackName;

	try {
		sender.sendMessage('/track/name', oscArgs);
	} catch (err) {
		println("error sending level: " + err);
	}

	host.showPopupNotification(trackName);

	// stuff like this does not work... because one has to go through the device bank to access the devices inside a track :(
	// var cursorTrackDevice1 = cursorTrack.getDevice (0).name ().get();
	// println("inside track name observer cursor track device 1: " + cursorTrackDevice1);

};

TrackHandler.prototype.tracksColorsSend = function() {

	// var cursorTrackPosition = this.cursorTrack.position().get();
	// println("POSITION: " + cursorTrackPosition);

	var cursorTrackName = this.cursorTrack.name().get();
	// println("NAME: " + cursorTrackName);

	println("before bundle start");
	sender.startBundle();

		var tracksColors = [];
		for (i = 0; i < this.trackbank.getSizeOfBank(); i++) {

			var track = this.trackbank.getItemAt(i);
			var trackColor = track.color().get();
			var trackName = track.name().get();

			var currentColorRed = trackColor.getRed255();
			var currentColorGreen = trackColor.getGreen255();
			var currentColorBlue = trackColor.getBlue255();

			tracksColors[i] = [];
			tracksColors[i][0] = currentColorRed;
			tracksColors[i][1] = currentColorGreen;
			tracksColors[i][2] = currentColorBlue;
			tracksColors[i][3] = trackName;

			// we can't use position until api bug is fixed
			if(cursorTrackName == trackName){
				tracksColors[i][4] = true;
			} else {
				tracksColors[i][4] = false;
			}

			// println("\ncurrentColor Red is: " + currentColorRed);
			// println("currentColor Green is: " + currentColorGreen);
			// println("currentColor Blue is: " + currentColorBlue);

			try {
				sender.sendMessage('/track/render', tracksColors[i]);
			} catch (err) {
				println("error sending level: " + err);
			}

		}

	sender.endBundle();
	println("after bundle end");

};

TrackHandler.prototype.cursorTrackColorSend = function() {

	var trackColor = this.cursorTrack.color().get();
	// println("track color is: " + trackColor);

	var currentColorRed = trackColor.getRed255();
	var currentColorGreen = trackColor.getGreen255();
	var currentColorBlue = trackColor.getBlue255();

	var oscArgs = [];
	oscArgs[0] = currentColorRed;
	oscArgs[1] = currentColorGreen;
	oscArgs[2] = currentColorBlue;

	try {
		sender.sendMessage('/track/color', oscArgs);
	} catch (err) {
		println("error sending level: " + err);
	}

};