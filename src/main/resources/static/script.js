let cards = [];
let currentIndex = 0;
let currentCard = null;

const DEV_SERVER_PORT = "8080";

function getApiCandidates() {
  const sameOrigin = "";

  const isLocalHost =
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname === "localhost";

  if (!isLocalHost) {
    return [sameOrigin];
  }

  const hostBasedApi = `${window.location.protocol}//${window.location.hostname}:${DEV_SERVER_PORT}`;
  const localhostApi = `${window.location.protocol}//localhost:${DEV_SERVER_PORT}`;
  const loopbackApi = `${window.location.protocol}//127.0.0.1:${DEV_SERVER_PORT}`;

  return [...new Set([sameOrigin, hostBasedApi, localhostApi, loopbackApi])];
}

function isConnectionError(err) {
  return err instanceof TypeError;
}

async function fetchWithFallback(path, options) {
  const candidates = getApiCandidates();
  let lastError = null;

  for (const baseUrl of candidates) {
    try {
      return await fetch(`${baseUrl}${path}`, options);
    } catch (err) {
      lastError = err;

      if (!isConnectionError(err)) {
        throw err;
      }
    }
  }

  throw lastError ?? new Error("Unable to reach API");
}

function showApiDownMessage(action) {
  alert(
    `${action} failed because the backend API is not reachable. Start the Spring app on port 8080 and try again.`
  );
}

async function addCard() {
  const q = document.getElementById("q").value;
  const a = document.getElementById("a").value;

  if (!q || !a) {
    alert("Enter both question and answer");
    return;
  }

  try {
    const res = await fetchWithFallback("/add", {
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

    if (isConnectionError(err)) {
      showApiDownMessage("Add card");
      return;
    }

    alert("Failed to add card");
  }
}

async function startReview() {
  try {
    const res = await fetchWithFallback("/review");

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

    if (isConnectionError(err)) {
      showApiDownMessage("Load cards");
      return;
    }

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
    const res = await fetchWithFallback("/answer", {
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

    if (isConnectionError(err)) {
      showApiDownMessage("Submit answer");
      return;
    }

    alert("Failed to submit answer");
  }
}
