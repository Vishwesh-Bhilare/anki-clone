let cards = [];
let currentIndex = 0;
let currentCard = null;

async function addCard() {
  const q = document.getElementById("q").value;
  const a = document.getElementById("a").value;

  if (!q || !a) {
    alert("Enter both question and answer");
    return;
  }

  try {
    const res = await fetch("/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: q, answer: a })
    });

    if (!res.ok) {
      throw new Error(`Failed to add card (${res.status})`);
    }

    document.getElementById("q").value = "";
    document.getElementById("a").value = "";

    alert("Card Added");
  } catch (err) {
    console.error(err);
    alert("Failed to add card");
  }
}

async function startReview() {
  try {
    const res = await fetch("/review");

    if (!res.ok) {
      throw new Error(`Failed to load cards (${res.status})`);
    }

    cards = await res.json();

    if (!cards || cards.length === 0) {
      alert("No cards to review");
      return;
    }

    currentIndex = 0;
    showCard();
  } catch (err) {
    console.error(err);
    alert("Failed to load cards");
  }
}

function showCard() {
  if (!cards[currentIndex]) return;

  currentCard = cards[currentIndex];

  document.getElementById("card").style.display = "block";
  document.getElementById("question").innerText = currentCard.question;

  document.getElementById("answerBox").style.display = "none";
}

function showAnswer() {
  if (!currentCard) return;

  document.getElementById("answerBox").style.display = "block";
  document.getElementById("answer").innerText = currentCard.answer;
}

async function submitAnswer(correct) {
  if (!currentCard) return;

  try {
    const res = await fetch("/answer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: currentCard.id,
        correct: correct,
        interval: currentCard.interval_days
      })
    });

    if (!res.ok) {
      throw new Error(`Failed to submit answer (${res.status})`);
    }

    currentIndex++;

    if (currentIndex >= cards.length) {
      alert("Review complete");
      document.getElementById("card").style.display = "none";
      return;
    }

    showCard();
  } catch (err) {
    console.error(err);
    alert("Failed to submit answer");
  }
}
