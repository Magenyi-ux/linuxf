# Daily Task: Process Next 1,000 Questions

To continue processing the randomized study data pack 1,000 questions at a time, please use the following prompt:

---

**Prompt:**
"Hi Jules, please run the question processing script to verify and patch the next 1,000 questions in `services/studyRandData.ts`.

Yesterday we finished up to index 1,000 of the Commerce subject. Today, please:
1. Identify the next 1,000 questions starting from where we left off (e.g., Commerce 1001-2000, or moving to Economics).
2. Generate accurate answers and detailed explanations for them.
3. Update the `scripts/patch_1000.cjs` script with these new answers.
4. Run the script and verify the updates in `services/studyRandData.ts`."

---

**Current Progress:**
- **Commerce:** 0 - 2,083 (DONE)
- **Economics:** 0 - 3,250+ (PENDING)
- **English Language:** 0 - 6,000+ (PENDING)
- ... (Other subjects)

---

# Daily Task: Patch Local Question Packs

To process the local question JSON files in `services/questions/`, providing accurate answers and explanations 1,000 questions at a time, please use the following prompt:

**Prompt:**
"Hi Jules, please help me patch the next 1,000 questions in the local JSON packs found in `services/questions/`.

Today, please:
1. Select a subject file from `services/questions/` and identify the next 1,000 questions starting from where we left off.
2. Generate accurate `correctOptionIndex` (0=a, 1=b, 2=c, 3=d, 4=e) and detailed `explanation` for each.
3. Update the patching script to apply these updates to the JSON files.
4. Run the script and verify a few samples."

**Current Progress (Local JSONs):**
- **Commerce:** 1 - 2,083 (DONE - Fully Verified with Diagrams)
- **Economics:** 0 - 1,692 (Placeholder)
- **English Language:** 0 - 3,491 (Placeholder)
- ... (Other subjects)
