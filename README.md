# System Design

A collection of hands-on projects for learning system design. Each folder takes one core concept and turns it into something you can run, poke at, and measure, instead of just reading about it.

Every project is self-contained, with its own README, code, and setup instructions.

## Projects

| # | Topic | What it covers | Stack |
|---|---|---|---|
| [01](https://github.com/samarjeet-88/SYSTEM_DESIGN/tree/main/01_CONSISTENT_HASHING) | **Consistent Hashing** | An interactive simulator comparing naive modulo hashing, a hash ring, and weighted virtual nodes on load balance and key movement | React, TypeScript, `<backend stack>` |

More topics will be added as numbered folders.

## Repository structure

```
.
├── 01-consistent-hashing/    # Consistent hashing simulator
│   ├── backend/
│   ├── frontend/
│   ├── docs/
│   └── README.md
└── README.md
```

New projects follow the naming pattern `NN-topic-name`, where `NN` is the next number in the sequence.

## Getting started

1. Clone the repository:

```bash
   git clone <your-repo-url>
   cd <your-repo-name>
```

2. Open the folder of the project you want to run and follow the instructions in its README, for example:

```bash
   cd 01-consistent-hashing
```

Each project lists its own prerequisites, so you only need to install what the project you are running requires.

## Adding a new project

Each project folder should contain:

- A `README.md` that explains the concept, how the project demonstrates it, how to run it, and what to look for in the results
- Source code that runs on its own, with no dependency on other project folders
- A `docs/` folder for screenshots and diagrams

## Contributing

Issues and pull requests are welcome. For larger changes or new topics, please open an issue first to discuss the idea.

1. Fork the repository
2. Create a branch: `git checkout -b feature/your-feature`
3. Commit your changes and push the branch
4. Open a pull request
