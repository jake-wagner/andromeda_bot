#!/usr/bin/env node
// This is the sample handler
// Usage: node andromeda.js

// Required Modules
var botgram = require('./node_modules/botgram');
var request = require('request');
var fs = require('fs');

// Variables
var bot = botgram("429095116:AAHsO-qSf3uMY33rTSIpxnXP2JaYOiEcCCI");
var slaps = ["{0} went up in flames",
"{0} burned to death",
"{0} got smacked down",
"{0} tried to swim in lava",
"{0} suffocated in a wall",
"{0} drowned",
"{0} starved to death",
"{0} was pricked to death",
"{0} hit the ground too hard",
"{0} fell out of the world",
"{0} died",
"{0} blew up",
"{0} was killed by magic",
"{0} was slain by {1}",
"{0} was slain by {1}",
"{0} was shot by {1}",
"{0} was fireballed by {1}",
"{0} was pummeled by {1}",
"{0} was killed by {1}",
"{1} smacked {0}",
"{1} pile drived {0}",
"{0} tripped on grass",
"{0} has information leading to Hillary's arrest",
"{0} swam with the fishes",
"{0} got herpagonasyphilaids from {1}",
"{0} got their momma told on them",
"{0} fell on spikes",
"{0} got lost in the woods",
"{0} fell into a black hole"];

//----------Functions----------//

String.prototype.capitalize = function() {
  return this.charAt(0).toUpperCase() + this.slice(1)
}

//----------Admin Privileges----------//

bot.all(function (msg, reply, next) {
  if (msg.from.id === 94603261)
    msg.hasPrivileges = true;
  next();
});

//----------Commands----------//

bot.command('start', function (msg, reply, next) {
  console.log(`Received a /start command from ${msg.from.username}`);
});

bot.command('help', function (msg, reply, next) {
  reply.text("Hey! I'm a stupid bot who can't do a whole lot yet!");
});

bot.command('testReq', function(msg, reply, next) {
  if(!msg.hasPrivileges) {
    reply.text('Sorry, you do not have permission to execute this command.');
    return;
  }
  
  let mockingText = msg.args.raw;
  if(mockingText.length == 0) {
    return reply.text('Please provide some mocking text');
  }

  var propObj = {
      'template_id':'102156234',
      'username':'andromeda_bot',
      'password':'p5cZZ1v6!B',
      'boxes':[{
        "text": `${mockingText}`,
        "color": "#ffffff",
        "outline_color": "#000000"
      }]
    }

  request.get({ url: "https://api.imgflip.com/caption_image", qs: propObj, json: true}, (err, res, body) => {
    if (err) { return console.log(err); }
    
    reply.action("upload_photo");
    reply.photo(body.data.url);
  });
});

bot.command('testPriv', function(msg, reply, next) {
  if(!msg.hasPrivileges) {
    reply.text('Sorry, you are not privileged.');
    return;
  }
  reply.text('Yes, you can has all the privilege!');
});

bot.command('slap', function (msg, reply, next) {
  console.log(`/slap invoked by ${msg.from.username}`);

  let sender = msg.from.name;
  let receiver = msg.args.raw;
  let theSlap = slaps[Math.floor(Math.random() * slaps.length)];

  if(receiver.length == 0) {
    return reply.text('Who you tryna slap, bruh?');
  }

  reply.action('typing');
  reply.text(theSlap.replace('{0}', receiver).replace('{1}', sender));
});

bot.command('catfact', function(msg, reply, next) {
  console.log(`/catfact invoked by ${msg.from.username}`);

  request('https://catfact.ninja/fact', { json: true }, (err, res, body) => {
    if (err) { return console.log(err); }
    
    reply.action('typing');
    reply.text(body.fact);
  });
});

bot.command('8ball', function(msg, reply, next) {
  console.log(`/8ball invoked by ${msg.from.username}`);

  let question = msg.args.raw;
  if(question.length == 0) {
    return reply.text('What question would you like to ask?');
  }

  request (`https://8ball.delegator.com/magic/JSON/${question}`, { json: true }, (err, res, body) => {
    if(err) { return console.log(err); }
    
    reply.action('typing');
    reply.text(body.magic.answer);
  });
});

bot.command('pokedex', function(msg, reply, next) {
  console.log(`/pokedex invoked by ${msg.from.username}`);
  console.log(`Arguments: ${msg.args.raw}`);

  let args = msg.args.raw;
  if(args.length == 0) {
    return reply.text('Please provide a command');
  }

  let searchType = args.split(" ")[0];
  let searchCriteria = args.split(" ")[1];

  //query types api
  if(searchType == 'weakness'){
    request (`https://pokeapi.co/api/v2/type/${searchCriteria.toLowerCase()}`, { json: true }, (err, res, body) => {
    if(err) { return console.log(err); }

      //extract type names
      let weaknesses = body.damage_relations.double_damage_from.map(a => a.name);

      //capitalize array members
      let formattedWeaknesses = [];
      for(var x = 0; x < weaknesses.length; x++) {
        formattedWeaknesses.push(weaknesses[x].capitalize());
      }

      //format string & reply
      let strWeaknesses = `${searchCriteria.capitalize()} is weak to ${formattedWeaknesses.join(", ")}`;
      
      reply.action('typing');
      reply.text(strWeaknesses);
    });
    return;
  }
  
  //query types api
  if(searchType == 'strength') {
    request (`https://pokeapi.co/api/v2/type/${searchCriteria.toLowerCase()}`, { json: true }, (err, res, body) => {
      if(err) { return console.log(err); }

      //extract type names
      let strengths = body.damage_relations.double_damage_to.map(a => a.name);

      //capitalize array members
      let formattedStrengths = [];
      for(var x = 0; x < strengths.length; x++) {
        formattedStrengths.push(strengths[x].capitalize());
      }

      //format string & reply
      let strStrengths = `${searchCriteria.capitalize()} is super effective against ${formattedStrengths.join(", ")}`;
      
      reply.action('typing');
      reply.text(strStrengths);
    });
    return;
  }

  //query pokemon api
  if(searchType == 'entry') {
    request (`https://pokeapi.co/api/v2/pokemon/${searchCriteria.toLowerCase()}`, { json: true }, (err, res, body) => {
      if(err) { return console.log(err); }
      
      //get pokemon info
      let sprite = body.sprites.other['official-artwork'].front_default;
      let name = body.name.capitalize();
      let id = body.id;
      let height_inches = Math.round(body.height * 3.937); //decimeters to inches (2 decimals)
      let weight_lbs = Math.round(body.weight / 4.536); //hectograms to lbs (rounded)
      let typeObjs = body.types;
      
      //get formatted types
      types = [];
      for(var x = 0; x < typeObjs.length; x++) {
        types.push(typeObjs[x].type.name.capitalize());
      }

      //get formatted height and weight
      let strHeight = `${Math.floor(height_inches / 12)}' ${Math.round(height_inches % 12)}"`;
      let replyStr  = `No. ${id}\nName: ${name}\nType: ${types.join("/")}\nHeight: ${strHeight}\nWeight: ${weight_lbs} lbs.`;
      
      //reply with photo if sprite is available
      if(sprite != null){
        reply.action("upload_photo");
        reply.photo(sprite, replyStr);

      } else if(id == 835){
        let stream = fs.createReadStream('./yampy.jpg');
        reply.action('upload_photo');
        reply.photo(stream, replyStr);

      } else {
        reply.text(`[NO IMAGE]\n\n${replyStr}`);
      }
    });
    return;
  }

  //Command not found
  return reply.text('Sorry, that command does not exist');
});

bot.command('mock', function(msg, reply, next) {
  console.log(`/mock invoked by ${msg.from.username}`);

  let mockingText = msg.args.raw;
  if(mockingText.length == 0) {
    return reply.text('Please provide some mocking text');
  } 
    
  let casedText = "";
  let lower = true;
  for (let c of mockingText) {
    casedText += lower ? c.toLowerCase() : c.toUpperCase();
    if (c.match(/[a-z]/i)) lower = !lower;
  }

  var propObj = {
      'template_id':'102156234',
      'username':'andromeda_bot',
      'password':'p5cZZ1v6!B',
      'boxes':[{
        "text": `${casedText}`,
        "color": "#ffffff",
        "outline_color": "#000000"
      }]
    }

  request.get({ url: "https://api.imgflip.com/caption_image", qs: propObj, json: true}, (err, res, body) => {
    if (err) { return console.log(err); }
    
    reply.action("upload_photo");
    reply.photo(body.data.url);
  });
});