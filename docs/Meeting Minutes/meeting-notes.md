# Meeting Notes
**NourishWell — Good Food & Healthy Eating — COMP2850**

---

## Meeting 1 — Team Introduction & Project Overview

**Date:** 19 February 2025, 18:00–20:00
**Location:** Laidlaw Library, University of Leeds — Booked Meeting Room
**Attendees:** Che Lin, Tengchuan Jiang, Chin Pang Chan, Baiyi He
**Organised by:** Che Lin
**Minutes by:** Che Lin

---

### Discussion Points

**1. Team introductions**
All four members met in person for the first time. Each member briefly introduced themselves, their background, their technical experience, and their availability outside of scheduled sessions. The meeting provided an opportunity to establish a comfortable working relationship before development began.

**2. Project requirements review**
The team read through the COMP2850 project specification together and identified the core requirements:
- A food diary and nutritional tracking system for subscribers
- Tools for health professionals to monitor and advise clients
- A home cooking and recipe section to encourage healthy eating

The team confirmed that the project involves two distinct user types — subscribers and health professionals — and agreed that this distinction would need to be reflected in both the design and the backend architecture.

**3. Initial technology discussion**
The team discussed potential technology choices. The backend direction was provisionally set as Kotlin with Ktor in line with the module materials. The frontend approach was left open for further discussion at the next meeting.

**4. Communication and version control**
The team agreed to use a group messaging platform for day-to-day communication and GitHub for all code and documentation. Che Lin agreed to set up the GitHub repository and invite all members before the next meeting.

**5. Next meeting**
The team agreed to hold a second meeting once all members had familiarised themselves further with the project requirements, at which point specific task allocation would be discussed.

---

### Action Items

| Action | Owner |
|--------|-------|
| Set up GitHub repository and add all members | Che Lin |
| Re-read project specification individually | All |
| Research Kotlin/Ktor setup | Chin Pang Chan, Baiyi He |
| Draft initial feature list and development allocation document | Che Lin |

---

## Meeting 2 — Task Allocation & Development Planning

**Date:** 11 March 2025, 16:00–18:00
**Location:** Online (Microsoft Teams)
**Attendees:** Che Lin, Tengchuan Jiang, Chin Pang Chan, Baiyi He
**Organised by:** Che Lin
**Minutes by:** Che Lin

---

### Discussion Points

**1. Project requirements recap**
The team reviewed the project specification together and carried out an initial prioritisation of features using the MoSCoW method. Must features were identified as forming the minimum viable system, with Should features to be implemented if time allowed.

**2. Development log and task allocation**
Che Lin shared a development allocation document prepared before the meeting, listing proposed tasks across frontend and backend. The team reviewed it together and agreed on the following division of responsibilities:

| Area | Responsible |
|------|-------------|
| Frontend (pages, UI components, interactions) | Che Lin, Tengchuan Jiang |
| Backend (API, database, server logic) | Chin Pang Chan, Baiyi He |
| Documentation, Wiki, requirements, evidence | Che Lin |

The team acknowledged that task boundaries might shift during development and agreed to communicate openly if additional support was needed in any area.

**3. Frontend design direction**
The team discussed the frontend design direction together. Che Lin had prepared a design proposal drawing on several reference websites and presented it during the meeting. The team reviewed the proposal and approved the direction. Che Lin agreed to publish the finalised proposal to the group after the meeting.

**4. GitHub workflow**
The team agreed on the following Git conventions:
- All development to take place on feature branches, not directly on main
- A pull request is required to merge into main
- At least one other team member must review a PR before it is merged
- Commit messages should clearly describe the change made

**5. Personas and User Stories review**
Che Lin presented the initial Personas and User Stories drafted from the project brief. The team reviewed them, agreed they were a suitable starting point, and suggested a number of minor refinements. Che Lin confirmed these would be incorporated before the next meeting.

**6. Timeline planning**
The team reviewed the submission deadline of 8 May and the demo date of 11 May and agreed on a broad sprint plan:
- Weeks 5–6: Frontend page structure and backend initialisation
- Weeks 7–8: Feature development and frontend–backend integration
- Weeks 9–10: Testing, UX feedback collection, and refinement
- Week 11: Final polish, documentation, and submission preparation

---

### Action Items

| Action | Owner |
|--------|-------|
| Begin frontend page structure and navigation | Che Lin, Tengchuan Jiang |
| Set up backend project and design database schema | Chin Pang Chan, Baiyi He |
| Publish frontend design proposal to group | Che Lin |
| Update Personas and User Stories based on team feedback | Che Lin |
| Create User Story cards on GitHub Project Board | Che Lin |

---

## Meeting 3 — Backend Progress Check

**Date:** 20 March 2025, 16:00–18:00
**Location:** Online (Microsoft Teams)
**Attendees:** Che Lin, Chin Pang Chan, Baiyi He
**Organised by:** Che Lin
**Minutes by:** Che Lin

---

### Discussion Points

**1. Backend progress update**
Chin Pang Chan and Baiyi He reported on the current backend status. The database schema design was still in progress and the basic project structure had been set up, but actual feature development had not yet begun.

**2. Frontend–backend integration discussion**
Che Lin outlined the current state of frontend progress and discussed the basic approach to frontend–backend integration with the backend members. The team had an initial conversation about which API endpoints should be prioritised.

**3. Next steps**
The team agreed that the backend should begin actual feature development as soon as possible, and that the first priority after Che Lin completed the homepage and login page would be to implement the corresponding backend logic for those pages.

---

### Action Items

| Action | Owner |
|--------|-------|
| Progress database schema design and begin feature development | Chin Pang Chan, Baiyi He |
| Complete homepage and login page frontend and publish integration guide | Che Lin |

---

## Meeting 4 — Frontend Design Conflict Resolution & Feature Scope

**Date:** 22 March 2025, 16:00–18:00
**Location:** Online (Microsoft Teams)
**Attendees:** Che Lin, Tengchuan Jiang, Chin Pang Chan, Baiyi He
**Organised by:** Che Lin
**Minutes by:** Che Lin

---

### Discussion Points

**1. Frontend design review**
Following Meeting 2, Tengchuan Jiang had produced a separate design proposal that diverged significantly from the direction the team had already agreed on. This meeting was called to formally review both designs side by side.

The key differences identified were:

| Aspect | Che Lin's approach | Tengchuan Jiang's approach |
|--------|-------------------|---------------------------|
| Visual style | Typography-led, teal and neutral palette, serif headings | Simpler layout, lighter overall style |
| Component complexity | Custom cards, sidebar navigation, donut chart dashboard | More basic component structure |
| Alignment with Personas | Icon-driven, low data density, tailored to Rose and Sarah's use cases | Less explicitly mapped to Persona constraints |

**2. Design decision**
The team evaluated both approaches against the project marking criteria and the Personas. Che Lin shared the relevant sections of the marking criteria during the discussion to support the evaluation.

Key considerations:
- Rose requires a simple, icon-driven interface with no complex data charts
- Sarah needs visual feedback that can be understood quickly during a busy day
- Dr. Okafor needs to manage multiple clients efficiently from a single view
- The marking criteria explicitly references an "accessible-first UI" and "consistent wording, formatting, and attention to detail"

Following discussion, the team agreed that Che Lin's design addressed these requirements more effectively.

**Decision:** The team agreed to adopt Che Lin's design as the basis for all frontend development. Tengchuan Jiang agreed with the decision.

**3. Extended feature scope**
With the Must features confirmed as achievable, the team discussed additional features worth including. The following were agreed as Should priority:

- Exercise logging alongside the food diary
- Recipe comparison tool (up to 4 recipes side by side)
- Meal planner based on a daily calorie budget
- Onboarding guide for first-time users
- Personal settings page
- Health professional: appointment management
- Health professional: per-client meal plan editing
- Health professional: client health analytics (BMI, health scores)

**4. Documentation responsibilities confirmed**
The team reconfirmed that Che Lin is responsible for all documentation including Personas, User Stories, meeting notes, design specification, and ongoing GitHub Wiki maintenance.

---

### Action Items

| Action | Owner |
|--------|-------|
| Proceed with frontend development using agreed design | Che Lin |
| Update User Stories v2 to include extended features | Che Lin |
| Update design specification document | Che Lin |
| Continue backend schema and API development | Chin Pang Chan, Baiyi He |
