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
  const toggleImportSectionButton = document.getElementById('toggle-import-section');
  const importSectionContainer = document.getElementById('import-section-container');
  // Nouveaux éléments pour la section "Comment ça fonctionne"
  const toggleHowItWorksButton = document.getElementById('toggle-how-it-works');
  const howItWorksSection = document.getElementById('how-it-works-section');
  const copyTemplateBtn = document.getElementById('copy-template-btn');
  const copyMarkdownBtn = document.getElementById('copy-markdown-btn');

  let currentQuestionIndex = 0;
  let quizData;
  let selectedAnswerIds = [];
  let correctAnswers = 0;
  let quizzesInStorage = {};

  // Function to copy the template to clipboard
  if (copyTemplateBtn) {
    copyTemplateBtn.addEventListener('click', function() {
      fetch('template.json')
        .then(response => response.text())
        .then(templateCode => {
          navigator.clipboard.writeText(templateCode).then(function() {
            const btn = copyTemplateBtn;
            const originalText = btn.textContent;
            btn.textContent = 'Copied!';
            btn.classList.add('copied');
            
            setTimeout(function() {
              btn.textContent = originalText;
              btn.classList.remove('copied');
            }, 2000);
          }, function(err) {
            console.error('Could not copy text: ', err);
          });
        })
        .catch(error => console.error('Error fetching template.json:', error));
    });
  }

  // Function to copy the Markdown content to clipboard
  if (copyMarkdownBtn) {
    copyMarkdownBtn.addEventListener('click', function() {
      navigator.clipboard.writeText(howItWorksMarkdown).then(function() {
        const btn = copyMarkdownBtn;
        const originalText = btn.textContent;
        btn.textContent = 'Copied!';
        btn.classList.add('copied');
        
        setTimeout(function() {
          btn.textContent = originalText;
          btn.classList.remove('copied');
        }, 2000);
      }, function(err) {
        console.error('Could not copy text: ', err);
      });
    });
  }

  // Function to toggle the "How it works" section
  toggleHowItWorksButton.addEventListener('click', () => {
    howItWorksSection.classList.toggle('visible');
    toggleHowItWorksButton.classList.toggle('open');
    
    // Close the import section if open
    if (importSectionContainer.style.display === 'block') {
      importSectionContainer.style.display = 'none';
      toggleImportSectionButton.classList.remove('open');
    }
  });

  // Function to load quizzes from localStorage
  function loadQuizzesFromStorage() {
    const storedQuizzes = localStorage.getItem('quizzes');
    if (storedQuizzes) {
      try {
        quizzesInStorage = JSON.parse(storedQuizzes);
      } catch (error) {
        console.error("Error loading quizzes from localStorage:", error);
        quizzesInStorage = {};
        localStorage.setItem('quizzes', JSON.stringify(quizzesInStorage));
      }
    } else {
      quizzesInStorage = {};
      localStorage.setItem('quizzes', JSON.stringify(quizzesInStorage));
      // Preload examples if localStorage is empty
      preloadExampleQuizzes();
    }
    updateQuizDropdown();
    updateSavedQuizzesList();
  }

  // Function to preload quiz examples
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
          console.error(`Error loading quiz example ${quiz.id}:`, error);
        }
      }
      
      localStorage.setItem('quizzes', JSON.stringify(quizzesInStorage));
    } catch (error) {
      console.error("Error preloading quiz examples:", error);
    }
  }

  // Function to update the quiz selector
  function updateQuizDropdown() {
    quizDropdown.innerHTML = '';
    
    if (Object.keys(quizzesInStorage).length === 0) {
      quizDropdown.innerHTML = '<option value="">No quizzes available</option>';
      startButton.disabled = true;
    } else {
      quizDropdown.innerHTML = '<option value="">Select a quiz</option>';
      
      Object.entries(quizzesInStorage).forEach(([id, quiz]) => {
        const option = document.createElement('option');
        option.value = id;
        option.textContent = quiz.Title || `Untitled Quiz (${id})`;
        quizDropdown.appendChild(option);
      });
      
      startButton.disabled = false;
    }
  }

  // Function to update the list of saved quizzes
  function updateSavedQuizzesList() {
    savedQuizzesContainer.innerHTML = '';
    
    if (Object.keys(quizzesInStorage).length === 0) {
      savedQuizzesContainer.innerHTML = '<p>No quizzes saved.</p>';
      return;
    }
    
    Object.entries(quizzesInStorage).forEach(([id, quiz]) => {
      const quizItem = document.createElement('div');
      quizItem.classList.add('saved-quiz-item');
      quizItem.dataset.quizId = id;
      
      const titleSpan = document.createElement('span');
      titleSpan.classList.add('quiz-title');
      titleSpan.textContent = quiz.Title || `Untitled Quiz (${id})`;
      
      const deleteButton = document.createElement('button');
      deleteButton.classList.add('delete-quiz');
      deleteButton.textContent = 'Delete';
      deleteButton.addEventListener('click', (e) => {
        e.stopPropagation();
        showDeleteConfirmation(quizItem, id);
      });
      
      // Create the confirmation area
      const confirmationDiv = document.createElement('div');
      confirmationDiv.classList.add('delete-confirmation');
      
      const confirmationMsg = document.createElement('span');
      confirmationMsg.classList.add('confirmation-message');
      confirmationMsg.textContent = 'Are you sure you want to delete this quiz?';
      
      const btnContainer = document.createElement('div');
      btnContainer.classList.add('confirmation-buttons');
      
      const confirmBtn = document.createElement('button');
      confirmBtn.classList.add('confirm-delete');
      confirmBtn.textContent = 'Yes';
      confirmBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteQuiz(id);
      });
      
      const cancelBtn = document.createElement('button');
      cancelBtn.classList.add('cancel-delete');
      cancelBtn.textContent = 'No';
      cancelBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        hideDeleteConfirmation(quizItem);
      });
      
      btnContainer.appendChild(confirmBtn);
      btnContainer.appendChild(cancelBtn);
      confirmationDiv.appendChild(confirmationMsg);
      confirmationDiv.appendChild(btnContainer);
      
      quizItem.appendChild(titleSpan);
      quizItem.appendChild(deleteButton);
      quizItem.appendChild(confirmationDiv);
      savedQuizzesContainer.appendChild(quizItem);
    });
  }

  // Function to show delete confirmation
  function showDeleteConfirmation(quizItem, quizId) {
    // Close all other active confirmations
    document.querySelectorAll('.saved-quiz-item.confirming').forEach(item => {
      if (item !== quizItem) {
        item.classList.remove('confirming');
      }
    });
    
    quizItem.classList.add('confirming');
  }
  
  // Function to hide delete confirmation
  function hideDeleteConfirmation(quizItem) {
    quizItem.classList.remove('confirming');
  }

  // Function to delete a quiz
  function deleteQuiz(quizId) {
    delete quizzesInStorage[quizId];
    localStorage.setItem('quizzes', JSON.stringify(quizzesInStorage));
    updateQuizDropdown();
    updateSavedQuizzesList();
    
    // Temporary success notification
    const notification = document.createElement('div');
    notification.textContent = 'Quiz deleted!';
    notification.style.backgroundColor = 'rgba(40, 167, 69, 0.9)';
    notification.style.color = 'white';
    notification.style.padding = '10px';
    notification.style.borderRadius = 'var(--border-radius)';
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.right = '20px';
    notification.style.zIndex = '1000';
    notification.style.boxShadow = 'var(--box-shadow)';
    notification.style.transition = 'opacity 0.5s ease';
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 500);
    }, 2000);
  }

  // Function to load a specific quiz
  function loadQuiz(quizId) {
    try {
      quizData = quizzesInStorage[quizId];
      
      if (!quizData || !quizData.quizz || quizData.quizz.length === 0) {
        throw new Error("The quiz is empty or poorly structured.");
      }
      
      // Display the quiz title
      quizTitleElement.textContent = quizData.Title || "Quiz";
      
      currentQuestionIndex = 0;
      correctAnswers = 0;
      loadQuestion(currentQuestionIndex);
      updateProgressBar();
      
      quizSelection.style.display = 'none';
      quizArea.style.display = 'block';
    } catch (error) {
      console.error("Error loading quiz:", error);
      alert(`Unable to load quiz: ${error.message}`);
    }
  }

  // Function to add a new quiz
  function addQuiz(quizContent, fromFile = false, fileName = '') {
    try {
      // Validate the quiz structure
      if (!quizContent || !quizContent.quizz || !Array.isArray(quizContent.quizz)) {
        throw new Error("Invalid quiz format. The format must contain a 'quizz' array.");
      }
      
      // Generate a unique ID
      const quizId = `quiz_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      
      // Add the quiz to storage
      quizzesInStorage[quizId] = quizContent;
      localStorage.setItem('quizzes', JSON.stringify(quizzesInStorage));
      
      // Update the interface
      updateQuizDropdown();
      updateSavedQuizzesList();
      
      // Clear import fields and indicate success
      if (!fromFile) {
        showImportSuccess(importJsonButton, `Quiz imported!`);
        jsonInput.setAttribute('data-original', jsonInput.value); // Save the current content
      } else {
        fileInput.value = '';
        showImportSuccess(document.querySelector('.file-import label'), 
          `Quiz imported!`);
      }
    } catch (error) {
      console.error("Error adding quiz:", error);
      showImportError(fromFile ? document.querySelector('.file-import label') : importJsonButton, 
        `Error: ${error.message}`);
    }
  }

  // Function to indicate import success
  function showImportSuccess(element, message) {
    // Save the original text
    const originalText = element.textContent;
    element.setAttribute('data-original-text', originalText);
    
    // Apply success style and text
    element.textContent = message;
    element.classList.add('import-success');
    element.disabled = true;
    
    // Schedule a return to normal state after a delay
    setTimeout(() => {
      if (element.classList.contains('import-success')) {
        element.textContent = element.getAttribute('data-original-text');
        element.classList.remove('import-success');
        element.disabled = false;
      }
    }, 5000);
  }
  
  // Function to indicate import error
  function showImportError(element, message) {
    // Save the original text
    const originalText = element.textContent;
    element.setAttribute('data-original-text', originalText);
    
    // Apply error style and text
    element.textContent = message;
    element.classList.add('import-error');
    
    // Schedule a return to normal state after a delay
    setTimeout(() => {
      if (element.classList.contains('import-error')) {
        element.textContent = element.getAttribute('data-original-text');
        element.classList.remove('import-error');
      }
    }, 5000);
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
    
    // Display the difficulty
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

    // Shuffle the possible answers array
    const possibleAnswers = currentQuestion["Possible answers"];
    for (let i = possibleAnswers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [possibleAnswers[i], possibleAnswers[j]] = [possibleAnswers[j], possibleAnswers[i]];
    }

    possibleAnswers.forEach((answer, index) => {
      const answerElement = document.createElement('div');
      answerElement.classList.add('answer-option');
      answerElement.textContent = answer.answer;
      // Utiliser l'index comme identifiant au lieu de l'ID fourni dans le JSON
      answerElement.dataset.answerId = index;
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
    
    // If the ID is already selected, deselect it
    if (selectedAnswerIds.includes(answerId)) {
      selectedAnswerIds = selectedAnswerIds.filter(id => id !== answerId);
      selectedDiv.classList.remove('selected');
    } else {
      // Otherwise, add it to the selections
      selectedAnswerIds.push(answerId);
      selectedDiv.classList.add('selected');
    }
  }

  function checkAnswer() {
    if (selectedAnswerIds.length === 0) {
      alert("Please select at least one answer before submitting.");
      return;
    }

    submitButton.style.display = 'none';
    nextButton.style.display = 'block';
    explanationContainer.style.display = 'block';
    feedbackContainer.style.display = 'block';

    const currentQuestion = quizData.quizz[currentQuestionIndex];
    
    // Récupérer les éléments de réponse dans l'ordre actuel (après le shuffle)
    const answerElements = document.querySelectorAll('.answer-option');
    
    // Déterminer quels sont les indices des réponses correctes
    const correctAnswerIndices = [];
    answerElements.forEach((element, index) => {
      const elementId = parseInt(element.dataset.answerId);
      const answerObject = currentQuestion["Possible answers"].find((a, i) => {
        // L'élément sélectionné correspond au texte de la réponse dans le JSON
        return element.textContent === a.answer;
      });
      
      if (answerObject && answerObject["is it correct or not"]) {
        correctAnswerIndices.push(elementId);
      }
    });

    // Check the answers
    let allCorrect = true;
    
    // Check if all correct answers are selected
    if (selectedAnswerIds.length !== correctAnswerIndices.length) {
      allCorrect = false;
    } else {
      for (let id of correctAnswerIndices) {
        if (!selectedAnswerIds.includes(id)) {
          allCorrect = false;
          break;
        }
      }
    }

    // Mark correct and incorrect answers
    answerElements.forEach(element => {
      const id = parseInt(element.dataset.answerId);
      
      if (correctAnswerIndices.includes(id)) {
        element.classList.add('correct');
      }
      
      if (selectedAnswerIds.includes(id) && !correctAnswerIndices.includes(id)) {
        element.classList.add('incorrect');
      }
    });

    explanationTextElement.textContent = currentQuestion.Explanation;

    if (allCorrect) {
      feedbackMessageElement.textContent = "Good answer!";
      feedbackContainer.classList.add('correct');
      correctAnswers++;
    } else {
      feedbackMessageElement.textContent = "Incorrect answer.";
      feedbackContainer.classList.add('incorrect');
    }
    
    // Update stats
    quizStats.textContent = `Question ${currentQuestionIndex + 1}/${quizData.quizz.length} | Score: ${correctAnswers}/${currentQuestionIndex + 1}`;
  }

  function nextQuestion() {
    currentQuestionIndex++;
    
    if (currentQuestionIndex < quizData.quizz.length) {
      loadQuestion(currentQuestionIndex);
      updateProgressBar();
    } else {
      // Quiz completed
      questionElement.textContent = "Quiz completed!";
      answersContainer.innerHTML = '';
      submitButton.style.display = 'none';
      nextButton.style.display = 'none';
      explanationContainer.style.display = 'none';
      feedbackContainer.style.display = 'none';
      difficultyBadge.style.display = 'none';
      
      // Display a summary
      const scorePercentage = Math.round((correctAnswers / quizData.quizz.length) * 100);
      const summaryElement = document.createElement('div');
      summaryElement.innerHTML = `
        <h3>Final Result</h3>
        <p>You got ${correctAnswers} correct answers out of ${quizData.quizz.length}.</p>
        <p>Score: ${scorePercentage}%</p>
        <button id="restart-button">Choose another quiz</button>
      `;
      summaryElement.classList.add('summary');
      answersContainer.appendChild(summaryElement);
      
      document.getElementById('restart-button').addEventListener('click', () => {
        quizArea.style.display = 'none';
        quizSelection.style.display = 'block';
        difficultyBadge.style.display = 'block';
      }); 
      
      progressBar.style.width = '100%';
      quizStats.textContent = `Quiz completed | Final Score: ${correctAnswers}/${quizData.quizz.length} (${scorePercentage}%)`;
    }
  }

  // Event Listeners
  startButton.addEventListener('click', () => {
    const selectedQuiz = quizDropdown.value;
    if (selectedQuiz) {
      loadQuiz(selectedQuiz);
    } else {
      alert("Please select a quiz from the list.");
    }
  });

  submitButton.addEventListener('click', checkAnswer);
  nextButton.addEventListener('click', nextQuestion);

  // Event listener to import a JSON file
  fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const quizContent = JSON.parse(e.target.result);
        addQuiz(quizContent, true, file.name);
        fileInput.value = ''; // Reset the file input
      } catch (error) {
        console.error("Error reading JSON file:", error);
        showImportError(document.querySelector('.file-import label'), `Error: ${error.message}`);
      }
    };
    reader.readAsText(file);
  });

  // Event listener to import from the textarea
  importJsonButton.addEventListener('click', () => {
    const jsonText = jsonInput.value.trim();
    if (!jsonText) {
      showImportError(importJsonButton, "Please enter valid JSON");
      return;
    }

    try {
      const quizContent = JSON.parse(jsonText);
      addQuiz(quizContent);
    } catch (error) {
      console.error("Error parsing JSON:", error);
      showImportError(importJsonButton, `Invalid JSON: ${error.message}`);
    }
  });

  // Reset the button state when the user modifies the content
  jsonInput.addEventListener('input', () => {
    if (jsonInput.getAttribute('data-original') !== jsonInput.value) {
      if (importJsonButton.classList.contains('import-success') || 
          importJsonButton.classList.contains('import-error')) {
        importJsonButton.textContent = importJsonButton.getAttribute('data-original-text');
        importJsonButton.classList.remove('import-success', 'import-error');
        importJsonButton.disabled = false;
      }
    }
  });

  // Event listener for the "Import a quiz" button
  toggleImportSectionButton.addEventListener('click', () => {
    importSectionContainer.style.display = importSectionContainer.style.display === 'none' ? 'block' : 'none';
    toggleImportSectionButton.classList.toggle('open');
    
    // Close the "How it works" section if open
    if (howItWorksSection.classList.contains('visible')) {
      howItWorksSection.classList.remove('visible');
      toggleHowItWorksButton.classList.remove('open');
    }
  });

  // Initialize the application
  loadQuizzesFromStorage();

  // Initialization: hide the import section and ensure the button has the correct initial class
  importSectionContainer.style.display = 'none';
  toggleImportSectionButton.classList.remove('open');
  // Ensure the "How it works" section is hidden initially
  howItWorksSection.classList.remove('visible');
  toggleHowItWorksButton.classList.remove('open');

  // Initialisation du contenu Markdown pour la section "Comment ça marche"
  const markdownContentElement = document.getElementById('markdown-content');
  
  // Configuration de marked pour ajouter la classe language-* aux blocs de code
  // et ajouter un bouton de copie pour chaque bloc de code JSON
  marked.setOptions({
    highlight: function(code, lang) {
      return code;
    },
    langPrefix: 'language-',
    breaks: true,
    gfm: true
  });
  
  // Convertir le Markdown en HTML et l'insérer dans la page
  if (markdownContentElement && typeof howItWorksMarkdown !== 'undefined') {
    markdownContentElement.innerHTML = marked.parse(howItWorksMarkdown);
    
    // Déclencher la coloration syntaxique de Prism après l'insertion du contenu
    if (typeof Prism !== 'undefined') {
      Prism.highlightAll();
    }
    
    // Ajouter un bouton de copie pour le bloc de code JSON
    const jsonCodeBlock = markdownContentElement.querySelector('pre code.language-json');
    if (jsonCodeBlock && jsonCodeBlock.parentElement) {
      const copyJsonBtn = document.createElement('button');
      copyJsonBtn.textContent = 'Copy JSON';
      copyJsonBtn.className = 'copy-json-btn';
      copyJsonBtn.addEventListener('click', function() {
        navigator.clipboard.writeText(jsonCodeBlock.textContent).then(function() {
          copyJsonBtn.textContent = 'Copied!';
          copyJsonBtn.classList.add('copied');
          
          setTimeout(function() {
            copyJsonBtn.textContent = 'Copy JSON';
            copyJsonBtn.classList.remove('copied');
          }, 2000);
        }, function(err) {
          console.error('Could not copy text: ', err);
        });
      });
      
      // Ajouter le bouton au parent du bloc de code
      jsonCodeBlock.parentElement.style.position = 'relative';
      jsonCodeBlock.parentElement.appendChild(copyJsonBtn);
    }
  }
});