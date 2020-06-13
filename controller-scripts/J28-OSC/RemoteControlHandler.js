function RemoteControlHandler (remoteControlsBank){

	this.remoteControlsBank = remoteControlsBank;

	var i;
	for (i = 0; i < this.remoteControlsBank.getParameterCount (); i++){
		this.remoteControlsBank.getParameter (i).markInterested ();
		this.remoteControlsBank.getParameter (i).setIndication (true);
	}

	this.remoteControlsBank.pageCount ().markInterested ();
	// this.remoteControlsBank.pageNames ().markInterested ();
	this.remoteControlsBank.selectedPageIndex ().markInterested ();

	this.remoteControlsBank.pageNames ().addValueObserver(remoteControlsPageNamesObserver);
	// this.remoteControlsBank.selectedPageIndex ().addValueObserver(remoteControlsPageNamesObserver);

}

RemoteControlHandler.prototype.selectParameter = function (parameterNum){
	this.remoteControlsBank.selectFirst ();
	var i;
	for (i = 0; i < parameterNum; i++)
		this.remoteControlsBank.selectNext ();
}

RemoteControlHandler.prototype.selectPage = function (pageIndex){

	var remoteControlsPagesNames = this.remoteControlsBank.pageNames ().get ();
	this.remoteControlsBank.selectFirst ();

	var i;
	for (i = 0; i < remoteControlsPagesNames.length; i++){

		println("remoteControlsPagesNames[i]: " + remoteControlsPagesNames[i]);
		if (i == pageIndex){
			return;
		} else {
			this.remoteControlsBank.selectNextPage (false);
		}

	}
}

RemoteControlHandler.prototype.sendPagesNames = function (){

	var remoteControlsPagesNames = this.remoteControlsBank.pageNames ().get ();
	var selectedPageIndex = this.remoteControlsBank.selectedPageIndex ().get ();

	sender.startBundle ();

		for (var p = 0; p < remoteControlsPagesNames.length; p++) {

			var currentPage = [];
			var isActive = null;

			if (p == selectedPageIndex){
				isActive = true;
			} else {
				isActive = false;					
			}

			currentPage[0] = remoteControlsPagesNames[p];
			currentPage[1] = isActive;

			try {
				sender.sendMessage('/remote-controls/pages', currentPage);
			} catch (err) {
				println("error sending level: " + err);
			}

		}

	sender.endBundle ();	

}