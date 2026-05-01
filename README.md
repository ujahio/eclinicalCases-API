things to work on:

#### DEPLOYMENT TODOS

- [ ] Clean up UI to match screenshots + mobile friendly
  - [x] action buttons (Go Back and Proceed) to be side by side on desktop, but stacked and centered on mobile
  - [ ] BUG - active case is resetting after routing to a new page from dashboard. the active case is also not been fetched when routed to the dashboard page from another page
  - [ ] Review Student View and Teacher update case view

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
