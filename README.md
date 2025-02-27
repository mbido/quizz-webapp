# Quiz WebApp

A web application for taking quizzes on various topics.

## Features

*   Select a quiz from a list of available quizzes.
*   Answer multiple-choice questions.
*   Receive immediate feedback on your answers.
*   View explanations for each question.
*   Track your progress and score.

## Technologies Used

*   HTML
*   CSS
*   JavaScript

## How to Run

1.  Clone the repository: `git clone git@github.com:mbido/quizz-webapp.git`
2.  Navigate to the project directory: `cd quizz-webapp`
3.  Open `index.html` in your browser.

```sh
git clone git@github.com:mbido/quizz-webapp.git &&\
cd quizz-webapp && \
open index.html
```

## Adding a Quiz

There are two ways to add a quiz to the application:

### 1. Using the provided examples

The application provides quiz examples in the `quiz-examples` directory. To use these examples:

1.  Open the desired `.json` file from the `quiz-examples` directory.
2.  Copy the JSON content.
3.  In the Quiz WebApp, go to the "Import a Quiz" section.
4.  Paste the JSON content into the text area labeled "Or Paste Your JSON".
5.  Click the "Import" button.

### 2. Creating a quiz with Google AI Studio

1.  Go to [Google AI Studio](https://makersuite.google.com/).
2.  Provide your learning sources to Google AI Studio.
3.  Select a model capable of providing structured output (JSON).
4.  Copy the content of [`template.json`](./template.json) into the structure.
5.  Ask the model to generate a quiz based on your sources, following the structure defined in `template.json`.
6.  Copy the generated JSON output.
7.  In the Quiz WebApp, go to the "Import a Quiz" section.
8.  Paste the JSON content into the text area labeled "Or Paste Your JSON".
9.  Click the "Import" button.

## Contributing

Contributions are welcome! Please follow these steps:

1.  Fork the repository.
2.  Create a new branch for your feature or bug fix.
3.  Make your changes and commit them with descriptive messages.
4.  Submit a pull request.
