class ByzantineIson {
    constructor() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.buffers = {}; // Store loaded audio samples
        this.currentSource = null; // Track current playing note

        // Load saved pitch preference
        this.pitchMultiplier = parseFloat(localStorage.getItem("isonPitch")) || 1.0;

        // Byzantine scales
        this.scales = {
            "Diatonic": ["Νη", "Πα", "Βου", "Γα", "Δι", "Κε", "Ζω"],
            "Chromatic": ["Νη", "Πα", "Βου#", "Γα", "Δι#", "Κε", "Ζω"],
            "Enharmonic": ["Νη", "Πα#", "Βου", "Γα#", "Δι", "Κε#", "Ζω"]
        };

        // Byzantine notation sound files
        this.soundFiles = {
            "Νη": "samples/Νη.mp3",
            "Πα": "samples/Πα.mp3",
            "Πα#": "samples/Πα-sharp.mp3",
            "Βου": "samples/Βου.mp3",
            "Βου#": "samples/Βου-sharp.mp3",
            "Γα": "samples/Γα.mp3",
            "Γα#": "samples/Γα-sharp.mp3",
            "Δι": "samples/Δι.mp3",
            "Δι#": "samples/Δι-sharp.mp3",
            "Κε": "samples/Κε.mp3",
            "Κε#": "samples/Κε-sharp.mp3",
            "Ζω": "samples/Ζω.mp3",
        };

        this.selectedScale = localStorage.getItem("isonScale") || "Diatonic"; // Load saved scale

        this.initUI();
        this.loadSamples();
        this.updateNoteButtons(); // Ensure buttons load correctly
    }

    async loadSamples() {
        for (let note in this.soundFiles) {
            try {
                const response = await fetch(this.soundFiles[note]);
                const arrayBuffer = await response.arrayBuffer();
                this.buffers[note] = await this.audioContext.decodeAudioData(arrayBuffer);
            } catch (error) {
                console.error(`Error loading sample ${note}:`, error);
            }
        }
        console.log("All sound samples loaded!");
    }

    playIson(note) {
        if (this.currentSource) {
            this.currentSource.stop(); // Stop any existing sound
        }

        const buffer = this.buffers[note];
        if (!buffer) {
            console.error("Audio sample not loaded for:", note);
            return;
        }

        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        source.loop = true; // Loop the ison sound
        source.playbackRate.value = this.pitchMultiplier; // Adjust pitch
        source.connect(this.audioContext.destination);
        source.start(0);

        this.currentSource = source;
    }

    stopIson() {
        if (this.currentSource) {
            this.currentSource.stop();
            this.currentSource = null;
        }
    }

    updateNoteButtons() {
        const noteButtonsContainer = document.getElementById('note-buttons');
        noteButtonsContainer.innerHTML = ""; // Clear existing buttons

        this.scales[this.selectedScale].forEach(note => {
            const button = document.createElement('button');
            button.innerText = note;
            button.classList.add('ison-btn');
            button.onclick = () => this.playIson(note);
            noteButtonsContainer.appendChild(button);
        });

        localStorage.setItem("isonScale", this.selectedScale); // Save user preference
    }

    handleScaleChange(event) {
        this.selectedScale = event.target.value;
        this.updateNoteButtons();
    }

    handlePitchChange(event) {
        this.pitchMultiplier = parseFloat(event.target.value);
        localStorage.setItem("isonPitch", this.pitchMultiplier); // Save user preference

        if (this.currentSource) {
            this.currentSource.playbackRate.value = this.pitchMultiplier; // Apply new pitch
        }
    }

    initUI() {
        document.getElementById('scale-selector').addEventListener('change', (e) => this.handleScaleChange(e));
        document.getElementById('pitch-slider').addEventListener('input', (e) => this.handlePitchChange(e));
        document.getElementById('stop-btn').onclick = () => this.stopIson();
        
        // Populate scale selector on startup
        const scaleSelector = document.getElementById('scale-selector');
        Object.keys(this.scales).forEach(scale => {
            const option = document.createElement('option');
            option.value = scale;
            option.innerText = scale;
            scaleSelector.appendChild(option);
        });

        scaleSelector.value = this.selectedScale;
        this.updateNoteButtons(); // Ensure buttons load on startup
    }
}

// Initialize the plugin when the page loads
window.onload = () => new ByzantineIson();
