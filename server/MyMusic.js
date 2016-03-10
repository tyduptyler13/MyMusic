"use strict";
//Includes
//const express = require('express');
//const socket = require('socket.io');
const crypto = require('crypto');
//const http = require('http');

//Prep
//const app = express();
//const server = http.Server(app);
//const io = socket(server);
const io = require('socket.io')(8880);

//Setup
//app.use('/', express.static(__dirname + '/../client'));

const rooms = {};
var userCount = 0;

class Room {

	constructor(name){
		this.users = [];
		this.chat = [];
		this.name = name;
		this.song = null;
	}

	addChat(chat) {
		this.chat.push(chat);

		if (this.chat.length > 50){
			this.chat.shift();
		}
	}

	addUser(user) {
		this.users.push(user);
	}

	removeUser(user) {
		this.users = this.users.splice(this.users.findIndex(user), 1);
	}

}

class Chat {
	constructor(user, message){
		this.user = user;
		this.message = message;
		this.edited = false; //If a privileged user modifies chat.
	}
}

class User {

	constructor(username){
		this.username = username;
		this.tripCode = null;
		this.lastMessage = null; //Future rate limiting.
	}

	static hexToAscii(str){
		var result = "";
		for (let x = 0; x + 1 < str.length; x += 2){
			result += String.fromCharCode(parseInt(str.substring(x, x+2), 16) % 94 + 32);
		}
		return result;
	}
	
	static createTripcode(value){
		const hash = crypto.createHash('sha1');
		hash.update(value, 'ascii');
		return User.hexToAscii(hash.digest('ascii'));
	}

	set tripCode(value){
		this.tripCode = '!!' + User.createTripcode(value + this.username);
	}

	get tripCode(){
		return this.tripCode;
	}

}

io.on('connection', function(socket) {

	userCount++;

	socket.emit('chat', 'SERVER: Connected.');

	socket.on('setId', function(data){
		socket.user = new User(data.username);
		if (data.tripCode){
			socket.user.tripCode = data.tripCode; 
		}
	});

	socket.on('join', function(data){
		if (socket.room){
			socket.leave(socket.room.name);
		}
		if (rooms[data.room]){
			socket.room = rooms[data.room];
		} else {
			socket.room = new Room(data.room);
			rooms.push(socket.room);
		}
		socket.join(socket.room.name);
		socket.broadcast.to(socket.room.name).emit('join', {user: socket.user});
		socket.emit('chat', 'SERVER: You have connected to ' + data.room);
	});

	socket.on('chat', function(message){
		socket.broadcast.to(socket.room.name).emit('chat', {user: socket.user, message: message});
		rooms[socket.room]
	});

	socket.on('disconnect', function(socket){
		//socket.broadcast.to(socket.room.name).emit('leave', {user: socket.user});
		//socket.room.removeUser(socket.user);
		userCount--;
	});

});

//Run
//app.listen(5455);

