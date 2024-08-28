const submitBtn = document.querySelector('#submit-btn');
const subject = document.querySelector('#subject');
const textField = document.querySelector('#text-question');
const addQuestion = document.querySelector('#add-question');
const questionBox = document.querySelector('#question-box');

const box2 = document.querySelector('#box2');
const box3 = document.querySelector('#box3');
const newForm = document.querySelector('#newform');
const display = document.querySelector('#display');

const response = document.querySelector('#response-name');
const responseArea = document.querySelector('#response-area');
const responseBtn = document.querySelector('#response-btn');
const responseBox = document.querySelector('#response-box');

const searchInput = document.querySelector('#search');
const resolve = document.querySelector('#resolve');

let questions = JSON.parse(localStorage.getItem('questions')) || [];
let index = questions.length > 0 ? Math.max(...questions.map(q => parseInt(q.id))) + 1 : 0;
let currentQuestionId = null;

function createResponsDOM(responseValue, responseAreaValue, likeValue, dislikeValue, responseIndex) {
    const newDisplayDiv = document.createElement('div');
    newDisplayDiv.className = 'display-response';
    newDisplayDiv.id = `display-response-${responseIndex}`;
    newDisplayDiv.innerHTML = `
        <h4>${responseValue}</h4>
        <p>${responseAreaValue}</p>
        <img src="thumbsUp.png" id="like-response-${responseIndex}" class="like-response">
        <span id="like-count-${responseIndex}" class="like-count">${likeValue}</span>
        <span id="dislike-count-${responseIndex}" class="dislike-count">${dislikeValue}</span>
        <img src="thumbsDown.png" id="dislike-response-${responseIndex}" class="dislike-response">
    `;
    return newDisplayDiv;
}

function createDOM(obj) {
    const div = document.createElement('div');
    div.className = 'query';
    div.id = obj.id;
    const favImageSrc = obj.isfavourite === 'true' ? 'like.png' : 'dislike.png';
    div.innerHTML = `
        <h4>${obj.subject}</h4>
        <p>${obj.text}</p>
        <img src="${favImageSrc}" class="${obj.isfavourite === 'true' ? 'favourite' : ''}" id="fav-image-${obj.id}">
        <p id="timer-${obj.id}" class="timer">${setTime(obj.time)}</p>
    `;
    div.querySelector(`#fav-image-${obj.id}`).addEventListener('click', toggleFavourite);
    return div;
}

function removeProblem(responseId) {
    const questionIndex = questions.findIndex(q => q.id === responseId);
    if (questionIndex !== -1) {
        questions.splice(questionIndex, 1);
        localStorage.setItem('questions', JSON.stringify(questions));
        if (currentQuestionId === responseId) {
            responseBox.innerHTML = '';
            box2.classList.remove('hide');
            box3.classList.add('hide');
            console.log(box3)
            document.getElementById(responseId).remove();
        }
    }
}

resolve.addEventListener('click', () => {
    removeProblem(currentQuestionId);
    display.innerHTML = '';
});

function appendQuestionAtTop(question) {
    const div = createDOM(question);
    const firstNonFavourite = Array.from(addQuestion.children).find(child => !child.querySelector('.favourite'));
    if (firstNonFavourite) {
        addQuestion.insertBefore(div, firstNonFavourite);
    } else {
        addQuestion.appendChild(div);
    }
}

function sortAndDisplayQuestions() {
    const favouriteQuestions = [];
    const regularQuestions = [];

    questions.forEach(question => {
        if (question.isfavourite === 'true') {
            favouriteQuestions.push(question);
        } else {
            regularQuestions.push(question);
        }
    });

    favouriteQuestions.concat(regularQuestions).forEach(question => {
        const existingQuestionDiv = document.getElementById(question.id);
        if (!existingQuestionDiv) {
            const div = createDOM(question);
            addQuestion.appendChild(div);
        } else {
            addQuestion.appendChild(existingQuestionDiv);
        }
    });
}

const saveQuestions = (questions) => {
    localStorage.setItem('questions', JSON.stringify(questions));
};

const loadResponses = (questionId) => {
    responseBox.innerHTML = '';
    const question = questions.find(q => q.id === questionId);

    if (question) {
        const sortedResponses = question.responses.slice();
        sortedResponses.sort((a, b) => {
            const diffA = a.like - a.dislike;
            const diffB = b.like - b.dislike;

            if (diffA !== diffB)
                return diffB - diffA;
            else
                return b.like - a.like;

        });

        sortedResponses.forEach((response, i) => {
            const newDisplayDiv = createResponsDOM(response.name, response.text, response.like, response.dislike, i);
            responseBox.appendChild(newDisplayDiv);

            const likeBtn = newDisplayDiv.querySelector(`#like-response-${i}`);
            const dislikeBtn = newDisplayDiv.querySelector(`#dislike-response-${i}`);

            likeBtn.addEventListener('click', () => {
                response.like++;
                const responseIndex = question.responses.findIndex(r => r.name === response.name && r.text === response.text);
                if (responseIndex !== -1) {
                    questions[questions.indexOf(question)].responses[responseIndex].like = response.like;
                    saveQuestions(questions);
                    document.querySelector(`#like-count-${i}`).textContent = response.like;
                    loadResponses(questionId);
                }
            });

            dislikeBtn.addEventListener('click', () => {
                response.dislike++;
                const responseIndex = question.responses.findIndex(r => r.name === response.name && r.text === response.text);
                if (responseIndex !== -1) {
                    questions[questions.indexOf(question)].responses[responseIndex].dislike = response.dislike;
                    saveQuestions(questions);
                    document.querySelector(`#dislike-count-${i}`).textContent = response.dislike;
                    loadResponses(questionId);
                }
            });
        });
    }
};


const saveResponse = () => {
    const question = questions.find(q => q.id === currentQuestionId);
    if (question) {
        question.responses.push({
            name: response.value.trim(),
            text: responseArea.value.trim(),
            like: 0,
            dislike: 0,
        });
        saveQuestions(questions);
    }
};

newForm.addEventListener('click', () => {
    box3.classList.add('hide');
    box2.classList.remove('hide');
});

function checkInput(subject, textField) {
    return subject.value.trim() !== '' && textField.value.trim() !== '';
}

function toggleFavourite(e) {
    e.stopPropagation();
    const image = e.target;
    const questionDiv = image.closest('.query');
    const questionId = questionDiv.id;
    const question = questions.find(q => q.id === questionId);

    if (image.classList.contains('favourite')) {
        image.src = 'dislike.png';
        image.classList.remove('favourite');
        question.isfavourite = 'false';
        addQuestion.appendChild(questionDiv);
    } else {
        image.src = 'like.png';
        image.classList.add('favourite');
        question.isfavourite = 'true';
        questionDiv.remove();
        addQuestion.insertBefore(questionDiv, addQuestion.firstChild);
    }
    saveQuestions(questions);
}

submitBtn.addEventListener('click', () => {
    if (checkInput(subject, textField)) {
        const questionObj = {
            subject: subject.value,
            text: textField.value,
            id: `${index++}`,
            responses: [],
            isfavourite: 'false',
            likedValue: 0,
            dislikedValue: 0,
            time: Date.now(),
        };
        questions.push(questionObj);
        saveQuestions(questions);
        appendQuestionAtTop(questionObj);
        subject.value = '';
        textField.value = '';
    }
});

addQuestion.addEventListener('click', (e) => {
    if (e.target.closest('.query')) {
        const queryDiv = e.target.closest('.query');
        box2.classList.add('hide');
        box3.classList.remove('hide');

        currentQuestionId = queryDiv.id;

        const displayQuestionDiv = queryDiv.cloneNode(true);
        const timer = displayQuestionDiv.querySelector('.timer');
        displayQuestionDiv.removeChild(timer);

        displayQuestionDiv.classList.remove('query');
        displayQuestionDiv.classList.add('display-question');
        displayQuestionDiv.id = 'display-box';

        display.innerHTML = '';
        display.appendChild(displayQuestionDiv);

        loadResponses(currentQuestionId);
    }
});

responseBtn.addEventListener('click', () => {
    const responseValue = response.value.trim();
    const responseAreaValue = responseArea.value.trim();

    if (responseValue === '' || responseAreaValue === '') {
        alert('Both response fields must be filled out.');
        return;
    }

    responseBox.insertBefore(createResponsDOM(responseValue, responseAreaValue, 0, 0, index), responseBox.firstChild);

    saveResponse();
    loadResponses(currentQuestionId);

    response.value = '';
    responseArea.value = '';
});

searchInput.addEventListener('input', searchQuestions);

function highlightText(text, query) {
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
}

function searchQuestions() {
    const searchText = searchInput.value.toLowerCase().trim();
    const allQuestions = addQuestion.querySelectorAll('.query');

    allQuestions.forEach(question => {
        const subject = question.querySelector('h4').textContent.toLowerCase();
        const text = question.querySelector('p').textContent.toLowerCase();

        if (subject.includes(searchText) || text.includes(searchText)) {
            question.style.display = '';
            question.querySelector('h4').innerHTML = highlightText(question.querySelector('h4').textContent, searchText);
            question.querySelector('p').innerHTML = highlightText(question.querySelector('p').textContent, searchText);
        } else {
            question.style.display = 'none';
        }
    });
}

function setTime(time) {
    const createTime = (Date.now() - time) / 1000;

    if (createTime < 60)
        return `${Math.floor(createTime)} seconds ago`;
    else if (createTime < 3600)
        return `${Math.floor(createTime / 60)} minutes ago`;
    else if (createTime < 86400)
        return `${Math.floor(createTime / 3600)} hours ago`;
    else if (createTime < 2592000)
        return `${Math.floor(createTime / 86400)} days ago`;
    else if (createTime < 31536000)
        return `${Math.floor(createTime / 2592000)} months ago`;
    else
        return `${Math.floor(createTime / 31536000)} years ago`;

}

function updateTimers() {
    questions.forEach(question => {
        const timerElement = document.querySelector(`#timer-${question.id}`);
        if (timerElement) {
            timerElement.textContent = setTime(question.time);
        }
    });
}

setInterval(updateTimers, 1000);

sortAndDisplayQuestions();
