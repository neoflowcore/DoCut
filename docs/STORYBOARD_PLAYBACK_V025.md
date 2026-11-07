# DoCut V0.25 — offline storyboard playback and timed captions

Scope: source-only improvement to the DoCut editor and its exportHTML single-file runtime. No video encoding, MP4, audio rendering, screen capture, cloud AI service, remote content, GitHub Actions or installation artifacts.

## Editing and scene structure

- Page metadata `playbackMs` is an integer in 3000–60000 ms; legacy pages without it default to 12000 ms. `captions` is a sorted list of 0–16 nonoverlapping cues `{startMs,endMs,text}`. `captionStyle` is one of `cinema`, `glass`, `minimal`; legacy defaults to `cinema`.
- Open the right-hand **Page settings** (on narrow displays use the inspector toggle), set duration, select caption style and type `start-end | caption text`, one line per cue. Examples: `0-4 | 도입`, `4-9.5 | 근거` or `00:01.500-00:04.999 | 주요 지표`.
- Imported or changed captions are rejected all-at-once if malformed, too long, overlapping, out of range, or more than 16. Changing a page duration cannot truncate existing cues. Caption text is rendered only as inert `textContent`, not parsed as HTML. The explicit Apply button creates a single Undo/Redo boundary.
- User-entered caption text is PUBLIC presentation content. Do not put confidential review notes, personal names or private sources in visible subtitles. The confidential review board remains separate and is omitted from public HTML/TXT and default AI prompts.

## Playback behavior

- Open **Preview** and explicitly select **Auto-play**. No automatic start at application boot. The scene clock uses scheduled wake-ups only while playing; closing preview cancels the timer. Pausing or hiding the document halts the clock and motion, with no background resume.
- Page-local slider and clock track the selected scene; aggregate slider and clock track the ENTIRE report. Playback duration differs by page, with 0.5×, 1×, 1.5×, 2× rate controls, optional loop and captions switch.
- The thin storyboard strip is sized proportionally to page dwell time, with relative progress fill, page labels, and clickable scene navigation. Small screens scroll only *within* this strip; the page still remains a fixed 16:9 canvas.
- Space pauses/starts preview when typing isn't active, Ctrl+left/right changes slides, Escape closes. Mobile inspector hides when entering Preview so it cannot cover the playback controls.
- Motion effects and page transitions remain WAAPI/CSS; when stopped, they do not silently resume. `prefers-reduced-motion` suppresses optional motion but keeps captions and the playback clock usable.

## Portability and limitations

- `DocutExporter.exportHTML(project)` includes the full self-contained player and the original project metadata. The standalone HTML has the same scene clock, global jump, scene strip, caption styles, keyboard controls, loop and pause when hidden. No `assets/` folder or network is required to view it. HTML/TXT with HTML remains HTML source, **not an MP4 or GIF**.
- The PPTX exporter remains a static editable slide exporter; DoCut scene clock, captions and CSS animations do not automatically convert to native PowerPoint timing, video or narration. Real PowerPoint interoperability is untested until user-authorized hands-on validation.
- The clock assumes browser timer scheduling; long tab suspension is bounded per wake-up. No guarantee of frame-accurate synchronisation or an actual 30/60 fps media stream. No background recording, microphone, video or audio codecs.

## Verification boundaries

- New Node suite uses a controlled in-memory clock and synthetic timers, including loop, seek, pause, long jumps, exact cue boundaries, HTML public/privacy, and JSON round-trips.
- New Chromium suite creates in-memory isolated pages and checks editor, exported single-file HTML, mobile width, local/global seeking, storyboard strip, caption style, stop behavior and keyboard controls. Actual Windows/Android Brave and file:///cross-tab localStorage manual testing are NOT performed.
- For manual QA: set 6.5-second and 12-second scenes, type captions containing Korean and HTML-like text, check each cue's timing and redaction, jump near scene boundary, leave browser tab and return, verify Stop does not continue motion, export HTML and test without network. Verify mobile 390px and real Android touch/IME/rotation; PowerPoint animation parity must be treated as **unsupported**.
