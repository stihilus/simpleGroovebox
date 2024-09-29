let drumSequencer;
let melodySequencer;
let playing = false;
const steps = 16;
const drumRows = ['BD', 'SD', 'MT', 'RS', 'CP', 'CH'];
const melodyNotes = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'];
let currentStep = 0;

const synths = {
    BD: new Tone.MembraneSynth({
        pitchDecay: 0.05,
        octaves: 10,
        oscillator: { type: 'sine' },
        envelope: { attack: 0.001, decay: 0.4, sustain: 0.01, release: 1.4 }
    }).toDestination(),
    SD: new Tone.NoiseSynth({
        noise: { type: 'white' },
        envelope: { attack: 0.005, decay: 0.2, sustain: 0.05, release: 0.4 }
    }).toDestination(),
    MT: new Tone.MembraneSynth({
        pitchDecay: 0.005,
        envelope: { attack: 0.001, decay: 0.2, sustain: 0.01, release: 0.3 }
    }).toDestination(),
    RS: new Tone.MetalSynth({
        frequency: 800,
        envelope: { attack: 0.001, decay: 0.1, release: 0.4 },
        harmonicity: 5.1,
        modulationIndex: 32,
        resonance: 4000,
        octaves: 1.5
    }).toDestination(),
    CP: new Tone.NoiseSynth({
        noise: { type: 'pink' },
        envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.1 }
    }).toDestination(),
    CH: new Tone.MetalSynth({
        frequency: 2000,
        envelope: { attack: 0.001, decay: 0.05, release: 0.05 },
        harmonicity: 5.1,
        modulationIndex: 32,
        resonance: 4000,
        octaves: 1.5
    }).toDestination(),
    melody: new Tone.PolySynth(Tone.Synth, {
        oscillator: {
            type: 'triangle'
        },
        envelope: {
            attack: 0.005,
            decay: 0.1,
            sustain: 0.3,
            release: 0.4
        }
    }).toDestination()
};

const waveforms = ['sine', 'square', 'triangle', 'sawtooth'];
let currentWaveformIndex = 0;

let recorder;
let recording = false;

function createSequencers() {
    const drumSequencerElement = document.getElementById('drum-sequencer');
    const melodySequencerElement = document.getElementById('melody-sequencer');
    const indicatorsElement = document.getElementById('step-indicators');
    drumSequencer = [];
    melodySequencer = [];

    for (let i = 0; i < steps; i++) {
        const indicator = document.createElement('div');
        indicator.classList.add('indicator');
        indicatorsElement.appendChild(indicator);
    }

    drumRows.forEach(row => {
        const rowSteps = [];
        for (let i = 0; i < steps; i++) {
            const step = document.createElement('div');
            step.classList.add('step');
            step.addEventListener('click', () => toggleDrumStep(row, i));
            drumSequencerElement.appendChild(step);
            rowSteps.push(false);
        }
        drumSequencer.push(rowSteps);
    });

    melodyNotes.forEach(note => {
        const rowSteps = [];
        for (let i = 0; i < steps; i++) {
            const step = document.createElement('div');
            step.classList.add('step');
            step.addEventListener('click', () => toggleMelodyStep(note, i));
            melodySequencerElement.appendChild(step);
            rowSteps.push(false);
        }
        melodySequencer.push(rowSteps);
    });
}

function toggleDrumStep(row, step) {
    const rowIndex = drumRows.indexOf(row);
    drumSequencer[rowIndex][step] = !drumSequencer[rowIndex][step];
    updateSequencerUI(drumSequencer, 'drum-sequencer');

    if (drumSequencer[rowIndex][step]) {
        playDrumSound(row);
    }
}

function toggleMelodyStep(note, step) {
    const rowIndex = melodyNotes.indexOf(note);
    melodySequencer[rowIndex][step] = !melodySequencer[rowIndex][step];
    updateSequencerUI(melodySequencer, 'melody-sequencer');

    if (melodySequencer[rowIndex][step]) {
        playMelodyNote(note);
    }
}

function playDrumSound(instrument) {
    switch (instrument) {
        case 'BD':
            synths[instrument].triggerAttackRelease('C1', '16n');
            break;
        case 'SD':
            synths[instrument].triggerAttackRelease('16n');
            break;
        case 'MT':
            synths[instrument].triggerAttackRelease('C3', '16n');
            break;
        default:
            synths[instrument].triggerAttackRelease('16n');
    }
}

function playMelodyNote(note) {
    synths.melody.triggerAttackRelease(note, '16n');
}

function updateSequencerUI(sequencer, elementId) {
    const stepElements = document.querySelectorAll(`#${elementId} .step`);
    sequencer.forEach((row, rowIndex) => {
        row.forEach((step, stepIndex) => {
            const index = rowIndex * steps + stepIndex;
            if (step) {
                stepElements[index].classList.add('active');
            } else {
                stepElements[index].classList.remove('active');
            }
        });
    });
}

function updateStepIndicators() {
    const indicators = document.querySelectorAll('.indicator');
    indicators.forEach((indicator, index) => {
        if (index === currentStep) {
            indicator.classList.add('active');
        } else {
            indicator.classList.remove('active');
        }
    });
}

function startStop() {
    playing = !playing;
    const playIcon = document.getElementById('playIcon');
    const stopIcon = document.getElementById('stopIcon');
    if (playing) {
        Tone.Transport.start();
        playIcon.style.display = 'none';
        stopIcon.style.display = 'inline';
    } else {
        Tone.Transport.stop();
        playIcon.style.display = 'inline';
        stopIcon.style.display = 'none';
    }
}

function clear() {
    drumSequencer = drumSequencer.map(row => row.map(() => false));
    melodySequencer = melodySequencer.map(row => row.map(() => false));
    updateSequencerUI(drumSequencer, 'drum-sequencer');
    updateSequencerUI(melodySequencer, 'melody-sequencer');
}

function random() {
    drumSequencer = drumSequencer.map(row => row.map(() => Math.random() < 0.1)); // 10% chance of being active
    melodySequencer = melodySequencer.map(row => row.map(() => Math.random() < 0.1)); // 10% chance of being active
    updateSequencerUI(drumSequencer, 'drum-sequencer');
    updateSequencerUI(melodySequencer, 'melody-sequencer');
}

function changeWaveform() {
    currentWaveformIndex = (currentWaveformIndex + 1) % waveforms.length;
    const newWaveform = waveforms[currentWaveformIndex];
    synths.melody.set({
        oscillator: {
            type: newWaveform
        }
    });
    
    const waveformButton = document.getElementById('waveform');
    waveformButton.querySelector('img').src = `${newWaveform}.svg`;
    waveformButton.title = `Change waveform (current: ${newWaveform})`;
}

function startRecording() {
    if (recording) return;
    
    recording = true;
    recorder = new Tone.Recorder();
    Tone.Destination.connect(recorder);
    
    if (playing) {
        Tone.Transport.stop();
        currentStep = 0;
        updateStepIndicators();
    }
    
    Tone.Transport.start();
    playing = true;
    const playIcon = document.getElementById('playIcon');
    const stopIcon = document.getElementById('stopIcon');
    playIcon.style.display = 'none';
    stopIcon.style.display = 'inline';
    
    recorder.start();
    
    setTimeout(async () => {
        const recording = await recorder.stop();
        const audioBuffer = await Tone.context.decodeAudioData(await recording.arrayBuffer());
        const wavBuffer = audioBufferToWav(audioBuffer);
        const blob = new Blob([wavBuffer], { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        
        // Generate filename with current date and time
        const now = new Date();
        const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, -5); // Format: YYYY-MM-DDTHH-mm
        anchor.download = `SimpleGroovebox_${timestamp}.wav`;
        
        anchor.href = url;
        anchor.click();
        recording = false;
    }, Tone.Time("1m").toSeconds() * 1000);
}

// Add this function to convert AudioBuffer to WAV format
function audioBufferToWav(buffer) {
    const numOfChan = buffer.numberOfChannels;
    const length = buffer.length * numOfChan * 2 + 44;
    const out = new ArrayBuffer(length);
    const view = new DataView(out);
    const channels = [];
    let sample;
    let offset = 0;
    let pos = 0;

    // write WAVE header
    setUint32(0x46464952);                         // "RIFF"
    setUint32(length - 8);                         // file length - 8
    setUint32(0x45564157);                         // "WAVE"

    setUint32(0x20746d66);                         // "fmt " chunk
    setUint32(16);                                 // length = 16
    setUint16(1);                                  // PCM (uncompressed)
    setUint16(numOfChan);
    setUint32(buffer.sampleRate);
    setUint32(buffer.sampleRate * 2 * numOfChan);  // avg. bytes/sec
    setUint16(numOfChan * 2);                      // block-align
    setUint16(16);                                 // 16-bit (hardcoded in this demo)

    setUint32(0x61746164);                         // "data" - chunk
    setUint32(length - pos - 4);                   // chunk length

    // write interleaved data
    for(let i = 0; i < buffer.numberOfChannels; i++)
        channels.push(buffer.getChannelData(i));

    while(pos < length) {
        for(let i = 0; i < numOfChan; i++) {             // interleave channels
            sample = Math.max(-1, Math.min(1, channels[i][offset])); // clamp
            sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767)|0; // scale to 16-bit signed int
            view.setInt16(pos, sample, true);          // update data chunk
            pos += 2;
        }
        offset++                                     // next source sample
    }

    // helper functions
    function setUint16(data) {
        view.setUint16(pos, data, true);
        pos += 2;
    }

    function setUint32(data) {
        view.setUint32(pos, data, true);
        pos += 4;
    }

    return new Uint8Array(out);
}

function setupTransport() {
    Tone.Transport.bpm.value = 120;
    Tone.Transport.scheduleRepeat((time) => {
        drumSequencer.forEach((row, index) => {
            if (row[currentStep]) {
                const instrument = drumRows[index];
                playDrumSound(instrument, time);
            }
        });

        melodySequencer.forEach((row, index) => {
            if (row[currentStep]) {
                const note = melodyNotes[index];
                synths.melody.triggerAttackRelease(note, '16n', time);
            }
        });
        
        Tone.Draw.schedule(() => {
            updateStepIndicators();
        }, time);

        currentStep = (currentStep + 1) % steps;
    }, '16n');
}

document.getElementById('startStop').addEventListener('click', startStop);
document.getElementById('clear').addEventListener('click', clear);
document.getElementById('random').addEventListener('click', random);
document.getElementById('waveform').addEventListener('click', changeWaveform);
document.getElementById('record').addEventListener('click', startRecording);
document.getElementById('tempo').addEventListener('input', (e) => {
    const tempo = e.target.value;
    Tone.Transport.bpm.value = tempo;
});

createSequencers();
setupTransport();

// Start audio context on user interaction
document.body.addEventListener('click', () => {
    Tone.start();
});