# User Stories
**Good Food & Healthy Eating — COMP2850**

> **Version history**
> - v1 — Week 4: Initial 13 stories drafted based on project brief and Personas

---

## Section 1 — Subscriber: Diet Monitoring & Nutritional Advice

**Story 1**

**As a** subscriber,
**I can** log details of my food intake in a daily food diary,
**So that** I can keep a record of what I eat and review my eating habits over time.

**Acceptance Criteria:**

Given I am logged in, When I search for a food item and enter a portion size and meal type, Then the entry is saved and appears in my diary for that date.

Given I have logged meals across multiple days, When I open the food diary, Then I can browse past entries by date in chronological order.

Given I attempt to save a diary entry without selecting a food item, When I submit the form, Then the system displays a validation message and does not save the entry.

---

**Story 2**

**As a** subscriber,
**I can** view simple and informative visual summaries of my nutritional intake over time,
**So that** I can see how well I am following dietary guidelines without needing to interpret complex data.

**Acceptance Criteria:**

Given I have logged meals for at least seven days, When I open the Trends page, Then I see a chart showing my daily intake of key nutrients for that period.

Given I am viewing the weekly trends chart, When I select a specific day, Then I see a breakdown of the meals logged for that day.

Given I have fewer than two days of diary entries, When I open the Trends page, Then the system displays a message explaining that more data is needed rather than an empty chart.

---

**Story 3**

**As a** subscriber,
**I can** receive clear feedback from the system on how well my diet meets nutritional guidelines,
**So that** I can understand what specific changes I should make to improve my eating habits.

**Acceptance Criteria:**

Given I have logged at least three days of meals, When I open the Feedback section, Then I see at least one specific actionable recommendation based on my recent nutritional intake.

Given my average sugar intake has exceeded the recommended daily level for five consecutive days, When I view my feedback, Then the system highlights this pattern and suggests lower-sugar alternatives.

Given I have no diary entries for the current week, When I open the Feedback section, Then the system prompts me to log at least one day of meals before personalised feedback can be generated.

---

**Story 4**

**As a** subscriber,
**I can** view my daily nutritional status through icons and colour indicators rather than numbers and tables,
**So that** I can understand at a glance whether my diet is on track without needing to interpret technical nutritional data.

**Acceptance Criteria:**

Given I have logged meals for today, When I open the home screen, Then I see icon-based indicators for key nutrients showing green, amber, or red status depending on whether I am within, approaching, or over the recommended daily amount.

Given a nutrient indicator is showing red, When I select the icon, Then the system displays a brief plain-language explanation of what the status means and a simple suggestion for improvement.

Given I have not logged any meals today, When I view the home screen, Then the nutritional status icons are shown in a neutral greyed-out state rather than displaying misleading default values.

---

**Story 5**

**As a** subscriber,
**I can** receive personalised suggestions for healthier food alternatives based on my logged dietary patterns,
**So that** I can make practical improvements to my diet without having to research healthy options myself.

**Acceptance Criteria:**

Given I have regularly logged high-sugar snacks in my diary, When I view the Suggestions page, Then I see at least one recommended lower-sugar alternative relevant to my eating patterns.

Given a suggestion is displayed, When I select it, Then I see a brief explanation of why this alternative is being recommended based on my recent diary entries.

Given I dismiss a suggestion, When I return to the Suggestions page within the same day, Then the dismissed suggestion does not reappear unless my diary entries change significantly.

---

## Section 2 — Subscriber: Home Cooking & Recipes

**Story 6**

**As a** subscriber,
**I can** browse a library of nutritious meal recommendations with full recipes and preparation instructions,
**So that** I can discover healthy meals I can cook at home rather than relying on ready meals.

**Acceptance Criteria:**

Given I open the Recipes section, When the page loads, Then I see a list of recipe cards each showing a title, thumbnail image, estimated preparation time, and approximate cost.

Given I select a recipe card, When the detail page opens, Then I see the full list of ingredients, step-by-step preparation instructions, and the nutritional profile of the meal.

Given the recipe data fails to load, When the page renders, Then the system displays an error message and a retry option rather than a blank or broken page.

---

**Story 7**

**As a** subscriber,
**I can** search for recipe recommendations based on specific ingredients I already have,
**So that** I can find meals I can cook immediately without needing to buy additional items.

**Acceptance Criteria:**

Given I enter two ingredients into the ingredient search field, When I submit the search, Then the system returns a list of recipes that use those ingredients ranked by how many of my listed ingredients they require.

Given search results are displayed, When I view each recipe card, Then I can see how many of my entered ingredients the recipe uses without opening the full recipe page.

Given I submit an ingredient search with no ingredients entered, When the search runs, Then the system displays a validation message asking me to enter at least one ingredient rather than returning all recipes.

---

**Story 8**

**As a** subscriber,
**I can** rate recipes I have tried and read ratings and comments left by other subscribers,
**So that** I can make informed decisions about which recipes to attempt and share my experience with the community.

**Acceptance Criteria:**

Given I have cooked a recipe, When I submit a star rating between 1 and 5 and an optional comment, Then my rating and comment appear on the recipe page with my username and the submission date.

Given a recipe has received ratings from multiple subscribers, When I view the recipe detail page, Then I see the average star rating and the total number of reviews.

Given I attempt to submit a comment that contains only whitespace, When I submit, Then the system rejects the submission and asks me to write a comment before posting.

---

**Story 9**

**As a** subscriber,
**I can** save recipes I have tried and enjoyed to a personal favourites list,
**So that** I can quickly find and revisit meals my family or I have approved without searching again.

**Acceptance Criteria:**

Given I am viewing a recipe, When I save it to my favourites, Then the recipe is added immediately and the saved state is visually indicated.

Given I have saved multiple recipes, When I open my Favourites page, Then all saved recipes are displayed and I can open any of them.

Given a recipe is already in my favourites, When I save it again, Then the system removes it from my favourites rather than adding a duplicate.

---

## Section 3 — Health Professional: Client Management & Advice

**Story 10**

**As a** health professional,
**I can** view a dashboard showing all of my assigned clients and their recent dietary activity,
**So that** I can monitor how well my clients are following their dietary plans without opening each profile individually.

**Acceptance Criteria:**

Given I am logged in as a health professional, When I open my dashboard, Then I see a list of all assigned clients with each client's name, most recent diary entry date, and a colour-coded nutritional compliance indicator.

Given I am viewing my dashboard, When I select a client's name, Then I am taken to that client's profile showing their full food diary for the past 30 days.

Given I am not authenticated as a health professional, When I attempt to access the client dashboard directly, Then I am redirected to the login page and the dashboard content is not displayed.

---

**Story 11**

**As a** health professional,
**I can** observe how well each of my clients is following their nutritional guidelines using visual progress indicators,
**So that** I can quickly identify which clients need attention without having to read through detailed reports for each one.

**Acceptance Criteria:**

Given I am on my client dashboard, When the page loads, Then each client row displays a visual status icon indicating whether their recent dietary compliance is good, needs attention, or is poor, based on their diary entries for the past seven days.

Given a client has not met their nutritional guidelines for five or more consecutive days, When I view my dashboard, Then that client's status icon is shown in red to indicate they require follow-up.

Given a client has no diary entries in the past seven days, When I view my dashboard, Then their status icon is shown as inactive rather than defaulting to a misleading compliance score.

---

**Story 12**

**As a** health professional,
**I can** send personalised dietary advice and words of encouragement directly to my clients through the system,
**So that** I can support my clients between appointments without needing to contact them by phone or personal email.

**Acceptance Criteria:**

Given I am viewing a client's profile, When I write a message and send it, Then the message is delivered to the client's inbox and a timestamp is recorded against the sent message.

Given I have sent a message to a client, When the client reads the message, Then a read receipt is displayed on my sent messages view.

Given I attempt to send a message with an empty text field, When I submit, Then the system prevents the submission and asks me to write a message before sending.

---

**Story 13**

**As a** health professional,
**I can** receive automatic alerts when a client has not logged their food diary for three or more consecutive days,
**So that** I can intervene early rather than waiting until the next scheduled appointment to discover that a client has stopped engaging with the service.

**Acceptance Criteria:**

Given a client assigned to me has not logged any food diary entries for three consecutive days, When the system's daily check runs, Then an alert flag appears next to that client's name on my dashboard.

Given an alert is active for a client, When I view the alert details, Then I see the client's name, the number of days without a diary entry, and the date of their last entry.

Given I have dismissed an alert for a client, When that client logs a new diary entry and then stops again for three days, Then a new alert is triggered rather than remaining in the dismissed state.
