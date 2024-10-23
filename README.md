# LIVE Version Here! (For web version)
https://music-generator-8y79.onrender.com/

## Versions
- Web version (above)
- Python command-line version (below)

## How to use python version
### Requirements
- python 3
- pygame
### Usage
1. Run the python script: `python test.py` or `python3 test.py`
2. Enter any of the following commands:
- `q` to quit
- `s` to change settings
- `cat` to see all chords available
- `r` to repeat chords in the cycle of 4ths (adjust chord type in settings)
- any chord sequence you desire, see below for syntax:

### Chord Syntax
- Syntax for individual chord chord is `[root note] [chord type].[optional extra notes]`
- Use commas to separate chords
- Both sharps (#) and flats (b) are allowed
- You can specify the octave in extra notes
- You can stack extra extra notes with `.[note].[note]`
- For example:
- `C min6, F min6, C minmaj, F min6.G5, G min7no5add2, F min7no5add2, G min7, F min7, C min6.C.D.B`
- 'Cb maj, F# min'

### Chords Supported (in Python)
- maj
- min
- fifth
- dim
- aug
- sus2
- sus4
- majb5
- b2   (root, flat 2, fifth)
- sus24
- maj7
- 7
- min7
- min7b5
- maj7b5
- minmaj
- maj9
- min9
- dim7
- 7b9
- maj7no5add2
- min7no5add2
- minmajno5add2
- 7no5add2
- 9
- 6
- min6
- maj11
