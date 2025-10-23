# Work with logs

## Description

The project consists of three main components:

1.  **`logger-module`**: A shared logger module used by both applications for console output. It has no external dependencies.
2.  **`log-generator`**: An application that:
    * Creates a new log folder every minute.
    * Creates a new `.log` file every 10 seconds inside the current minute's folder.
3.  **`log-analyzer`**: An application that:
    * Recursively scans all log files in the `logs/` directory.
    * Calculates statistics by log type (SUCCESS, ERROR, etc.).
    * Supports a CLI filter to display only one log type.


## Installation

To link the local modules correctly, run `npm install` in each of the three folders:

### 1. Install logger dependencies (and name)
```
cd logger-module
npm install
````

### 2. Install the generator and link it to the logger
```
cd log-generator
npm install
````

### 3. Install the analyzer and link it to the logger
```
cd log-analyzer
npm install
````

### Go one folder up
```
cd ..
````

##  Usage

### 1. Run the Generator

```
cd log-generator
node index
```

### 2. Run the Analyzer

```
cd log-analyzer
node index
```

**Analysis with a filter (e.g., only 'ERROR'):**

```
node index --type error
```

**Show help:**

```
node index --help
```
