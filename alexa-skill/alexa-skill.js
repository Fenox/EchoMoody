/* This code has been generated from your interaction model

/* eslint-disable  func-names */
/* eslint quote-props: ["error", "consistent"]*/

// There are three sections, Text Strings, Skill Code, and Helper Function(s).
// You can copy and paste the contents as the code for a new Lambda function, using the alexa-skill-kit-sdk-factskill template.
// This code includes helper functions for compatibility with versions of the SDK prior to 1.0.9, which includes the dialog directives.



 // 1. Text strings =====================================================================================================
 //    Modify these strings and messages to change the behavior of your Lambda function
var speechOutput;
var reprompt;
var welcomeOutput = "Started mood recognition";
var welcomeReprompt = "sample re-prompt text";
 // 2. Skill Code =======================================================================================================
"use strict";
var http = require('https');
var Alexa = require('alexa-sdk');
var awsIot = require('aws-sdk');

const config = {};
config.IOT_BROKER_ENDPOINT      = "a3pyhd573085lu.iot.eu-west-1.amazonaws.com";  // also called the REST API endpoint
config.IOT_BROKER_REGION        = "eu-west-1";  // eu-west-1 corresponds to the Ireland Region.  Use us-east-1 for the N. Virginia region
config.IOT_THING_NAME = "raspi";

var APP_ID = 'amzn1.ask.skill.8d3abf65-3f57-4319-bde1-9dc0db3b52cf';  // TODO replace with your app ID (OPTIONAL).

var options = {
  "method": "PUT",
  "hostname": "api.meethue.com",
  "port": null,
  "path": "/v2/bridges/001788fffe200561/rvUtRIrROHuRz9ix7dz9SAFFrVCoE4AshVqhvh7D/groups/0/action",
  "headers": {
    "authorization": "Bearer t8qTOzy2SKghFlqMGLZx1wagiqoR",
    "content-type": "application/json"
  }
};

var optionsAzure = {
  "method": "POST",
  "hostname": "westus.api.cognitive.microsoft.com",
  "port": null,
  "path": "/emotion/v1.0/recognize?",
  "headers": {
    "Ocp-Apim-Subscription-Key": "0601955ea82d44c09b842a9e26f2b39b",
    "content-type": "application/json"
  }
};


var speechOutput = '';
var handlers = {
    'LaunchRequest': function () {
          this.emit(':ask', welcomeOutput + " How can I help you?");
    },
	'AMAZON.HelpIntent': function () {
        this.emit(':ask', "I can analyze your mood, play music and adjust your lights");
    },
    'AMAZON.CancelIntent': function () {
        speechOutput = 'bla';
        this.emit(':tell', speechOutput);
    },
    'AMAZON.StopIntent': function () {
        speechOutput = 'blub';
        this.emit(':tell', "stoping mood recognition");
    },
    'AMAZON.PauseIntent': function () {
        //this.emit(':tell', "Pausing music");
    },
    'AMAZON.ResumeIntent': function () {
        this.response.audioPlayer('play', 'string', 'https://api.spotify.com/v1/tracks/3n3Ppam7vgaVa1iaRUc9Lp', 'BQA_TuFX6e8sI9G_ohAprk-sKgPT7Sx0gPD3ZH-kFbLfiNo8hgNHnpJq_fs306Uo35LuS4suimmyq4AHXs-kY16ZOnpcXtFxDjGpDv1gp6DaLhqafNMHlaiX1lk4ugnkbLS7HpWSBg9-XHTKUZb9KF9kJxOuwymjENjXU-QgLW540gJM6pvtLh1CkEFgB3DvW5V0-UH_YsgmXbbGrt_mfpbl2oczW9zpgdZoIROHAamdGTqul3e6f-MRdR-4bp93', '', 0)
        .speak( "Lets play some music");
    },
    'SessionEndedRequest': function () {
        speechOutput = 'asd';
        //this.emit(':saveState', true);//uncomment to save attributes to db on session end
        this.emit(':tell', speechOutput);
    },
    "TakePicture": function () {
        /*var params = {
            "thingName" : config.IOT_THING_NAME,
            "payload" : JSON.stringify(
                { "topic": "sdk/test/Python"
                }
            )
        };*/
        var iotData = new awsIot.IotData({endpoint: config.IOT_BROKER_ENDPOINT});

        var params = {
                topic: 'sdk/test/Python',
                payload: 'blah',
                qos: 0,
                thingName : config.IOT_THING_NAME
                };
        iotData.publish(params, function(err, data){
        if(err){
            console.log(err);
        }
        /*else{
            console.log("success?");
            //context.succeed(event);
        }*/
    });
        var say = "took picture";
        updateShadow(params, status => {
            this.response.speak(say).listen(say);
            this.emit(':responseReady');
        });
    },
	"FaceAnalyzer": function () {
	    var self = this;
	    analyzePicture(function(chunks) {
            var body = Buffer.concat(chunks);
            //console.log(body.toString());
            var obj = JSON.parse(body); 
            var maxMood = JSON.parse(getMoodIndex(obj[0].scores));
            console.log(maxMood);
            self.emit(":tell", "you were" + Math.floor(maxMood.value * 100) + "%" + maxMood.mood.toString());
        });    
    },	
    "AdjustLights": function () {
        var self = this;
	    analyzePicture(function(chunks) {
            var body = Buffer.concat(chunks);
            //console.log(body.toString());
            var obj = JSON.parse(body); 
            var maxMood = JSON.parse(getMoodIndex(obj[0].scores));
            console.log(maxMood);
            
            var req = http.request(options, function (res) {
            var chunks = [];
            
            res.on("data", function (chunk) {
                chunks.push(chunk);
            });
            
            res.on("end", function () {
                var body = Buffer.concat(chunks);
                console.log(body.toString());
                self.emit(":tell", "I adjusted your lights according to your " + maxMood.mood.toString());
                
              });
            });
            req.write(getColor(maxMood));
            req.end();
            
        });
    },
	'Unhandled': function () {
        speechOutput = "The skill didn't quite understand what you wanted.  Do you want to try something else?";
        this.emit(':ask', speechOutput, speechOutput);
    }
};
function updateShadow(params, callback) {
    // update AWS IOT thing shadow
    awsIot.config.region = config.IOT_BROKER_REGION;

    

    var iotData = new awsIot.IotData({endpoint: config.IOT_BROKER_ENDPOINT});

    iotData.updateThingShadow(params, function(err, data)  {
        if (err){
            console.log(err);

            callback("not ok");
        }
        else {
            console.log("updated thing shadow " + config.IOT_THING_NAME + ' to state ' + paramsUpdate.payload);
            callback("ok");
        }

    });

}

function analyzePicture(_callback){
    //server url
    //var post_data = '{"url": "http://juli.pbum.de/image.jpg"}'
    //happy
    //var post_data = '{"url": "http://images.huffingtonpost.com/2016-05-27-1464381878-6932997-11HabitsofSupremelyHappyPeopleHP.jpg"}'
    //sad
    var post_data = '{"url": "https://www.askideas.com/wp-content/uploads/2016/11/Funny-Sad-Baby-Face-Photo.jpg"}'
    //anger
    //var post_data = '{"url": "http://i2.cdn.cnn.com/cnnnext/dam/assets/161107120239-01-trump-parry-super-169.jpg"}'
    	//any intent slot variables are listed here for convenience
    var req = http.request(optionsAzure, function (res) {
     var chunks = [];
        
    res.on("data", function (chunk) {
        chunks.push(chunk);
     });
        
    res.on("end", function () {
        _callback(chunks);   
      });
    });
    req.write(post_data)
    req.end(); 
}

function getColor(mood) {
    console.log(mood.mood.toString());
    if (mood.mood.toString() === "anger") {
        //green
        return JSON.stringify({xy:[0.4,0.5], on: true });
    } else if (mood.mood.toString() === "sadness") {
        //orange
        return JSON.stringify({xy:[0.55,0.38], on: true });
    } else if (mood.mood.toString() === "happiness") {
        //blue
        return JSON.stringify({xy:[0.28,0.15], on: true });
    }
    return JSON.stringify({xy:[0.33,0.33], on: true });
}

function getMoodIndex(mood) {
    var maxMoodValue = 0;
    var maxMoodText = 0;
    if (mood.anger > maxMoodValue) {
        maxMoodValue = mood.anger;
        maxMoodText = "anger";
    } if (mood.contempt > maxMoodValue) {
        maxMoodValue = mood.contempt;
        maxMoodText = "contempt";
    } if (mood.disgust > maxMoodValue) {
        maxMoodValue = mood.disgust;
        maxMoodText = "disgust";
    } if (mood.fear > maxMoodValue) {
        maxMoodValue = mood.fear;
        maxMoodText = "fear";
    } if (mood.happiness > maxMoodValue) {
        maxMoodValue = mood.happiness;
        maxMoodText = "happiness";
    } if (mood.sadness > maxMoodValue) {
        maxMoodValue = mood.sadness;
        maxMoodText = "sadness";
    } if (mood.surprise > maxMoodValue) {
        maxMoodValue = mood.surprise;
        maxMoodText = "surprise";
    }
    
    return JSON.stringify({mood: maxMoodText, value: maxMoodValue });
}

exports.handler = (event, context) => {
    var alexa = Alexa.handler(event, context);
    alexa.APP_ID = APP_ID;
    // To enable string internationalization (i18n) features, set a resources object.
    //alexa.resources = languageStrings;
    alexa.registerHandlers(handlers);
	//alexa.dynamoDBTableName = 'DYNAMODB_TABLE_NAME'; //uncomment this line to save attributes to DB
    alexa.execute();
};

//    END of Intent Handlers {} ========================================================================================
// 3. Helper Function  =================================================================================================

function resolveCanonical(slot){
	//this function looks at the entity resolution part of request and returns the slot value if a synonyms is provided
    try{
		var canonical = slot.resolutions.resolutionsPerAuthority[0].values[0].value.name;
	}catch(err){
	    console.log(err.message);
	    var canonical = slot.value;
	};
	return canonical;
};

function delegateSlotCollection(){
  console.log("in delegateSlotCollection");
  console.log("current dialogState: "+this.event.request.dialogState);
    if (this.event.request.dialogState === "STARTED") {
      console.log("in Beginning");
	  var updatedIntent= null;
	  // updatedIntent=this.event.request.intent;
      //optionally pre-fill slots: update the intent object with slot values for which
      //you have defaults, then return Dialog.Delegate with this updated intent
      // in the updatedIntent property
      //this.emit(":delegate", updatedIntent); //uncomment this is using ASK SDK 1.0.9 or newer
	  
	  //this code is necessary if using ASK SDK versions prior to 1.0.9 
	  if(this.isOverridden()) {
			return;
		}
		this.handler.response = buildSpeechletResponse({
			sessionAttributes: this.attributes,
			directives: getDialogDirectives('Dialog.Delegate', updatedIntent, null),
			shouldEndSession: false
		});
		this.emit(':responseReady', updatedIntent);
		
    } else if (this.event.request.dialogState !== "COMPLETED") {
      console.log("in not completed");
      // return a Dialog.Delegate directive with no updatedIntent property.
      //this.emit(":delegate"); //uncomment this is using ASK SDK 1.0.9 or newer
	  
	  //this code necessary is using ASK SDK versions prior to 1.0.9
		if(this.isOverridden()) {
			return;
		}
		this.handler.response = buildSpeechletResponse({
			sessionAttributes: this.attributes,
			directives: getDialogDirectives('Dialog.Delegate', updatedIntent, null),
			shouldEndSession: false
		});
		this.emit(':responseReady');
		
    } else {
      console.log("in completed");
      console.log("returning: "+ JSON.stringify(this.event.request.intent));
      // Dialog is now complete and all required slots should be filled,
      // so call your normal intent handler.
      return this.event.request.intent;
    }
}


function randomPhrase(array) {
    // the argument is an array [] of words or phrases
    var i = 0;
    i = Math.floor(Math.random() * array.length);
    return(array[i]);
}
function isSlotValid(request, slotName){
        var slot = request.intent.slots[slotName];
        //console.log("request = "+JSON.stringify(request)); //uncomment if you want to see the request
        var slotValue;

        //if we have a slot, get the text and store it into speechOutput
        if (slot && slot.value) {
            //we have a value in the slot
            slotValue = slot.value.toLowerCase();
            return slotValue;
        } else {
            //we didn't get a value in the slot.
            return false;
        }
}

//These functions are here to allow dialog directives to work with SDK versions prior to 1.0.9
//will be removed once Lambda templates are updated with the latest SDK

function createSpeechObject(optionsParam) {
    if (optionsParam && optionsParam.type === 'SSML') {
        return {
            type: optionsParam.type,
            ssml: optionsParam['speech']
        };
    } else {
        return {
            type: optionsParam.type || 'PlainText',
            text: optionsParam['speech'] || optionsParam
        };
    }
}

function buildSpeechletResponse(options) {
    var alexaResponse = {
        shouldEndSession: options.shouldEndSession
    };

    if (options.output) {
        alexaResponse.outputSpeech = createSpeechObject(options.output);
    }

    if (options.reprompt) {
        alexaResponse.reprompt = {
            outputSpeech: createSpeechObject(options.reprompt)
        };
    }

    if (options.directives) {
        alexaResponse.directives = options.directives;
    }

    if (options.cardTitle && options.cardContent) {
        alexaResponse.card = {
            type: 'Simple',
            title: options.cardTitle,
            content: options.cardContent
        };

        if(options.cardImage && (options.cardImage.smallImageUrl || options.cardImage.largeImageUrl)) {
            alexaResponse.card.type = 'Standard';
            alexaResponse.card['image'] = {};

            delete alexaResponse.card.content;
            alexaResponse.card.text = options.cardContent;

            if(options.cardImage.smallImageUrl) {
                alexaResponse.card.image['smallImageUrl'] = options.cardImage.smallImageUrl;
            }

            if(options.cardImage.largeImageUrl) {
                alexaResponse.card.image['largeImageUrl'] = options.cardImage.largeImageUrl;
            }
        }
    } else if (options.cardType === 'LinkAccount') {
        alexaResponse.card = {
            type: 'LinkAccount'
        };
    } else if (options.cardType === 'AskForPermissionsConsent') {
        alexaResponse.card = {
            type: 'AskForPermissionsConsent',
            permissions: options.permissions
        };
    }

    var returnResult = {
        version: '1.0',
        response: alexaResponse
    };

    if (options.sessionAttributes) {
        returnResult.sessionAttributes = options.sessionAttributes;
    }
    return returnResult;
}

function getDialogDirectives(dialogType, updatedIntent, slotName) {
    let directive = {
        type: dialogType
    };

    if (dialogType === 'Dialog.ElicitSlot') {
        directive.slotToElicit = slotName;
    } else if (dialogType === 'Dialog.ConfirmSlot') {
        directive.slotToConfirm = slotName;
    }

    if (updatedIntent) {
        directive.updatedIntent = updatedIntent;
    }
    return [directive];
}