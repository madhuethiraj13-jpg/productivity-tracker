// ===== STORAGE =====
// Load saved data or start empty
let activities = JSON.parse(localStorage.getItem("activities") || "[]");
let goals = JSON.parse(localStorage.getItem("goals") || "[]");

// Show saved data immediately on page load
window.onload = function() {
    // Load activities
    displayActivities();
    calculateScore();
  
    if (activities.length > 0) {
      updateChart();
      updateInsight();
      updateStreak();
    }
  
    checkGoals();
  
    // Always load weekly table from saved data
    loadWeeklySummary();
  
    // Check daily reset
    checkDailyReset();
  };

// ===== ADD ACTIVITY FUNCTION =====
function addActivity() {

  // Step 1: Get values from inputs
  let name = document.getElementById("activityName").value;
  let category = document.getElementById("activityCategory").value;
  let minutes = document.getElementById("activityMinutes").value;

  // Step 2: Check if user filled everything
  if (name === "" || minutes === "") {
    alert("Please fill in all fields!");
    return;
  }

  // Step 3: Create an activity object
  let activity = {
    name: name,
    category: category,
    minutes: parseInt(minutes) // convert text to number
  };

  // Step 4: Add to our list
  activities.push(activity);
  localStorage.setItem("activities", JSON.stringify(activities)); // NEW

  // Step 5: Show it on screen
  displayActivities();

  // Step 6: Calculate new score
  calculateScore();
  // Step 6: Update chart
  updateChart();

  // Step 7: Update insight
  updateInsight();
  checkGoals(); //checks the new goal is added
  updateStreak();
  updateWeeklySummary();

  // Step 8: Clear the inputs
  document.getElementById("activityName").value = "";
  document.getElementById("activityMinutes").value = "";

  // Step 7: Clear the inputs
  document.getElementById("activityName").value = "";
  document.getElementById("activityMinutes").value = "";
}

// ===== DISPLAY ACTIVITIES =====
function displayActivities() {
  let list = document.getElementById("activityList");

  // Clear current list
  list.innerHTML = "";

  // Loop through each activity and show it
  activities.forEach(function(activity) {
    let emoji = getEmoji(activity.category);
    list.innerHTML += `
      <div class="activity-item">
        <span>${emoji} <strong>${activity.name}</strong></span>
        <span>${activity.minutes} mins - ${activity.category}</span>
      </div>
    `;
  });
}

// ===== GET EMOJI FOR CATEGORY =====
function getEmoji(category) {
  if (category === "productive") return "✅";
  if (category === "distracting") return "❌";
  if (category === "neutral") return "⚪";
  if (category === "mixed") return "🔄";
}

// ===== CALCULATE SCORE =====
function calculateScore() {
  let productiveMinutes = 0;
  let distractingMinutes = 0;
  let totalMinutes = 0;

  activities.forEach(function(activity) {
    totalMinutes += activity.minutes;
    if (activity.category === "productive") {
      productiveMinutes += activity.minutes;
    }
    if (activity.category === "distracting") {
      distractingMinutes += activity.minutes;
    }
  });

  // Calculate productivity percentage
  let score = 0;
  if (totalMinutes > 0) {
    score = Math.round((productiveMinutes / totalMinutes) * 100);
  }

  // Show score
  document.getElementById("scoreDisplay").textContent = score + "%";
}
// ===== CHART SETUP =====
let categoryChart = null; // stores our chart

function updateChart() {

  // Count minutes per category
  let productiveMin = 0;
  let distractingMin = 0;
  let neutralMin = 0;
  let mixedMin = 0;

  activities.forEach(function(activity) {
    if (activity.category === "productive")  productiveMin += activity.minutes;
    if (activity.category === "distracting") distractingMin += activity.minutes;
    if (activity.category === "neutral")     neutralMin += activity.minutes;
    if (activity.category === "mixed")       mixedMin += activity.minutes;
  });

  // Chart data
  let data = {
    labels: ["Productive", "Distracting", "Neutral", "Mixed"],
    datasets: [{
      label: "Minutes",
      data: [productiveMin, distractingMin, neutralMin, mixedMin],
      backgroundColor: [
        "#6c63ff",  // purple - productive
        "#ff6b6b",  // red - distracting
        "#888888",  // grey - neutral
        "#3ecfcf"   // teal - mixed
      ],
      borderWidth: 0,
      hoverOffset: 10
    }]
  };

  // Chart settings
  let config = {
    type: "bar",
    data: data,
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            color: "#ffffff",
            padding: 20,
            font: { size: 13 }
          }
        }
      }
    }
  };

  // If chart already exists, destroy it first
  if (categoryChart !== null) {
    categoryChart.destroy();
  }

  // Create new chart
  let ctx = document.getElementById("categoryChart").getContext("2d");
  categoryChart = new Chart(ctx, config);
}

// ===== DAILY INSIGHT =====
function updateInsight() {
  let totalMinutes = 0;
  let productiveMinutes = 0;
  let distractingMinutes = 0;
  let mostTimeActivity = activities[0];

  activities.forEach(function(activity) {
    totalMinutes += activity.minutes;
    if (activity.category === "productive") productiveMinutes += activity.minutes;
    if (activity.category === "distracting") distractingMinutes += activity.minutes;
    if (activity.minutes > mostTimeActivity.minutes) {
      mostTimeActivity = activity;
    }
  });

  let score = Math.round((productiveMinutes / totalMinutes) * 100);
  let insight = "";

  // Generate insight based on score
  if (score >= 80) {
    insight = `🔥 Outstanding day! You were productive for ${productiveMinutes} minutes. You're crushing your goals — keep this energy tomorrow!`;
  } else if (score >= 60) {
    insight = `👍 Good day! ${productiveMinutes} mins of productive work done. Your biggest time activity was "${mostTimeActivity.name}". Push a little harder tomorrow!`;
  } else if (score >= 40) {
    insight = `⚠️ Average day. You spent ${distractingMinutes} mins on distracting activities. Try reducing that by 30 mins tomorrow.`;
  } else {
    insight = `💪 Tough day — but tomorrow is a fresh start! You spent ${distractingMinutes} mins on distractions. Set one small goal for tomorrow and stick to it.`;
  }

  document.getElementById("insightText").textContent = insight;
}
// ===== GOALS STORAGE =====


// ===== ADD GOAL =====
function addGoal() {
  let name = document.getElementById("goalName").value;
  let category = document.getElementById("goalCategory").value;
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
  localStorage.setItem("goals", JSON.stringify(goals)); // NEW

  // Clear inputs
  document.getElementById("goalName").value = "";
  document.getElementById("goalMinutes").value = "";

  // Update display
  checkGoals();
}

// ===== CHECK GOALS AGAINST ACTIVITIES =====
function checkGoals() {
  let goalList = document.getElementById("goalList");
  goalList.innerHTML = "";

  if (goals.length === 0) {
    goalList.innerHTML = "<p>No goals set yet.</p>";
    return;
  }

  goals.forEach(function(goal) {

    // Add up minutes for matching activity name
let actualMinutes = 0;
activities.forEach(function(activity) {
  if (activity.name.toLowerCase() === goal.name.toLowerCase()) {
    actualMinutes += activity.minutes;
  }
});
    // Check if goal achieved
    let achieved = actualMinutes >= goal.targetMinutes;
    let percentage = Math.min(Math.round((actualMinutes / goal.targetMinutes) * 100), 100);
    let statusClass = achieved ? "goal-achieved" : (actualMinutes > 0 ? "goal-failed" : "goal-pending");
    let statusEmoji = achieved ? "✅" : (actualMinutes > 0 ? "❌" : "⏳");

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

  // Update motivation after checking goals
  updateMotivation();
}

// ===== MOTIVATION SYSTEM =====
function updateMotivation() {
  let totalGoals = goals.length;
  if (totalGoals === 0) return;

  let achievedGoals = 0;

  goals.forEach(function(goal) {
    let actualMinutes = 0;
    activities.forEach(function(activity) {
      if (activity.category === goal.category) {
        actualMinutes += activity.minutes;
      }
    });
    if (actualMinutes >= goal.targetMinutes) achievedGoals++;
  });

  let goalPercentage = Math.round((achievedGoals / totalGoals) * 100);
  let message = "";

  if (goalPercentage === 100) {
    message = "🏆 INCREDIBLE! You achieved ALL your goals today! You are unstoppable. Champions are built on days exactly like this one. Keep going!";
  } else if (goalPercentage >= 75) {
    message = "🔥 Amazing effort! You hit " + achievedGoals + " out of " + totalGoals + " goals. You're so close to a perfect day. Push through tomorrow!";
  } else if (goalPercentage >= 50) {
    message = "👍 Good progress! " + achievedGoals + " goals done. Every step forward counts. Tomorrow, aim for one more goal than today!";
  } else if (goalPercentage > 0) {
    message = "💪 You started that already puts you ahead of most people. " + achievedGoals + " goal achieved. Small wins build big results. Try again tomorrow!";
  } else {
    message = "🌱 Today was tough but you showed up. Set smaller goals tomorrow and build from there. Every expert was once a beginner!";
  }

  document.getElementById("motivationText").textContent = message;
}
// ===== CLEAR GOALS =====
function clearGoals() {
    goals = [];
    localStorage.removeItem("goals"); // NEW
    checkGoals();
  }
  // ===== CLEAR ACTIVITIES =====
function clearActivities() {
    activities = [];
    localStorage.removeItem("activities"); // NEW
    displayActivities();
    calculateScore();
    updateChart();
    updateInsight();
    checkGoals();
  }
  // ===== STREAK SYSTEM =====
function updateStreak() {
    let totalMinutes = 0;
    let productiveMinutes = 0;
  
    activities.forEach(function(activity) {
      totalMinutes += activity.minutes;
      if (activity.category === "productive") {
        productiveMinutes += activity.minutes;
      }
    });
  
    let score = totalMinutes > 0 ? Math.round((productiveMinutes / totalMinutes) * 100) : 0;
  
    // Get streak from localStorage
    let streak = parseInt(localStorage.getItem("streak") || "0");
    let lastDate = localStorage.getItem("lastDate") || "";
    let today = new Date().toDateString();
  
    // Update streak if score is good enough
    if (score >= 50 && lastDate !== today) {
      streak += 1;
      localStorage.setItem("streak", streak);
      localStorage.setItem("lastDate", today);
    }
  
    // Show streak
    document.getElementById("streakCount").textContent = streak;
  
    // Streak message
    let msg = "";
    if (streak === 0) msg = "Log today's activities to start your streak!";
    else if (streak < 3) msg = "Good start! Keep going every day!";
    else if (streak < 7) msg = "You're on fire! " + streak + " days strong!";
    else if (streak < 14) msg = "One week+ streak! You're unstoppable!";
    else msg = "LEGEND STATUS! " + streak + " day streak! Incredible!";
  
    document.getElementById("streakMessage").textContent = msg;
  }
  // ===== WEEKLY SUMMARY =====
function updateWeeklySummary() {
    let tbody = document.getElementById("weeklyTableBody");
  
    // Get saved week data
    let weekData = JSON.parse(localStorage.getItem("weekData") || "[]");
  
    // Calculate today's data
    let productiveMin = 0;
    let distractingMin = 0;
    let totalMin = 0;
  
    activities.forEach(function(activity) {
      totalMin += activity.minutes;
      if (activity.category === "productive") productiveMin += activity.minutes;
      if (activity.category === "distracting") distractingMin += activity.minutes;
    });
  
    let score = totalMin > 0 ? Math.round((productiveMin / totalMin) * 100) : 0;
    let today = new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  
    // Update or add today's entry
    let existingIndex = weekData.findIndex(d => d.date === today);
    let todayEntry = { date: today, productive: productiveMin, distracting: distractingMin, score: score };
  
    if (existingIndex >= 0) {
      weekData[existingIndex] = todayEntry;
    } else {
      weekData.push(todayEntry);
    }
  
    // Keep only last 7 days
    if (weekData.length > 7) weekData = weekData.slice(-7);
    localStorage.setItem("weekData", JSON.stringify(weekData));
    // Always reload table after saving
    loadWeeklySummary();
  
    // Build table
    tbody.innerHTML = "";
    weekData.forEach(function(day) {
      let badge = day.score >= 70
        ? `<span class="badge-good">Good</span>`
        : day.score >= 40
        ? `<span class="badge-ok">Average</span>`
        : `<span class="badge-bad">Poor</span>`;
  
        tbody.innerHTML += `
        <tr onclick="showDayDetail('${day.date}', ${day.productive}, ${day.distracting}, ${day.score})" 
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
  // ===== AUTO DAILY RESET =====
function checkDailyReset() {
    let lastActiveDate = localStorage.getItem("lastActiveDate") || "";
    let today = new Date().toDateString();
  
    if (lastActiveDate !== today && lastActiveDate !== "") {
      // New day detected - save yesterday to weekly then reset
      updateWeeklySummary();
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
  
  // Run reset check when page loads
  checkDailyReset();
  // ===== DAY DETAIL POPUP =====
function showDayDetail(date, productive, distracting, score) {
    let neutral = 0;
    let total = productive + distracting + neutral;
    let status = score >= 70 ? "Good day!" : score >= 40 ? "Average day" : "Poor day";
    let emoji = score >= 70 ? "✅" : score >= 40 ? "⚠️" : "❌";
  
    alert(
      `📅 ${date}\n\n` +
      `${emoji} Status: ${status}\n` +
      `📊 Score: ${score}%\n\n` +
      `✅ Productive: ${productive} mins\n` +
      `❌ Distracting: ${distracting} mins\n` +
      `⏱️ Total logged: ${total} mins\n\n` +
      `💡 Insight: You spent ${Math.round((productive/total)*100)}% of your time productively on this day.`
    );
  }
  // ===== LOAD WEEKLY SUMMARY FROM STORAGE =====
function loadWeeklySummary() {
    let tbody = document.getElementById("weeklyTableBody");
    let weekData = JSON.parse(localStorage.getItem("weekData") || "[]");
  
    if (weekData.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align:center; color:#888;">
            Log activities to see weekly data
          </td>
        </tr>`;
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
        <tr onclick="showDayDetail('${day.date}', ${day.productive}, ${day.distracting}, ${day.score})"
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