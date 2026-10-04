# Pathways: setup and testing

The hierarchy is Project → Pathway → Topic (existing deck) → Concept → Question.
Collections is a Java topic, not a concept. Equality/hashing, iterator behaviour,
and choosing a collection are examples of concepts inside it.

## Fresh Java project

1. In Knowledge, create a project named **Java**. Opening it shows the configured
   Java pathway automatically. No new SQL is needed if concept tracking is already
   installed, as the user confirmed in the previous iteration.
2. Click **Set up topics** to create its 15 topic decks, or set up an individual
   topic. The outline includes fundamentals, object-oriented Java, core APIs and
   advanced Java. New topics are empty; setup does not generate practice content.
3. Open **Collections**, create concepts, and use **Manage questions** to author
   or import prepared MC questions. Link them to concepts on the topic page.
4. Open a concept to see its objective and recent practice history. Practice from
   there; Stop/summary returns to the concept, then Back to topic → Back to pathway.
5. Check that saved practice updates the pathway's coverage and last-practice date
   after returning/reloading. Repeated reviews of one concept still cover one concept.
6. Verify the list, setup controls and navigation on a phone/narrow screen.

A project named **React** gets the same interface with an eight-topic React
outline. Ordinary projects retain the existing project/deck browser. **Manage
decks** opens that browser for Java/React; its **Open pathway** button returns.

The Java pathway now targets Java 27 (a project named Java 27 is also recognized).
The topic outlines reference https://dev.java/learn/ and https://react.dev/learn.
Their ordering is our learning outline, not an official certification syllabus.

## Configuration and persistence

`src/apps/knowledge/curricula/pathways.ts` is the versioned source-controlled
configuration: subject names, pathway IDs, ordered topics, objectives and explicit
deck-name aliases. Fresh Java/React projects therefore require no database IDs
to be hardcoded, and the configuration works across desktop/mobile/reloads.

Existing decks match by normalized exact title or an explicit alias within the
current project. IDs continue to anchor all concepts, cards and history. More
than one matching deck is exposed as separate Open actions within the topic;
unmatched decks remain accessible under Other topics. Setup re-reads decks first
and adds only missing topics; it does not rename, delete or rewrite existing decks.
Renaming a deck to an unrecognized name moves it into Other topics; extend the
alias configuration to put it back in the ordered outline. Persistent editable
pathway bindings/prerequisites can be added later if needed.

The app blocks repeated setup clicks in one view. It does not promise cross-tab
transactional uniqueness: the existing decks schema has no documented unique
project/name constraint. Opening a pathway alone never inserts anything.

No live Supabase project/decks were read or modified by the coding agent in this
iteration. The shell read connection was declined; the user chose to start with
a fresh Java project. Topic creation happens through the app's setup action.

## What the numbers mean

- **Topics set up:** number of configured topics with matching decks, including
  empty decks. This is organization, not learning completion.
- **Concepts practised:** distinct concepts with recorded concept-linked reviews
  out of the concepts currently added. Failed attempts count as practice.
  Missing curriculum concepts are not automatically filled or considered mastered.
- **Questions ready:** prepared MC questions linked to a concept. Unlinked/other
  modes/unprepared questions remain accessible in the ordinary deck browser.
- **Questions due:** prepared linked questions that have been reviewed and whose
  existing card next_review has arrived. New questions are not counted as due;
  a previously failed Again question counts once its date arrives even when its
  repetitions field is zero.
- **Last concept practice:** latest saved concept-linked timestamp. Unlinked old
  rating-only history is not reinterpreted as concept practice.

Open next due topic goes to the relevant topic; it is not a cross-deck review
queue. Card scheduling and the existing extra-practice fallback remain in place.
Mastery scores, concept scheduling, delayed-review qualification, lessons and
certification mapping remain subsequent iterations. This update stores no new
learner identity and does not change existing access policies or offline support.

## Ready-made content for foundation topics 1 and 2

Run `supabase/seeds/java_foundations_1_2.sql` in Supabase SQL Editor to populate
the first two topics with 16 concepts and 48 linked MC questions targeting Java
27. See `supabase/seeds/JAVA_FOUNDATIONS.md` for counts, rerun behavior and checks.
This content seed does not require setting up all 15 topics first.
