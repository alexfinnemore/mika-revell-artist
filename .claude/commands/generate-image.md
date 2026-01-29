# Generate Image

Create concept images for proposals using the Gemini API.

## Instructions

1. **Get Context**
   - Identify active proposal from `/rfps/`
   - Read `00-intake.md` and `01-research.md` for site context
   - Check existing images in `generated-images/images.json`

2. **Prepare Prompt**
   - User provides description (e.g., "woven rope canopy in a cedar forest")
   - Enhance with:
     - Site-specific details from research
     - Style references (if specified)
     - Technical accuracy (materials, scale)
     - Living Matter aesthetic sensibility

3. **Generate Image via Gemini API**

   ```bash
   curl -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent" \
     -H "Content-Type: application/json" \
     -H "x-goog-api-key: ${GEMINI_API_KEY}" \
     -d '{
       "contents": [{
         "parts": [{
           "text": "Generate an image: [enhanced prompt here]"
         }]
       }],
       "generationConfig": {
         "responseModalities": ["image", "text"]
       }
     }'
   ```

4. **Save Image**
   - Generate filename: `idea-[NNN].png` (sequential numbering)
   - Save to `/rfps/[active-proposal]/generated-images/`
   - Decode base64 image data from response

5. **Update images.json**
   - Add entry with:
     ```json
     {
       "filename": "idea-001.png",
       "prompt": "[full prompt used]",
       "generated": "YYYY-MM-DD",
       "status": "draft",
       "notes": ""
     }
     ```

6. **Support Iteration**
   - For refinements ("make the trees taller"), reference the previous prompt
   - Keep all versions - don't overwrite
   - User marks finals when selecting for submission

## Image Workflow

1. Generate many concepts (status: `draft`)
2. User reviews and adds notes
3. User marks winners as `final` when selecting for submission
4. All images archive with the proposal

## Environment

Requires `GEMINI_API_KEY` in `.env` file.

Get a key from: https://aistudio.google.com/apikey

## Output Location

`/rfps/[active-proposal]/generated-images/`
