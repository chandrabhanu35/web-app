// Advanced question randomization system
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function randomizeOptions(question) {
    const options = typeof question.options === 'string' 
        ? JSON.parse(question.options) 
        : question.options;
    
    // Create pairs of options and correct answer index
    const optionPairs = options.map((opt, idx) => ({
        option: opt,
        wasCorrect: idx === (typeof question.correct_answer === 'string' 
            ? parseInt(question.correct_answer) 
            : question.correct_answer)
    }));
    
    // Shuffle the pairs
    const shuffled = shuffleArray([...optionPairs]);
    
    // Update the question with new order
    question.options = shuffled.map(pair => pair.option);
    question.correct_answer = shuffled.findIndex(pair => pair.wasCorrect);
    
    return question;
}

function balanceQuestions(questions) {
    // Group questions by difficulty
    const byDifficulty = {
        'easy': [],
        'medium': [],
        'hard': []
    };
    
    questions.forEach(q => {
        if (byDifficulty[q.difficulty.toLowerCase()]) {
            byDifficulty[q.difficulty.toLowerCase()].push(q);
        }
    });
    
    // Count correct answers in each position for each difficulty
    Object.keys(byDifficulty).forEach(diff => {
        const questions = byDifficulty[diff];
        const positionCounts = [0, 0, 0, 0]; // Count of A, B, C, D as correct answers
        
        questions.forEach(q => {
            const correctPos = typeof q.correct_answer === 'string' 
                ? parseInt(q.correct_answer) 
                : q.correct_answer;
            positionCounts[correctPos]++;
        });
        
        // Balance if too skewed
        const total = questions.length;
        const targetPerPosition = total / 4;
        
        questions.forEach(q => {
            const currentCorrect = typeof q.correct_answer === 'string' 
                ? parseInt(q.correct_answer) 
                : q.correct_answer;
            
            if (positionCounts[currentCorrect] > targetPerPosition * 1.5) { // If too many correct answers in this position
                // Find position with least correct answers
                const minPos = positionCounts.indexOf(Math.min(...positionCounts));
                
                // Swap correct answer to underrepresented position
                const temp = q.options[minPos];
                q.options[minPos] = q.options[currentCorrect];
                q.options[currentCorrect] = temp;
                q.correct_answer = minPos;
                
                // Update counts
                positionCounts[currentCorrect]--;
                positionCounts[minPos]++;
            }
        });
    });
    
    return questions;
}

module.exports = {
    shuffleArray,
    randomizeOptions,
    balanceQuestions
};