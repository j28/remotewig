function TransportHandler (transport)
{
	this.transport = transport;
	this.transport.isPlaying ().markInterested ();
	this.transport.isPlaying ().addValueObserver(applicationPlayObserver);

}


TransportHandler.prototype.applicationPlay = function (){

	this.transport.play();

};

TransportHandler.prototype.applicationPlayUpdate = function (){

	var onOff = this.transport.isPlaying ().get();

	println("this.cursorDevice.isRemoteControlsSectionVisible ().get(): " + onOff);
	var oscArgs = [];
	oscArgs[0] = onOff;

	try {
		sender.sendMessage('/application/play', oscArgs);
	} catch (err) {
		println("error sending level: " + err);
	};

};