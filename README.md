# openvtuber2

version 2 of the classic garbage [openvtuber](https://github.com/voidedWarranties/openvtuber/), this time with more terrible technology powered by tensorflow

the new version is much better suited to bad lighting or webcams and has basic support for upper-body pose estimation through posenet

### running
This apps starts a PeerJS server, enabling it to be recorded by an OBS browser capture.
You must run it through Express, not by opening `index.html`.
Install node.js (tested with v12), open a command prompt in the downloaded directory and run `npm install` followed by `npm start`.

Open the app by going to http://localhost:9000/

This app was tested on a Ryzen APU and took 60-80% of the GPU running all the models at once.

### libraries / references
* tensorflow.js + prebuilt models - facemesh, posenet, handpose
* three.js + GLTFLoader + OrbitControls
* three-vrm + their default model
* tween.js
* canvasfilters (filters.js)
* express + peerjs
* ml5
* stats.js

PoseNet solution using atan2 was inspired by [atskimura](https://gist.github.com/atskimura/198e558e0eff94774892d4ee9e22f98e)

### recording
##### option 1 - display capture
Using a window capture is impossible because the app is based on a graphics-accelerated Electron instance.
You can use display capture and crop it to record the model.
##### option 2 - PeerJS
A less finicky way to record the model is to create a "video call" through PeerJS.
1. Add the peerjs.html to a browser capture while the Electron app is running.
2. Right click the browser capture and click Interact
3. Copy the key shown in the browser capture, paste it into the "PeerJS Connection ID" field in the main application, and click Call.
4. Chroma key out the green background

### tested technologies
mostly for any developers who are wondering about this kind of stuff
##### clmtrackr
Across every app I've seen use clmtrackr, results were not consistent enough for purposes like this.
This could probably be improved by training your own models, though.
clmtrackr was fast enough to run on the render loop, and no tweening was needed for it to look smooth.
##### C# - OpenCvSharp + DlibDotNet
I abandoned this combination mostly due to how inconsistent the two libraries are when working together.
The model used, however, was much more consistent than clmtrackr.
The plan was to link the C# app to a three.js based frontend.
##### Python - opencv + dlib
After abandoning the C# combination, I decided to try the same libraries on python.
These results were much easier to use, and alongside libraries like [GazeTracking](https://github.com/antoinelame/GazeTracking) I was able to link this to an old version of the current electron app via UDP.
Due to the delay of even UDP, it was necessary to begin tweening the model rotations to avoid jerkiness.
However, things got a lot more complicated when I tried to add PoseNet.
At this point, building the libraries for Python, and linking the two languages together, had become far too inconvenient to use.
The end product would be a lot harder to distribute, and there is no possibility of hosting it online.
##### Electron - facemesh + posenet + handpose
Facemesh, posenet, and handpose all use models which must be downloaded upon running the application (unless they are distributed alongside it).
However, they together produce a much better solution than previous combinations.
Tweening from the previous solution was kept because running many models could become bottlenecked by the graphics card.
All models were moved to their own worker, meaning the render loop could still run smoothly while inferences were running.
Facemesh is a lot better at keeping the eye keypoints around the user's eyes, meaning it's a lot easier to create consistent blink detection.
It also provides coordinates in 3D, making calculating the rotation much easier.
(It is worth mentioning that Facemesh tends to handle rolling your head pretty poorly).
Starting all the models can take a minute or more, and this is likely due to the way tfjs initializes the models.
Due to this and other tracking issues with posenet and handpose, they are disabled by default.
