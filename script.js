document.addEventListener('DOMContentLoaded', () => {
  const quizDropdown = document.getElementById('quiz-dropdown');
  const startButton = document.getElementById('start-button');
  const quizSelection = document.getElementById('quiz-selection');
  const quizArea = document.getElementById('quiz-area');
  const questionElement = document.getElementById('question');
  const answersContainer = document.getElementById('answers-container');
  const submitButton = document.getElementById('submit-button');
  const nextButton = document.getElementById('next-button');
  const explanationContainer = document.getElementById('explanation-container');
  const explanationTextElement = document.getElementById('explanation-text');
  const feedbackContainer = document.getElementById('feedback-container');
  const feedbackMessageElement = document.getElementById('feedback-message');
  const progressBar = document.getElementById('progress-bar');
  const difficultyBadge = document.getElementById('difficulty-badge');
  const quizStats = document.getElementById('quiz-stats');
  const quizTitleElement = document.getElementById('quiz-title');
  const fileInput = document.getElementById('file-input');
  const jsonInput = document.getElementById('json-input');
  const importJsonButton = document.getElementById('import-json-button');
  const savedQuizzesContainer = document.getElementById('saved-quizzes-container');

  let currentQuestionIndex = 0;
  let quizData;
  let selectedAnswerIds = [];
  let correctAnswers = 0;
  let quizzesInStorage = {};

  // Fonction pour charger les quizz depuis le localStorage
  function loadQuizzesFromStorage() {
    const storedQuizzes = localStorage.getItem('quizzes');
    if (storedQuizzes) {
      try {
        quizzesInStorage = JSON.parse(storedQuizzes);
      } catch (error) {
        console.error("Erreur lors du chargement des quizz du localStorage:", error);
        quizzesInStorage = {};
        localStorage.setItem('quizzes', JSON.stringify(quizzesInStorage));
      }
    } else {
      quizzesInStorage = {};
      localStorage.setItem('quizzes', JSON.stringify(quizzesInStorage));
      // Précharger les exemples si le localStorage est vide
      preloadExampleQuizzes();
    }
    updateQuizDropdown();
    updateSavedQuizzesList();
  }

  // Fonction pour précharger les exemples de quizz
  async function preloadExampleQuizzes() {
    try {
      const exampleQuizzes = [
        { id: '1', path: '/quizzes/1.json' },
        { id: '2', path: '/quizzes/2.json' },
        { id: '3', path: '/quizzes/3.json' }
      ];

      for (const quiz of exampleQuizzes) {
        try {
          const response = await fetch(quiz.path);
          if (response.ok) {
            const quizContent = await response.json();
            quizzesInStorage[quiz.id] = quizContent;
          }
        } catch (error) {
          console.error(`Erreur lors du chargement de l'exemple de quiz ${quiz.id}:`, error);
        }
      }
      
      localStorage.setItem('quizzes', JSON.stringify(quizzesInStorage));
    } catch (error) {
      console.error("Erreur lors du préchargement des exemples de quizz:", error);
    }
  }

  // Fonction pour mettre à jour le sélecteur de quizz
  function updateQuizDropdown() {
    quizDropdown.innerHTML = '';
    
    if (Object.keys(quizzesInStorage).length === 0) {
      quizDropdown.innerHTML = '<option value="">Aucun quiz disponible</option>';
      startButton.disabled = true;
    } else {
      quizDropdown.innerHTML = '<option value="">Sélectionnez un quiz</option>';
      
      Object.entries(quizzesInStorage).forEach(([id, quiz]) => {
        const option = document.createElement('option');
        option.value = id;
        option.textContent = quiz.Title || `Quiz sans titre (${id})`;
        quizDropdown.appendChild(option);
      });
      
      startButton.disabled = false;
    }
  }

  // Fonction pour mettre à jour la liste des quizz enregistrés
  function updateSavedQuizzesList() {
    savedQuizzesContainer.innerHTML = '';
    
    if (Object.keys(quizzesInStorage).length === 0) {
      savedQuizzesContainer.innerHTML = '<p>Aucun quiz enregistré.</p>';
      return;
    }
    
    Object.entries(quizzesInStorage).forEach(([id, quiz]) => {
      const quizItem = document.createElement('div');
      quizItem.classList.add('saved-quiz-item');
      
      const titleSpan = document.createElement('span');
      titleSpan.classList.add('quiz-title');
      titleSpan.textContent = quiz.Title || `Quiz sans titre (${id})`;
      
      const deleteButton = document.createElement('button');
      deleteButton.classList.add('delete-quiz');
      deleteButton.textContent = 'Supprimer';
      deleteButton.addEventListener('click', () => {
        deleteQuiz(id);
      });
      
      quizItem.appendChild(titleSpan);
      quizItem.appendChild(deleteButton);
      savedQuizzesContainer.appendChild(quizItem);
    });
  }

  // Fonction pour charger un quiz spécifique
  function loadQuiz(quizId) {
    try {
      quizData = quizzesInStorage[quizId];
      
      if (!quizData || !quizData.quizz || quizData.quizz.length === 0) {
        throw new Error("Le quiz est vide ou mal structuré.");
      }
      
      // Afficher le titre du quiz
      quizTitleElement.textContent = quizData.Title || "Quiz";
      
      currentQuestionIndex = 0;
      correctAnswers = 0;
      loadQuestion(currentQuestionIndex);
      updateProgressBar();
      
      quizSelection.style.display = 'none';
      quizArea.style.display = 'block';
    } catch (error) {
      console.error("Erreur lors du chargement du quiz:", error);
      alert(`Impossible de charger le quiz: ${error.message}`);
    }
  }

  // Fonction pour ajouter un nouveau quiz
  function addQuiz(quizContent, fromFile = false, fileName = '') {
    try {
      // Valider la structure du quiz
      if (!quizContent || !quizContent.quizz || !Array.isArray(quizContent.quizz)) {
        throw new Error("Format de quiz invalide. Le format doit contenir un tableau 'quizz'.");
      }
      
      // Générer un ID unique
      const quizId = `quiz_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      
      // Ajouter le quiz au stockage
      quizzesInStorage[quizId] = quizContent;
      localStorage.setItem('quizzes', JSON.stringify(quizzesInStorage));
      
      // Mettre à jour l'interface
      updateQuizDropdown();
      updateSavedQuizzesList();
      
      // Effacer les champs d'import
      if (!fromFile) {
        jsonInput.value = '';
      }
      
      alert(`Quiz "${quizContent.Title || 'Sans titre'}" ajouté avec succès !`);
    } catch (error) {
      console.error("Erreur lors de l'ajout du quiz:", error);
      alert(`Impossible d'ajouter le quiz: ${error.message}`);
    }
  }

  // Fonction pour supprimer un quiz
  function deleteQuiz(quizId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce quiz ?')) {
      delete quizzesInStorage[quizId];
      localStorage.setItem('quizzes', JSON.stringify(quizzesInStorage));
      updateQuizDropdown();
      updateSavedQuizzesList();
      alert('Quiz supprimé avec succès !');
    }
  }

  function updateProgressBar() {
    const progress = ((currentQuestionIndex + 1) / quizData.quizz.length) * 100;
    progressBar.style.width = `${progress}%`;
    quizStats.textContent = `Question ${currentQuestionIndex + 1}/${quizData.quizz.length} | Score: ${correctAnswers}/${currentQuestionIndex}`;
  }

  function loadQuestion(questionIndex) {
    resetState();
    const currentQuestion = quizData.quizz[questionIndex];
    
    questionElement.textContent = `${questionIndex + 1}. ${currentQuestion.Question}`;
    
    // Afficher la difficulté
    difficultyBadge.textContent = currentQuestion.Difficulty;
    switch(currentQuestion.Difficulty) {
      case "Easy (*)":
        difficultyBadge.style.backgroundColor = "#28a745";
        break;
      case "Medium (**)":
        difficultyBadge.style.backgroundColor = "#ffc107";
        break;
      case "Hard (***)":
        difficultyBadge.style.backgroundColor = "#dc3545";
        break;
    }

    currentQuestion["Possible answers"].forEach(answer => {
      const answerElement = document.createElement('div');
      answerElement.classList.add('answer-option');
      answerElement.textContent = answer.answer;
      answerElement.dataset.answerId = answer["answer id"];
      answerElement.addEventListener('click', selectAnswer);
      answersContainer.appendChild(answerElement);
    });
  }

  function resetState() {
    answersContainer.innerHTML = '';
    submitButton.style.display = 'block';
    nextButton.style.display = 'none';
    explanationContainer.style.display = 'none';
    feedbackContainer.style.display = 'none';
    selectedAnswerIds = [];
    feedbackContainer.classList.remove('correct', 'incorrect');
  }

  function selectAnswer(e) {
    const selectedDiv = e.target;
    const answerId = parseInt(selectedDiv.dataset.answerId);
    
    // Si l'ID est déjà sélectionné, on le désélectionne
    if (selectedAnswerIds.includes(answerId)) {
      selectedAnswerIds = selectedAnswerIds.filter(id => id !== answerId);
      selectedDiv.classList.remove('selected');
    } else {
      // Sinon, on l'ajoute aux sélections
      selectedAnswerIds.push(answerId);
      selectedDiv.classList.add('selected');
    }
  }

  function checkAnswer() {
    if (selectedAnswerIds.length === 0) {
      alert("Veuillez sélectionner au moins une réponse avant de soumettre.");
      return;
    }

    submitButton.style.display = 'none';
    nextButton.style.display = 'block';
    explanationContainer.style.display = 'block';
    feedbackContainer.style.display = 'block';

    const currentQuestion = quizData.quizz[currentQuestionIndex];
    
    // Utiliser le nouveau format pour obtenir les bonnes réponses
    const correctAnswerIds = currentQuestion["Possible answers"]
      .filter(answer => answer["is it correct or not"])
      .map(answer => answer["answer id"]);

    // Vérification des réponses
    let allCorrect = true;
    
    // Vérifier si toutes les bonnes réponses sont sélectionnées
    if (selectedAnswerIds.length !== correctAnswerIds.length) {
      allCorrect = false;
    } else {
      for (let id of correctAnswerIds) {
        if (!selectedAnswerIds.includes(id)) {
          allCorrect = false;
          break;
        }
      }
    }

    // Marquer les réponses correctes et incorrectes
    const answerElements = document.querySelectorAll('.answer-option');
    answerElements.forEach(element => {
      const id = parseInt(element.dataset.answerId);
      
      if (correctAnswerIds.includes(id)) {
        element.classList.add('correct');
      }
      
      if (selectedAnswerIds.includes(id) && !correctAnswerIds.includes(id)) {
        element.classList.add('incorrect');
      }
    });

    explanationTextElement.textContent = currentQuestion.Explanation;

    if (allCorrect) {
      feedbackMessageElement.textContent = "Bonne réponse !";
      feedbackContainer.classList.add('correct');
      correctAnswers++;
    } else {
      feedbackMessageElement.textContent = "Réponse incorrecte.";
      feedbackContainer.classList.add('incorrect');
    }
    
    // Mettre à jour les statistiques
    quizStats.textContent = `Question ${currentQuestionIndex + 1}/${quizData.quizz.length} | Score: ${correctAnswers}/${currentQuestionIndex + 1}`;
  }

  function nextQuestion() {
    currentQuestionIndex++;
    
    if (currentQuestionIndex < quizData.quizz.length) {
      loadQuestion(currentQuestionIndex);
      updateProgressBar();
    } else {
      // Quiz terminé
      questionElement.textContent = "Quiz terminé !";
      answersContainer.innerHTML = '';
      submitButton.style.display = 'none';
      nextButton.style.display = 'none';
      explanationContainer.style.display = 'none';
      feedbackContainer.style.display = 'none';
      difficultyBadge.style.display = 'none';
      
      // Afficher un résumé
      const scorePercentage = Math.round((correctAnswers / quizData.quizz.length) * 100);
      const summaryElement = document.createElement('div');
      summaryElement.innerHTML = `
        <h3>Résultat final</h3>
        <p>Vous avez obtenu ${correctAnswers} réponses correctes sur ${quizData.quizz.length}.</p>
        <p>Score: ${scorePercentage}%</p>
        <button id="restart-button">Choisir un autre quiz</button>
      `;
      summaryElement.classList.add('summary');
      answersContainer.appendChild(summaryElement);
      
      document.getElementById('restart-button').addEventListener('click', () => {
        quizArea.style.display = 'none';
        quizSelection.style.display = 'block';
        difficultyBadge.style.display = 'block';
      }); 
      
      progressBar.style.width = '100%';
      quizStats.textContent = `Quiz terminé | Score final: ${correctAnswers}/${quizData.quizz.length} (${scorePercentage}%)`;
    }
  }

  // Event Listeners
  startButton.addEventListener('click', () => {
    const selectedQuiz = quizDropdown.value;
    if (selectedQuiz) {
      loadQuiz(selectedQuiz);
    } else {
      alert("Veuillez sélectionner un quiz dans la liste.");
    }
  });

  submitButton.addEventListener('click', checkAnswer);
  nextButton.addEventListener('click', nextQuestion);

  // Event listener pour importer un fichier JSON
  fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const quizContent = JSON.parse(e.target.result);
        addQuiz(quizContent, true, file.name);
        fileInput.value = ''; // Réinitialiser l'input file
      } catch (error) {
        console.error("Erreur lors de la lecture du fichier JSON:", error);
        alert(`Le fichier n'est pas un JSON valide: ${error.message}`);
      }
    };
    reader.readAsText(file);
  });

  // Event listener pour importer depuis le textarea
  importJsonButton.addEventListener('click', () => {
    const jsonText = jsonInput.value.trim();
    if (!jsonText) {
      alert("Veuillez entrer du JSON valide dans le champ.");
      return;
    }

    try {
      const quizContent = JSON.parse(jsonText);
      addQuiz(quizContent);
    } catch (error) {
      console.error("Erreur lors de l'analyse du JSON:", error);
      alert(`JSON invalide: ${error.message}`);
    }
  });

  // Initialiser l'application
  loadQuizzesFromStorage();
});