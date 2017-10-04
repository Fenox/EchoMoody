# [EchoMoody](https://fenox.github.io/EchoMoody/)
Analyze and change your mood using Amazon Alexa. 
Submition to the [inno{hacks} 2017](http://inno-hacks.de).


## How does it work
We combined the Alexa, Phillips Hue and a Raspberry pi to take a picture with the pi on command and analyze it with Microsoft Azure Emotion Api.
The emotion api returns a set of emotion and for each a percentage value. The Alexa skill takes the emotion with the highest 
percentage value and tells you it. Now you can tell alexa to adjust the lights on your Phillips Hue. The lights will change according to your
mood. You can close the skill or tell Alexa to take another picture and repeat the process.

## Demo


## Developer
- [Julian Martin](https://github.com/fenox)
- [Thomas Czogalik](https://github.com/thomcz)
- [Mathäus Pordzik](https://github.com/thaeus)
- Michael Kaiser

## License

	EchoMoody
    Copyright 2016

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
