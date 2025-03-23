## Business Goal:

A teaching hospital wants to build a learning management for students to learn about medical topics and earn credits.

## Core Functionalities

### Students:

- Students can learn from a case study, take some quizzes and earn credits (certificate of completion)
- Students can see the list case studies taken
- Students can download the certificate of completion from a case study
- Students can see the list of certificates earned
- Students can see the currently published case study with a expiry date
- Students can leave feedback for a case study

### Teacher:

- Teacher can see the list of students that have left feedback for a case study
- Teacher can draft cases study for a later date
- Teacher can update the draft case study
- Teacher can create a new case study from a previously published (archived) case study
- Teacher can publish a case study with an expiry date
- Teacher can see the list of students and those that have completed the case study

### System:

- System should automatically archive the case study after the expiry date
- System should automatically send a notification to the student when the case study is published
- System should automatically send a notification to the student when the case study is created
- System should use emails to handle student onboarding and case study completion

### App

- App should be responsive
- App should be accessible
- App should be secure
- App should be fast
- App should be scalable
- App should be easy to maintain
- App should be easy to deploy

## Technical Restrictions:

### Frontend:

- Typescript (statically typed javascript)
- Tailwind CSS (css framework)
- React.js (frontend tool)
- Next.js (frontend tool)
- Text Editor (for writing case studies, capturing students response)

### Backend (Cloud):

- SST ION (provision and deploy resources)
- AWS Lambda for backend logic
- API Gateway
- Cognito for authentication
- DynamoDB for database
- S3 for file storage
- SES for email service

### Testing:

- Jest for testing
- React Testing Library for testing
- Playwright for testing

### CI/CD

- Github Actions

## Front End Specifications

### Home Page

#### Nav bar (options)

- Logo
  - Use placeholderimage, logo to be provided by the client
- Faculty ("/faculty")
  - navigate to "/faculty" page
- How It Works
  - modal
  - 10 page carousel
- Login
  - button
  - navigate to "/login" page
- Get Started ("/register")
  - button
  - navigate to "/signup" page

### Faculty Page

- Pic of the faculty
- Write up about the faculty

### How It Works Page

- 10 page carousel
- Step indicators at the bottom of the carousel
- Previous and Next buttons at the bottom of the carousel
- pages and associated images already loaded for faster rendering
- pages
  - first page has logo at the top center
  - first page has "Welcome to e-Clinical Cases Solutions. Here are the steps to get started." at the center of the page
  - Each page in the rest of the pages should have Step X of Y at the top center
  - Each page in the rest of the pages should have write up about the step next
  - Each page in the rest of the pages should have an image at the center of the page
  - Each page in the rest of the pages should have "Previous" and "Next" buttons at the bottom of the page
  - Last page should have only "Previous" button at the bottom of the page and the step indicator
- the size of the modal should not change when navigating through the pages
- the modal should not be scrollable. The content of the modal should not pass the height of the modal
- Each page should have an "X" button at the top right of the page to close the modal

### Login Page

### Register Page

### Forgot Password Page

### Reset Password Page
