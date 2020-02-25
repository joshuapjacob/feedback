"use strict"

// @author: Joshua Paul Jacob

// GLOBAL VARIABLES ------------------------------------------------------------

var index = 0;

var panVolNodes = {
  'kick_panVol': new Tone.PanVol(0,0).toMaster(),
  'snare_panVol': new Tone.PanVol(0,0).toMaster(),
  'hhc_panVol': new Tone.PanVol(0,0).toMaster(),
  'hho_panVol': new Tone.PanVol(0,0).toMaster(),
  'crash_panVol': new Tone.PanVol(0,0).toMaster(),
};

var trackList = {
  'kick': new Tone.Player("defaults/kick.wav").connect(panVolNodes['kick_panVol']),
  'snare': new Tone.Player("defaults/snare.wav").connect(panVolNodes['snare_panVol']),
  'hhc': new Tone.Player("defaults/hhc.wav").connect(panVolNodes['snare_panVol']),
  'hho': new Tone.Player("defaults/hho.wav").connect(panVolNodes['snare_panVol']),
  'crash': new Tone.Player("defaults/crash.wav").connect(panVolNodes['snare_panVol']),
};

var toPlayNext = [];
var toStopNext = [];
var nowPlaying = [];

var tester = new Audio();

// INITIALIZATION --------------------------------------------------------------

function init(){
  // Open the default tab
  document.getElementById("defaultOpen").click();
  // Setup the looper
  Tone.Transport.scheduleRepeat(repeat, "16n");
  // Start AudioContext (most browsers don't allow it to start without user input)
  document.addEventListener("mousedown", function(event){
      if (Tone.context.state !== 'running') {
        Tone.context.resume();
    }})
  Tone.context.lookAhead = 0;
  // Add key listener
  document.addEventListener("keyup", keyUp);
  initBrowser();
}

init();

// LOOPER ----------------------------------------------------------------------

function repeat() {
  let step = index % 32;
  index++;
  update_counter();
  // Update tracks that have to start or stop and change colors
  if (step === 0) {
    // Update tracks that have to start
    for (let i = 0; i < toPlayNext.length; i++){
      nowPlaying.push(toPlayNext[i]);
      const color = document.getElementById(`${toPlayNext[i]}_color`).value;
      document.getElementById(`${toPlayNext[i]}_key`).style.borderLeft = `4px solid ${color}`;
    }
    toPlayNext = [];
    // Update tracks that have to stop
    for (let i = 0; i < toStopNext.length; i++){
      nowPlaying.splice(nowPlaying.indexOf(toStopNext[i]),1);
      trackList[toStopNext[i]].stop();
    }
    toStopNext = [];
  }
  refreshColors();
  // Blink tracks that are about to be played
  for (let i = 0; i < toPlayNext.length; i++){
    const trackID = toPlayNext[i];
    if (step % 2 == 1) {
      const color = document.getElementById(`${trackID}_color`).value;
      document.getElementById(`${trackID}_key`).style.borderLeft = `4px solid ${color}`;
    }
    else {
      document.getElementById(`${trackID}_key`).style.borderLeft = "4px solid rgba(0,0,0,0)";
    }
  }
  // Blink tracks that are about to be stopped
  for (let i = 0; i < toStopNext.length; i++){
    const trackID = toStopNext[i];
    if (step % 2 == 1) {
      document.getElementById(`${trackID}_key`).style.borderLeft = "4px solid grey";
    }
    else {
      document.getElementById(`${trackID}_key`).style.borderLeft = "4px solid rgba(0,0,0,0)";
    }
  }
  // Play tracks
  for (var trackID in trackList) {
    if (document.querySelector(`#${trackID}_loop`).checked) {
      const input = document.getElementById(`${trackID}-${step+1}`)
      const label = document.querySelector(`#${trackID}-${step+1} + label`)
      label.className = "current";
      if (input.checked && nowPlaying.includes(trackID)) {
        trackList[trackID].start();
      }
    }
  }
}


// TAB CONTROLS ----------------------------------------------------------------

function openTab(event, Tab) {
  // Get all elements with class="tabcontent" and hide them
  const tabcontent = document.getElementsByClassName("tabcontent");
  for (let i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  // Get all elements with class="tablinks" and remove the class "active"
  const tablinks = document.getElementsByClassName("tablinks");
  for (let i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }
  // Show the current tab, and add an "active" class to the button that opened the tab
  document.getElementById(Tab).style.display = "block";
  event.currentTarget.className += " active";
}

// MAIN CONTROLS ----------------------------------------------------------

function triggerTransport() {
  if (Tone.Transport.state === "started") {Tone.Transport.stop();}
  else {Tone.Transport.start();}
}

function play(event) {
  Tone.Transport.start();
}

function stop(event) {
  for (var trackID in trackList) {
    trackList[trackID].stop()
  }
  // Pause
  if (Tone.Transport.state === "started") {Tone.Transport.stop();}
  // Stop
  else {
    index = 0;
    update_counter();
    // Stop all tracks and turn off their indicator
    for (let i = 0; i < nowPlaying.length; i++){
      const trackID = nowPlaying[i];
      document.getElementById(`${trackID}_key`).style.borderLeft = "4px solid grey";
    }
    nowPlaying = [];
    refreshColors();
    if (!tester.paused) {tester.pause();}
  }
}

function reset(event) {
  const allInputs = document.querySelectorAll(".sequence input");
  for (let i = 0; i < allInputs.length; i++) {
      allInputs[i].checked = false;
  }
  refreshColors();
}

function changeBPM(event) {
  Tone.Transport.bpm.value = event.currentTarget.value
}

// COUNTER ---------------------------------------------------------------------

function update_counter() {
  // Update the main counter
  const step = index % 4 + 1; // 4 Steps per Beat
  const beat = (Math.floor(index / 4) % 4) + 1; // 4 Beats per Measure
  const measure = (Math.floor(index / 16) % 2) + 1; // 2 Measures
  document.getElementById("counter").textContent = `${measure}.${beat}.${step}`;
  // Update the fancy line that runs through the sequencer
  const current_inputs = document.querySelectorAll(".current");
  for (let i = 0; i < current_inputs.length; i++) {
    current_inputs[i].className = "";
  }
}

// TRACK CONTROLS --------------------------------------------------------------
// Remark: yes, the whole 'track' thing could have been implemented as a class but we didn't cover that in the course.

function triggerTrack(event) {
  const trackID = event.currentTarget.parentElement.id;
  triggerTrackByID(trackID);
}

function triggerTrackByID(trackID) {
  const loop = document.getElementById(`${trackID}_loop`)
  if (nowPlaying.includes(trackID) && loop.checked && !(toStopNext.includes(trackID))) {
    if (!(Tone.Transport.state === "started")) {Tone.Transport.start();}
    toStopNext.push(trackID);
  }
  else if (!(nowPlaying.includes(trackID)) && loop.checked && !(toPlayNext.includes(trackID))){
    if (!(Tone.Transport.state === "started")) {Tone.Transport.start();}
    toPlayNext.push(trackID);
  }
  else if (!(toStopNext.includes(trackID)) && !(toPlayNext.includes(trackID))) {
      trackList[trackID].start();
  }
}

function changePanVol(event) {
  const trackID = event.currentTarget.parentElement.id;
  const volume = document.getElementById(`${trackID}_volume`).value
  const pan = document.getElementById(`${trackID}_pan`).value / 50
  panVolNodes[`${trackID}_panVol`].pan.value = pan;
  panVolNodes[`${trackID}_panVol`].volume.value = volume;
}

function changeColor(event) {
  const trackID = event.currentTarget.parentElement.id;
  const color = event.currentTarget.value;
  const keyName = document.querySelector(`#${trackID}_key`);
  keyName.style.color = color;
  const name = document.querySelector(`#${trackID} .track_name`);
  name.style.color = color;
  const del = document.querySelector(`#${trackID} .del`);
  del.style.color = color;
  if (nowPlaying.includes(trackID)) {
    document.getElementById(`${trackID}_key`).style.borderLeft = `4px solid ${color}`;
  }
}

function deleteTrack(event) {
  // Stop playing track and remove from trackList
  const trackID = event.currentTarget.parentElement.id;
  trackList[trackID].stop();
  delete trackList[trackID];
  // Remove from all lists
  if (nowPlaying.includes(trackID)) {nowPlaying.splice(nowPlaying.indexOf(trackID),1);}
  if (toStopNext.includes(trackID)) {toStopNext.splice(toStopNext.indexOf(trackID),1);}
  if (toPlayNext.includes(trackID)) {toPlayNext.splice(toPlayNext.indexOf(trackID),1);}
  // Remove from HTML DOM
  const trackElement = document.getElementById(trackID);
  trackElement.parentNode.removeChild(trackElement);
}

function addTrack(trackID, sample) {
  // Change trackID if a track already exists with the same ID
  if (trackID in trackList) {
    let i = 2;
    let newtrackID = trackID
    while (newtrackID in trackList) {
      newtrackID = trackID + `_${i}`;
      i++;
    }
    trackID = newtrackID
  }
  // Add a panVol node
  panVolNodes[`${trackID}_panVol`] = new Tone.PanVol(0,0).toMaster();
  // Add to trackList
  trackList[trackID] = new Tone.Player(sample).connect(panVolNodes[`${trackID}_panVol`]);
  // Create HTML element
  const trackElement = document.createElement("div");
  trackElement.id = trackID;
  trackElement.className = "track";
  // Create trigger key
  const button = document.createElement("button")
  const key_value = getNextkey();
  const key = document.createTextNode(key_value); // TODO: CHNAGE THIS
  button.id = `${trackID}_key`;
  button.className = "control key";
  button.onclick = triggerTrack;
  button.appendChild(key);
  trackElement.appendChild(button);
  addWhitespace(trackElement);
  // Create name tag
  const name = document.createElement("input");
  name.type = "text";
  name.value = trackID;
  name.className = "track_name";
  trackElement.appendChild(name);
  addWhitespace(trackElement);
  //Create color input
  const color = document.createElement("input");
  color.type = "color";
  color.id = `${trackID}_color`;
  color.value = "#ffffff";
  color.className = "control color";
  color.onchange = changeColor;
  trackElement.appendChild(color);
  addWhitespace(trackElement);
  // Create loop button
  const loop_div = document.createElement("div");
  loop_div.className = "loop";
  const loop_checkbox = document.createElement("input");
  loop_checkbox.type = "checkbox";
  loop_checkbox.id = `${trackID}_loop`;
  loop_checkbox.checked = true;
  loop_div.appendChild(loop_checkbox);
  addWhitespace(loop_div);
  const loop_label = document.createElement("label");
  loop_label.htmlFor = `${trackID}_loop`;
  const loop_icon = document.createElement("i");
  loop_icon.className = "fa fa-sync";
  loop_label.appendChild(loop_icon);
  loop_div.appendChild(loop_label);
  trackElement.appendChild(loop_div);
  addWhitespace(trackElement);
  // Create sequence checkboxes
  const sequence = document.createElement("div");
  sequence.id = `${trackID}_sequence`;
  sequence.className = "sequence";
  sequence.onclick = refreshColors;
  for (let i = 0; i < 32; i++) {
    const inputDiv = document.createElement("div");
    const input = document.createElement("input");
    input.type = "checkbox";
    input.id = `${trackID}-${i+1}`;
    inputDiv.appendChild(input);
    const inputLabel = document.createElement("label");
    inputLabel.htmlFor = `${trackID}-${i+1}`;
    const inputIcon = document.createElement("i");
    inputIcon.className = "fas fa-square";
    inputLabel.appendChild(inputIcon);
    inputDiv.appendChild(inputLabel);
    sequence.appendChild(inputDiv);
    if (i % 4 === 3) {
      addWhitespace(sequence);
    }
  }
  trackElement.appendChild(sequence);
  addWhitespace(trackElement);
  // Create volume slider
  const volume = document.createElement("input");
  volume.type = "range";
  volume.name = "volume";
  volume.min = "-36";
  volume.max = "6";
  volume.value = "0";
  volume.id = `${trackID}_volume`;
  volume.className = "slider";
  volume.onchange = changePanVol;
  trackElement.appendChild(volume);
  addWhitespace(trackElement);
  // Create pan slider
  const pan = document.createElement("input");
  pan.type = "range";
  pan.name = "pan";
  pan.min = "-50";
  pan.max = "50";
  pan.value = "0";
  pan.id = `${trackID}_pan`;
  pan.className = "slider";
  pan.onchange = changePanVol;
  trackElement.appendChild(pan);
  addWhitespace(trackElement);
  // Create delete button with icon
  const deleteButton = document.createElement("button");
  deleteButton.className = "control del";
  deleteButton.onclick = deleteTrack;
  const deleteIcon = document.createElement("i");
  deleteIcon.className = "fa fa-minus-circle";
  deleteButton.appendChild(deleteIcon);
  trackElement.appendChild(deleteButton);
  // Add to HTML DOM
  const sequencerDiv = document.querySelector("#sequencer .simplebar-content");
  sequencerDiv.appendChild(trackElement);
}

// SAMPLES ---------------------------------------------------------------------

// Loads all samples from the sample list (sample_list.js)
function initBrowser() {
  const sampleList = document.getElementById("sample_list");
  for (let i = 0; i < allSamples.length; i++){
    const sampleListItem = document.createElement("li");
    let filename = allSamples[i];
    filename = filename.replace(".wav","");
    const name = document.createTextNode(filename);
    sampleListItem.appendChild(name);
    sampleListItem.onclick = clickBrowser;
    sampleList.appendChild(sampleListItem);
  }
}

function clickBrowser(event) {
    // Play the sample
    const trackID = event.currentTarget.textContent;
    if (!tester.paused) { tester.pause() }
    tester = new Audio(`samples/${trackID}.wav`);
    tester.play();
    // Select the sample
    const selected = document.getElementsByClassName("selected");
    for (let i = 0; i < selected.length; i++) {
      selected[i].className = selected[i].className.replace(" selected", "");
    }
    event.currentTarget.className += " selected";
}

function loadSample(event) {
  const selected = document.querySelector(".selected");
  const trackID = selected.textContent;
  if (Object.keys(trackList).length === 26) { alert("Failed to add track. Your track list is full! Delete some to continue.") }
  else { addTrack(trackID, `samples/${trackID}.wav`); }
  document.getElementById("defaultOpen").click();
}

// KEY LISTENER ------------------------------------------------------------

function keyUp(event) {
  // Space bar to play/pause
  if (event.keyCode === 32) {triggerTransport();}
  else {
    if (Tone.Transport.state === "started") {
      const keyElements = document.querySelectorAll(".key");
      let keyMappings = {}
      for (let i = 0; i < keyElements.length; i++) {
        const key = keyElements[i].textContent.toLowerCase();
        const trackID = keyElements[i].parentElement.id;
        keyMappings[key] = trackID;
      }
      if (event.key in keyMappings) {
        triggerTrackByID(keyMappings[event.key]);
      }
    }
  }
}

// UTILS -----------------------------------------------------------------------

// This is to account for the HTML DOM whitespace issue
// https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Whitespace_in_the_DOM#The_issue
function addWhitespace(element) {
  const empty_text = document.createTextNode("\n");
  element.appendChild(empty_text);
}

// Refreshes colors
// This was simpler to implement than modifying CSS pseudo-classes with javascript
function refreshColors() {
  for (var trackID in trackList) {
    const inputs = document.querySelectorAll(`#${trackID}_sequence input`);
    const labels = document.querySelectorAll(`#${trackID}_sequence label`);
    const color = document.querySelector(`#${trackID} .color`).value;
    for (let i = 0; i < inputs.length; i++) {
      if (inputs[i].checked) {
        if (nowPlaying.includes(trackID)) { labels[i].style.color = color; }
        else { labels[i].style.color = "grey"; }
      }
      else { labels[i].style.color = "rgba(100,100,100,0.75)"; }
    }
  }
}

// Gets next corresponding keyboard key available
function getNextkey() {
  const keyElements = document.getElementsByClassName("key");
  let keysInUse = [];
  for (let i = 0; i < keyElements.length; i++) {
    keysInUse.push(keyElements[i].textContent.toLowerCase())
  }
  for (let i = 0; i < keys.length; i++) {
    if (!keysInUse.includes(keys[i])) {return keys[i].toUpperCase()}
  }
}
