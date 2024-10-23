import pygame as pyg
import numpy as np
from scipy.io.wavfile import write
import time
from decimal import Decimal

# sample chord progressions found with this program!!
# C min6, F min6, C minmaj, F min6.G5, G min7no5add2, F min7no5add2, G min7, F min7, C min6.C.D.B
# C min6, F min6, C minmaj, F min6.G5, G min7no5add2, F min7no5add2, Bb min7, Db min7, C min6.C.D.B

sps = 44100
canPlayChord = True
default_duration = 0.22*16
default_arp_duration = 0.22
intro_chord = "min7no5add2"
volume = 0.3
bar = 0

# Regarding note values
# 21 --> A0, 69 --> A4, 60 --> C4, 108 --> C8
def playChord(note_array, duration_s, arp_duration):
    each_sample_number = np.arange(int(duration_s * sps))
    waveform = np.zeros(len(each_sample_number))
    delay = int(arp_duration * sps)
    for n in note_array:
        n = n - 69
        freq_hz = 440 * (2**(n/12))
        wavepart = np.sin(2 * np.pi * each_sample_number * freq_hz / sps)
        wavepart[:delay] = np.zeros(len(wavepart[:delay]))
        waveform += wavepart
        delay += int(arp_duration * sps)
    waveform = waveform / len(note_array)
    waveform_quiet = waveform * volume
    waveform_integers = np.int16(waveform_quiet * 32767)
    write('wave.wav', sps, waveform_integers)

    pyg.mixer.init()
    soundObj = pyg.mixer.Sound('wave.wav')
    time.sleep(0.1)
    soundObj.play()
    time.sleep(duration_s)
    soundObj.stop()

m_intro = np.random.randint(12) # modulation
m_new = m_intro + 5
def playIntro():
    global m_new
    m_new -= 7
    if (m_new < 0):
        m_new += 12
    initChord = np.asarray(chord_switcher.get(intro_chord, [0])) + 60
    initChord = initChord - 6 + m_new
    root = chord_rooter.get(initChord[0] % 12, "C")
    print("Now playing: " + root + " " + intro_chord) 
    playChord(initChord, default_duration, default_arp_duration)

chord_rooter = {
    0: "C",
    1: "C#",
    2: "D",
    3: "Eb",
    4: "E",
    5: "F",
    6: "F#",
    7: "G",
    8: "Ab",
    9: "A",
    10: "Bb",
    11: "B"
}

note_switcher = {
    "C": 60,
    "D": 62,
    "E": 64,
    "F": 65,
    "G": 67,
    "A": 69,
    "B": 71
}

octave_switcher = {
    "0": -48,
    "1": -36,
    "2": -24,
    "3": -12,
    "4": 0,
    "5": 12,
    "6": 24,
    "7": 36,
    "8": 48
} 

chord_switcher = {
    # chords within an augmented fifth
    "maj": [0,4,7],
    "min": [0,3,7],
    "fifth": [0,7],
    "dim": [0,3,6],
    "aug": [0,4,8],
    "sus2": [0,2,7],
    "sus4": [0,5,7],
    "majb5": [0,4,6],
    "b2": [0,1,7],
    "sus24": [0,2,5,7],
    
    # complex chords
    "maj7": [0,4,7,11],
    "7": [0,4,7,10],
    "min7": [0,3,7,10],
    "min7b5": [0,3,6,10],
    "maj7b5": [0,4,6,11],
    "minmaj": [0,3,7,11],
    "maj9": [0,4,7,11,14],
    "min9": [0,3,7,10,14],
    "dim7": [0,3,6,9],
    "7b9": [0,4,7,10,13],
    "maj7no5add2": [0,2,4,11],
    "min7no5add2": [0,2,3,10],
    "minmajno5add2": [0,2,3,11],
    "7no5add2": [0,2,4,10],
    "9": [0,4,7,10,14],
    "6": [0,4,7,9],
    "min6": [0,3,7,9],
    "maj11": [0,4,7,11,14,18]
}
def playText(text):
    global bar
    comma_token = text.split(",")
    for ct in comma_token:
        generateChord(ct)

def generateChord(text):
    global bar
    global canPlayChord
    global default_duration
    global default_arp_duration
    period_token = text.split(".")
    final_chord = np.array([])
    for pt in period_token:
        final_chord = np.concatenate(
            (final_chord, generateSubChord(pt)),
            axis=None
        )
        if (not canPlayChord):
            break
    if (canPlayChord):
        bar += 1
        print("\nBar", bar)
        print("Now playing: " + text.lstrip())
        playChord(final_chord, default_duration, default_arp_duration)
        
        
def generateSubChord(text):
    global canPlayChord
    tokens = text.split()
    

    # modulation
    mod = note_switcher.get(tokens[0][0].upper(), -1) # [0][0] gets first letter of token
    
    # single note or chord
    if (len(tokens) == 1):
        chord = np.array([0])
    else:
        chord = np.asarray(
            chord_switcher.get(tokens[1].lower(), [-1])
            )
        
    if (mod == -1 or chord[0] == -1):
        print("Chord unavailable. Try again.")
        canPlayChord = False
        return
    else:
        canPlayChord = True
        # flats and sharps
        if(tokens[0][-1] == "b" and len(tokens[0]) > 1):
            mod -= 1
        elif(tokens[0][-1] == "#"):
            mod += 1
        
        # octave specification
        if(len(tokens[0]) > 1):
            mod += octave_switcher.get(tokens[0][1], 0)
        return chord + mod
        
def changeSettings():
    global default_duration
    global default_arp_duration
    global intro_chord
    print("\n(Hit enter to leave a setting unchanged)")
    print("\nCurrent chord duration: ", default_duration)
    print("Current arpeggio duration: ", default_arp_duration)
    print("Current intro chord: ", intro_chord)
    
    inp1 = input("\nNew chord duration (seconds): ")
    inp2 = input("New arpeggio duration (seconds) (0 for none): ")
    inp3 = input("Intro chord: ")
    
    if (inp1 != ""):
        default_duration = float(inp1)
    if (inp2 != ""):
        default_arp_duration = float(inp2)
    if (inp3 != ""):
        intro_chord = inp3

# Help text
helpText = (
"Examples:\n\n" +

"D maj --> plays a D major chord\n\n" +

"C maj, C min --> plays the first chord, then the second chord\n\n" +
    
"C maj.C min --> plays both chords together\n\n" +

"C.D maj --> plays the note C and D major together\n\n" +

"C8 --> plays C8. Default octave is from C4 to B4\n\n"
)

       
# "Main" method
print()
playIntro()

def introText():
    print("\n")
    print("Welcome to music generator!")
    print("made with love by Khai-Huy Nguyen\n")
    print("Type 'q' to quit, 's' to change settings, 'cat' for chord catalogue, or 'r' to repeat intro in cycle of 4ths :)")
    print("Want to hear all the chord types? Type 'play cat'")
    print("Need help? Type 'h'")
introText()

text = ""
while (text != "q"):
    print("\nWhat note(s) or chord(s) would you like to play?")
    text = input()
    if (text == "r"):
        repeats = int(input("How many times would you like to hear the intro? "))
        for r in range(repeats):
            print("\nBar", r+1)
            playIntro()
    elif (text == "s"):
        changeSettings()
    elif (text == "cat"):
        for chord in chord_switcher:
            print(chord)
    elif (text == "play cat"):
        root_note = input("Set root note: ")
        for chord in chord_switcher:
            playText(root_note + " " + chord)
    elif (text == "h"):
        introText()
        print(helpText)
    elif (text != 'q'):
        bar = 0
        playText(text)
    
print("Music generator has stopped.\n")

# Some planning

# Playing a set of notes: C.E.G.Ab --> convert to chord
    # delimiter: ','
# Playing a chord: C m7b5
    # delimiter: ' '
# Playing a specific chord: C4 m7b5
    # delimiter: ' '
# Playing a note: C (defaults to C4)
# Playing a specific note: C5
# Playing several chords and notes sequentially: D maj7, A maj7
    # delimiter: ','
