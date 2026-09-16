import { IUser } from '../../models/User';

/**
 * MODULE 1: GREETING ENGINE
 * Evaluates the time of day and the user's history to generate a zero-latency contextual greeting.
 * 
 * @param user The authenticated user object
 * @param hasHistory Boolean indicating if the user has previous conversations
 * @returns Formatted greeting string
 */
export function generateGreeting(user: IUser, hasHistory: boolean): string {
  const currentHour = new Date().getHours();
  let timeGreeting = 'Hello';

  // Time-based resolution
  if (currentHour >= 5 && currentHour < 12) {
    timeGreeting = 'Good Morning ☀️';
  } else if (currentHour >= 12 && currentHour < 17) {
    timeGreeting = 'Good Afternoon 🌤️';
  } else if (currentHour >= 17 && currentHour < 22) {
    timeGreeting = 'Good Evening 🌇';
  } else {
    timeGreeting = 'Hello 👋';
  }

  const name = user.name || 'there';

  // Array of dynamic tips for returning users
  const tips = [
    "Tip: You can ask me to 'Check my pending tasks' or 'Show my holiday calendar'!",
    "Tip: Did you know you can ask me about the IT Support contact?",
    "Tip: I can instantly tell you about the Work From Home (WFH) policy.",
    "Tip: Ask me 'How to apply for leave' if you need a break!",
    "Tip: Need to update your bank details? Just ask me how.",
    "Tip: Wondering about your FnF settlement? I have the answers.",
    "Tip: Having trouble finding a parking slot? Ask me about the parking facility.",
    "Tip: Need a new laptop? Ask me about the IT Equipment policy.",
    "Tip: You can ask me 'What is the WiFi password?' to get connected.",
    "Tip: Did you know you get 5 days of special leave for your wedding?",
    "Tip: You can encash your unused Earned Leaves. Ask me how!"
  ];
  const randomTip = tips[Math.floor(Math.random() * tips.length)];

  // State resolution
  if (!hasHistory) {
    return `${timeGreeting}, ${name}! 👋\n\nWelcome to your **Employee Management Assistant**. I am here to make your work life easier. You can ask me to:\n- 📅 View your holiday calendar & leave policies\n- 📝 Manage your assigned tasks and workloads\n- 💰 Check payroll & expense rules\n- 📞 Find IT or HR emergency contacts\n\nHow can I help you today?`;
  } else {
    return `${timeGreeting}, ${name}! Welcome back.\n\n*${randomTip}*\n\nHow can I assist you today?`;
  }
}
