# Wiki Schema

## Domain
个人知识库 — 涵盖包装设计、AI 工作流、生产力系统与跨领域洞察

## Conventions
- File names: lowercase, hyphens, no spaces (e.g., `offset-printing.md`)
- Every wiki page starts with YAML frontmatter
- Use `[[wikilinks]]` to link between pages (minimum 2 outbound links per page)
- When updating a page, always bump the `updated` date
- Every new page must be added to `index.md` under the correct section
- Every action must be appended to `log.md`

## Frontmatter
```yaml
---
title: Page Title
created: YYYY-MM-DD
updated: YYYY-MM-DD
type: entity | concept | comparison | query | summary
tags: [from taxonomy below]
sources: [raw/articles/source-name.md]
---
```

## Tag Taxonomy

### 包装与设计
- packaging, sustainable-packaging, material, structural-design, branding, produce-packaging, active-packaging

### 知识管理
- knowledge-management, note-taking, zettelkasten, para-method, evergreen-notes, fleeting-notes

### 思维与决策
- mental-models, decision-making, critical-thinking, systems-thinking, cognitive-bias

### 生产力与习惯
- productivity, deep-work, habits, time-management, attention-management, focus

### 工具与技术
- obsidian, markdown, automation, ai-tools, search, annotation, read-later

### 个人成长
- learning, reading, writing, reflection, journaling, goal-setting

### 元标签
- concept, entity, comparison, query, tutorial, case-study, prediction

## Page Thresholds
- **Create a page** when an entity/concept appears in 2+ sources OR is central to one source
- **Add to existing page** when a source mentions something already covered
- **DON'T create a page** for passing mentions, minor details
- **Split a page** when it exceeds ~200 lines
- **Archive a page** when content is fully superseded

## Entity Pages
One page per notable entity. Include:
- Overview / what it is
- Key facts and dates
- Relationships to other entities ([[wikilinks]])
- Source references

## Concept Pages
One page per concept or topic. Include:
- Definition / explanation
- Current state of knowledge
- Open questions or debates
- Related concepts ([[wikilinks]])

## Comparison Pages
Side-by-side analyses. Include:
- What is being compared and why
- Dimensions of comparison (table format preferred)
- Verdict or synthesis
- Sources

## Update Policy
When new information conflicts with existing content:
1. Check dates — newer sources generally supersede older ones
2. If genuinely contradictory, note both positions with dates and sources
3. Mark contradiction in frontmatter: `contradictions: [page-name]`
4. Flag for user review in the lint report
