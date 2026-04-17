# User Stories
**Good Food & Healthy Eating — COMP2850**

> **Version history**
> - v1 — Week 4: Initial 13 stories drafted based on project brief and Personas
> - v2 — Week 6: Added 8 new stories (Story 14 to Story 21) based on features identified and built during frontend development. Story 1 updated to reflect 6 meal slots rather than generic meal types.

---

## Section 1 — Subscriber: Diet Monitoring & Nutritional Advice

**Story 1**

**As a** subscriber,
**I can** log details of my food intake across six daily meal slots,
**So that** I can keep a detailed record of what I eat throughout the day and review my eating habits over time.

**Acceptance Criteria:**

**[PASS]** Given I am logged in, When I search for a food item and submit an entry with a portion size and meal slot, Then the entry is saved and appears in the correct slot for that date.

**[PASS]** Given I have logged meals across multiple days, When I open the food diary, Then I can browse past entries organised by date.

**[FAIL]** Given I attempt to save an entry without selecting a food item, When I submit the form, Then the system displays a validation message and does not save the entry.

---

**Story 2**

**As a** subscriber,
**I can** view visual summaries of my nutritional intake over time,
**So that** I can see how well I am following dietary guidelines without interpreting complex data.

**Acceptance Criteria:**

**[PASS]** Given I have logged meals for at least seven days, When I open the Trends page, Then I see a chart showing my daily intake of key nutrients for that period.

**[PASS]** Given I am viewing the weekly trends chart, When I select a specific day, Then I see a breakdown of the meals logged for that day.

**[FAIL]** Given I have fewer than two days of diary entries, When I open the Trends page, Then the system displays a message explaining that more data is needed rather than an empty chart.

---

**Story 3**

**As a** subscriber,
**I can** receive feedback on how well my diet meets nutritional guidelines,
**So that** I can understand what specific changes I should make to improve my eating habits.

**Acceptance Criteria:**

**[PASS]** Given I have logged at least three days of meals, When I open the Feedback section, Then I see at least one specific actionable recommendation based on my recent intake.

**[PASS]** Given my average sugar intake has exceeded the recommended level for five consecutive days, When I view my feedback, Then the system highlights this pattern and suggests lower-sugar alternatives.

**[FAIL]** Given I have no diary entries for the current week, When I open the Feedback section, Then the system prompts me to log meals before personalised feedback is shown.

---

**Story 4**

**As a** subscriber,
**I can** view my daily nutritional status through icons and colour indicators,
**So that** I can understand at a glance whether my diet is on track without interpreting numerical data.

**Acceptance Criteria:**

**[PASS]** Given I have logged meals for today, When I open the home screen, Then I see icon-based indicators for key nutrients showing green, amber, or red status based on my intake relative to recommended amounts.

**[PASS]** Given a nutrient indicator is showing red, When I select the icon, Then the system displays a plain-language explanation and a simple suggestion for improvement.

**[FAIL]** Given I have not logged any meals today, When I view the home screen, Then the nutritional status icons are shown in a neutral state rather than displaying misleading values.

---

**Story 5**

**As a** subscriber,
**I can** receive suggestions for healthier food alternatives based on my logged dietary patterns,
**So that** I can make practical improvements to my diet without researching options myself.

**Acceptance Criteria:**

**[PASS]** Given I have regularly logged high-sugar items in my diary, When I view the Suggestions page, Then I see at least one recommended lower-sugar alternative relevant to my recent entries.

**[PASS]** Given a suggestion is displayed, When I select it, Then I see a brief explanation of why this alternative is being recommended based on my diary.

**[FAIL]** Given I dismiss a suggestion, When I return to the Suggestions page on the same day, Then the dismissed suggestion does not reappear unless my diary entries change significantly.

---

**Story 14 — Exercise Logging**

**As a** subscriber,
**I can** log my exercise activity alongside my food diary,
**So that** I can track my overall energy balance and not just my food intake.

**Acceptance Criteria:**

**[PASS]** Given I am on the Record Today page, When I add an exercise entry with a type and duration, Then the exercise is saved and shown in my activity log for that day.

**[PASS]** Given I have logged both food and exercise for today, When I view the dashboard, Then I can see both my calorie intake and my exercise activity in the same view.

**[FAIL]** Given I submit an exercise entry without selecting an activity type, When I submit the form, Then the system displays a validation message and does not save the entry.

---

**Story 15 — Onboarding Guide**

**As a** subscriber,
**I can** follow a step-by-step guided tour of the system when I first log in,
**So that** I can understand how to use the key features without needing to ask for help.

**Acceptance Criteria:**

**[PASS]** Given I log in for the first time, When the dashboard loads, Then an onboarding guide launches and walks me through the main features in clearly labelled steps.

**[PASS]** Given I am at any step of the guide, When I choose to skip, Then the guide closes and I am taken directly to the dashboard.

**[FAIL]** Given I skipped the guide on first login, When I later want to revisit it, Then I can relaunch it from the dashboard at any time.

---

**Story 16 — Personal Settings**

**As a** subscriber,
**I can** update my personal details and dietary preferences in a settings page,
**So that** the system can provide feedback and targets that are relevant to my individual profile.

**Acceptance Criteria:**

**[PASS]** Given I open the settings page, When I update my personal details such as name or dietary goals, Then the changes are saved and reflected in my profile.

**[PASS]** Given I open the preferences section, When I update my notification or display settings, Then the new preferences are applied immediately.

**[FAIL]** Given I attempt to save a required field as empty, When I submit the form, Then the system displays a validation message and does not save the changes.

---

## Section 2 — Subscriber: Home Cooking & Recipes

**Story 6**

**As a** subscriber,
**I can** browse a library of nutritious meal recommendations with full recipes and preparation instructions,
**So that** I can discover healthy meals I can cook at home rather than relying on ready meals.

**Acceptance Criteria:**

**[PASS]** Given I open the Recipes section, When the page loads, Then I see recipe cards each showing a title, estimated preparation time, and approximate cost.

**[PASS]** Given I select a recipe card, When the detail page opens, Then I see the full ingredient list, step-by-step instructions, and the nutritional profile of the meal.

**[FAIL]** Given the recipe data fails to load, When the page renders, Then the system displays an error message and a retry option rather than a blank page.

---

**Story 7**

**As a** subscriber,
**I can** search for recipes based on specific ingredients I already have,
**So that** I can find meals I can cook immediately without needing to buy additional items.

**Acceptance Criteria:**

**[PASS]** Given I enter two ingredients into the search field, When I submit the search, Then the system returns recipes that use those ingredients ranked by how many of my listed ingredients they require.

**[PASS]** Given search results are displayed, When I view each result, Then I can see how many of my entered ingredients the recipe uses without opening the full recipe.

**[FAIL]** Given I submit an ingredient search with no ingredients entered, When the search runs, Then the system displays a validation message rather than returning all recipes.

---

**Story 8**

**As a** subscriber,
**I can** rate recipes I have tried and read ratings left by other subscribers,
**So that** I can make informed decisions about which recipes to attempt based on community experience.

**Acceptance Criteria:**

**[PASS]** Given I have cooked a recipe, When I submit a star rating and an optional comment, Then my rating and comment appear on the recipe page with my username and the date.

**[PASS]** Given a recipe has received multiple ratings, When I view the recipe detail page, Then I see the average star rating and the total number of reviews.

**[FAIL]** Given I attempt to submit a comment containing only whitespace, When I submit, Then the system rejects the submission and asks me to write a comment before posting.

---

**Story 9**

**As a** subscriber,
**I can** save recipes I have tried and enjoyed to a personal favourites list,
**So that** I can quickly find and revisit meals I want to cook again without searching each time.

**Acceptance Criteria:**

**[PASS]** Given I am viewing a recipe, When I save it to my favourites, Then the recipe is added immediately and the saved state is visually indicated.

**[PASS]** Given I have saved multiple recipes, When I open my Favourites page, Then all saved recipes are displayed and I can open any of them.

**[FAIL]** Given a recipe is already in my favourites, When I save it again, Then the system removes it from my favourites rather than adding a duplicate.

---

**Story 17 — Recipe Comparison**

**As a** subscriber,
**I can** compare the nutritional data of up to four saved recipes side by side,
**So that** I can make more informed choices about which meals best fit my dietary goals.

**Acceptance Criteria:**

**[PASS]** Given I have saved at least two recipes, When I open the Recipe Compare page and select them, Then I see a chart comparing their nutritional values side by side.

**[PASS]** Given I am viewing a comparison, When I remove a recipe, Then the chart updates immediately to reflect the remaining selections.

**[FAIL]** Given I attempt to add a fifth recipe to the comparison, When I select it, Then the system prevents the addition and informs me the maximum is four recipes.

---

**Story 18 — Meal Planner**

**As a** subscriber,
**I can** plan my meals for the day based on a calorie budget with recipe recommendations for each slot,
**So that** I can prepare ahead and make healthier choices rather than deciding what to eat at the last minute.

**Acceptance Criteria:**

**[PASS]** Given I open the Meal Planner, When the page loads, Then I see recipe suggestions for each meal slot based on my daily calorie target.

**[PASS]** Given a recipe is suggested for a slot, When I lock it, Then that slot remains fixed when I refresh or swap other slots.

**[FAIL]** Given I have no saved recipes, When I open the Meal Planner, Then the system displays a prompt to browse and save recipes before planning can begin.

---

## Section 3 — Health Professional: Client Management & Advice

**Story 10**

**As a** health professional,
**I can** view a dashboard showing all of my assigned clients and their recent dietary activity,
**So that** I can monitor how well my clients are following their dietary plans without opening each profile individually.

**Acceptance Criteria:**

**[PASS]** Given I am logged in as a health professional, When I open my dashboard, Then I see all assigned clients with each client's name, most recent diary entry date, and a colour-coded compliance indicator.

**[PASS]** Given I am viewing my dashboard, When I select a client's name, Then I am taken to that client's profile showing their food diary for the past 30 days.

**[FAIL]** Given I am not authenticated as a health professional, When I attempt to access the client dashboard directly, Then I am redirected to the login page and no client data is shown.

---

**Story 11**

**As a** health professional,
**I can** observe how well each of my clients is following their nutritional guidelines using visual progress indicators,
**So that** I can quickly identify which clients need attention without reading through individual reports.

**Acceptance Criteria:**

**[PASS]** Given I am on my client dashboard, When the page loads, Then each client row displays a visual status indicator based on their dietary compliance over the past seven days.

**[PASS]** Given a client has not met their nutritional guidelines for five or more consecutive days, When I view my dashboard, Then that client's status indicator shows they require follow-up.

**[FAIL]** Given a client has no diary entries in the past seven days, When I view my dashboard, Then their status is shown as inactive rather than displaying a misleading compliance score.

---

**Story 12**

**As a** health professional,
**I can** send personalised dietary advice and encouragement directly to my clients through the system,
**So that** I can support my clients between appointments without contacting them by personal phone or email.

**Acceptance Criteria:**

**[PASS]** Given I am viewing a client's profile, When I write and send a message, Then the message is delivered to the client and a timestamp is recorded.

**[PASS]** Given I have sent a message to a client, When the client reads the message, Then a read receipt is shown on my sent messages view.

**[FAIL]** Given I attempt to send a message with an empty text field, When I submit, Then the system prevents the submission and asks me to write a message first.

---

**Story 13**

**As a** health professional,
**I can** receive automatic alerts when a client has not logged their food diary for three or more consecutive days,
**So that** I can intervene early rather than discovering inactivity only at their next appointment.

**Acceptance Criteria:**

**[PASS]** Given a client assigned to me has not logged any entries for three consecutive days, When the system's daily check runs, Then an alert flag appears next to that client's name on my dashboard.

**[PASS]** Given an alert is active for a client, When I view the alert details, Then I see the client's name, the number of days without an entry, and the date of their last entry.

**[FAIL]** Given I have dismissed an alert for a client, When that client stops logging again for three days after a new entry, Then a new alert is triggered rather than remaining in the dismissed state.

---

**Story 19 — Client Health Analytics**

**As a** health professional,
**I can** view detailed analytics for each client including BMI, body metrics, and health scores across nutrition, consistency, hydration, and exercise,
**So that** I can assess a client's overall wellbeing at a glance rather than reading through raw diary entries.

**Acceptance Criteria:**

**[PASS]** Given I open a client's profile, When I view the analytics tab, Then I see their BMI, weight, and a breakdown of health scores across at least four categories.

**[PASS]** Given a client's score in any category is critically low, When I view their analytics, Then that category is visually highlighted to indicate it requires attention.

**[FAIL]** Given a client has no diary entries, When I view their analytics, Then the system displays a message indicating insufficient data rather than showing empty or zero scores.

---

**Story 20 — Client Appointment Management**

**As a** health professional,
**I can** view and manage scheduled appointments with my clients within the system,
**So that** I can keep track of upcoming consultations without relying on a separate calendar tool.

**Acceptance Criteria:**

**[PASS]** Given I open a client's profile, When I select the Appointments tab, Then I see a list of upcoming appointments with the date, time, and type of session.

**[PASS]** Given I have multiple clients with appointments on the same day, When I view the overview dashboard, Then I can see all of that day's appointments in one place.

**[FAIL]** Given I attempt to schedule an appointment at a time that conflicts with an existing one, When I confirm the booking, Then the system alerts me to the conflict rather than creating a duplicate.

---

**Story 21 — Edit Client Meal Plan**

**As a** health professional,
**I can** create and edit a weekly meal plan for each of my clients directly within their profile,
**So that** I can provide structured dietary guidance that goes beyond text-based advice messages.

**Acceptance Criteria:**

**[PASS]** Given I open a client's profile, When I select the Plan tab, Then I see their current weekly meal plan with one entry per day.

**[PASS]** Given I edit a day's entry in the plan, When I save the changes, Then the updated plan is immediately visible on the client's profile.

**[FAIL]** Given I attempt to save a plan with a day left completely empty, When I submit, Then the system asks me to confirm whether I intend to leave that day without a plan entry.
