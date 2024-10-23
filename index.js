/*
 * Khai-Huy Alex Nguyen
 * October 13th, 2024
 *
 * This is the functionality for Epic Music Box.
 * Example functions include editing chords, selecting chord types, and playing music.
 * cloneNode was provided by MDN docs at
 * https://developer.mozilla.org/en-US/docs/Web/API/Node/cloneNode
 * getRandomElement was provided by MDN docs at
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
 *
 * Please note that the undefined "Tone" is defined by a music generation library
 * provided by https://tonejs.github.io/. This was imported
 * inside <script src="http://unpkg.com/tone"></script> in the HTML
 */
"use strict";

(function() {
  // constants relating to musical notes and chords
  const NUM_NOTES = 12;
  const ROOT = 0;
  const MAJOR_2ND = 2;
  const MINOR_3RD = 3;
  const MAJOR_3RD = 4;
  const PERFECT_4TH = 5;
  const DIM_5TH = 6;
  const PERFECT_5TH = 7;
  const AUG_5TH = 8;
  const MINOR_6TH = 8;
  const MAJOR_6TH = 9;
  const DIM_7TH = 9;
  const MINOR_7TH = 10;
  const MAJOR_7TH = 11;
  const MAJOR_9TH = 14;
  const NOTES = ['c', 'db', 'd', 'eb', 'e', 'f', 'gb', 'g', 'ab', 'a', 'bb', 'b'];
  const NO_CHORD = [ROOT];
  const MAJOR_CHORD = [ROOT, MAJOR_3RD, PERFECT_5TH];
  const MINOR_CHORD = [ROOT, MINOR_3RD, PERFECT_5TH];
  const MAJOR_7TH_CHORD = [ROOT, MAJOR_3RD, PERFECT_5TH, MAJOR_7TH];
  const MINOR_7TH_CHORD = [ROOT, MINOR_3RD, PERFECT_5TH, MINOR_7TH];
  const DIMINISHED_CHORD = [ROOT, MINOR_3RD, DIM_5TH];
  const AUGMENTED_CHORD = [ROOT, MAJOR_3RD, AUG_5TH];
  const DIMINISHED_7TH_CHORD = [ROOT, MINOR_3RD, DIM_5TH, DIM_7TH];
  const MINOR_MAJOR_CHORD = [ROOT, MINOR_3RD, PERFECT_5TH, MAJOR_7TH];
  const MAJOR_9TH_CHORD = [ROOT, MAJOR_3RD, PERFECT_5TH, MAJOR_7TH, MAJOR_9TH];
  const MINOR_9TH_CHORD = [ROOT, MINOR_3RD, PERFECT_5TH, MINOR_7TH, MAJOR_9TH];
  const SUS2_CHORD = [ROOT, MAJOR_2ND, PERFECT_5TH];
  const SUS4_CHORD = [ROOT, PERFECT_4TH, PERFECT_5TH];
  const MIDDLE_C_FREQ = 261.63;
  const TWO = 2;
  const TWELVE = 12;
  const TWELTH_ROOT_OF_2 = Math.pow(TWO, 1 / TWELVE);
  const ARPEGGIO_LEN = 0.05;
  const NOTE_LEN = "1.125";
  const MEASURE_LEN = "1.5";
  const NICE_JUMPS = [MINOR_3RD, MAJOR_3RD, PERFECT_4TH, PERFECT_5TH, MINOR_6TH, MAJOR_6TH];
  const NICE_CHORDS = ["Major 7th", "Minor 7th", "Major 9th", "Minor 9th", "Sus2", "Sus4"];

  window.addEventListener("load", init);

  // the current type of chord selected, defaults to Major
  let currChordType = "Major";

  // the DOM node of the currently-selected chord type
  let currChordTypeSelected = undefined;

  // the DOM node of the currently-selected chord
  let currChordSelected = undefined;

  // if true, repeat is on, otherwise repeat is off
  let isOnRepeat = false;

  // if true, there is something playing, otherwise nothing should be playing
  let isPlaying = false;

  // the current synthesiser
  let synth = new Tone.PolySynth(Tone.Synth).toDestination();

  /**
   * Sets up event listeners for the start button and the bugs.
   */
  function init() {
    // listener: add random chord
    id("random").addEventListener("click", addRandomChord);

    // listener: play chords in the editor
    id("play").addEventListener("click", playEditor);

    // listener: stop playing chords in the editor
    id("stop").addEventListener("click", stopEditor);

    // listener: toggle between repeat is on/off
    id("repeat").addEventListener("click", toggleRepeat);

    // listener: select chord types
    const chordTypes = qsa("#chord-type .grid > div");
    for (let i = 0; i < chordTypes.length; i++) {
      chordTypes[i].addEventListener("click", selectClickedChordType);
    }

    // on init, Major chord is selected by default
    changeChordType(currChordType);
    currChordTypeSelected = qs("#chord-type .grid div");
    currChordTypeSelected.classList.add("selected");

    // listener: add chord to editor
    const chords = qsa("#selector .grid > div");
    for (let i = 0; i < chords.length; i++) {
      chords[i].addEventListener("click", addChord);
    }
  }

  /**
   * Plays the chords in the editor
   */
  function playEditor() {
    if (isPlaying) {
      // don't play again
      return;
    }
    id("random").classList.add("disabled");
    id("play").classList.add("disabled");
    id("stop").classList.remove("disabled");
    id("repeat").classList.add("disabled");
    synth = new Tone.PolySynth(Tone.Synth).toDestination();

    const chords = qsa("#editor .grid > div");
    const frequencyArrays = getFrequencyArrays(chords);

    if (frequencyArrays.length === 0) {
      // don't do anything with no chords
      return;
    }

    let index = 0;
    playFreqArrays(index, frequencyArrays, chords);
  }

  /**
   * Plays the notes in frequencyArrays
   * @param {number} i - index i to start in frequencyArrays
   * @param {Array.<number[]>} frequencyArrays - frequency 2D array
   * @param {object[]} chords - array of chord DOM nodes
   */
  function playFreqArrays(i, frequencyArrays, chords) {
    Tone.loaded().then(() => {
      isPlaying = true;
      const loop = new Tone.Loop((time) => {
        const chord = i % frequencyArrays.length;
        if (isOnRepeat || (!isOnRepeat && i < frequencyArrays.length)) {
          for (let j = 0; j < frequencyArrays[chord].length; j++) {
            synth.triggerAttackRelease(
              frequencyArrays[chord][j],
              NOTE_LEN,
              time + j * ARPEGGIO_LEN
            );
          }
          i++;
        }
        if (isPlaying) {
          if (currChordSelected !== undefined) {
            currChordSelected.classList.remove("selected");
          }
          currChordSelected = chords[chord];
          currChordSelected.classList.add("selected");
        }
        if (!isOnRepeat && i >= frequencyArrays.length) {
          isPlaying = false;
        }
      }, MEASURE_LEN);
      loop.start(0);
      Tone.Transport.start();
    });
  }

  /**
   * Stops playing chords in the editor,
   * deselects the current chord, and
   * deletes notes from the synth
   */
  function stopEditor() {
    id("random").classList.remove("disabled");
    id("play").classList.remove("disabled");
    id("stop").classList.add("disabled");
    id("repeat").classList.remove("disabled");

    // remove previously-selected highlighted chord
    if (currChordSelected !== undefined) {
      currChordSelected.classList.remove("selected");
    }
    isPlaying = false;
    Tone.Transport.stop();
    Tone.Transport.cancel();
    synth = undefined;
  }

  /**
   * Toggles repeat to be on/off
   * Does not do anything if chords are playing
   */
  function toggleRepeat() {
    if (isPlaying) {
      return;
    }
    let newText = "";
    if (isOnRepeat) {
      newText = "off";
    } else {
      newText = "on";
    }
    isOnRepeat = !isOnRepeat;
    id("repeat-tog").textContent = newText;
  }

  /**
   * Selects a new type of chord to use, based on what was clicked
   * If the same chord was selected, nothing happens.
   */
  function selectClickedChordType() {
    const newChordType = this.textContent;
    selectChordType(newChordType);
  }

  /**
   * Adds a random chord (nice root, nice type) to the editor and
   * updates editor text.
   * Roots are chosen based on the circle of 4ths
   * Does not do anything if chords are playing
   */
  function addRandomChord() {
    if (isPlaying) {
      return;
    }

    // select nice chord type
    selectChordType(getRandomElement(NICE_CHORDS));

    // select nice chord root
    const chordsInEditor = qsa("#editor .grid > div");
    let niceRootNum = getRandomNum(NUM_NOTES);
    if (chordsInEditor.length > 0) {
      const prevRootNode = chordsInEditor[chordsInEditor.length - 1];
      const prevRoot = prevRootNode.querySelector(".root").textContent.toLowerCase();

      niceRootNum = (noteToNum(prevRoot) + getRandomElement(NICE_JUMPS)) % NUM_NOTES;
    }
    let note = "#selector ." + numToNote(niceRootNum);
    addChordFromNode(qs(note));
  }

  /**
   * Adds the chosen chord to the editor and
   * updates editor text.
   * Does not do anything if chords are playing
   */
  function addChord() {
    if (isPlaying) {
      return;
    }
    addChordFromNode(this);
  }

  /* --- OTHER HELPER FUNCTIONS --- */

  /**
   * Adds the chosen chord to the editor and
   * updates editor text.
   * @param {object} chordNode - the DOM node of the chord
   */
  function addChordFromNode(chordNode) {
    updateEditorText();
    const editor = qs("#editor .grid");
    const noteBox = chordNode.cloneNode(true);

    // add listener to make chord disappear
    noteBox.addEventListener("click", () => removeChord(noteBox));
    editor.appendChild(noteBox);
  }

  /**
   * Selects a new type of chord to use, based on what was clicked
   * If the same chord was selected, nothing happens.
   * @param {string} newChordType - the type of chord to select
   */
  function selectChordType(newChordType) {
    if (newChordType !== currChordType) {
      currChordType = newChordType;
      changeChordType(newChordType);
      currChordTypeSelected.classList.remove("selected");
      const chordTypes = qsa("#chord-type .grid > div");
      for (let i = 0; i < chordTypes.length; i++) {
        if (chordTypes[i].textContent === newChordType) {
          currChordTypeSelected = chordTypes[i];
          currChordTypeSelected.classList.add("selected");
        }
      }
    }
  }

  /**
   * Updates text from editor, if there is a chord there
   */
  function updateEditorText() {
    const para = qs("#editor em");
    para.textContent = "Click on chord to delete (only when nothing is playing)";
  }

  /**
   * Changes the type of chord in Chord Selector
   * @param {string} type - the type of chord
   */
  function changeChordType(type) {
    const chordTypes = qsa("#selector .grid .chord-type");
    for (let i = 0; i < chordTypes.length; i++) {
      chordTypes[i].textContent = type;
    }
  }

  /**
   * Removes the chord from the editor, only if nothing is playing
   * @param {object} chord - the DOM Node of chord
   */
  function removeChord(chord) {
    if (!isPlaying) {
      const editor = qs("#editor .grid");
      editor.removeChild(chord);
    }
  }

  /**
   * Returns a random element in an array.
   * @param {any[]} arr - array
   * @returns {any} - random element returned.
   */
  function getRandomElement(arr) {
    const index = getRandomNum(arr.length);
    return arr[index];
  }

  /**
   * Returns a random number in [0, max)
   * @param {number} max - max
   * @returns {number} - random number returned.
   */
  function getRandomNum(max) {
    return Math.floor(Math.random() * max);
  }

  /**
   * Returns a 2D array of numbers based on chords provided;
   * each subarray represents the audio frequencies in a chord
   * @param {object[]} chordBoxes - chord box HTML elements in Editor.
   * @returns {Array.<number[]>} - 2D array of audio frequencies.
   */
  function getFrequencyArrays(chordBoxes) {
    let freqArrays = [];
    for (let i = 0; i < chordBoxes.length; i++) {
      const root = chordBoxes[i].querySelector(".root").textContent;
      const chordType = chordBoxes[i].querySelector(".chord-type").textContent;
      const freqArray = getChordFrequencies(root, chordType);
      freqArrays.push(freqArray);
    }
    return freqArrays;
  }

  /**
   * Returns an array of audio frequencies in a chord;
   * the chord is based on root and chord type provided.
   * @param {string} root - root of the chord
   * @param {string} chordType - type of the chord
   * @returns {number[]} - array of audio frequencies.
   */
  function getChordFrequencies(root, chordType) {
    root = root.toLowerCase();
    const rootNoteNum = noteToNum(root);
    chordType = chordType.toLowerCase();

    let freqArray = [];

    // notes to add relative to the root
    let toAdd = chordToChordArray(chordType);

    for (let i = 0; i < toAdd.length; i++) {
      freqArray.push(rootNoteNum + toAdd[i]);
    }

    // conversion to audio frequencies
    for (let i = 0; i < freqArray.length; i++) {
      const power = freqArray[i];
      freqArray[i] = MIDDLE_C_FREQ * Math.pow(TWELTH_ROOT_OF_2, power);
    }
    return freqArray;
  }

  /**
   * Returns the chord array associated with the chord name
   * @param {string} chordName - name of the chord
   * @returns {number[]} - array of notes in chord.
   */
  function chordToChordArray(chordName) {
    switch (chordName) {
      case "major":
        return MAJOR_CHORD;
      case "minor":
        return MINOR_CHORD;
      case "major 7th":
        return MAJOR_7TH_CHORD;
      case "minor 7th":
        return MINOR_7TH_CHORD;
      case "diminished":
        return DIMINISHED_CHORD;
      case "augmented":
        return AUGMENTED_CHORD;
      case "diminished 7th":
        return DIMINISHED_7TH_CHORD;
      case "minor-major":
        return MINOR_MAJOR_CHORD;
      case "major 9th":
        return MAJOR_9TH_CHORD;
      case "minor 9th":
        return MINOR_9TH_CHORD;
      case "sus2":
        return SUS2_CHORD;
      case "sus4":
        return SUS4_CHORD;
      default:
        return NO_CHORD;
    }
  }

  /**
   * Returns the lowercase note name associated with the note number.
   * Behavior is undefined if note number is not between 0 and 11.
   * @param {number} noteNum - note number between 0 and 11.
   * @returns {string} - lowercase note name
   */
  function numToNote(noteNum) {
    return NOTES[noteNum];
  }

  /**
   * Returns the note number associated with the lowercase note name.
   * Behavior is undefined if note name is not in NOTES.
   * @param {string} noteName - name of the note.
   * @returns {number} - lowercase note name
   */
  function noteToNum(noteName) {
    return NOTES.indexOf(noteName);
  }

  /* --- CSE 154 HELPER FUNCTIONS --- */

  /**
   * Returns the element that has the ID attribute with the specified value.
   * @param {string} name - element ID.
   * @returns {object} - DOM object associated with id.
   */
  function id(name) {
    return document.getElementById(name);
  }

  /**
   * Returns first element matching selector.
   * @param {string} selector - CSS query selector.
   * @returns {object} - DOM object associated selector.
   */
  function qs(selector) {
    return document.querySelector(selector);
  }

  /**
   * Returns an array of elements matching the given query.
   * @param {string} query - CSS query selector.
   * @returns {array} - Array of DOM objects matching the given query.
   */
  function qsa(query) {
    return document.querySelectorAll(query);
  }

})();