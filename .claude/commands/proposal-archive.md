# Proposal Archive

Archive a completed proposal after submission for future reference.

## Instructions

1. **Confirm Submission**
   - Ask user: "Has this proposal been submitted? What was the outcome (if known)?"
   - Get proposal folder name from `/rfps/`

2. **Move to Past Proposals**
   - Move entire folder from `/rfps/[proposal]/` to `/past-proposals/[proposal]/`
   - Keep all files including:
     - Intake and research documents
     - All proposal drafts
     - Generated images with images.json
     - Reference materials

3. **Create Reflection Document**
   - Add `reflection.md` to the archived folder with:

   ```markdown
   # Reflection: [Proposal Name]

   ## Outcome
   - Status: [Won / Did not win / Finalist / Pending]
   - Notification date: [if known]

   ## Strengths
   - [What worked well in this proposal]

   ## Areas for Improvement
   - [What could be stronger next time]

   ## Lessons Learned
   - [Key insights for future proposals]

   ## Feedback Received
   - [Any feedback from selection committee]

   ## Reusable Elements
   - [Concepts, images, or text that could be adapted for future proposals]
   ```

4. **Update Themes Database**
   - Add this proposal to `/artist-info/themes-database.md`
   - Note which themes were used
   - Record outcome for success pattern tracking

5. **Report Summary**
   - Confirm what was archived
   - Note any follow-up actions needed

## Output Location

`/past-proposals/[institution-year]/`
