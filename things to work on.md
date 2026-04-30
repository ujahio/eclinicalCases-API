things to work on:

#### DEPLOYMENT TODOS

- [ ] Clean up UI to match screenshots + mobile friendly
  - [ ] Auto adjust to the left to the option in tabs that's been selected
  - [ ] action buttons (Go Back and Proceed) to be side by side on desktop, but stacked and centered on mobile
  - [ ] Notes:SMOOTH TRANSITIONS
        DO NOT CHANGE THE ELEMENTS AND TEXT, JUST THE POSITIONING WHEN NECESSARY, FONT SIZE AND WEIGHTS, COLORS
        CURRENT SOLUTION COMBINES LECTURE WITH CASE MATERIALS UPLOAD AND DEADLINE. THAT'S DIFFERENT FROM THE DESIGN BUT DO NOT CHANGE IT.
        IGNORE THE DEFAULT POSITIONING AND SETTINGS OF THE EDITORS```

#### POST DEPLOYMENT TODOS 1

- [ ] Migrate from react-draft-wysiwyg + draft-js
  - [ ] Take into account mobile friendliness when looking for an editor
- [ ] ADD VALIDATION TO FINAL REVIEW PAGE TO NOT ADD POST BUTTON UNTIL ALL THE FIELDS ARE PASSING VALIDATION
- [ ] Migrage from axios to native fetch API
- [ ] REMOVE REDUX AND USE REACT QUERY

#### POST DEPLOYMENT TODOS 2

- [ ] write unit tests and end-to-end tests
- [ ] Clean architecture research + implementation
- [ ] analysis on bundle size and audit of dependencies and necessaity
- [ ] security audit
- [ ] reacrchitect the error messaging

screenshots-current/cme-questions-desktop-[CURRENT].png
screenshots/cme-questions-desktop-[DESIGN].png

Your work is strictly making sure the UI is mobile friendly and matches the design screenshots. The UI modification for the create a case flow for a teacher. The flow covers a teachers login and creating a new published case.
Your task is to make the UI mobile-friendly and nothing else. Do not change the components/elements or current text. Only change the positioning, font sizes and weights, and add smooth transitions. Do not change the default settings of the editors.
The current UI solution moves splits the deadline date picker and uploading of case materials to two differnet components/experience. This implementation is different from the design do not change it.
The screenshots directory contains the design screenshots for the create a case flow. Use them as a reference to make the UI match the design and be mobile friendly.
THe screenshots-current directory contains screenshots of the current UI. Use them as a reference to understand the current UI and make the necessary changes to match the design and make it mobile friendly.

lets start with the dashboard.

1. user profile image in the nav bar is too big. This fix should be applied to all pages that has a nav with the image. fix
2. "Create New Case" button should be above "Ongoing Case Study" text. maintain the space and alignment between the 2. also font for "Create New Case" button is too big. fix.
3. the font weight and size of feedback count, responses count, created and deadline dates of the text is different than the design. The font for the entire app has been set in the app layout. Adjust the weight, font size and color according to the design
4. Move Info button above the feedback and responses count and align it to the left. fix
