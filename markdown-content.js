const howItWorksMarkdown = `
# Comment ça fonctionne

## Commencer un quiz
1. Sélectionnez un quiz dans la liste déroulante
2. Cliquez sur "Start" pour commencer
3. Répondez aux questions et validez avec "Submit"
4. Passez à la question suivante avec "Next Question"

## Ajouter un quiz
Vous pouvez ajouter vos propres quiz de trois façons :

### 1. Utiliser les exemples fournis
- Copiez le contenu JSON d'un exemple
- Cliquez sur "Import a Quiz"
- Collez le contenu dans la zone de texte
- Cliquez sur "Import"

### 2. Créer un quiz avec Google AI Studio
- Visitez [Google AI Studio](https://makersuite.google.com/)
- Fournissez vos sources d'apprentissage
- Utilisez un modèle capable de générer du JSON
- Utilisez la structure dans template.json
- Demandez au modèle de générer un quiz
- Importez le JSON généré

### 3. Créer votre propre JSON
- Créez un fichier JSON suivant la structure du modèle
- Veillez à respecter strictement le format du modèle
- Tout écart par rapport au format peut empêcher le quiz de fonctionner
- Importez votre JSON via la fonction d'importation

## Structure du modèle de quiz

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
                "answer id": {
                  "type": "integer"
                },
                "answer": {
                  "type": "string"
                },
                "is it correct or not": {
                  "type": "boolean"
                }
              },
              "required": [
                "answer id",
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

> **Attention :** La structure JSON doit être suivie exactement comme indiqué ci-dessus. Toute déviation peut empêcher le quiz de fonctionner correctement.
`;
