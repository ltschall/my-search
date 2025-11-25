## My Search

My Search is a lightweight, browser-based meta–search interface that routes queries to different providers using configurable *bang* (e.g. `!g`) and *hashtag* (e.g. `#g`) prefixes.  
If no explicit provider is selected, queries are safely forwarded to DuckDuckGo as a privacy‑respecting default.

## Purpose and Scope

The primary objective of this project is to serve as a controlled, real‑world testbed for **AI‑assisted software development workflows**.  
In particular, it is used to:

- **Systematically evaluate** how advanced AI coding tools can support end‑to‑end feature development, refactoring, and maintenance.
- **Characterize limitations and failure modes** of AI assistance in a realistic but constrained TypeScript/Vite codebase.
- **Document practical best practices** for collaborating with AI tools on everyday development tasks.

The secondary objective is to produce a **fast, keyboard‑centric search utility** that I can use as my daily driver for web search, documentation lookup, and domain‑specific queries (e.g. wikis, tooling docs, or APIs).

## Key Characteristics

- **Bang- and hashtag‑based routing**: Short prefixes select specific search providers while typing, with live previews of the resolved URL.
- **Configurable providers**: Search providers are defined in code and can be extended or adapted to new services.
- **Privacy‑oriented default**: Unqualified queries fall back to DuckDuckGo.
- **Minimalist UI**: A focused interface optimized for speed, clarity, and low cognitive load.

## Research Context

This repository is intentionally kept small and approachable to enable **repeatable experiments** with different AI tools, prompts, and collaboration patterns.  
Commits and changes may therefore reflect not only feature needs, but also specific experimental setups designed to probe the strengths and weaknesses of AI‑supported development in 2025.
