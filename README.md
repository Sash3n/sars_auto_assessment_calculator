# SARS Auto-Assessment Calculator

A personal decision-support calculator for South African individual income
tax. It independently estimates what SARS's auto-assessment should look
like — across salary income, rental/property income, freelance income, and
fluctuating monthly pay — so you can check SARS's numbers before the
40-business-day correction window closes.

**Not tax advice. Not affiliated with or endorsed by SARS.**

## Tech stack

- [Next.js](https://nextjs.org/) (App Router) + React, TypeScript
- Tailwind CSS + [DaisyUI](https://daisyui.com/)
- [Vitest](https://vitest.dev/) + React Testing Library

## Getting started

```bash
npm install
npm run dev
```

## Testing

```bash
npm test
```

## Git workflow

```
main -> dev -> feature/*  (feature branches merge into dev, never deleted)
                  |
                  v
                prod        (promoted from dev via reviewed PR + CI)
```

See `docs/` for the full project specification (kept local/untracked — see
`.gitignore`).
