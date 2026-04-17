# Personas
**Good Food & Healthy Eating — COMP2850**

> **Version history**
> - v1 — Week 4: Initial four personas drafted based on project brief and needs-finding
> - v2 — Week 6: Goals updated for Rose, Dr. Okafor, Marco, and Sarah to reflect new features identified during frontend development (exercise logging, onboarding, meal planner, recipe comparison, health analytics, appointment management, meal plan editing)

---

## Rose
**Role:** Subscriber — Executive Assistant at a media company
**Environment:** Relies entirely on digital channels — apps, websites, and social media — for food decisions. Does not engage with printed materials.
**Demographic:** 31 years old, lives alone, long working hours, high-pressure environment, frequent takeaway user.
**Trigger:** Frequently orders takeaway and consumes high-sugar snacks to cope with stress. Wants to feel more in control of her eating habits without learning complicated diet rules.

### Pain Points
- After stressful workdays she drinks milk tea or eats desserts as a coping mechanism. Currently: promises herself to reduce sugar the next day but the cycle repeats.
- When concerned about her weight she tries to drastically cut food intake. Currently: these extreme attempts are unsustainable and she returns to previous habits within days.
- Living alone makes takeaway the easiest option after a long day. Currently: chooses food based on speed and convenience rather than nutritional value.
- Most health apps present complex data and charts that feel intimidating. Currently: ignores most of the information and only pays attention to the simplest indicators.

### Goals
- Implement a personalised suggestion feature that recommends healthier alternatives to high-sugar drinks and snacks.
- Implement a food diary that allows users to log meals across six daily slots and track eating patterns over time.
- Provide a simplified nutrition overview that highlights key indicators without overwhelming detail.
- Implement a gradual habit-building tool that sets small, achievable dietary goals rather than extreme restrictions.
- Implement an exercise logging feature so users can track activity alongside food intake and see their overall energy balance.
- Provide a step-by-step onboarding guide so first-time users can learn the system without needing to ask for help.

### Success Criteria
- She receives at least one healthier snack or drink suggestion per day relevant to her logged food choices.
- She can log a full day of meals in under two minutes without needing to read instructions.
- She can view a simple weekly summary of her eating habits on a single screen.
- She completes at least one small dietary goal per week and the system records her progress over time.

### Constraints
- Very limited time and energy after work — any interaction must be completable in under three minutes.
- High stress levels mean she is likely to abandon features that feel effortful or judgmental.
- Lives alone with no external support for cooking or diet planning.
- Relies entirely on digital channels for food information and services.

### Non-Goals
- Does not need advanced medical-grade nutritional analysis or calorie calculations.
- Does not want to manage other users' accounts or view health professional reports.
- Not interested in complex recipe instructions at this stage.

---

## Dr. James Okafor
**Role:** Health Professional — Registered Nutritionist
**Environment:** Uses a desktop computer at the clinic during consultations and a tablet when reviewing client progress remotely.
**Demographic:** 47 years old, runs a private practice in Leeds, manages over 30 clients across different age groups, works full-time with back-to-back appointments.
**Trigger:** His clinic has joined the platform to support remote dietary monitoring. Needs to oversee all clients in one place and send timely advice without scheduling a call for every update.

### Pain Points
- Client food diary entries are scattered with no aggregated overview, so he must open each profile individually. Currently: manually reviews each client one by one, which means some clients are inadvertently overlooked between appointments.
- Every piece of advice must be delivered individually with no in-system communication tool. Currently: contacts clients via personal email or phone, with no record kept inside the platform.
- There is no mechanism to notify him when a client misses several days of logging. Currently: only discovers problems at the next scheduled appointment, by which point habits may have worsened considerably.

### Goals
- Provide a client management dashboard displaying all assigned clients' recent diary activity and compliance status in a single view.
- Implement an in-system messaging feature so health professionals can send personalised advice directly to clients.
- Implement automatic alerts that notify the professional when a client has not logged food for three or more consecutive days.
- Provide visual progress indicators for each client so the professional can quickly assess who needs attention without opening individual profiles.
- Provide detailed per-client health analytics including BMI, body metrics, and health scores across nutrition, consistency, hydration, and exercise.
- Implement appointment management so the professional can view and schedule client consultations within the system.
- Allow the professional to create and edit a weekly meal plan for each client directly within their profile.

### Success Criteria
- He can view all clients' most recent diary date and a compliance indicator on a single page without opening individual profiles.
- He can compose and send a message to a client in under one minute from the client's profile.
- The system automatically flags a client when they have not logged food for three consecutive days.
- He can view a client's BMI, health scores, and appointment schedule from a single profile page.

### Constraints
- Subject to GDPR — all client data must be accessible only to the assigned professional.
- Back-to-back appointments mean each client review must be completable in under ten minutes.
- Must work reliably on both desktop and tablet without additional software installation.

### Non-Goals
- Does not need to log his own personal food diary.
- Does not need to browse, rate, or save recipes.
- Does not need to directly edit a client's food diary entries.

---

## Marco Ferrari
**Role:** Subscriber — Postgraduate Student (Home Cook focus)
**Environment:** Uses a tablet in the kitchen while cooking and his phone at the supermarket to check ingredient lists and costs.
**Demographic:** 27 years old, originally from Italy, postgraduate student at the University of Leeds, lives in a shared house, very tight weekly budget, beginner-level cooking skills.
**Trigger:** Has realised that ready meals are both expensive and unhealthy. Wants to start cooking at home but does not know which recipes are affordable, quick, and achievable for a beginner.

### Pain Points
- Has several ingredients in his fridge but cannot search for recipes using only those items. Currently: searches the web randomly, finds recipes requiring ingredients he does not have, and ends up buying a ready meal instead.
- Cannot tell from the recipe listing whether a dish fits his budget or time constraints until he has opened the full page. Currently: wastes time opening and discarding multiple recipes before finding one that might work.
- Recipe descriptions give no indication of actual difficulty level. Currently: attempts recipes at random, sometimes fails, wastes ingredients and money, and gradually loses motivation to try again.
- When he finds and cooks a recipe he likes, there is no feature to save it. Currently: takes a screenshot or tries to remember where he found it, and frequently cannot locate it again.

### Goals
- Provide an ingredient-based recipe search that returns results ranked by how many of the user's listed ingredients they require.
- Provide recipe cards that clearly show estimated preparation time and approximate cost before the user opens the full recipe.
- Implement a community rating and comment system so users can read honest feedback on difficulty before choosing a recipe.
- Implement a favourites feature so users can save recipes they have tried and enjoyed.
- Provide a recipe comparison tool so users can compare the nutritional and cost data of up to four recipes side by side before deciding which to cook.

### Success Criteria
- He can enter three or fewer ingredients and receive a ranked list of matching recipes within 30 seconds.
- Estimated preparation time and approximate cost are visible on each recipe card without opening the full recipe.
- He can save a recipe to his favourites with a single action and retrieve it from his favourites page at any time.
- He can compare up to four recipes side by side to identify which best fits his budget and nutritional needs.

### Constraints
- Weekly grocery budget of no more than £30.
- Meals must be preparable in under 30 minutes with basic kitchen equipment.
- Beginner cooking level — recipes must use plain language with no assumed technical knowledge.

### Non-Goals
- Does not need detailed nutritional analysis or diet tracking features.
- Does not need to interact with a health professional or access professional dietary advice.

---

## Sarah Thompson
**Role:** Subscriber — Parent Concerned About Family Nutrition
**Environment:** Uses her phone throughout the day — in the kitchen while cooking, at the supermarket, and in the evening when planning meals for the week.
**Demographic:** 38 years old, full-time office administrator, married with two children aged 7 and 10, responsible for most of the family's cooking and food shopping.
**Trigger:** After reading about increasing childhood obesity rates in the UK, wants to improve her family's diet but does not know where to start. Currently cooks mostly from habit with no clear sense of whether meals meet nutritional guidelines.

### Pain Points
- Has no tool to assess whether the meals she cooks contain the right balance of nutrients. Currently: relies on rough guesswork with no clear feedback on whether her family's diet is actually healthy.
- Most recipe platforms are not tailored to families with children — recipes are too complex, too expensive, or not nutritionally focused. Currently: falls back on the same small rotation of meals her family already accepts.
- Nutrition labels and charts use numbers and terminology that require effort to understand. Currently: ignores detailed nutritional breakdowns and relies on vague impressions of whether a meal is healthy enough.
- When her children enjoy a meal, she has no efficient way to save and retrieve that recipe. Currently: bookmarks pages in a browser, resulting in a disorganised collection she rarely revisits.

### Goals
- Implement a food diary and nutritional tracking feature that provides clear visual feedback on whether daily meals meet recommended guidelines.
- Provide icon-based nutritional summaries that communicate dietary information visually without requiring users to interpret numbers.
- Provide a searchable recipe library that includes family-friendly nutritious meals with clear preparation times and cost estimates.
- Implement a favourites feature so users can save approved family recipes and retrieve them easily.
- Implement a meal planner so users can organise meals for the day based on a calorie budget, helping with advance family meal preparation.

### Success Criteria
- She can log a family meal and immediately see a clear visual indicator of whether it meets the recommended nutritional guidelines for that day.
- She can find at least three family-friendly healthy recipes within two minutes using the search feature.
- She can save a recipe to favourites in one action and access her full saved list from a dedicated page.
- She can use the meal planner to plan a full day of family meals within her calorie budget without navigating multiple pages.

### Constraints
- Busy daily schedule with children — interactions must be quick and require no prior reading or training.
- Needs an interface that relies on icons and visuals rather than text, accessible during rushed moments.
- Family budget constraints mean recipes must be practically affordable for a family of four.

### Non-Goals
- Does not need to interact with a health professional or receive clinical dietary advice.
- Does not need advanced sports nutrition or fitness-specific tracking features.
- Does not need to manage accounts for other users or view professional dashboards.
