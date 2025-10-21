# AptitudeHub - Online Exam Practice Platform

A modern, responsive web application for students to practice aptitude tests for IT jobs, banking exams, and government exams.

## 📋 Project Structure

```
d:\web ui\
├── index.html          # Main HTML file
├── styles.css         # CSS styling
├── app.js             # Main JavaScript logic
├── questions.js       # Question bank database
└── README.md          # This file
```

## 🎯 Features

### Authentication
- **Sign Up**: New users can create an account with name, email, mobile, and password
- **Login**: Existing users can securely log in
- **Session Management**: Persistent login using browser localStorage

### Exam Categories
1. **IT Jobs & Campus Placements** (60 min, 50 questions)
   - TCS, Infosys, Wipro, Cognizant, Accenture, Tech Mahindra

2. **Banking Exams** (60 min, 50 questions)
   - SBI PO, IBPS PO, RRB, Clerk, PNB, Bank of Baroda

3. **Government Exams** (90 min, 75 questions)
   - SSC CGL, SSC CHSL, Railway, UPSC, State PSC

### Quiz Features
- **Real-time Timer**: Countdown timer with visual warnings
- **Progress Bar**: Visual indication of quiz progress
- **Immediate Feedback**: Correct/incorrect answers highlighted instantly
- **Explanations**: Detailed explanations for each question
- **Question Metadata**: Category, topic, and difficulty level badges
- **Random Questions**: Questions shuffled randomly on each attempt

### Performance Tracking
- **Dashboard Stats**: Tests attempted, average score, best score, total questions solved
- **Result Analysis**: Detailed category-wise performance breakdown
- **Performance Rating**: Scaled ratings (Excellent, Very Good, Good, Fair)
- **Test History**: All previous test attempts saved

### Design
- **Modern UI**: Clean, professional interface with gradient purple theme
- **Responsive**: Works perfectly on desktop, tablet, and mobile devices
- **Smooth Animations**: Engaging transitions and effects
- **User-Friendly**: Intuitive navigation and clear instructions

## 🚀 How to Use

### Local Setup
1. Download all files to a folder (e.g., `d:\web ui\`)
2. Open `index.html` in any web browser
3. No server or installation required!

### First Time User
1. Click "Sign Up" on the login screen
2. Enter your details: Full Name, Email, Mobile, Password
3. Click "Create Account"
4. Login with your email and password

### Taking a Test
1. From the dashboard, select an exam category
2. Read the question carefully
3. Select an answer (highlighted in blue)
4. Click "Next Question" to continue
5. After the last question, click "Finish Test"
6. View your results and analysis

### Retaking Tests
- Click "Retake Test" after viewing results
- Or go back to dashboard and select a different category
- Your test history is automatically saved

## 📊 Question Bank

The platform includes:
- **150+ Questions** across three exam types
- **Multiple Categories**: Quantitative Aptitude, Logical Reasoning, Verbal Reasoning
- **Difficulty Levels**: Easy, Medium, Hard
- **Detailed Explanations**: Every question has a clear solution

### Question Topics Include:
- **Quantitative**: Percentages, Time & Work, Ratios, Profit & Loss, Compound Interest, etc.
- **Logical**: Number Series, Coding, Blood Relations, Calendar, Analogies, etc.
- **Verbal**: Synonyms, Antonyms, Reading Comprehension, Idioms, One Word Substitution, etc.

## 💾 Data Storage

All user data is stored locally in the browser:
- `aptitude_users`: User account information
- `current_user`: Currently logged-in user
- `user_history`: Test attempts and scores

**Note**: Data persists only in the same browser. Clearing browser data will remove saved information.

## 🔐 Security Note

This is a practice platform. For production use:
- Implement server-side authentication
- Use encrypted password storage
- Move data to secure database
- Add password recovery mechanism

## 📱 Browser Compatibility

Works on:
- Chrome/Chromium
- Firefox
- Safari
- Edge
- Opera

## 🎓 Tips for Best Performance

1. **Take Full Tests**: Complete entire tests to get accurate assessments
2. **Read Explanations**: Understand the concepts behind each answer
3. **Track Progress**: Monitor your improving scores over time
4. **Practice Consistently**: Regular practice improves aptitude skills
5. **Analyze Weak Areas**: Focus on categories with lower performance

## 📝 Customization

To add more questions:
1. Open `questions.js`
2. Add new question objects to the `questionBank` array
3. Follow the existing format with all required fields

Example:
```javascript
{
    "id":"NEW001",
    "examType":"it",
    "category":"Quantitative Aptitude",
    "topic":"Percentages",
    "difficulty":"Easy",
    "question":"Your question here?",
    "options":["Option A","Option B","Option C","Option D"],
    "correctAnswer":0,
    "explanation":"Explanation here"
}
```

## 🐛 Troubleshooting

**Problem**: Login not working
- Clear browser cookies and try again
- Check if email is correctly registered

**Problem**: Timer not visible
- Ensure JavaScript is enabled
- Try a different browser

**Problem**: Questions not loading
- Verify `questions.js` is in the same folder
- Check browser console for errors

## 📞 Support

For any issues or suggestions:
- Check that all files are in the same directory
- Ensure browser JavaScript is enabled
- Try opening in a different browser

## 📄 License

This project is provided for educational purposes.

## ✨ Future Enhancements

- Backend server integration
- Mobile app version
- More question topics
- Video explanations
- Discussion forums
- Leaderboards
- Achievement badges

---

**Happy Learning! 🎯**

Last Updated: October 20, 2025
