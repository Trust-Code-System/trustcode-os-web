// 200 original, local messages. No quote service, tracking or network request.
export const greetingNotes = [
  [
    "Keep tonight's work light if you can.", "The rest can wait until morning.", "One small step is enough for tonight.", "A quiet workspace for a quiet hour.", "Leave a little room for rest.",
    "Save your progress and take a breath.", "There is no rush to finish everything.", "Tomorrow can hold the next chapter.", "A good stopping point counts as progress.", "Keep some energy for the morning.",
    "Make the next step a small one.", "Your notes will still be here tomorrow.", "A little clarity, then a little rest.", "Close the loop gently tonight.", "Give yourself permission to pause.",
    "Let the quiet help you find your place.", "A short checklist is plenty for now.", "Make it easy to pick up tomorrow.", "Small, steady steps still count.", "Finish the thought, then find some rest.",
    "Your workspace is ready when you are.", "Keep the essentials close tonight.", "A calmer ending makes a better beginning.", "Leave tomorrow a clear starting point.", "There is room to slow down.",
  ],
  [
    "Ease into the day, one step at a time.", "A quiet start can be a good start.", "Make a little space before the day begins.", "Start with what matters most to you.", "Give the morning a gentle beginning.",
    "A clear first step is enough.", "Set a pace you can keep.", "Take a breath before your first task.", "Let the day unfold a little.", "A little planning can make room for more.",
    "Start small and find your rhythm.", "Choose one thing to move forward.", "Make this morning easy to return to.", "There is time to find your footing.", "A fresh page is waiting for you.",
    "Keep your first move simple.", "Good things can begin quietly.", "A little focus before the noise.", "Find a comfortable pace for today.", "Keep the beginning kind to yourself.",
    "A glass of water, then a clear next step.", "Begin with a little breathing room.", "Bring some calm into the first hour.", "Make room for the work and yourself.", "A gentle start is still a start.",
  ],
  [
    "A fresh start for the work that matters.", "Make a little room for a good day.", "Your next clear step is waiting.", "Start with one useful conversation.", "A good day can begin with a small win.",
    "Find your focus, then find your flow.", "Keep today's first promise simple.", "A clear workspace makes a softer landing.", "Give the important things a little space.", "Bring a little care to the first detail.",
    "A thoughtful start goes a long way.", "Make today a little easier to navigate.", "There is room for good work today.", "Start where the next step feels clear.", "A little preparation can feel like progress.",
    "Good morning to the work ahead.", "Let clarity set the tone today.", "A small plan can carry a good morning.", "Begin with the thing you can finish.", "Make space for a useful first hour.",
    "Keep the first chapter simple.", "A fresh look can make the next step easier.", "Pick a starting point and settle in.", "A little care makes a strong beginning.", "The day is open. Take it at your pace.",
  ],
  [
    "A little clarity goes a long way.", "Keep the important work in view.", "One clear decision can lighten the day.", "A good moment to bring the team together.", "Make the next handover a little easier.",
    "There is room to move one thing forward.", "A short update can save a long conversation.", "Let the next step be a useful one.", "Keep the details close and the plan clear.", "Small progress is still worth noticing.",
    "A little focus can go a long way.", "Keep your promises and your pace realistic.", "A good question can unlock the next step.", "Bring one loose end back into view.", "Make a little space for thoughtful work.",
    "Clear notes make good company.", "The next useful thing is a good place to start.", "Keep the conversation moving gently.", "A small improvement can help the whole day.", "Make the work easier for the next person.",
    "Good work grows from clear details.", "A calm check-in can change the morning.", "Give your next decision a little attention.", "One thing at a time is a sound plan.", "Find the thread and keep it simple.",
  ],
  [
    "There is room to reset the pace.", "Take a fresh look at what comes next.", "An afternoon can start with a small reset.", "A little breathing room helps good decisions.", "Come back to the work with a clear next step.",
    "Make the rest of the day a little lighter.", "A short pause can be useful work too.", "Find the one thing that needs your attention.", "Keep the next part manageable.", "A good moment to reconnect the details.",
    "There is still space for something useful.", "A little kindness belongs in the plan.", "Settle into the next clear task.", "Make one handover smoother this afternoon.", "A small adjustment can make a big difference.",
    "Let the next hour have a clear purpose.", "A fresh perspective is always welcome.", "Keep some room for the unexpected.", "A thoughtful update can move things along.", "Choose a pace that leaves room to think.",
    "Bring the important things back into focus.", "A little progress can change the afternoon.", "Take the next step with a little care.", "Keep the plan simple and the notes useful.", "The day still has room to unfold.",
  ],
  [
    "Small finishes make a good afternoon.", "A clear handover is a thoughtful finish.", "Bring one loose end to a gentle close.", "Make tomorrow's first step easier.", "Keep the remaining work within reach.",
    "A little reflection can help the next decision.", "There is value in a well-placed pause.", "Finish one thing with a little care.", "A useful note is a good way forward.", "Let the next update be clear and simple.",
    "A small finish is worth a moment of pride.", "Make room for a comfortable stopping point.", "Keep the final stretch realistic.", "A good afternoon leaves something clear.", "Look at what moved forward today.",
    "A little order can lighten the last hour.", "Close a loop before opening another.", "A thoughtful finish helps the whole team.", "Keep the next person's starting point clear.", "Some things can wait for a fresh morning.",
    "Bring the day into a little more focus.", "Make a short plan for what remains.", "A steady pace can carry you home.", "Leave the work in a good place.", "The small details are adding up.",
  ],
  [
    "Make a little space for tomorrow.", "Let the evening have a gentler pace.", "A good moment to gather the loose ends.", "Keep the last few steps simple.", "Leave a clear note for your next visit.",
    "There is room to put the day down.", "A thoughtful finish is enough.", "Take a look at how far things moved.", "Close the day with a little clarity.", "Keep some time for yourself this evening.",
    "A little order makes tomorrow feel lighter.", "Save the thought before you step away.", "Let the next thing wait if it can.", "A calm finish belongs in the plan.", "Keep tonight's checklist comfortably short.",
    "A good handover can be the last task.", "Give yourself a clear place to return.", "One final detail, with a little care.", "A soft landing after a full day.", "Make room for life beyond the workspace.",
    "The work will be here when you return.", "A short recap can be a good ending.", "Notice the things that came together.", "Leave tomorrow a little less tangled.", "Take the evening at your own pace.",
  ],
  [
    "Wrap up gently. Tomorrow has room too.", "Keep a little energy for yourself.", "A clear stopping point is a good result.", "Leave the workspace in a calm place.", "Some good decisions begin with rest.",
    "Let the final task be a small one.", "Make a note, then take a breath.", "Tonight does not need every answer.", "Keep the next visit easy to begin.", "A quiet finish can be a strong finish.",
    "There is room to close the laptop.", "Give the next day a simple starting point.", "Finish the essentials and leave some space.", "A good pause can protect tomorrow's focus.", "Keep the evening kind to your future self.",
    "A little clarity is plenty for tonight.", "Save your place and step away when ready.", "Bring the day to a comfortable close.", "Tomorrow is another chance to move forward.", "Let a small finish be enough.",
    "A short note can hold the thought overnight.", "The next chapter can wait for fresh eyes.", "Keep the important things, release the rest.", "Give yourself some room to switch off.", "A calmer night can make a clearer morning.",
  ],
] as const;

export function greetingFor(date: Date, variation: number) {
  const hour = date.getHours();
  const period = hour < 4 ? 0 : hour < 6 ? 1 : hour < 9 ? 2 : hour < 12 ? 3 : hour < 15 ? 4 : hour < 18 ? 5 : hour < 21 ? 6 : 7;
  const greetings = ["A quiet hour", "You're up early", "Good morning", "Good morning", "Good afternoon", "Good afternoon", "Good evening", "Working late?"];
  return { period, title: greetings[period]!, note: greetingNotes[period]![Math.abs(variation) % 25]! };
}
