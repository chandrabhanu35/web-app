import { randomInt } from 'crypto';

function shuffleArray(array) {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

export function generateBulkQuestions(count = 1000) {
    const questions = [];
    const difficulties = ['easy', 'medium', 'hard'];
    const examTypes = ['it', 'banking', 'government'];
    const categories = ['Quantitative Aptitude', 'Logical Reasoning', 'English Language', 'General Knowledge'];

    for (let i = 0; i < count; i++) {
        // Ensure even distribution of difficulties (33% each)
        const difficulty = difficulties[i % 3];
        
        // Ensure even distribution of exam types
        const examType = examTypes[i % 3];
        
        // Ensure even distribution of categories
        const category = categories[i % 4];
        
        // Generate random correct answer index (0-3) for balanced distribution
        // This ensures 25% distribution for each option (A/B/C/D)
        const correctAnswer = i % 4;
        
        // Generate question based on difficulty
        const questionData = generateQuestionByDifficulty(difficulty, correctAnswer);
        
        questions.push({
            examType,
            category,
            topic: questionData.topic,
            difficulty,
            question_text: questionData.question,
            options: JSON.stringify(questionData.options),
            correct_answer: correctAnswer.toString(),
            explanation: questionData.explanation
        });
    }
    
    return questions;
}

function generateQuestionByDifficulty(difficulty, correctAnswer) {
    // Generate random numbers based on difficulty
    const num1 = Math.floor(Math.random() * (difficulty === 'easy' ? 100 : (difficulty === 'medium' ? 500 : 1000))) + 1;
    const num2 = Math.floor(Math.random() * (difficulty === 'easy' ? 100 : (difficulty === 'medium' ? 500 : 1000))) + 1;
    
    let question, answer, options, explanation, topic;
    
    switch(difficulty) {
        case 'easy':
            answer = num1 + num2;
            question = `What is ${num1} + ${num2}?`;
            topic = 'Basic Arithmetic';
            // Generate wrong options that are close to correct answer
            options = [
                answer,
                answer + Math.floor(Math.random() * 5) + 1,
                answer - Math.floor(Math.random() * 5) - 1,
                answer + Math.floor(Math.random() * 10) + 6
            ];
            explanation = `Addition: ${num1} + ${num2} = ${answer}`;
            break;
            
        case 'medium':
            answer = num1 * num2;
            question = `What is ${num1} × ${num2}?`;
            topic = 'Multiplication';
            options = [
                answer,
                answer + Math.floor(Math.random() * 50) + 10,
                answer - Math.floor(Math.random() * 50) - 10,
                answer * 2
            ];
            explanation = `Multiplication: ${num1} × ${num2} = ${answer}`;
            break;
            
        case 'hard':
            const divisor = Math.floor(Math.random() * 4) + 2;
            const product = num1 * num2;
            answer = Math.floor(product / divisor);
            question = `If a number divided by ${divisor} equals ${Math.floor(product / divisor)}, what is the number?`;
            topic = 'Complex Arithmetic';
            options = [
                product,
                product + Math.floor(Math.random() * 100) + 50,
                product - Math.floor(Math.random() * 100) - 50,
                Math.floor(product * 1.5)
            ];
            explanation = `${product} ÷ ${divisor} = ${Math.floor(product / divisor)}`;
            break;
    }
    
    // Shuffle options but ensure correct answer is at the specified index
    const correctAnswerValue = options[0];
    const shuffledOptions = shuffleArray(options);
    const correctIndex = shuffledOptions.indexOf(correctAnswerValue);
    
    // Swap to position
    [shuffledOptions[correctAnswer], shuffledOptions[correctIndex]] = 
    [shuffledOptions[correctIndex], shuffledOptions[correctAnswer]];
    
    return {
        question,
        options: shuffledOptions,
        explanation,
        topic
    };
}