const howItWorksMarkdown = `
# How It Works

## Start a Quiz
1. Select a quiz from the dropdown list
2. Click "Start" to begin
3. Answer the questions and validate with "Submit"
4. Proceed to the next question with "Next Question"

## Add a Quiz
You can add your own quizzes in three ways:

### 1. Use the Provided Examples
- Copy the JSON content from an example
- Click "Import a Quiz"
- Paste the content into the text area
- Click "Import"

### 2. Create a Quiz with Google AI Studio
- Visit [Google AI Studio](https://makersuite.google.com/)
- Provide your learning sources
- Use a model capable of generating JSON
- Use the structure in template.json
- Ask the model to generate a quiz
- Import the generated JSON

### 3. Create Your Own JSON
- Create a JSON file following the model structure
- Ensure strict adherence to the model format
- Any deviation from the format may prevent the quiz from functioning
- Import your JSON via the import function

## Quiz Model Structure

\`\`\`json
{
  "type": "object",
  "properties": {
    "quizz": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "Question": {
            "type": "string"
          },
          "Possible answers": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "answer": {
                  "type": "string"
                },
                "is it correct or not": {
                  "type": "boolean"
                }
              },
              "required": [
                "answer",
                "is it correct or not"
              ]
            }
          },
          "Difficulty": {
            "type": "string",
            "enum": [
              "Easy (*)",
              "Medium (**)",
              "Hard (***)"
            ]
          },
          "Explanation": {
            "type": "string"
          }
        },
        "required": [
          "Question",
          "Possible answers",
          "Difficulty",
          "Explanation"
        ]
      }
    },
    "Title": {
      "type": "string"
    }
  },
  "required": [
    "quizz",
    "Title"
  ]
}
\`\`\`

> **Warning:** The JSON structure must be followed exactly as shown above. Any deviation may prevent the quiz from functioning correctly.
`;
