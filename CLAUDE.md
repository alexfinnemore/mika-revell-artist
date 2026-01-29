# Living Matter Studio - Context for Claude

## About This Repository

This is a document repository for generating art proposals and RFP responses for Living Matter Studio (Mika Revell + Alex Finnemore). The work focuses on large-scale sculptural installations ($10k+) that explore biomimicry, natural materials, and the intersection of science and art.

## Natural Language Routing

When the user asks for these actions, use the corresponding skill workflow:

| User says... | Use skill... |
|--------------|--------------|
| "generate an image of...", "create a concept image", "visualize..." | `/generate-image` |
| "analyze this RFP", "extract requirements" | `/rfp-intake` |
| "research this opportunity", "look into past winners" | `/rfp-research` |
| "archive this proposal" | `/proposal-archive` |
| "update themes", "analyze patterns" | `/themes-update` |

## Active Proposal Context

Check `/rfps/` for the current active proposal. When generating images or writing content, save to the active proposal folder unless the user specifies otherwise.

Current active proposal: **KAIR 2026** (Kamiyama Artist in Residence)
- Deadline: Feb 27, 2026
- Location: Kamiyama, Tokushima, Japan
- Folder: `/rfps/kair-2026/`

## Living Matter Themes

Our work consistently explores:
- **Biomimicry**: Natural systems informing design (nacre, mycelium, Voronoi patterns)
- **Material inquiry**: Rammed earth, dichroic glass, rope, natural fibers
- **Interactivity**: Sound, light, visitor presence triggering responses
- **Site-responsiveness**: Deep connection to place, culture, local materials
- **Science-art intersection**: Alex's physics research informing Mika's artistic practice

## Writing Style

For proposals:
- Concrete and specific, not abstract
- Connect concept to site and context
- Show technical feasibility alongside artistic vision
- Reference relevant past work without being repetitive
- Match exact word counts when specified

## Image Generation Notes

When generating concept images for proposals:
- Save to `[active-rfp]/generated-images/`
- Update `images.json` with prompt and metadata
- Use specific style references relevant to the proposal
- Generate many variations - user will select finals later

## Key Artist Information

**Mika Revell**: BFA Otis, MFA Central Saint Martins, MA Psychology Pepperdine. Large-scale sculpture, immersive installations. Prior Japan residency: AIR 3331 Arts Chiyoda (2016).

**Alex Finnemore**: PhD Physics Cambridge (biomimetic materials). 747 Big Imagination Foundation co-leader. Research on artificial nacre and gyroid structures.

**Recent Win**: SFER IK Art in Nature Award 2024 (Art Basel Miami) - "A Symphony of Circuit and Soil"

## Repository Structure

```
/artist-info/        - Bios, CV, portfolio (source of truth)
/past-work/          - Documentation of completed projects
/past-proposals/     - Archived submissions (win or lose)
/rfps/               - Active RFP work (one folder per opportunity)
/.claude/commands/   - AI skills (slash commands)
```

## Folder Naming Convention

`institution-YYYY` (e.g., `kair-2026`, `sfer-ik-2023`)
