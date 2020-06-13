function TrackHandler (trackbank, cursorTrack)
{

	this.trackbank = trackbank;
	this.cursorTrack = cursorTrack;

	this.devicesAmount = [];

	for (i = 0; i < this.trackbank.getSizeOfBank (); i++)
	{
		var track = this.trackbank.getItemAt (i);
		var vol = track.volume ();
		vol.markInterested ();
		vol.setIndication (true);

		var name = track.name ();
		name.markInterested ();
	}

	this.trackbank.followCursorTrack (this.cursorTrack);

	this.cursorTrack.name().addValueObserver(this.updateLocalState);
	this.cursorTrack.color().markInterested();
	this.cursorTrack.position().markInterested();

	// this.cursorTrack.position().addValueObserver(this.updateLocalState);
	// this.cursorTrack.name().addValueObserver(this.cursorTrackNameObserver);
	// this.cursorTrack.color().addValueObserver(this.cursorTrackColorObserver);
	// this.cursorTrack.getDevice (0).name ().get().markInterested();

}

TrackHandler.prototype.updateLocalState = function (){

	localState[0] = this.cursorTrack.position ().get();

	host.scheduleTask(function(){
		deviceHandler.updateBrowserRoot();
	},50);	
}


TrackHandler.prototype.selectTrack = function (){
	// this.trackbank.getItemAt (localState[0]).select ();
}


TrackHandler.prototype.cursorTrackPositionSend = function ()
{

	var trackPosition = this.cursorTrack.position().get();
	// println("track name is: " + trackName);

	var oscArgs = [];
	oscArgs[0] = trackPosition;

	try {
		sender.sendMessage('/track/position', oscArgs);
	} catch (err) {
		println("error sending level: " + err);
	}

}

TrackHandler.prototype.cursorTrackNameSend = function ()
{

	var trackName = this.cursorTrack.name().get();
	// println("track name is: " + trackName);

	var oscArgs = [];
	oscArgs[0] = trackName;

	try {
		sender.sendMessage('/track/name', oscArgs);
	} catch (err) {
		println("error sending level: " + err);
	}

	host.showPopupNotification( trackName );

	// stuff like this does not work... because one has to go through the device bank to access the devices inside a track :(
	// var cursorTrackDevice1 = cursorTrack.getDevice (0).name ().get();
	// println("inside track name observer cursor track device 1: " + cursorTrackDevice1);

}

TrackHandler.prototype.cursorTrackColorSend = function ()
{

	var trackColor = this.cursorTrack.color().get ();
	// println("track color is: " + trackColor);

	var currentColorRed = trackColor.getRed255 ();
	var currentColorGreen = trackColor.getGreen255 ();
	var currentColorBlue = trackColor.getBlue255 ();

	var oscArgs = [];
	oscArgs[0] = currentColorRed;
	oscArgs[1] = currentColorGreen;
	oscArgs[2] = currentColorBlue;

	try {
		sender.sendMessage('/track/color', oscArgs);
	} catch (err) {
		println("error sending level: " + err);
	}

}