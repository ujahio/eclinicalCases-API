# Graph Report - .  (2026-06-14)

## Corpus Check
- 674 files · ~22,763,130 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 867 nodes · 1619 edges · 105 communities (63 shown, 42 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 75 edges (avg confidence: 0.82)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_AWS SDK Dependencies|AWS SDK Dependencies]]
- [[_COMMUNITY_Auth & Case Flow|Auth & Case Flow]]
- [[_COMMUNITY_UI Component Library|UI Component Library]]
- [[_COMMUNITY_TypeScript Configuration|TypeScript Configuration]]
- [[_COMMUNITY_Rich Text Editor|Rich Text Editor]]
- [[_COMMUNITY_Package Configuration|Package Configuration]]
- [[_COMMUNITY_Component Aliases|Component Aliases]]
- [[_COMMUNITY_Case Data Management|Case Data Management]]
- [[_COMMUNITY_Infrastructure API|Infrastructure API]]
- [[_COMMUNITY_Login & Password Flow|Login & Password Flow]]
- [[_COMMUNITY_Server Application Context|Server Application Context]]
- [[_COMMUNITY_Server Controllers|Server Controllers]]
- [[_COMMUNITY_Case API Functions|Case API Functions]]
- [[_COMMUNITY_Case Creation Wizard|Case Creation Wizard]]
- [[_COMMUNITY_Backend Infrastructure|Backend Infrastructure]]
- [[_COMMUNITY_Signup Flow|Signup Flow]]
- [[_COMMUNITY_Auth State & Password Flow|Auth State & Password Flow]]
- [[_COMMUNITY_AWS Services Concepts|AWS Services Concepts]]
- [[_COMMUNITY_Navigation & Layout|Navigation & Layout]]
- [[_COMMUNITY_Signup Form Elements|Signup Form Elements]]
- [[_COMMUNITY_UI Modals|UI Modals]]
- [[_COMMUNITY_Case Details|Case Details]]
- [[_COMMUNITY_Students Certificates|Students Certificates]]
- [[_COMMUNITY_Settings & Account|Settings & Account]]
- [[_COMMUNITY_Home & Student Views|Home & Student Views]]
- [[_COMMUNITY_Admin Dashboard Layout|Admin Dashboard Layout]]
- [[_COMMUNITY_Forgot Password & Routing|Forgot Password & Routing]]
- [[_COMMUNITY_Case Materials|Case Materials]]
- [[_COMMUNITY_Form Elements|Form Elements]]
- [[_COMMUNITY_Case AddUpdate Flow|Case Add/Update Flow]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 54|Community 54]]
- [[_COMMUNITY_Community 55|Community 55]]
- [[_COMMUNITY_Community 56|Community 56]]
- [[_COMMUNITY_Community 57|Community 57]]
- [[_COMMUNITY_Community 58|Community 58]]
- [[_COMMUNITY_Community 59|Community 59]]
- [[_COMMUNITY_Community 60|Community 60]]
- [[_COMMUNITY_Community 61|Community 61]]
- [[_COMMUNITY_Community 62|Community 62]]
- [[_COMMUNITY_Community 63|Community 63]]
- [[_COMMUNITY_Community 64|Community 64]]
- [[_COMMUNITY_Community 65|Community 65]]
- [[_COMMUNITY_Community 67|Community 67]]
- [[_COMMUNITY_Community 69|Community 69]]
- [[_COMMUNITY_Community 70|Community 70]]
- [[_COMMUNITY_Community 71|Community 71]]
- [[_COMMUNITY_Community 72|Community 72]]
- [[_COMMUNITY_Community 73|Community 73]]
- [[_COMMUNITY_Community 74|Community 74]]
- [[_COMMUNITY_Community 75|Community 75]]
- [[_COMMUNITY_Community 77|Community 77]]
- [[_COMMUNITY_Community 78|Community 78]]
- [[_COMMUNITY_Community 79|Community 79]]
- [[_COMMUNITY_Community 80|Community 80]]
- [[_COMMUNITY_Community 81|Community 81]]
- [[_COMMUNITY_Community 83|Community 83]]
- [[_COMMUNITY_Community 84|Community 84]]
- [[_COMMUNITY_Community 85|Community 85]]
- [[_COMMUNITY_Community 86|Community 86]]
- [[_COMMUNITY_Community 87|Community 87]]
- [[_COMMUNITY_Community 89|Community 89]]
- [[_COMMUNITY_Community 90|Community 90]]
- [[_COMMUNITY_Community 91|Community 91]]
- [[_COMMUNITY_Community 92|Community 92]]
- [[_COMMUNITY_Community 93|Community 93]]
- [[_COMMUNITY_Community 94|Community 94]]
- [[_COMMUNITY_Community 95|Community 95]]
- [[_COMMUNITY_Community 96|Community 96]]
- [[_COMMUNITY_Community 97|Community 97]]
- [[_COMMUNITY_Community 98|Community 98]]
- [[_COMMUNITY_Community 99|Community 99]]
- [[_COMMUNITY_Community 100|Community 100]]
- [[_COMMUNITY_Community 102|Community 102]]
- [[_COMMUNITY_Community 103|Community 103]]
- [[_COMMUNITY_Community 104|Community 104]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 51 edges
2. `useAppSelector` - 50 edges
3. `Button` - 33 edges
4. `useAppDispatch` - 30 edges
5. `compilerOptions` - 23 edges
6. `configureRequestHeaders()` - 21 edges
7. `CreateCaseStudy` - 19 edges
8. `rootReducer.ts - Combined Redux reducer` - 19 edges
9. `extrapolateRequestBody()` - 13 edges
10. `Student Case Study Page` - 12 edges

## Surprising Connections (you probably didn't know these)
- `TeacherDashboard()` --semantically_similar_to--> `Student Dashboard UI`  [INFERRED] [semantically similar]
  src/presentation/teacher/Dashboard.tsx → public/images/dashboard.png
- `Student Dashboard UI` --calls--> `useAppDispatch`  [EXTRACTED]
  public/images/dashboard.png → src/services/hooks/hooks.ts
- `Student Dashboard UI` --calls--> `useAppSelector`  [EXTRACTED]
  public/images/dashboard.png → src/services/hooks/hooks.ts
- `Student Dashboard UI` --implements--> `DashboardLayout`  [EXTRACTED]
  public/images/dashboard.png → src/components/layouts/dashboard/index.tsx
- `Signup Page` --references--> `Auth Controller`  [INFERRED]
  src/app/(auth)/signup/page.tsx → server/controllers/auth.js

## Import Cycles
- None detected.

## Communities (105 total, 42 thin omitted)

### Community 0 - "AWS SDK Dependencies"
Cohesion: 0.05
Nodes (44): dependencies, @aws-sdk/client-cognito-identity-provider, @aws-sdk/client-dynamodb, @aws-sdk/client-s3, @aws-sdk/lib-dynamodb, @aws-sdk/lib-storage, @aws-sdk/s3-request-presigner, bcryptjs (+36 more)

### Community 1 - "Auth & Case Flow"
Cohesion: 0.10
Nodes (35): Auth Flow - Signup → OTP → Password management, Case Study Lifecycle - Draft → Publish → Archive/Delete, Student Response Flow - View case → Submit response → Feedback → Certificate, auth.ts - Auth API functions, case.ts - Case API functions, student.ts - Student API functions, fetchClient.ts - API client factory, constants/index.ts - Case study tabs (+27 more)

### Community 2 - "UI Component Library"
Cohesion: 0.11
Nodes (25): cn(), DropdownMenuCheckboxItem(), DropdownMenuContent(), DropdownMenuRadioGroup(), DropdownMenuRadioItem(), DropdownMenuSeparator(), DropdownMenuShortcut(), DropdownMenuSubContent() (+17 more)

### Community 3 - "TypeScript Configuration"
Cohesion: 0.07
Nodes (27): compilerOptions, allowJs, declaration, esModuleInterop, incremental, isolatedModules, jsx, lib (+19 more)

### Community 4 - "Rich Text Editor"
Cohesion: 0.14
Nodes (15): CaseEditorProps, plugins, PlateViewerProps, plugins, BlockquoteElement, EditorContainer(), editorContainerVariants, EditorProps (+7 more)

### Community 5 - "Package Configuration"
Cohesion: 0.09
Nodes (23): description, devDependencies, eslint, eslint-config-next, jwks-rsa, lodash, tailwindcss, @types/node (+15 more)

### Community 6 - "Component Aliases"
Cohesion: 0.09
Nodes (22): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+14 more)

### Community 7 - "Case Data Management"
Cohesion: 0.12
Nodes (13): getArchiveCasesApi(), client, dbClient, Application Context Dependency Injection, cognitoClient, signin(), signup(), dbClient (+5 more)

### Community 8 - "Infrastructure API"
Cohesion: 0.16
Nodes (15): api, cognitoAuthorizer, links, routeArgs, authUrl, eccsWebClient, userPool, userPoolDomain (+7 more)

### Community 9 - "Login & Password Flow"
Cohesion: 0.15
Nodes (12): signIn, LoginCompProps, LoginFormValues, Step1, Step2, ForgotPassword(), AuthLayout, forgetPassStep1Schema (+4 more)

### Community 10 - "Server Application Context"
Cohesion: 0.11
Nodes (13): EmailHtmlProps, EmailProps, sendEmail(), box, button, container, footer, main (+5 more)

### Community 11 - "Server Controllers"
Cohesion: 0.20
Nodes (12): getDraftCasesApi(), addFeedbackApi(), getStudentsCertificatesApi(), dbClient, getCaseForStudentsResponse(), areArraysEqualRegardlessOfOrder(), dbClient, deleteDraftCase() (+4 more)

### Community 12 - "Case API Functions"
Cohesion: 0.21
Nodes (13): addDraftCaseApi(), deleteCaseApi(), deletePdfFromCaseMaterialsApi(), fetchCaseDataApi(), fetchPublishedCaseApi(), getPresignedUrlForDocumentUploadApi(), getPresignedUrlForFetchingDocumentsApi(), publishCaseApi() (+5 more)

### Community 13 - "Case Creation Wizard"
Cohesion: 0.23
Nodes (14): CreateCaseStudy, CaseEditor, TeacherCaseAnswer, TeacherCaseTeaching, TeacherCMEQuestions, CaseQuestion, CreateCaseStudy(), handleUpdateDraftCase (+6 more)

### Community 14 - "Backend Infrastructure"
Cohesion: 0.15
Nodes (17): Case Study Lifecycle, CME Quiz Grading System, RBAC Authorization Pattern, S3 Presigned URL Pattern, Auth Controller, Case Controller, Archived Cases Controller, Case Materials Controller (+9 more)

### Community 15 - "Signup Flow"
Cohesion: 0.22
Nodes (11): SignupTeacher(), signup(), SignupCompProps, SignupValues, initialState, signupState, signupUser, SignUpForm() (+3 more)

### Community 16 - "Auth State & Password Flow"
Cohesion: 0.14
Nodes (11): resetPasswordApi(), sendOtpApi(), initialState, initialState, ResetPasswordState, initialState, sendOtp, SendOtpState (+3 more)

### Community 17 - "AWS Services Concepts"
Cohesion: 0.23
Nodes (16): Amazon APS, API Gateway, AWS Solutions Architect, AWS WAF, CloudTrail, CloudWatch, Cost Estimation, DynamoDB (+8 more)

### Community 18 - "Navigation & Layout"
Cohesion: 0.18
Nodes (7): signOut, NavProps, AppDropdownItem(), AppDropdownItemProps, AppDropdownProps, DropdownPosition, AppDropdown

### Community 19 - "Signup Form Elements"
Cohesion: 0.15
Nodes (9): passwordRequirements, PersonalDetailsProps, ProfessionalDetailsFormProps, ProfessionalDetailsProps, InputFieldInterface, InputField, SearchBar, TextAreaInterface (+1 more)

### Community 20 - "UI Modals"
Cohesion: 0.21
Nodes (9): tabs, Step, stepsData, WalkthroughModal, FeedbackModal, ResponseModal, CmeModal, ModalProps (+1 more)

### Community 21 - "Case Details"
Cohesion: 0.22
Nodes (9): fetchCaseDetailsApi(), CaseDetailsState, initialState, tabs, Student Case Study Page, Cases Components Index, Answer, CaseDetail (+1 more)

### Community 22 - "Students Certificates"
Cohesion: 0.18
Nodes (9): initialState, studentsCertificatesSlice, StudentsCertificatesState, Page(), CertificatesContent(), Page(), Page(), Settings() (+1 more)

### Community 23 - "Settings & Account"
Cohesion: 0.21
Nodes (6): AccountSettings(), tabs, AdminAccountSettings(), tabs, TabsProps, Tabs

### Community 25 - "Admin Dashboard Layout"
Cohesion: 0.22
Nodes (7): AdminLayout(), navLinks, DashboardLayoutProps, Nav(), DashboardLayout, StudentCertificate(), Certificates()

### Community 26 - "Forgot Password & Routing"
Cohesion: 0.24
Nodes (9): ForgotPassword(), useAppDispatch, useAppSelector, ResponsesAndFeedbackContent(), TeacherCaseStudies, Page(), Answer, StudentCMEQuestions() (+1 more)

### Community 27 - "Case Materials"
Cohesion: 0.21
Nodes (6): addPdfToCaseMaterialsApi(), caseMaterialsSlice, getCaseMaterials, initialState, CaseCard(), CaseCardProps

### Community 28 - "Form Elements"
Cohesion: 0.21
Nodes (7): CheckBoxProps, Checkbox, BulletedListElement(), listVariants, NumberedListElement(), TaskListItemElement(), ListElement

### Community 29 - "Case Add/Update Flow"
Cohesion: 0.25
Nodes (8): addCase, initialState, updateDraftCase, CreateCaseStudyContent(), initialCaseStudy, Page(), UpdateCaseStudyContent(), Page()

### Community 30 - "Community 30"
Cohesion: 0.29
Nodes (7): initialState, getDraftCases, GetDraftCasesState, initialState, TeacherCaseStudies, TeacherCaseStudiesContent(), CaseStudy

### Community 31 - "Community 31"
Cohesion: 0.25
Nodes (6): OPAT Case Study, e-Clinical Cases Solutions Platform, Student Dashboard UI, Medical Professionals Illustration, StudentCasePresentation(), TeacherDashboard()

### Community 32 - "Community 32"
Cohesion: 0.31
Nodes (8): deleteCaseMaterial(), getSignedUrlsToFetchForCaseMaterials(), getSignedUrlToUploadForCaseMaterials(), deleteCaseMaterialFromS3(), getSignedUrlForFetchingFromS3(), getSignedUrlToUploadToS3(), s3Client, extrapolateRequestBody()

### Community 33 - "Community 33"
Cohesion: 0.29
Nodes (6): StudentDashboardWithAuth(), TeacherDashboard, TeacherDashboardWithAuth(), Page(), Page(), Session

### Community 34 - "Community 34"
Cohesion: 0.27
Nodes (5): inlineSuggestionVariants, editorVariants, Input(), LinkElementStatic(), LinkElement

### Community 35 - "Community 35"
Cohesion: 0.22
Nodes (5): caseApi, HeadersObj, studentApi, initialState, studentsResponsesToCasesState

### Community 36 - "Community 36"
Cohesion: 0.22
Nodes (8): geist, metadata, nunitoFont, RootLayout(), Tooltip(), TooltipContent(), TooltipProvider(), TooltipTrigger()

### Community 37 - "Community 37"
Cohesion: 0.24
Nodes (8): getPublishedCase, initialState, publishedCaseSlice, PublishedCaseState, dbClient, hasContent(), publishCase(), validateInputs()

### Community 38 - "Community 38"
Cohesion: 0.20
Nodes (7): Login Page, authOptions, JWT, nextAuthInstance, Session, User, config

### Community 39 - "Community 39"
Cohesion: 0.22
Nodes (10): Case Teaching Step UI, Case Study Workflow Steps, Malaria Case Model Course, Certificate of Completion (Malaria Case Model), Certificate of Completion (retina), Certificate of Completion (alternate), COVID Symptoms MCQ Question, CME Questions Page UI (+2 more)

### Community 40 - "Community 40"
Cohesion: 0.39
Nodes (5): useAppStore, RootState, AppDispatch, AppStore, makeStore()

### Community 41 - "Community 41"
Cohesion: 0.25
Nodes (7): CHANGE / EDIT MODE, Context7, CRITICAL RULES - MUST FOLLOW, graphify, PLANNING MODE, RESPONSES, Runtime

### Community 42 - "Community 42"
Cohesion: 0.39
Nodes (7): getStudentsResponsesApi(), dbClient, extractAnswers(), gradeAnswers(), gradeQuiz(), submitStudentResponse(), generateCertificate()

### Community 43 - "Community 43"
Cohesion: 0.25
Nodes (7): groups, agents, commands, plugins, skills, pluginName, version

### Community 44 - "Community 44"
Cohesion: 0.32
Nodes (6): addFeedback, initialState, getFeedbackInfo(), questions, responses, StudentFeedback()

### Community 45 - "Community 45"
Cohesion: 0.25
Nodes (4): PopoverContent(), PopoverDescription(), PopoverHeader(), PopoverTitle()

### Community 46 - "Community 46"
Cohesion: 0.73
Nodes (6): Female Clinical Assistant Portrait, Female Doctor with Microscope, Male Doctor with Clipboard, Male Doctor in Clinical Setting, Male Doctor Portrait, Male Doctor with Tablet

### Community 47 - "Community 47"
Cohesion: 0.47
Nodes (6): Circular portrait of medical professional in blue surgical scrubs with mask and face shield, holding medical instrument, Circular portrait of woman in white lab coat examining a microscope, Circular portrait of woman in blue surgical scrubs and mask standing in a medical facility, Circular portrait of male doctor wearing stethoscope, glasses, and blue tie, using a tablet device, e-Clinical Cases Solutions brand logo featuring stylized teal eC icon with company name in dark gray and teal text, e-Clinical Cases Solutions brand logo featuring stylized teal eC icon with company name in dark gray and teal text

### Community 48 - "Community 48"
Cohesion: 0.40
Nodes (4): Cme(), CmeProps, Question, FinalReviewProps

### Community 49 - "Community 49"
Cohesion: 0.40
Nodes (3): headingVariants, headingVariants, HeadingElement

### Community 50 - "Community 50"
Cohesion: 0.60
Nodes (5): inputVariants, LinkOpenButton(), popoverVariants, LinkFloatingToolbar, buttonVariants

### Community 51 - "Community 51"
Cohesion: 0.60
Nodes (5): Dark DNA helix gradient background for ongoing case section, e-Clinical registration form with name, email, password fields, SVG wireframe of e-Clinical home page student view, e-Clinical sign-in variant with teal accent, show password toggle, e-Clinical sign-in page with email, password, keep logged in

### Community 52 - "Community 52"
Cohesion: 0.40
Nodes (5): Add icon (plus symbol, 14px), Add icon (rotated plus, 20px), Paperclip attachment icon, Briefcase/suitcase with plus icon, Checkmark confirmation icon

### Community 55 - "Community 55"
Cohesion: 0.67
Nodes (4): Checkmark Icon, Close X Icon, Exclamation Mark Warning Icon, Remove Minus Icon

### Community 56 - "Community 56"
Cohesion: 1.00
Nodes (4): Admin dashboard UI for ECCS platform with sidebar navigation including Cases, Users, Certifications, Invoices, CMS, Media Center, Announcements, Case Studies, Case Comments, Case Model Answers, CME Questions, Case Teaching, Feedbacks, and Reports, Case Comments page UI showing rich text editor for submitting case comments with 150-700 character limit and workflow navigation, Case Model Answers page UI showing side-by-side comparison of user response versus model answer with navigation to proceed to case teaching, Case Presentation page UI showing case description content with deadline 11/30/2024 and proceed to comment on the case button

### Community 60 - "Community 60"
Cohesion: 1.00
Nodes (3): Masked doctor in blue scrubs with stethoscope and tablet, Set of 12 diverse medical staff avatars - doctors, nurses, surgeons, Male doctor in white coat with glasses and stethoscope on tablet

### Community 63 - "Community 63"
Cohesion: 0.67
Nodes (3): Arrow right navigation icon, Downward caret/chevron icon, Downward caret/chevron icon (typo variant)

## Knowledge Gaps
- **305 isolated node(s):** `DEPLOYMENT TODOS`, `POST DEPLOYMENT TODOS 1`, `RESPONSES`, `PLANNING MODE`, `CHANGE / EDIT MODE` (+300 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **42 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `UI Component Library` to `Community 34`, `Rich Text Editor`, `Community 36`, `Community 45`, `Home & Student Views`, `Form Elements`?**
  _High betweenness centrality (0.076) - this node is a cross-community bridge._
- **Why does `Button` connect `Home & Student Views` to `UI Component Library`, `Login & Password Flow`, `Community 44`, `Case Creation Wizard`, `Community 48`, `Navigation & Layout`, `Signup Form Elements`, `UI Modals`, `Community 50`, `Settings & Account`, `Admin Dashboard Layout`, `Forgot Password & Routing`, `Case Materials`, `Community 31`?**
  _High betweenness centrality (0.071) - this node is a cross-community bridge._
- **Why does `useAppSelector` connect `Forgot Password & Routing` to `Community 33`, `Community 40`, `Login & Password Flow`, `Community 44`, `Case Creation Wizard`, `Signup Flow`, `Community 48`, `Case Details`, `Students Certificates`, `Home & Student Views`, `Admin Dashboard Layout`, `Case Materials`, `Case Add/Update Flow`, `Community 30`, `Community 31`?**
  _High betweenness centrality (0.045) - this node is a cross-community bridge._
- **What connects `DEPLOYMENT TODOS`, `POST DEPLOYMENT TODOS 1`, `RESPONSES` to the rest of the system?**
  _305 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AWS SDK Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.045454545454545456 - nodes in this community are weakly interconnected._
- **Should `Auth & Case Flow` be split into smaller, more focused modules?**
  _Cohesion score 0.09841269841269841 - nodes in this community are weakly interconnected._
- **Should `UI Component Library` be split into smaller, more focused modules?**
  _Cohesion score 0.11229946524064172 - nodes in this community are weakly interconnected._