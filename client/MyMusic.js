"use strict";

(function(){

	var player;

	Promise.all([
		new Promise(function(resolve, reject){
			$(function(){
				$('#chatBox').keypress(function(e){
					if (e.which === 13){
						handleChat();
					}
				});

				$('#chatButton').click(handleChat);

				resolve();
			});
		}), new Promise(function(resolve, reject){
			window.onYouTubeIframeAPIReady = resolve;
		})
	]).then(function(){
		player = new YT.Player('video', {
			playerVars: {controls: 0},
			height: $(window).height(),
			width: $(window).width()
		});

		$(window).resize(function(){
			player.setSize($(window).width(), $(window).height());
		});
		
	});

	//Events
	const socket = new io('//io.music.myuplay.com');

	socket.on('connect', function(){

		console.log("Success!");

		socket.emit('join', {room: 'default'});

		socket.on('play', function(data){
			if (data.id){
				if (!YT.loaded){
					setTimeout(function(){
						player.loadVideoById(data.id, (data.time || 0) + 2);
					}, 2000);
				} else {
					player.loadVideoById(data.id, data.time || 0);
				}
			} else {
				console.log("Failure to get next song.");
			}
		});

		socket.on('seek', function(data){
			if (data.time){
				player.seekTo(data.time, true);
			} else {
				console.log("Failed to seek to correct time");
			}
		});

	});

	var handleChat = function(){
		const text = $('#chatBox').val();
		$('#chatBox').val(''); //Clear

		if (text.startsWith('/')){ //Command
			if (/^\/play\s+[\w\d-]+$/.test(text)){
				socket.emit('queueSong', {id: text.split(/\s+/)[1]});
			} else {
				console.log("Unknown command");
			}
		} else {
			socket.emit('chat', text);
		}
	}

})();

/*ToolTipCode I tried to get working*/
$(document).ready(function() {
    $("body").tooltip({ selector: '[data-toggle=tooltip]' });
});

