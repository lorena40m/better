This is a [Next.js](https://nextjs.org/) project.

## Getting Started

Run the development server:

```bash
npm run dev
```

Build as production:

```bash
npm run build
```

## Launch tests

Run unit tests (use a custom script):

```bash
npm run unittest
```

Run end-to-end tests (use Cypress framework):

```bash
npm run test
```

Then click on test suites.

Most tests are red, **don't panick!** It's normal, there have to be completed.
**Look into the console** to observe printed object, as well as validation failures!

## Before a merge request

1. Squash your commits: `git rebase -i master` (Voir tuto dans Discord)
2. Make sure the project compiles for production: `npm run build`
3. Make sure tests pass with `npm run unittest`, `npm run test`
4. Have a look to the website with: `npm run dev`
