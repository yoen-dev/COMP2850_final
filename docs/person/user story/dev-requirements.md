# Development Requirements
**Good Food & Healthy Eating — COMP2850 | Icon-driven UI, no translation feature**

---

## Overview — Features by Persona

| Persona | Frontend Tasks | Backend Tasks |
|---------|---------------|---------------|
| **Rose** — food diary, icon-based nutrition summary, personalised suggestions | Meal entry UI, icon status dashboard, suggestion cards | Diary CRUD API, nutrition calculation engine, recommendation logic |
| **Dr. James Okafor** — client dashboard, progress monitoring, messaging, auto-alerts | Client list + status icons, message panel, alert badges | Role-based access, client aggregation API, messaging API, alert scheduler |
| **Marco** — ingredient search, cost/time tags, ratings & comments, favourites | Ingredient tag input, recipe card badges, star rating, favourites list | Recipe search API, match ranking, ratings/comments API, favourites API |
| **Sarah** — food diary, icon nutrition feedback, family-friendly recipes, favourites | Icon nutrition summary, recipe search UI, favourites page | Nutrition API (shared with Rose), recipe filter API, favourites API (shared with Marco) |

---

## Persona 1 — Rose (Subscriber)

> Core need: log meals, understand nutritional intake through simple visuals, receive suggestions to improve eating habits.

---

### F1.1 — Food Diary

**Pain point:** Rose has no tool to track what she eats. She relies entirely on guesswork and will not use a paper-based alternative.

| | Frontend | Backend |
|-|----------|---------|
| **Food diary — log meals and view history** | Meal entry form: food search, portion size, meal type selector (breakfast / lunch / dinner / snack) | `POST /diary` — create entry (userId, foodId, portionSize, mealType, date) |
| | Calendar/date view to browse past entries | `GET /diary?userId&date` — get all entries for a day |
| | Daily summary page listing all logged items | `GET /diary?userId&startDate&endDate` — get entries over a range |
| | Edit and delete entry buttons | `PUT /diary/:entryId` — update an entry |
| | | `DELETE /diary/:entryId` — remove an entry |
| | | **Foods table:** id, name, caloriesPer100g, proteinPer100g, carbsPer100g, fatPer100g, sugarPer100g |

---

### F1.2 — Icon-based Nutrition Summary Dashboard

**Pain point:** Rose is overwhelmed by complex data. Icons and colour coding replace numbers and tables.

| | Frontend | Backend |
|-|----------|---------|
| **Icon-based daily nutrition summary** | Home screen icon status bar: one icon per key nutrient (calories, sugar, protein, carbs) in green / amber / red | `GET /nutrition/daily?userId&date` — return daily nutrient totals + iconStatus per nutrient (under / ok / over) |
| | Tapping an icon expands a plain-language one-line explanation | `GET /nutrition/weekly?userId&weekStart` — return 7-day nutrient totals |
| | Mini weekly trend chart (tap to see daily breakdown) | Status logic: consumed < 90% target → under; 90–110% → ok; > 110% → over |
| | No numerical tables — status via colour and icons only | Response includes `iconStatus` object: `{ sugar: 'over', protein: 'under', ... }` |
| | | **Nutritional reference values table** (recommended daily intake per nutrient) |

---

### F1.3 — Personalised Dietary Suggestions

**Pain point:** Rose wants to improve her diet but receives no concrete guidance on healthier alternatives.

| | Frontend | Backend |
|-|----------|---------|
| **Personalised healthy eating suggestions** | Suggestion card on home/diary page: icon + one-line recommendation | `GET /suggestions?userId` — generate suggestions from last 7 days of diary entries |
| | Tap to expand plain-language explanation | Logic: average sugar > threshold → lower-sugar alternatives; protein below target → high-protein options |
| | Dismiss / save suggestion buttons | **Suggestions table:** id, triggerNutrient, condition, suggestedFoodId, reasonText |

---

## Persona 2 — Dr. James Okafor (Health Professional)

> Core need: oversee all clients from a single view, quickly identify at-risk clients via visual indicators, send advice and encouragement, receive automatic alerts when clients go inactive.

---

### F2.1 — Client Dashboard + Visual Progress Monitoring

**Pain point:** Dr. Okafor must open each client profile individually. Back-to-back appointments leave no time for manual review.

| | Frontend | Backend |
|-|----------|---------|
| **Client dashboard with icon-based status** | Dashboard: table listing all assigned clients | `GET /professional/:profId/clients` — return client list with summary stats |
| | Each row: name, last diary date, colour-coded status icon (green/amber/red), alert flag | Summary fields: lastEntryDate, complianceScore (% days meeting targets, last 7 days), iconStatus (good/warning/critical), hasAlert |
| | Icon key: green = on track, amber = needs attention, red = immediate follow-up | Status logic: compliance ≥ 80% → good; 50–79% → warning; < 50% or no entries → critical |
| | Click name → client profile with full 30-day diary | `GET /professional/:profId/clients/:clientId/diary` — retrieve client's full diary |
| | Filter / sort by status or last activity | **Role guard:** only `role = 'professional'` may access `/professional/*` routes |
| | | **Client_Professional table:** clientId, professionalId, assignedDate |

---

### F2.2 — In-system Messaging

**Pain point:** Dr. Okafor uses personal email and phone, leaving no record of advice given inside the platform.

| | Frontend | Backend |
|-|----------|---------|
| **Send advice and encouragement to clients** | Message compose panel on client profile: text input, send button | `POST /messages` — send message (senderId, recipientId, body, timestamp) |
| | Sent messages list with timestamp and read receipt icon | `GET /messages?userId` — retrieve all messages for a user |
| | Client-side inbox showing messages from their professional | `PUT /messages/:messageId/read` — mark as read, record readAt |
| | Unread message badge on client navigation menu | **Messages table:** id, senderId, recipientId, body, sentAt, readAt |
| | | Authorisation: sender must be the recipient's assigned professional |

---

### F2.3 — Automatic Inactivity Alerts

**Pain point:** Dr. Okafor has no alert mechanism and only discovers inactivity at the next appointment.

| | Frontend | Backend |
|-|----------|---------|
| **Auto-alert when client stops logging** | Red alert icon next to client name on dashboard | Scheduled background job (cron): runs daily, checks all subscriber accounts |
| | Alert detail modal: '[Name] has not logged for X days' | Logic: lastEntryDate < today minus 3 days AND professional assigned → trigger alert |
| | Dismiss button (re-triggers if inactivity continues) | **Alerts table:** id, clientId, professionalId, alertType, triggeredAt, dismissedAt |
| | | `GET /alerts/:profId` — return all active alerts |
| | | `PUT /alerts/:alertId/dismiss` — mark alert as dismissed |

---

## Persona 3 — Marco Ferrari (Home Cook Subscriber)

> Core need: find recipes using available ingredients, see cost and time before opening a recipe, read community reviews, save favourites.

---

### F3.1 — Ingredient-based Recipe Search

**Pain point:** Marco has ingredients but generic search returns recipes that require items he does not have.

| | Frontend | Backend |
|-|----------|---------|
| **Ingredient-based recipe search** | Multi-ingredient input: type one at a time, each added as a removable tag | `POST /recipes/search` — accepts ingredientId array, returns recipes sorted by match score |
| | Search returns recipes ranked by ingredient match count | Match score: count of user's ingredients present in recipe's list, sorted descending |
| | Match count badge on each card (e.g. 'Uses 3 of your 4 ingredients') | **Recipes table:** id, title, description, prepTime, estimatedCost, imageUrl, tags |
| | Clear all button | **Recipe_Ingredients table:** recipeId, ingredientId, quantity, unit |
| | | **Ingredients table:** id, name |
| | | `GET /ingredients?query=` — autocomplete endpoint |

---

### F3.2 — Recipe Cards with Cost and Time Tags

**Pain point:** Marco cannot judge budget or time fit until he opens the full recipe page.

| | Frontend | Backend |
|-|----------|---------|
| **Cost and time visible on recipe card** | Recipe card: title, thumbnail, time icon + minutes, cost icon + GBP estimate | prepTime and estimatedCost stored on Recipes table (see F3.1) |
| | Filter bar: max prep time slider, max cost slider | `GET /recipes?maxTime&maxCost&tags&sortBy` — server-side filtering |
| | Sort: by match score, prep time, cost, or rating | estimatedCost is a pre-calculated value stored at recipe creation time |

---

### F3.3 — Recipe Ratings and Community Comments

**Pain point:** Marco has no community feedback to judge difficulty. Random attempts lead to failures and lost confidence.

| | Frontend | Backend |
|-|----------|---------|
| **Ratings and community comments** | Star rating component on recipe detail page (1–5 stars) | `POST /recipes/:recipeId/ratings` — submit rating (userId, stars 1–5) |
| | Comment input and submit button (requires login) | `POST /recipes/:recipeId/comments` — submit comment (userId, body) |
| | Comment list: author, date, text, and rating | `GET /recipes/:recipeId/reviews` — return all ratings and comments, newest first |
| | Average star rating and total review count | **Ratings table:** id, recipeId, userId, stars, createdAt |
| | Pagination when more than 10 comments | **Comments table:** id, recipeId, userId, body, createdAt |
| | | One rating per user per recipe (upsert on re-submit) |

---

### F3.4 — Recipe Favourites

**Pain point:** Marco cannot save recipes he has enjoyed and frequently cannot find them again.

| | Frontend | Backend |
|-|----------|---------|
| **Save and retrieve favourites** | Bookmark/heart icon on cards and detail pages; filled = saved | `POST /favourites` — add to favourites (userId, recipeId) |
| | My Favourites page: grid of saved recipe cards | `DELETE /favourites/:recipeId` — remove from favourites |
| | Tap icon again to unsave | `GET /favourites?userId` — return all saved recipes |
| | | **Favourites table:** id, userId, recipeId, savedAt |
| | | `GET /recipes/:recipeId` response includes `isFavourited` boolean |

---

## Persona 4 — Sarah Thompson (Parent Subscriber)

> Core need: understand whether family meals meet nutritional guidelines through icons, find family-friendly recipes, save approved recipes. Directly addresses the childhood obesity concern in the project brief.

---

### F4.1 — Food Diary + Icon-based Nutrition Feedback

**Pain point:** Sarah has no tool to check whether family meals meet nutritional guidelines and no time to read numbers.

| | Frontend | Backend |
|-|----------|---------|
| **Food diary + icon nutrition feedback** | Meal entry form (shared component with F1.1) | `GET /nutrition/daily` response includes iconStatus object — shared with Rose F1.2 |
| | Home screen icon status bar: colour-coded icons, no numbers | No additional backend required — reuses Rose's nutrition calculation API entirely |
| | Tap icon → plain one-line explanation | |
| | Icons readable at a glance in busy kitchen or supermarket | |

---

### F4.2 — Family-friendly Recipe Search

**Pain point:** Sarah cannot find nutritious recipes suited to a family with children.

| | Frontend | Backend |
|-|----------|---------|
| **Family-friendly recipe search** | Recipe search bar (shared with F3.1 / F3.2), showing time and cost tags | Recipes table: add `tags` field (array, e.g. `['family-friendly', 'kid-friendly']`) |
| | Filter tags: 'Family-friendly', 'Kid-friendly' | `GET /recipes?tags=` — support tag-based filtering |
| | Recipe detail shows full instructions and nutritional overview | Shares the same recipe backend as Marco — only adds a tag filter parameter |

---

### F4.3 — Recipe Favourites *(shared with Marco)*

**Pain point:** Sarah's browser bookmarks and phone screenshots are disorganised and rarely revisited.

| | Frontend | Backend |
|-|----------|---------|
| **Save family-approved recipes** | Favourites icon (fully shared with F3.4) | Fully reuses F3.4 favourites API — no additional backend development required |
| | My Favourites page (fully shared with Marco) | |

---

## Shared Foundation — Authentication & Role Management

---

### User Registration and Login

| | Frontend | Backend |
|-|----------|---------|
| **Auth** | Registration form: name, email, password, role selector | `POST /auth/register` — create user |
| | Login form: email, password | `POST /auth/login` — verify credentials, return JWT |
| | Redirect to role-appropriate home after login | **Users table:** id, name, email, passwordHash, role, createdAt |
| | | JWT middleware: validate token on all protected routes |
| | | Role guard: reject `/professional/*` if `role !== 'professional'` |

### Client–Professional Relationship

| | Frontend | Backend |
|-|----------|---------|
| **Relationship management** | Professional's 'My Clients' page: add clients by email or ID | `POST /professional/:profId/clients` — assign a client |
| | Client account shows assigned professional's name | `DELETE /professional/:profId/clients/:clientId` — remove assignment |
| | | **Client_Professional table:** clientId, professionalId, assignedDate |

---

## Full API Endpoint Summary

### Authentication & Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register a new user |
| POST | `/auth/login` | Log in and receive JWT |

### Food Diary & Food Search
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/diary` | Create a new diary entry |
| GET | `/diary?userId&date` | Get all entries for a day |
| GET | `/diary?userId&startDate&endDate` | Get entries over a date range |
| PUT | `/diary/:entryId` | Update a diary entry |
| DELETE | `/diary/:entryId` | Delete a diary entry |
| GET | `/foods?query=` | Search food items |

### Nutrition & Suggestions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/nutrition/daily?userId&date` | Daily nutrient totals + icon status |
| GET | `/nutrition/weekly?userId&weekStart` | Weekly nutrient totals |
| GET | `/suggestions?userId` | Get personalised dietary suggestions |

### Recipes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/recipes?maxTime&maxCost&tags&sortBy` | List / filter recipes |
| POST | `/recipes/search` | Ingredient-based recipe search |
| GET | `/recipes/:recipeId` | Get recipe detail |
| POST | `/recipes/:recipeId/ratings` | Submit a star rating |
| POST | `/recipes/:recipeId/comments` | Submit a comment |
| GET | `/recipes/:recipeId/reviews` | Get ratings and comments |
| GET | `/ingredients?query=` | Autocomplete ingredient search |
| POST | `/favourites` | Add recipe to favourites |
| DELETE | `/favourites/:recipeId` | Remove from favourites |
| GET | `/favourites?userId` | Get all saved recipes |

### Health Professional
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/professional/:profId/clients` | Get client list with summary stats |
| POST | `/professional/:profId/clients` | Assign a client |
| DELETE | `/professional/:profId/clients/:clientId` | Remove a client |
| GET | `/professional/:profId/clients/:clientId/diary` | View client's full diary |
| POST | `/messages` | Send a message |
| GET | `/messages?userId` | Get all messages for a user |
| PUT | `/messages/:messageId/read` | Mark message as read |
| GET | `/alerts/:profId` | Get all active alerts |
| PUT | `/alerts/:alertId/dismiss` | Dismiss an alert |

---

## Database Tables Summary

| Table | Key Fields |
|-------|-----------|
| **Users** | id, name, email, passwordHash, role, createdAt |
| **Foods** | id, name, caloriesPer100g, proteinPer100g, carbsPer100g, fatPer100g, sugarPer100g |
| **Diary_Entries** | id, userId, foodId, portionSizeG, mealType, date, createdAt |
| **Suggestions** | id, triggerNutrient, condition, suggestedFoodId, reasonText |
| **Client_Professional** | id, clientId, professionalId, assignedDate |
| **Messages** | id, senderId, recipientId, body, sentAt, readAt |
| **Alerts** | id, clientId, professionalId, alertType, triggeredAt, dismissedAt |
| **Recipes** | id, title, description, prepTime, estimatedCost, imageUrl, tags, createdAt |
| **Recipe_Ingredients** | id, recipeId, ingredientId, quantity, unit |
| **Ingredients** | id, name |
| **Ratings** | id, recipeId, userId, stars, createdAt |
| **Comments** | id, recipeId, userId, body, createdAt |
| **Favourites** | id, userId, recipeId, savedAt |
