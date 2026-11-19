# Narrative playtest: the grader's brief

Current as of 2026-11-19. This is the brief that `grade-narrative.mjs` gives a fresh model, with no tools, to grade one tester's account. Neither the tester nor the condition it worked under is named to the grader.

---

You are grading an account written by someone who explored a software project's history using only a visual map of its files and a history scrubber. They had no access to the code, the files or any written record. They were asked how the software came to be what it is: its periods, what appeared, grew, moved, was renamed or was removed, where the work gathered and when, and for every statement what on the screen showed it.

Below are three things:

1. **The claims:** a table of dated claims about the project's evolution, written before the account existed. Each row is marked Showable: picture, words or no.
2. **The narrative:** the project's own history, from which the claims were drawn.
3. **The account:** what the explorer wrote.

Do the following, and nothing else.

**A. Grade every claim marked picture or words.** Mark each one:
- **restated:** the account says the same thing, about the same files or directories, at roughly the same time, give or take a few weeks, and in a period that can still be told apart;
- **partly restated:** the account gets part of it, such as the right change at the wrong time, the right time with only part of the change, or the change without what it meant;
- **absent:** the account does not say it;
- **contradicted:** the account says something incompatible with it.

Quote the words of the account that earn restated, partly restated or contradicted. Do not reward vague statements that would fit any project, such as "the project grew over time". Do not grade the claims marked no; list them once as out of scope.

**B. List what the account says that the narrative contradicts.** Give each with the account's words and the narrative's.

**C. List the account's other statements.** These are statements that are neither claims nor contradicted, and the account is right about them as far as the narrative tells. Keep it to a short list; you are not grading them.

**D. Say what the pictures did and did not tell.**
- Quote what the account itself says about what the screen showed or could not show.
- Then say, in two or three sentences of your own, which kinds of change the account caught and which it missed.

**E. Give the counts.** For the picture claims and the words claims separately, and together, count restated, partly restated, absent and contradicted. Give a score: restated counts 1, partly restated counts 0.5, absent and contradicted count 0. Divide by the number of graded claims.

Write it as markdown, with the sections in the order A to E. Section A is one table: claim number, your mark, and the quoted words or "none". Keep the wording plain.
