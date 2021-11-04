# Feedback
A Powerful Online Audio Sample Sequencer. This was final project for my freshman-year introductory web programming course (CSE104 @ Ecole Polytechnique). Developed using HTML, CSS, and vanilla JavaScript (+ Tone.js) in 2019. The application allows you to select audio samples and make beats with them. Just like any other musical playground online, this is nothing but a toy. I doubt you can create the next smash hit with this, but you're certainly welcome to prove me wrong!

<div align="center">
  <img alt="Screenshot" src="https://raw.githubusercontent.com/joshuapjacob/feedback/main/img.png" width="1000" />
</div>
## Project Setup
You may host the application using any method but Python is the simplest. It must be hosted though!
```console
python -m http.server 8000
```

## Features
- Play/Stop buttons.
- Reset button to clear the sequence.
- BPM that can be changed.
- Measure.Beat.Step counter.
- Add samples from the list of samples in the ‘samples’ tab (you will have to mannually install samples first - see below).
- Once a sample is loaded, a new track will be created in the ‘sequencer’ tab:
  - Each track has two modes: loop and one-shot.
  - Trigger a track by pressing the track button (ex. ‘Q’) or by pressing the corresponding 
keyboard key. 
  - Rename tracks simply by clicking on the name (ex. ‘kick’) 
  - Change the color of a track by clicking on its color box. 
  - Set the mode of the track with the loop button: loop or one-shot. 
  - Change the volume of a track with the volume slider. 
  - Change the pan of a track with the pan slider. 
  - Delete a track by pressing the delete button. 
- When a track is in loop mode, click on the sequencer boxes to make a beat and then trigger the 
track.
- Triggering tracks that are in loop mode will be automatically synced. The indicator (line on the 
left of the track) will blink in the tracks color to show that the track will start at the next 
iteration. The indicator will blink grey to show that the track will stop at the next iteration. 
- Up to 26 tracks can be used at once. 
- When a track is in one-shot mode. The sequencer will be disabled, and the track won’t be 
synced. The only way to trigger the track is by pressing its button. It is best to use the keyboard 
in this mode. If you’re lacking inspiration, the one-shot mode can help you find some. 
## How to add your own samples?
You will first have to create a `samples` folder in the same directory as `index.html`. Then run the `automatetheboringstuff.py` script and copy the output into `data.js`. You should see the samples available next time you run the app.

## Credits
- Web Audio API interface provided by Tone.js.
- Cool background animation using [AnimatedMeshLines](https://tympanus.net/Development/AnimatedMeshLines/).