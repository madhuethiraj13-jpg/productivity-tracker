# Smart Daily Life Productivity Tracker

A web application to track daily activities, mood, energy level and time of day, and analyse the data to understand productivity patterns.

**Live Demo:** https://madhuethiraj13-jpg.github.io/productivity-tracker/
## About

This application helps track how time is spent during the day. Along with each activity, it records mood, energy level and time of day. The collected data was then analysed using Python to find patterns and improve daily planning.

## Features

- Log daily activities with duration
- Record mood and energy level for each entry
- Track time of day (morning, afternoon, evening, night)
- Separate productive time and time wasted
- Interactive charts using Chart.js
- Data analysis using Python

## Tech Stack

- HTML
- CSS
- JavaScript
- Chart.js
- Python (Matplotlib)
- GitHub Pages

## Analysis and Insights

<img width="2906" height="1653" alt="productivity_charts_combined" src="https://github.com/user-attachments/assets/7a8fb917-747f-4cb4-8207-79f9b8120b71" />

- Monday was the most productive day (578 mins) and Wednesday the least (120 mins)
- Evening was the most productive time (88.5 mins average), while afternoon was the lowest (43.3 mins)
- High energy days gave about 39% more productive time than medium energy days
- Stress reduced productivity the most (60 mins vs 84.8 mins when neutral)
- Biggest time wasters were movies (6 hrs), Instagram (4 hrs) and TV (1.7 hrs)

## Folder Structure
productivity-tracker/
├── index.html
├── style.css
├── app.js
├── analysis.py
├── my_data.csv
└── productivity_charts_combined.png

## How to Run

1. Clone the repository
git clone https://github.com/madhuethiraj13-jpg/productivity-tracker.git
2. Open `index.html` in your browser

To run the analysis:
pip install pandas matplotlib
python analysis.py

## Future Improvements

- Weekly and monthly reports
- Goal setting and progress tracking
- Export data to CSV from the app

## Author

**Madhumitha Ethiraj**
MBA in Business Analytics, SRM Institute of Science and Technology

- LinkedIn: https://www.linkedin.com/in/madhumitha-e-
- GitHub: https://github.com/madhuethiraj13-jpg
