"use strict";

(function(){

	//Utility
	function Chat(){
		
	}

	

	//Events
	var socket = new io('//io.music.myuplay.com');

	socket.on('connect', function(){

		console.log("Success!");

	});

})();

