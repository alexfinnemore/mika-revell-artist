# Living Matter Studio - RFP Response System

A document repository and AI workflow system for generating art proposals and responding to RFPs (Requests for Proposals) for large-scale sculptural installations.

## Quick Start

1. **New RFP arrives**: Drop PDF into `/rfps/[institution-year]/reference/`
2. **Extract requirements**: Run `/rfp-intake`
3. **Research**: Run `/rfp-research`
4. **Ideate**: Chat, generate images, refine concepts
5. **Write**: Fill in `/proposal/` files
6. **Submit & archive**: Run `/proposal-archive`

## Folder Structure

```
/artist-info/        - Bios, CV, portfolio (source of truth)
/past-work/          - Documentation of completed projects
/past-proposals/     - Archived submissions (win or lose)
/rfps/               - Active RFP work (one folder per opportunity)
/.claude/commands/   - AI skills (slash commands)
```

## Available Skills

| Command | Purpose |
|---------|---------|
| `/rfp-intake` | Extract requirements from RFP documents |
| `/rfp-research` | Research institution, site, past winners |
| `/generate-image` | Create concept images via Gemini API |
| `/proposal-archive` | Archive completed proposal |
| `/themes-update` | Analyze patterns across proposals |

**Note:** You can also just describe what you want ("generate an image of...") and Claude will route to the appropriate skill.

## Working on a Proposal

### Phase 1: Intake
```
/rfps/kair-2026/
  └── reference/     <- Drop RFP PDFs here
```
Run `/rfp-intake` to create `kair-2026-intake.md` with extracted requirements.

### Phase 2: Research & Ideation
This is iterative. You'll cycle between:
- Reading research (`kair-2026-research.md`)
- Noting ideas (`kair-2026-ideas.md`)
- Generating concept images
- Chatting with Claude about directions

Generated images are saved to `/generated-images/` with prompts tracked in `images.json`.

### Phase 3: Writing
When your concept is solid, fill in:
```
/proposal/
  ├── artist-statement.md   # Check word limit
  ├── motive.md             # Check word limit
  ├── work-proposal.md      # Main concept + materials
  ├── cv.md                 # Tailored CV
  └── image-sheet.md        # Selected portfolio images
```

### Phase 4: Review & Submit
- Review markdown files in VS Code
- Make manual edits alongside AI refinement
- Export/compile as needed for submission format
- Run `/proposal-archive` after submitting

## Image Generation

Generate images by:
- Running `/generate-image [description]`
- Or just saying "create an image of..." in chat

Images are saved to the active proposal's `/generated-images/` folder.

### Image Workflow
1. Generate many concepts (marked as `draft`)
2. Review and add notes
3. Mark finals when selecting for submission
4. All images and prompts are archived with the proposal

## For Mika (Proposals)

Your typical workflow:
1. Research deeply - site, culture, past winners, materials
2. Note ideas as they emerge
3. Generate 20+ concept images, iterate
4. When concept is solid, finalize the writing
5. Bio and CV are the easy parts at the end

## For Alex (System)

- Skills live in `/.claude/commands/`
- `CLAUDE.md` controls natural language routing
- Gemini API key in `.env`
- Sync via GitHub

## Environment Setup

Copy `.env.example` to `.env` and add:
```
GEMINI_API_KEY=your_key_here
```

Get a key from: https://aistudio.google.com/apikey

## Artists

**Mika Revell** - BFA Otis, MFA Central Saint Martins, MA Psychology Pepperdine. Large-scale sculpture, immersive installations, science-art intersection.

**Alex Finnemore** - PhD Physics Cambridge (biomimetic materials). 747 Big Imagination Foundation co-leader. Research on artificial nacre and gyroid structures.

**Living Matter Studio** - Collaborative practice exploring biomimicry, ephemeral materials, and natural design language.

## Links

- [mikarevell.com](https://www.mikarevell.com) - Mika's fine art
- [livingmatterstudio.com](https://www.livingmatterstudio.com) - Collaborative work
