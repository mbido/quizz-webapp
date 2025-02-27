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

  let currentQuestionIndex = 0;
  let quizData;
  let selectedAnswerIds = [];
  let correctAnswers = 0;

  // Fonction pour charger la liste des quizzes disponibles
  async function loadQuizList() {
    try {
      const response = await fetch('/quizzes/');
      if (!response.ok) {
        throw new Error(`Erreur HTTP! statut: ${response.status}`);
      }

      const text = await response.text();
      const parser = new DOMParser();
      const htmlDoc = parser.parseFromString(text, 'text/html');
      const links = Array.from(htmlDoc.querySelectorAll('a'));
      const quizFiles = links
        .filter(link => link.href.endsWith('.json'))
        .map(link => {
          const filename = link.href.substring(link.href.lastIndexOf('/') + 1);
          return { name: filename.replace('.json', ''), file: filename };
        });

      quizDropdown.innerHTML = '';
      
      if (quizFiles.length === 0) {
        quizDropdown.innerHTML = '<option value="">Aucun quiz disponible</option>';
        startButton.disabled = true;
      } else {
        quizDropdown.innerHTML = '<option value="">Sélectionnez un quiz</option>';
        
        // Chargement des titres de quiz
        for (const quiz of quizFiles) {
          try {
            const quizResponse = await fetch(`/quizzes/${quiz.file}`);
            if (quizResponse.ok) {
              const quizContent = await quizResponse.json();
              const option = document.createElement('option');
              option.value = quiz.file;
              option.textContent = quizContent.Title || `Quiz ${quiz.name}`;
              quizDropdown.appendChild(option);
            }
          } catch (error) {
            console.error(`Erreur lors du chargement du quiz ${quiz.file}:`, error);
            const option = document.createElement('option');
            option.value = quiz.file;
            option.textContent = `Quiz ${quiz.name}`;
            quizDropdown.appendChild(option);
          }
        }
      }
    } catch (error) {
      console.error("Erreur lors du chargement de la liste des quizzes:", error);
      quizDropdown.innerHTML = '<option value="">Erreur de chargement</option>';
      startButton.disabled = true;
    }
  }

  // Fonction pour charger un quiz spécifique
  async function loadQuiz(quizFile) {
    try {
      const response = await fetch(`/quizzes/${quizFile}`);
      if (!response.ok) {
        throw new Error(`Erreur HTTP! statut: ${response.status}`);
      }
      
      quizData = await response.json();
      
      if (!quizData.quizz || quizData.quizz.length === 0) {
        throw new Error("Le fichier JSON du quiz est vide ou mal structuré.");
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

  // Charger la liste des quizzes au démarrage
  loadQuizList();
});