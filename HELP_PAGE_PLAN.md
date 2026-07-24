# Morse Watcher Help Page Plan

## Goal

Create a clear, mobile-friendly help page that opens from a link inside the Morse Watcher app. It should help a first-time user understand the app quickly through short instructions and simple visuals.

## Page Structure

1. **Welcome and quick explanation**
   - Explain in one sentence that Morse Watcher detects flashing-light Morse code and translates it into readable text.
   - Include a prominent "Quick Start" link that jumps to the first instruction.

2. **Quick Start guide**
   - Open Morse Watcher and allow camera access.
   - Point the camera at one steady, clearly visible flashing light.
   - Keep the phone still and place the light inside the detection area.
   - Wait while the app recognizes the timing of the signal.
   - Read the translated message on screen.

3. **Simple visual guide**
   - Show one simplified illustration for each major step.
   - Use clean phone outlines, a light source, directional arrows, and short labels.
   - Avoid dense screenshots, tiny interface text, or decorative details that distract from the action.
   - Add meaningful alternative text for every instructional image.

4. **Tips for better detection**
   - Use a bright signal with clear on-and-off flashes.
   - Keep the camera and light source steady.
   - Avoid reflections, moving backgrounds, and multiple flashing lights.
   - Move closer if the light appears very small.
   - Clean the camera lens if the image is blurry.

5. **Troubleshooting**
   - Camera does not open: check camera permission in the device settings.
   - Signal is not detected: improve contrast, move closer, and keep the phone still.
   - Translation looks incorrect: restart from a pause between messages and make sure only one light is visible.
   - Detection stops: confirm the light remains inside the detection area.

6. **Morse code basics**
   - Briefly explain dots, dashes, letter gaps, and word gaps.
   - Include a small example showing how a flashing pattern becomes a letter or short word.
   - Keep this section optional and visually separate from the Quick Start instructions.

7. **Support and navigation**
   - Provide a link to contact support.
   - Include links back to the main website, Privacy Policy, and Terms of Use.

## Design Direction

- Match the existing Morse Watcher website colors, typography, navigation, and footer.
- Design mobile-first because most visitors will arrive from the app.
- Use large headings, short paragraphs, numbered step cards, and generous spacing.
- Keep important instructions visible without requiring long reading.
- Use simplified illustrations as the primary teaching method, with existing app screenshots only where they clarify a specific control.
- Ensure text and controls have strong contrast and comfortable touch-target sizes.
- Respect reduced-motion preferences if any animations are added.

## Planned Website Changes

- Add a standalone `help.html` page at a stable URL suitable for the app link.
- Add help-page styles to `styles.css`, reusing existing shared components where practical.
- Add a Help link to the website navigation and footer.
- Reuse existing brand assets and create only the minimum new instructional visuals required.
- Keep the page functional without JavaScript unless a small enhancement clearly improves navigation.

## Accessibility and Content Requirements

- Use semantic heading order and numbered instructions.
- Provide descriptive alternative text for instructional images.
- Do not communicate status or meaning through color alone.
- Write in plain language and avoid unexplained technical terms.
- Keep each instruction focused on one action.
- Make keyboard focus states clearly visible.

## Verification Plan

- Check the page at common phone, tablet, and desktop widths.
- Confirm all navigation, support, policy, and in-page links work.
- Verify the instructions can be understood without relying on image details alone.
- Test keyboard navigation, focus visibility, heading order, and image alternative text.
- Confirm the page remains readable at increased browser zoom and with reduced motion enabled.
- Verify the final help-page URL can be opened directly from the app.

## Acceptance Criteria

- A first-time user can understand how to begin detecting Morse code within one minute.
- The five Quick Start steps are visible, ordered, and easy to scan on a phone.
- Every major step has a simple supporting visual or a clearly reserved visual specification.
- Common camera and detection problems have concise recovery instructions.
- The page looks consistent with the current Morse Watcher website.
- The page meets basic responsive and accessibility checks.

## Assumptions

- The help content will be a dedicated web page rather than a section of the home page.
- The first version will prioritize receiving and decoding flashing-light Morse code.
- Simplified instructional illustrations are preferred over a screenshot-heavy tutorial.
- The mobile app will be updated separately to open the final help-page URL.
- This document is planning only; it does not authorize implementation of the page.
