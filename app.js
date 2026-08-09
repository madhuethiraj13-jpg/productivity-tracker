// ===== STORAGE =====
let activities = JSON.parse(localStorage.getItem("activities") || "[]");
let goals = JSON.parse(localStorage.getItem("goals") || "[]");

// ===== PAGE LOAD =====
window.onload = function() {
  displayActivities();
  calculateScore();

  if (activities.length > 0) {
    updateChart();
    updateInsight();
    updateMoodAnalytics();
    updateDNA();
  }

  checkGoals();
  loadWeeklySummary();
  checkDailyReset();
  showSavedStreak();
  updateChallengeScore();
  updateMonthlyComparison();
  buildHeatmap();
};

// ===== ADD ACTIVITY =====
function addActivity() {
  let name     = document.getElementById("activityName").value;
  let category = document.getElementById("activityCategory").value;
  let minutes  = document.getElementById("activityMinutes").value;
  let mood     = document.getElementById("activityMood").value;
  let timeOfDay= document.getElementById("activityTimeOfDay").value;
  let energy   = document.getElementById("activityEnergy").value;

  if (name === "" || minutes === "") {
    alert("Please fill in all fields!");
    return;
  }

  let activity = {
    name: name,
    category: category,
    minutes: parseInt(minutes),
    mood: mood,
    timeOfDay: timeOfDay,
    energy: energy,
    date: new Date().toLocaleDateString(),
    dayOfWeek: new Date().toLocaleDateString("en-US", { weekday: "long" })
  };

  activities.push(activity);
  localStorage.setItem("activities", JSON.stringify(activities));

  displayActivities();
  calculateScore();
  updateChart();
  updateInsight();
  checkGoals();
  updateStreak();
  updateWeeklySummary();
  updateMoodAnalytics();
  updateDNA();
  updateChallengeScore();
  updateMonthlyComparison();
  buildHeatmap();

  document.getElementById("activityName").value = "";
  document.getElementById("activityMinutes").value = "";
}

// ===== DISPLAY ACTIVITIES =====
function displayActivities() {
  let list = document.getElementById("activityList");
  list.innerHTML = "";

  if (activities.length === 0) {
    list.innerHTML = "<p>No activities logged yet.</p>";
    return;
  }

  activities.forEach(function(activity) {
    let emoji = getEmoji(activity.category);
    let moodEmoji = getMoodEmoji(activity.mood || "neutral");
    let energyColor = activity.energy === "high"   ? "#2ecc71"
                    : activity.energy === "medium" ? "#f39c12"
                    : "#ff6b6b";

    list.innerHTML += `
      <div class="activity-item">
        <div>
          <span>${emoji} <strong>${activity.name}</strong></span>
          <br>
          <small style="color:#888">
            ${activity.timeOfDay || "morning"} &bull;
            ${moodEmoji} ${activity.mood || "neutral"} &bull;
            <span style="color:${energyColor}">${activity.energy || "medium"} energy</span>
          </small>
        </div>
        <span>${activity.minutes} mins</span>
      </div>
    `;
  });
}

// ===== GET EMOJI =====
function getEmoji(category) {
  if (category === "productive")  return "✅";
  if (category === "distracting") return "❌";
  if (category === "neutral")     return "⚪";
  if (category === "mixed")       return "🔄";
}

// ===== GET MOOD EMOJI =====
function getMoodEmoji(mood) {
  if (mood === "happy")     return "😊";
  if (mood === "neutral")   return "😐";
  if (mood === "stressed")  return "😰";
  if (mood === "tired")     return "😴";
  if (mood === "motivated") return "💪";
  return "😐";
}

// ===== CALCULATE SCORE =====
function calculateScore() {
  let productiveMinutes  = 0;
  let distractingMinutes = 0;
  let totalMinutes       = 0;

  activities.forEach(function(activity) {
    totalMinutes += activity.minutes;
    if (activity.category === "productive")  productiveMinutes  += activity.minutes;
    if (activity.category === "distracting") distractingMinutes += activity.minutes;
  });

  let score = 0;
  if (totalMinutes > 0) {
    score = Math.round((productiveMinutes / totalMinutes) * 100);
  }

  document.getElementById("scoreDisplay").textContent = score + "%";
}

// ===== CHART =====
let categoryChart = null;

function updateChart() {
  let productiveMin  = 0;
  let distractingMin = 0;
  let neutralMin     = 0;
  let mixedMin       = 0;

  activities.forEach(function(activity) {
    if (activity.category === "productive")  productiveMin  += activity.minutes;
    if (activity.category === "distracting") distractingMin += activity.minutes;
    if (activity.category === "neutral")     neutralMin     += activity.minutes;
    if (activity.category === "mixed")       mixedMin       += activity.minutes;
  });

  let data = {
    labels: ["Productive", "Distracting", "Neutral", "Mixed"],
    datasets: [{
      label: "Minutes",
      data: [productiveMin, distractingMin, neutralMin, mixedMin],
      backgroundColor: ["#6c63ff", "#ff6b6b", "#888888", "#3ecfcf"],
      borderWidth: 0,
      hoverOffset: 10
    }]
  };

  let config = {
    type: "bar",
    data: data,
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "bottom",
          labels: { color: "#ffffff", padding: 20, font: { size: 13 } }
        }
      }
    }
  };

  if (categoryChart !== null) categoryChart.destroy();
  let ctx = document.getElementById("categoryChart").getContext("2d");
  categoryChart = new Chart(ctx, config);
}

// ===== DAILY INSIGHT , 20 MESSAGES =====
function updateInsight() {
  if (activities.length === 0) return;

  let totalMinutes       = 0;
  let productiveMinutes  = 0;
  let distractingMinutes = 0;
  let mostTimeActivity   = activities[0];

  activities.forEach(function(activity) {
    totalMinutes += activity.minutes;
    if (activity.category === "productive")  productiveMinutes  += activity.minutes;
    if (activity.category === "distracting") distractingMinutes += activity.minutes;
    if (activity.minutes > mostTimeActivity.minutes) mostTimeActivity = activity;
  });

  let score = Math.round((productiveMinutes / totalMinutes) * 100);

  let excellentInsights = [
    `🔥 Exceptional day! ${productiveMinutes} productive minutes logged. You are operating at your absolute peak , this is what champions look like!`,
    `⭐ Outstanding performance! You crushed ${productiveMinutes} minutes of productive work. Days like this build the life you dream of!`,
    `🏆 Elite level day! Your focus was razor sharp with ${productiveMinutes} productive minutes. Screenshot this , future you will thank you!`,
    `💎 You just had a diamond level day! ${productiveMinutes} minutes of pure productivity. This is your new standard , don't go below it!`,
    `🚀 Incredible! ${productiveMinutes} productive minutes today. You didn't just use time , you invested it. That's the mindset of winners!`
  ];

  let goodInsights = [
    `👍 Solid day! ${productiveMinutes} mins of productive work done. Your biggest activity was "${mostTimeActivity.name}". One more push tomorrow!`,
    `💪 Good effort today! ${productiveMinutes} productive minutes logged. You showed up and delivered. Keep building on this momentum!`,
    `✅ Nice work! ${productiveMinutes} mins productive vs ${distractingMinutes} mins distracting. You're on the right side of the balance!`,
    `📈 Positive day! ${productiveMinutes} minutes well spent. Trim just 20 mins of distraction tomorrow and you hit excellence!`,
    `🎯 Good focus today! ${productiveMinutes} productive minutes. Your consistency is building something great , keep the streak alive!`
  ];

  let averageInsights = [
    `⚠️ Average day. You spent ${distractingMinutes} mins on distractions. That's okay , awareness is step one. Tomorrow aim 20 mins better!`,
    `😐 Middle ground today. ${productiveMinutes} productive vs ${distractingMinutes} distracting. You have more in you , show it tomorrow!`,
    `🔄 Balanced but not optimal. ${distractingMinutes} mins went to distractions. Replace just one hour of that with study and watch your score jump!`,
    `💭 Could be stronger. Your productive time was ${productiveMinutes} mins. Set one specific goal for tomorrow and protect that time fiercely!`,
    `⏱️ Time slipped today , ${distractingMinutes} mins on distractions. Tomorrow morning, before touching your phone, do 30 mins of focused work!`
  ];

  let toughInsights = [
    `💡 Tough day , but you tracked it and that takes courage! ${distractingMinutes} mins on distractions. Tomorrow is completely fresh. Start small!`,
    `🌱 Everyone has off days. What matters is you're here tracking and aware. Set one tiny goal for tomorrow , just 30 mins of focused work!`,
    `🔋 Low energy day today. That's human. Rest if you need to , but come back stronger. Your streak and goals are waiting for you!`,
    `😤 Not your best , but not your last! ${distractingMinutes} mins of distraction today. Tomorrow morning write down 3 things you will do. Then do them!`,
    `🌅 Today was hard. Tomorrow is unwritten. You have 24 fresh hours coming , decide right now what ONE thing you will protect time for!`
  ];

  let pool = score >= 80 ? excellentInsights
           : score >= 60 ? goodInsights
           : score >= 40 ? averageInsights
           : toughInsights;

  let lastIndex = parseInt(localStorage.getItem("lastInsightIndex") || "-1");
  let newIndex;
  do {
    newIndex = Math.floor(Math.random() * pool.length);
  } while (newIndex === lastIndex && pool.length > 1);

  localStorage.setItem("lastInsightIndex", newIndex);
  document.getElementById("insightText").textContent = pool[newIndex];
}

// ===== ADD GOAL =====
function addGoal() {
  let name    = document.getElementById("goalName").value;
  let category= document.getElementById("goalCategory").value;
  let minutes = document.getElementById("goalMinutes").value;

  if (name === "" || minutes === "") {
    alert("Please fill in all goal fields!");
    return;
  }

  let goal = {
    name: name,
    category: category,
    targetMinutes: parseInt(minutes)
  };

  goals.push(goal);
  localStorage.setItem("goals", JSON.stringify(goals));

  document.getElementById("goalName").value = "";
  document.getElementById("goalMinutes").value = "";

  checkGoals();
}

// ===== CHECK GOALS =====
function checkGoals() {
  let goalList = document.getElementById("goalList");
  goalList.innerHTML = "";

  if (goals.length === 0) {
    goalList.innerHTML = "<p>No goals set yet.</p>";
    return;
  }

  goals.forEach(function(goal) {
    let actualMinutes = 0;
    activities.forEach(function(activity) {
      if (activity.name.toLowerCase() === goal.name.toLowerCase()) {
        actualMinutes += activity.minutes;
      }
    });

    let achieved, percentage, statusClass, statusEmoji;

    if (goal.category === "distracting") {
      achieved     = actualMinutes <= goal.targetMinutes;
      percentage   = actualMinutes === 0 ? 100
                   : Math.max(Math.round((1 - (actualMinutes - goal.targetMinutes) / goal.targetMinutes) * 100), 0);
      statusClass  = achieved ? "goal-achieved" : "goal-failed";
      statusEmoji  = achieved ? "✅" : "❌";
    } else {
      achieved     = actualMinutes >= goal.targetMinutes;
      percentage   = Math.min(Math.round((actualMinutes / goal.targetMinutes) * 100), 100);
      statusClass  = achieved ? "goal-achieved" : (actualMinutes > 0 ? "goal-failed" : "goal-pending");
      statusEmoji  = achieved ? "✅" : (actualMinutes > 0 ? "❌" : "⏳");
    }

    goalList.innerHTML += `
      <div class="goal-item ${statusClass}">
        <div>
          <strong>${goal.name}</strong>
          <br>
          <small>Target: ${goal.targetMinutes} mins | Done: ${actualMinutes} mins</small>
        </div>
        <div style="text-align:center">
          <div class="goal-status">${statusEmoji}</div>
          <small>${percentage}%</small>
        </div>
      </div>
    `;
  });

  updateMotivation();
}

// ===== MOTIVATION , 20 MESSAGES =====
function updateMotivation() {
  let totalGoals = goals.length;
  if (totalGoals === 0) return;

  let achievedGoals = 0;
  goals.forEach(function(goal) {
    let actualMinutes = 0;
    activities.forEach(function(activity) {
      if (activity.name.toLowerCase() === goal.name.toLowerCase()) {
        actualMinutes += activity.minutes;
      }
    });
    if (actualMinutes >= goal.targetMinutes) achievedGoals++;
  });

  let goalPercentage = Math.round((achievedGoals / totalGoals) * 100);

  let perfectMessages = [
    "🏆 INCREDIBLE! You achieved ALL your goals today! You are unstoppable. Champions are built on days exactly like this one. Keep going!",
    "👑 PERFECT DAY! Every single goal smashed! This is what dedication looks like. You just proved to yourself what you're capable of!",
    "🔥 ALL GOALS DONE! You showed up, you delivered, you won. This is not luck , this is who you are becoming every single day!",
    "💎 FLAWLESS! 100% goal achievement! Most people dream. You execute. Most people wish. You work. Today you were unstoppable!",
    "🚀 MAXIMUM PERFORMANCE! All goals achieved! Write today's date down , this is the standard. Everything below this is unacceptable now!"
  ];

  let greatMessages = [
    `🔥 Amazing effort! You hit ${achievedGoals} out of ${totalGoals} goals. You're so close to a perfect day. One more push tomorrow!`,
    `💪 Strong performance! ${achievedGoals}/${totalGoals} goals done. You're in the top tier. Finish what you started tomorrow!`,
    `⭐ Almost there! ${achievedGoals} goals crushed out of ${totalGoals}. You have the momentum ,don't stop now. Tomorrow finish the job!`,
    `📈 Great progress! ${achievedGoals}/${totalGoals} goals achieved. You're building something real. Stay consistent and watch the magic happen!`,
    `🎯 ${achievedGoals} out of ${totalGoals} goals done! That's called progress. Every goal you hit is a promise kept to yourself!`
  ];

  let goodMessages = [
    `👍 Good progress! ${achievedGoals} goals done. Every step forward counts. Tomorrow aim for one more goal than today!`,
    `💡 Halfway there! ${achievedGoals}/${totalGoals} goals achieved. You started , that already puts you ahead. Build on this!`,
    `🌱 ${achievedGoals} goals done today. Small wins compound into big results. Stay the course and trust the process!`,
    `📊 ${achievedGoals} out of ${totalGoals} goals completed. You're building the habit. Habits take time , you're doing the work!`,
    `✅ ${achievedGoals} goals achieved! Progress is progress no matter the size. Tomorrow is another chance to push further!`
  ];

  let startMessages = [
    "🌱 Today was tough , but you showed up. Set smaller goals tomorrow and build from there. Every expert was once a beginner!",
    "💪 You started , that already puts you ahead of most people. Small wins build big results. Try again tomorrow with ONE clear goal!",
    "🌅 Every champion has bad days. What separates them is they come back. Tomorrow is your comeback day , prepare for it tonight!",
    "🔋 Recharge tonight. Reflect on what got in the way today. Tomorrow remove that one obstacle and watch everything change!",
    "⭐ Zero goals today , but you're still tracking. That awareness is powerful. Tomorrow write your ONE most important goal and protect it!"
  ];

  let pool = goalPercentage === 100 ? perfectMessages
           : goalPercentage >= 75   ? greatMessages
           : goalPercentage >= 50   ? goodMessages
           : startMessages;

  let lastIndex = parseInt(localStorage.getItem("lastMotivationIndex") || "-1");
  let newIndex;
  do {
    newIndex = Math.floor(Math.random() * pool.length);
  } while (newIndex === lastIndex && pool.length > 1);

  localStorage.setItem("lastMotivationIndex", newIndex);
  document.getElementById("motivationText").textContent = pool[newIndex];
}

// ===== CLEAR GOALS =====
function clearGoals() {
  goals = [];
  localStorage.removeItem("goals");
  checkGoals();
}

// ===== CLEAR ACTIVITIES =====
function clearActivities() {
  activities = [];
  localStorage.removeItem("activities");
  displayActivities();
  calculateScore();
  updateChart();
  updateInsight();
  checkGoals();
}

// ===== SMART STREAK SYSTEM =====
function updateStreak() {
  let totalMinutes      = 0;
  let productiveMinutes = 0;

  activities.forEach(function(activity) {
    totalMinutes += activity.minutes;
    if (activity.category === "productive") productiveMinutes += activity.minutes;
  });

  let score = totalMinutes > 0
    ? Math.round((productiveMinutes / totalMinutes) * 100) : 0;

  let streak         = parseInt(localStorage.getItem("streak") || "0");
  let lastDate       = localStorage.getItem("lastStreakDate") || "";
  let today          = new Date().toDateString();
  let daysMissed     = 0;

  if (lastDate !== "" && lastDate !== today) {
    let last = new Date(lastDate);
    let now  = new Date(today);
    daysMissed = Math.floor((now - last) / (1000 * 60 * 60 * 24));
  }

  if (lastDate === today) {
    // Already logged today , just show
  } else if (lastDate === "" || daysMissed === 0) {
    if (score >= 50) {
      streak += 1;
      localStorage.setItem("lastStreakDate", today);
      localStorage.setItem("streak", streak);
    }
  } else if (daysMissed === 1) {
    if (score >= 50) {
      streak += 1;
      localStorage.setItem("lastStreakDate", today);
      localStorage.setItem("streak", streak);
    }
  } else if (daysMissed >= 2) {
    if (streak > 0) localStorage.setItem("brokenStreak", streak);
    streak = score >= 50 ? 1 : 0;
    localStorage.setItem("streak", streak);
    localStorage.setItem("lastStreakDate", today);
  }

  document.getElementById("streakCount").textContent = streak;

  let msg          = "";
  let brokenStreak = parseInt(localStorage.getItem("brokenStreak") || "0");

  if (daysMissed === 1 && streak > 0) {
    msg = `⚠️ Oops! You missed yesterday! Log today to save your ${streak} day streak!`;
  } else if (daysMissed >= 2 && brokenStreak > 0) {
    msg = `💔 Your ${brokenStreak} day streak broke. But every champion falls , what matters is getting back up! Starting fresh!`;
    localStorage.setItem("brokenStreak", "0");
  } else if (streak === 0) {
    msg = "Log today's activities to start your streak!";
  } else if (streak === 1) {
    msg = "🌱 Day 1! Every legend starts somewhere. Come back tomorrow!";
  } else if (streak === 2) {
    msg = "✌️ 2 days strong! You're building something real. Don't stop now!";
  } else if (streak === 3) {
    msg = "🔥 3 day streak! You're forming a habit. This is where magic starts!";
  } else if (streak < 7) {
    msg = `🔥 ${streak} days strong! You're on fire! Keep this energy going!`;
  } else if (streak === 7) {
    msg = "🎉 ONE FULL WEEK STREAK! You are absolutely incredible! 7 days of dedication!";
  } else if (streak < 14) {
    msg = `💪 ${streak} day streak! You're in the zone. Most people quit by now , not you!`;
  } else if (streak === 14) {
    msg = "🏆 TWO WEEK STREAK! You're not just tracking , you're transforming your life!";
  } else if (streak < 30) {
    msg = `⭐ ${streak} days! You're becoming someone who doesn't break promises to themselves!`;
  } else if (streak === 30) {
    msg = "👑 30 DAY STREAK! ONE FULL MONTH! You are an absolute legend! This changes everything!";
  } else if (streak < 100) {
    msg = `🚀 ${streak} day streak! You're in rare territory now. Less than 1% of people reach this!`;
  } else {
    msg = `🐐 ${streak} DAY STREAK! You are the GOAT. Unstoppable. Undeniable. Legendary!`;
  }

  document.getElementById("streakMessage").textContent = msg;
}

// ===== SHOW SAVED STREAK ON PAGE LOAD =====
function showSavedStreak() {
  let streak     = parseInt(localStorage.getItem("streak") || "0");
  let lastDate   = localStorage.getItem("lastStreakDate") || "";
  let today      = new Date().toDateString();
  let daysMissed = 0;

  if (lastDate !== "" && lastDate !== today) {
    let last = new Date(lastDate);
    let now  = new Date(today);
    daysMissed = Math.floor((now - last) / (1000 * 60 * 60 * 24));
  }

  document.getElementById("streakCount").textContent = streak;

  let msg = "";
  if (daysMissed === 1) {
    msg = `⚠️ You missed yesterday! Log today to save your ${streak} day streak!`;
  } else if (daysMissed >= 2 && streak > 0) {
    msg = `💔 Your streak broke after ${streak} days. Start fresh today , you've got this!`;
  } else if (streak === 0) {
    msg = "Log today's activities to start your streak!";
  } else if (streak >= 30) {
    msg = `👑 ${streak} day streak! You are a legend , protect it today!`;
  } else if (streak >= 14) {
    msg = `🏆 ${streak} day streak! You're transforming your life , don't stop!`;
  } else if (streak >= 7) {
    msg = `🎉 ${streak} day streak! One week strong , you're unstoppable!`;
  } else if (streak >= 3) {
    msg = `🔥 ${streak} days strong! You're building an amazing habit!`;
  } else {
    msg = `🌱 ${streak} day streak , keep going! Come back tomorrow!`;
  }

  document.getElementById("streakMessage").textContent = msg;
}

// ===== WEEKLY SUMMARY =====
function updateWeeklySummary() {
  let weekData = JSON.parse(localStorage.getItem("weekData") || "[]");

  let productiveMin  = 0;
  let distractingMin = 0;
  let totalMin       = 0;

  activities.forEach(function(activity) {
    totalMin += activity.minutes;
    if (activity.category === "productive")  productiveMin  += activity.minutes;
    if (activity.category === "distracting") distractingMin += activity.minutes;
  });

  let score = totalMin > 0 ? Math.round((productiveMin / totalMin) * 100) : 0;
  let today = new Date().toLocaleDateString("en-US", { weekday:"short", month:"short", day:"numeric" });

  let existingIndex = weekData.findIndex(d => d.date === today);
  let todayEntry    = { date: today, productive: productiveMin, distracting: distractingMin, score: score };

  if (existingIndex >= 0) weekData[existingIndex] = todayEntry;
  else weekData.push(todayEntry);

  if (weekData.length > 7) weekData = weekData.slice(-7);
  localStorage.setItem("weekData", JSON.stringify(weekData));

  loadWeeklySummary();
}

// ===== LOAD WEEKLY SUMMARY =====
function loadWeeklySummary() {
  let tbody    = document.getElementById("weeklyTableBody");
  let weekData = JSON.parse(localStorage.getItem("weekData") || "[]");

  if (weekData.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:#888;">Log activities to see weekly data</td></tr>`;
    return;
  }

  tbody.innerHTML = "";
  weekData.forEach(function(day) {
    let badge = day.score >= 70
      ? `<span class="badge-good">Good</span>`
      : day.score >= 40
      ? `<span class="badge-ok">Average</span>`
      : `<span class="badge-bad">Poor</span>`;

    tbody.innerHTML += `
      <tr onclick="showDayDetail('${day.date}',${day.productive},${day.distracting},${day.score})"
          style="cursor:pointer">
        <td>${day.date}</td>
        <td style="color:#6c63ff">${day.productive} mins</td>
        <td style="color:#ff6b6b">${day.distracting} mins</td>
        <td style="color:#3ecfcf">${day.score}%</td>
        <td>${badge}</td>
      </tr>
    `;
  });
}

// ===== DAY DETAIL POPUP =====
function showDayDetail(date, productive, distracting, score) {
  let total  = productive + distracting;
  let status = score >= 70 ? "Good day!" : score >= 40 ? "Average day" : "Poor day";
  let emoji  = score >= 70 ? "✅" : score >= 40 ? "⚠️" : "❌";

  alert(
    `📅 ${date}\n\n` +
    `${emoji} Status: ${status}\n` +
    `📊 Score: ${score}%\n\n` +
    `✅ Productive: ${productive} mins\n` +
    `❌ Distracting: ${distracting} mins\n` +
    `⏱️ Total logged: ${total} mins\n\n` +
    `💡 Insight: You spent ${total > 0 ? Math.round((productive/total)*100) : 0}% of your time productively on this day.`
  );
}

// ===== AUTO DAILY RESET =====
function checkDailyReset() {
  let lastActiveDate = localStorage.getItem("lastActiveDate") || "";
  let today = new Date().toDateString();

  if (lastActiveDate !== today && lastActiveDate !== "") {

    // Save today's activities to MONTHLY storage before resetting
    saveToMonthlyData();

    // Now reset daily activities
    activities = [];
    localStorage.removeItem("activities");
    localStorage.setItem("lastActiveDate", today);
    displayActivities();
    calculateScore();
    document.getElementById("scoreDisplay").textContent = "0%";
    document.getElementById("insightText").textContent = "Log activities to see your insight.";
    document.getElementById("activityList").innerHTML = "<p>No activities logged yet.</p>";

  } else {
    localStorage.setItem("lastActiveDate", today);
  }
}

// ===== SAVE TO MONTHLY DATA =====
function saveToMonthlyData() {
  let now = new Date();
  let monthKey = now.toLocaleDateString("en-US", {
    month: "long", year: "numeric"
  });

  // Get existing monthly data
  let monthlyData = JSON.parse(
    localStorage.getItem("monthlyActivities") || "{}"
  );

  // Create month array if first time
  if (!monthlyData[monthKey]) {
    monthlyData[monthKey] = [];
  }

  // Add today's activities to this month
  activities.forEach(function(activity) {
    monthlyData[monthKey].push(activity);
  });

  // Save back
  localStorage.setItem("monthlyActivities",
    JSON.stringify(monthlyData)
  );
}
// ===== MOOD ANALYTICS =====
function updateMoodAnalytics() {
  let moodData    = {};
  let moodMinutes = {};

  activities.forEach(function(activity) {
    let mood = activity.mood || "neutral";
    if (!moodData[mood]) { moodData[mood] = 0; moodMinutes[mood] = 0; }
    moodData[mood]++;
    if (activity.category === "productive") moodMinutes[mood] += activity.minutes;
  });

  let container = document.getElementById("moodAnalytics");
  container.innerHTML = "";

  let moodEmojis = { happy:"😊", neutral:"😐", stressed:"😰", tired:"😴", motivated:"💪" };

  Object.keys(moodData).forEach(function(mood) {
    let count       = moodData[mood];
    let avgProductive = Math.round(moodMinutes[mood] / count);
    container.innerHTML += `
      <div class="activity-item">
        <div>
          <strong>${moodEmojis[mood] || "😐"} ${mood}</strong>
          <br>
          <small style="color:#888">${count} activities in this mood</small>
        </div>
        <div style="text-align:right">
          <div style="color:#6c63ff;font-weight:700">${avgProductive} mins</div>
          <small style="color:#888">avg productive</small>
        </div>
      </div>
    `;
  });

  if (Object.keys(moodData).length === 0) {
    container.innerHTML = "<p>Log activities to see mood analysis.</p>";
  }
}

// ===== PRODUCTIVITY DNA =====
function updateDNA() {
  let dnaSection = document.getElementById("dnaSection");
  let weekData   = JSON.parse(localStorage.getItem("weekData") || "[]");

  if (weekData.length < 3) {
    dnaSection.innerHTML = `
      <p style="color:#888;text-align:center;">
        Use the app for 3+ days to unlock your DNA profile!<br><br>
        <span style="font-size:24px;">🧬</span><br><br>
        <span style="font-size:13px;color:#6c63ff;">${weekData.length}/3 days completed</span>
      </p>`;
    return;
  }

  let timeCount = {};
  activities.forEach(a => {
    let t = a.timeOfDay || "morning";
    timeCount[t] = (timeCount[t] || 0) + (a.category === "productive" ? a.minutes : 0);
  });
  let peakTime = Object.keys(timeCount).sort((a,b) => timeCount[b] - timeCount[a])[0] || "morning";
  let timeEmoji = { morning:"🌅", afternoon:"☀️", evening:"🌆", night:"🌙" };

  let bestDay  = weekData.reduce((a,b) => a.score > b.score ? a : b);
  let worstDay = weekData.reduce((a,b) => a.score < b.score ? a : b);

  let actCount = {};
  activities.forEach(a => { actCount[a.name] = (actCount[a.name] || 0) + a.minutes; });
  let topActivity = Object.keys(actCount).sort((a,b) => actCount[b] - actCount[a])[0] || "Study";

  let distractCount = {};
  activities.forEach(a => {
    if (a.category === "distracting")
      distractCount[a.name] = (distractCount[a.name] || 0) + a.minutes;
  });
  let timeThief = Object.keys(distractCount).sort((a,b) => distractCount[b] - distractCount[a])[0] || "None";

  let moodCount = {};
  activities.forEach(a => {
    let mood = a.mood || "neutral";
    if (a.category === "productive") moodCount[mood] = (moodCount[mood] || 0) + a.minutes;
  });
  let bestMood = Object.keys(moodCount).sort((a,b) => moodCount[b] - moodCount[a])[0] || "motivated";

  let avgScore = Math.round(weekData.reduce((s,d) => s + d.score, 0) / weekData.length);

  let personality, pEmoji, pDesc;
  if (peakTime === "morning" && avgScore >= 70) {
    personality = "Morning Achiever"; pEmoji = "🌅";
    pDesc = `You crush it in the morning! Your best work happens before noon. ${bestDay.date} is your power day. Keep protecting your mornings!`;
  } else if (peakTime === "night" && avgScore >= 70) {
    personality = "Night Owl Hustler"; pEmoji = "🌙";
    pDesc = `You come alive at night! While others sleep you grind. Your energy peaks after 9pm. Own that night shift!`;
  } else if (avgScore >= 80) {
    personality = "Productivity Legend"; pEmoji = "🏆";
    pDesc = `You are consistently excellent! High scores across all times. You have mastered self discipline!`;
  } else if (avgScore >= 60) {
    personality = "Steady Grinder"; pEmoji = "💪";
    pDesc = `Consistent and reliable. You show up every day and get things done. Small improvements daily = massive results!`;
  } else {
    personality = "Rising Star"; pEmoji = "⭐";
    pDesc = `You are still building your habits. Every expert started here. Keep tracking and watch yourself transform!`;
  }

  dnaSection.innerHTML = `
    <div class="dna-personality">
      <div class="p-emoji">${pEmoji}</div>
      <div class="p-type">${personality}</div>
      <div class="p-desc">${pDesc}</div>
    </div>
    <div class="dna-grid">
      <div class="dna-box">
        <div class="dna-label">Peak Time</div>
        <div class="dna-value">${timeEmoji[peakTime] || "🌅"} ${peakTime}</div>
        <div class="dna-desc">Most productive period</div>
      </div>
      <div class="dna-box">
        <div class="dna-label">Power Day</div>
        <div class="dna-value">⚡ ${bestDay.date}</div>
        <div class="dna-desc">${bestDay.score}% , your best score</div>
      </div>
      <div class="dna-box">
        <div class="dna-label">Top Activity</div>
        <div class="dna-value">📚 ${topActivity}</div>
        <div class="dna-desc">${actCount[topActivity] || 0} total minutes</div>
      </div>
      <div class="dna-box">
        <div class="dna-label">Time Thief</div>
        <div class="dna-value">📱 ${timeThief}</div>
        <div class="dna-desc">Steals most of your time</div>
      </div>
      <div class="dna-box">
        <div class="dna-label">Best Mood</div>
        <div class="dna-value">💪 ${bestMood}</div>
        <div class="dna-desc">Most productive when ${bestMood}</div>
      </div>
      <div class="dna-box">
        <div class="dna-label">Avg Score</div>
        <div class="dna-value">📊 ${avgScore}%</div>
        <div class="dna-desc">Weekly average performance</div>
      </div>
    </div>
    <div class="dna-insight">
      <h4>💡 Key Insight</h4>
      <p>If you reduce ${timeThief} by 1 hour daily , you gain 30 hours per month. That's 12 extra study sessions!</p>
    </div>
    <div class="dna-insight" style="border-left-color:#3ecfcf;">
      <h4>🎯 Recommendation</h4>
      <p>Schedule your hardest tasks during ${peakTime} hours. Your data shows this is your peak performance window!</p>
    </div>
    <div class="dna-insight" style="border-left-color:#2ecc71;">
      <h4>⚠️ Watch Out</h4>
      <p>${worstDay.date} is your weakest day at ${worstDay.score}%. Plan something energizing for this day!</p>
    </div>
  `;
}

// ===== EXPORT CSV =====
// ===== EXPORT MONTHLY CSV =====
function exportCSV() {
  let now = new Date();
  let monthKey = now.toLocaleDateString("en-US", {
    month: "long", year: "numeric"
  });

  // Get monthly stored data
  let monthlyData = JSON.parse(
    localStorage.getItem("monthlyActivities") || "{}"
  );

  // Also save today's current activities to monthly
  saveToMonthlyData();

  // Reload after saving
  monthlyData = JSON.parse(
    localStorage.getItem("monthlyActivities") || "{}"
  );

  let thisMonthActivities = monthlyData[monthKey] || [];

  // Also include today's activities that haven't reset yet
  activities.forEach(function(activity) {
    let alreadySaved = thisMonthActivities.some(function(a) {
      return a.date === activity.date && a.name === activity.name;
    });
    if (!alreadySaved) {
      thisMonthActivities.push(activity);
    }
  });

  if (thisMonthActivities.length === 0) {
    alert("No activities this month yet! Log some activities first.");
    return;
  }

  // Build CSV
  let csv = "Date,Day,Activity,Category,Minutes,Mood,TimeOfDay,Energy\n";

  thisMonthActivities.forEach(function(activity) {
    csv += `${activity.date || ""},`;
    csv += `${activity.dayOfWeek || ""},`;
    csv += `${activity.name || ""},`;
    csv += `${activity.category || ""},`;
    csv += `${activity.minutes || 0},`;
    csv += `${activity.mood || "neutral"},`;
    csv += `${activity.timeOfDay || "morning"},`;
    csv += `${activity.energy || "medium"}\n`;
  });

  // Add weekly summary too
  let weekData = JSON.parse(localStorage.getItem("weekData") || "[]");
  if (weekData.length > 0) {
    csv += "\n\nWeekly Summary\n";
    csv += "Date,Productive Minutes,Distracting Minutes,Score\n";
    weekData.forEach(function(day) {
      csv += `${day.date},${day.productive},${day.distracting},${day.score}%\n`;
    });
  }

  // Add monthly summary
  let monthlyStats = JSON.parse(localStorage.getItem("allMonthData") || "{}");
  let thisMonthStats = monthlyStats[monthKey];
  if (thisMonthStats) {
    csv += "\n\nMonthly Summary\n";
    csv += "Month,Avg Score,Best Score,Good Days,Days Logged,Best Streak\n";
    csv += `${monthKey},${thisMonthStats.avgScore}%,${thisMonthStats.bestScore}%,`;
    csv += `${thisMonthStats.goodDays},${thisMonthStats.days},${thisMonthStats.streak}\n`;
  }

  // Download with month name
  let fileName = `productivity_${monthKey.replace(" ", "_")}.csv`;
  let blob = new Blob([csv], { type: "text/csv" });
  let url  = URL.createObjectURL(blob);
  let link = document.createElement("a");
  link.href     = url;
  link.download = fileName;
  link.click();

  alert(`✅ Downloaded! File: ${fileName}\n\nThis contains ALL your activities for ${monthKey}!\n\nTotal activities: ${thisMonthActivities.length}`);
}

// ===== FRIEND CHALLENGE =====
function updateChallengeScore() {
  let weekData = JSON.parse(localStorage.getItem("weekData") || "[]");
  let avgScore = weekData.length > 0
    ? Math.round(weekData.reduce((s,d) => s + d.score, 0) / weekData.length) : 0;

  let streak   = parseInt(localStorage.getItem("streak") || "0");
  let goodDays = weekData.filter(d => d.score >= 70).length;

  document.getElementById("challengeScore").textContent = avgScore + "%";
  document.getElementById("challengeSub").textContent   =
    `${goodDays} good days this week • ${streak} day streak 🔥`;

  localStorage.setItem("myWeeklyScore", avgScore);
}

function shareScore() {
  let score  = localStorage.getItem("myWeeklyScore") || "0";
  let streak = localStorage.getItem("streak") || "0";
  let msg    = `Hey! I scored ${score}% productivity this week! 🔥 I have a ${streak} day streak! Can you beat me?\n\nTry here: https://madhuethiraj13-jpg.github.io/productivity-tracker`;
  window.open("https://wa.me/?text=" + encodeURIComponent(msg));
}

function compareScores() {
  let friendName  = document.getElementById("friendName").value || "Friend";
  let friendScore = parseInt(document.getElementById("friendScore").value) || 0;
  let myScore     = parseInt(localStorage.getItem("myWeeklyScore") || "0");

  let resultDiv   = document.getElementById("compareResult");
  resultDiv.style.display = "block";

  let myClass     = myScore >= friendScore ? "winner" : "loser";
  let friendClass = friendScore > myScore  ? "winner" : "loser";
  let message     = "";

  if (myScore > friendScore) {
    message = `<div style="font-size:20px;font-weight:800;color:#2ecc71;">You Won! 🎉</div>
      <div style="font-size:13px;color:#888;margin-top:8px;">You beat ${friendName} by ${myScore - friendScore}%!</div>`;
  } else if (friendScore > myScore) {
    message = `<div style="font-size:20px;font-weight:800;color:#ff6b6b;">${friendName} Won!</div>
      <div style="font-size:13px;color:#888;margin-top:8px;">You lost by ${friendScore - myScore}%. Use this as fuel!</div>`;
  } else {
    message = `<div style="font-size:20px;font-weight:800;color:#6c63ff;">It's a Tie! 🤝</div>
      <div style="font-size:13px;color:#888;margin-top:8px;">Perfectly matched! Next week , who breaks the tie?</div>`;
  }

  resultDiv.innerHTML = `
    <div style="display:grid;grid-template-columns:1fr auto 1fr;gap:12px;align-items:center;margin-bottom:16px;">
      <div class="vs-player ${myClass}">
        <div class="vp-score">${myScore}%</div>
        <div class="vp-name">You</div>
      </div>
      <div class="vs-label">VS</div>
      <div class="vs-player ${friendClass}">
        <div class="vp-score">${friendScore}%</div>
        <div class="vp-name">${friendName}</div>
      </div>
    </div>
    <div style="background:#0f0f1a;border-radius:12px;padding:16px;text-align:center;">${message}</div>
  `;
}

// ===== MONTHLY COMPARISON =====
function updateMonthlyComparison() {
  let container    = document.getElementById("monthlyComparison");
  if (!container) return;

  let allMonthData = JSON.parse(localStorage.getItem("allMonthData") || "{}");
  let now          = new Date();
  let thisMonth    = now.toLocaleDateString("en-US", { month:"long", year:"numeric" });
  let lastMonthDate= new Date(now.getFullYear(), now.getMonth() - 1, 1);
  let lastMonth    = lastMonthDate.toLocaleDateString("en-US", { month:"long", year:"numeric" });

  let weekData = JSON.parse(localStorage.getItem("weekData") || "[]");
  if (weekData.length > 0) {
    let avgScore      = Math.round(weekData.reduce((s,d) => s + d.score, 0) / weekData.length);
    let bestScore     = Math.max(...weekData.map(d => d.score));
    let goodDays      = weekData.filter(d => d.score >= 70).length;
    let totalProductive = weekData.reduce((s,d) => s + d.productive, 0);
    let streak        = parseInt(localStorage.getItem("streak") || "0");

    allMonthData[thisMonth] = {
      avgScore, bestScore, goodDays, totalProductive, streak, days: weekData.length
    };
    localStorage.setItem("allMonthData", JSON.stringify(allMonthData));
  }

  let thisData = allMonthData[thisMonth];
  let lastData = allMonthData[lastMonth];

  if (!thisData) {
    container.innerHTML = `<p style="color:#888;text-align:center;">
      Keep using the app this month to build your first monthly report!<br><br>
      <span style="font-size:24px;">📆</span></p>`;
    return;
  }

  if (!lastData) {
    container.innerHTML = `
      <div style="background:#0f0f1a;border-radius:14px;padding:16px;border:1px solid #2a2a4a;">
        <h3 style="font-size:13px;color:#6c63ff;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;">
          ${thisMonth}
        </h3>
        ${buildMonthStats(thisData)}
      </div>
      <p style="color:#888;font-size:13px;text-align:center;margin-top:12px;">
        Come back next month to see your improvement comparison!
      </p>`;
    return;
  }

  let diff     = thisData.avgScore - lastData.avgScore;
  let improved = diff > 0;
  let same     = diff === 0;

  let arrowClass = improved ? "improved" : same ? "same" : "declined";
  let arrowText  = improved
    ? `📈 Improved by ${diff}% from last month!`
    : same ? `➡️ Same performance as last month`
    : `📉 Declined by ${Math.abs(diff)}% , time to push harder!`;
  let arrowSub = improved
    ? "You're growing! Keep this momentum going!"
    : same ? "Consistent! Push for improvement next month!"
    : "Every dip is a lesson. Use it to come back stronger!";

  container.innerHTML = `
    <div class="compare-arrow ${arrowClass}" style="text-align:center;padding:16px;border-radius:12px;margin-bottom:16px;">
      <div style="font-size:18px;font-weight:800;color:${improved?'#2ecc71':same?'#6c63ff':'#ff6b6b'}">${arrowText}</div>
      <div style="font-size:13px;color:#888;margin-top:6px;">${arrowSub}</div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
      <div style="background:#0f0f1a;border-radius:14px;padding:16px;border:1px solid #2a2a4a;">
        <h3 style="font-size:12px;color:#888;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;">
          Last , ${lastMonth}
        </h3>
        ${buildMonthStats(lastData)}
      </div>
      <div style="background:#0f0f1a;border-radius:14px;padding:16px;border:1px solid #6c63ff;">
        <h3 style="font-size:12px;color:#6c63ff;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;">
          This , ${thisMonth}
        </h3>
        ${buildMonthStats(thisData)}
      </div>
    </div>
    <div style="margin-top:16px;">
      <div style="margin-bottom:10px;">
        <div style="display:flex;justify-content:space-between;font-size:12px;color:#888;margin-bottom:4px;">
          <span>Avg Score</span><span>${lastData.avgScore}% → ${thisData.avgScore}%</span>
        </div>
        <div style="background:#0f0f1a;border-radius:6px;height:8px;overflow:hidden;">
          <div style="height:100%;width:${thisData.avgScore}%;background:${improved?'#2ecc71':'#ff6b6b'};border-radius:6px;"></div>
        </div>
      </div>
      <div>
        <div style="display:flex;justify-content:space-between;font-size:12px;color:#888;margin-bottom:4px;">
          <span>Good Days</span><span>${lastData.goodDays} → ${thisData.goodDays}</span>
        </div>
        <div style="background:#0f0f1a;border-radius:6px;height:8px;overflow:hidden;">
          <div style="height:100%;width:${Math.min(thisData.goodDays*10,100)}%;background:#6c63ff;border-radius:6px;"></div>
        </div>
      </div>
    </div>
  `;
}

function buildMonthStats(data) {
  return `
    <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #1a1a2e;font-size:13px;">
      <span style="color:#888;">Avg Score</span>
      <span style="font-weight:700;color:#6c63ff;">${data.avgScore}%</span>
    </div>
    <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #1a1a2e;font-size:13px;">
      <span style="color:#888;">Best Day</span>
      <span style="font-weight:700;color:#2ecc71;">${data.bestScore}%</span>
    </div>
    <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #1a1a2e;font-size:13px;">
      <span style="color:#888;">Good Days</span>
      <span style="font-weight:700;">${data.goodDays}</span>
    </div>
    <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #1a1a2e;font-size:13px;">
      <span style="color:#888;">Days Logged</span>
      <span style="font-weight:700;">${data.days}</span>
    </div>
    <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;font-size:13px;">
      <span style="color:#888;">Best Streak</span>
      <span style="font-weight:700;color:#ff9500;">${data.streak} 🔥</span>
    </div>
  `;
}

// ===== HEATMAP CALENDAR =====
function buildHeatmap() {
  let area = document.getElementById("heatmapArea");
  if (!area) return;

  let weekData = JSON.parse(localStorage.getItem("weekData") || "[]");
  let scoreMap = {};
  weekData.forEach(d => { scoreMap[d.date] = d.score; });

  let months      = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  let daysInMonth = [31,28,31,30,31,30,31,31,30,31,30,31];
  let year        = new Date().getFullYear();

  function getColor(score) {
    if (score === undefined) return "#1a1a2e";
    if (score >= 85) return "#6c63ff";
    if (score >= 70) return "#2ecc71";
    if (score >= 50) return "#1a4a2a";
    if (score >= 30) return "#4a3a1a";
    return "#3a1a1a";
  }

  let tip = document.getElementById("heatmapTooltip");
  if (!tip) {
    tip = document.createElement("div");
    tip.id        = "heatmapTooltip";
    tip.className = "heatmap-tooltip";
    document.body.appendChild(tip);
  }

  let monthHTML = `<div style="display:flex;margin-bottom:6px;min-width:600px;">`;
  daysInMonth.forEach((days,m) => {
    let cols = Math.ceil(days / 7);
    monthHTML += `<div style="flex:${cols};font-size:10px;color:#888;">${months[m]}</div>`;
  });
  monthHTML += `</div>`;

  let gridHTML = `<div style="display:grid;grid-template-columns:repeat(53,1fr);gap:3px;min-width:600px;">`;
  for (let m = 0; m < 12; m++) {
    for (let d = 0; d < daysInMonth[m]; d++) {
      let dateStr  = `${d+1} ${months[m]}`;
      let fullDate = new Date(year, m, d+1)
        .toLocaleDateString("en-US", { weekday:"short", month:"short", day:"numeric" });
      let score    = scoreMap[fullDate];
      let color    = getColor(score);
      let scoreText = score !== undefined ? score + "%" : "Not logged";

      gridHTML += `<div class="heatmap-cell" style="background:${color}"
        onmouseenter="showHeatTip(event,'${dateStr}','${scoreText}')"
        onmouseleave="hideHeatTip()"></div>`;
    }
  }
  gridHTML += `</div>`;
  area.innerHTML = monthHTML + gridHTML;

  let totalLogged = weekData.length;
  let avgScore    = totalLogged > 0
    ? Math.round(weekData.reduce((s,d) => s + d.score, 0) / totalLogged) : 0;
  let bestScore   = totalLogged > 0 ? Math.max(...weekData.map(d => d.score)) : 0;
  let goodDays    = weekData.filter(d => d.score >= 70).length;

  document.getElementById("heatmapStats").innerHTML = `
    <div style="background:#0f0f1a;border-radius:10px;padding:12px;text-align:center;border:1px solid #2a2a4a;">
      <div style="font-size:24px;font-weight:800;color:#6c63ff;">${totalLogged}</div>
      <div style="font-size:11px;color:#888;margin-top:4px;">Days Logged</div>
    </div>
    <div style="background:#0f0f1a;border-radius:10px;padding:12px;text-align:center;border:1px solid #2a2a4a;">
      <div style="font-size:24px;font-weight:800;color:#6c63ff;">${avgScore}%</div>
      <div style="font-size:11px;color:#888;margin-top:4px;">Avg Score</div>
    </div>
    <div style="background:#0f0f1a;border-radius:10px;padding:12px;text-align:center;border:1px solid #2a2a4a;">
      <div style="font-size:24px;font-weight:800;color:#6c63ff;">${bestScore}%</div>
      <div style="font-size:11px;color:#888;margin-top:4px;">Personal Best</div>
    </div>
    <div style="background:#0f0f1a;border-radius:10px;padding:12px;text-align:center;border:1px solid #2a2a4a;">
      <div style="font-size:24px;font-weight:800;color:#6c63ff;">${goodDays}</div>
      <div style="font-size:11px;color:#888;margin-top:4px;">Good Days</div>
    </div>
  `;
}

function showHeatTip(e, date, score) {
  let tip = document.getElementById("heatmapTooltip");
  if (!tip) return;
  tip.innerHTML    = `<strong>${date}</strong><br>Score: ${score}`;
  tip.style.display= "block";
  tip.style.left   = (e.clientX + 10) + "px";
  tip.style.top    = (e.clientY - 40) + "px";
}

function hideHeatTip() {
  let tip = document.getElementById("heatmapTooltip");
  if (tip) tip.style.display = "none";
}
// ===== PAGE NAVIGATION =====
function showPage(id, btn) {
  // Hide all pages
  document.querySelectorAll('.page').forEach(function(p) {
    p.classList.remove('active');
  });

  // Remove active from all nav buttons
  document.querySelectorAll('.nav-item').forEach(function(b) {
    b.classList.remove('active');
  });

  // Show selected page
  document.getElementById('page-' + id).classList.add('active');

  // Highlight selected nav button
  btn.classList.add('active');

  // Scroll to top
  window.scrollTo(0, 0);

  // If analytics page opened — refresh all analytics
  if (id === 'analytics') {
    loadWeeklySummary();
    updateMonthlyComparison();
    updateMoodAnalytics();
    updateDNA();
    buildHeatmap();
  }

  // If social page opened — refresh challenge score
  if (id === 'social') {
    updateChallengeScore();
  }
}
