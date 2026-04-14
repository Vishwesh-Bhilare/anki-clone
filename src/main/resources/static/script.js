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
    await fetch("/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: q, answer: a })
    });

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
    let res = await fetch("/review");
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
    await fetch("/answer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: currentCard.id,
        correct: correct,
        interval: currentCard.interval_days
      })
    });

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