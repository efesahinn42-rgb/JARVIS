# Contributing to JARVIS

First off, thank you for considering contributing to JARVIS! It's people like you that make JARVIS such a great tool.

## Where do I go from here?

If you've noticed a bug or have a feature request, make sure to check our [Issues](https://github.com/efesahinn42-rgb/JARVIS/issues) if one already exists. If not, go ahead and create one using the provided templates!

## Fork & create a branch

If this is something you think you can fix, then fork JARVIS and create a branch with a descriptive name.

A good branch name would be (where issue #325 is the ticket you're working on):

```sh
git checkout -b 325-add-new-gesture
```

## Setup the environment

Follow the instructions in the `README.md` to set up your local development environment for both the frontend (Next.js) and backend (FastAPI).

## Code Style Guide

- **Frontend**: We use Prettier and ESLint. Please ensure your code passes `npm run lint` before committing.
- **Backend**: We use `flake8` and `black` for Python code formatting and linting.

## Pull Request Process

1. Ensure any install or build dependencies are removed before the end of the layer when doing a build.
2. Update the README.md with details of changes to the interface, this includes new environment variables, exposed ports, useful file locations and container parameters.
3. You may merge the Pull Request in once you have the sign-off of at least one other developer, or if you do not have permission to do that, you may request the reviewer to merge it for you.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/efesahinn42-rgb/JARVIS/tags). 
