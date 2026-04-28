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

function shouldRetryWithAnotherCandidate(response, baseUrl) {
  const isSameOriginCandidate = baseUrl === "";
  const isNotFoundOnStaticServer = response.status === 404;
  const isMethodRejectedOnStaticServer = response.status === 405;

  return (
    isSameOriginCandidate &&
    (isNotFoundOnStaticServer || isMethodRejectedOnStaticServer)
  );
}

async function fetchWithFallback(path, options) {
  const candidates = getApiCandidates();
  let lastError = null;

  for (const baseUrl of candidates) {
    try {
      const response = await fetch(`${baseUrl}${path}`, options);

      if (shouldRetryWithAnotherCandidate(response, baseUrl)) {
        continue;
      }

      return response;
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

function switchTab(tabName) {
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.tab === tabName);
  });

  document.querySelectorAll(".tab-panel").forEach((panel) => {
    panel.classList.remove("active");
  });

  document.getElementById(`tab-${tabName}`).classList.add("active");

  if (tabName === "cards") {
    loadCardStatus();
  }
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

function formatDate(value) {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleString();
}

function toDateTimeLocal(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  const tzOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
}

function renderCardStatusTable(cardsData) {
  const body = document.getElementById("cardStatusBody");

  if (!cardsData || cardsData.length === 0) {
    body.innerHTML = '<tr><td colspan="6" class="empty">No cards found</td></tr>';
    return;
  }

  body.innerHTML = cardsData
    .map(
      (card) => `
      <tr data-id="${card.id}">
        <td>${card.id}</td>
        <td><input data-field="question" value="${escapeHtml(card.question)}" /></td>
        <td><input data-field="answer" value="${escapeHtml(card.answer)}" /></td>
        <td><input data-field="interval_days" type="number" min="1" value="${card.interval_days}" /></td>
        <td><input data-field="next_review" type="datetime-local" value="${toDateTimeLocal(card.next_review)}" /></td>
        <td>
          <div class="row-actions">
            <button class="secondary" onclick="saveCard(${card.id}, this)">Save</button>
            <button class="danger" onclick="deleteCard(${card.id})">Delete</button>
          </div>
        </td>
      </tr>
    `
    )
    .join("");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

async function loadCardStatus() {
  try {
    const res = await fetchWithFallback("/cards");

    if (!res.ok) {
      throw new Error(`Failed to load card status (${res.status})`);
    }

    const allCards = await res.json();
    renderCardStatusTable(allCards);
  } catch (err) {
    console.error(err);

    if (isConnectionError(err)) {
      showApiDownMessage("Load card status");
      return;
    }

    alert("Failed to load card status");
  }
}

async function saveCard(id, button) {
  const row = button.closest("tr");
  const question = row.querySelector('[data-field="question"]').value.trim();
  const answer = row.querySelector('[data-field="answer"]').value.trim();
  const intervalValue = Number(row.querySelector('[data-field="interval_days"]').value);
  const nextReviewValue = row.querySelector('[data-field="next_review"]').value;

  if (!question || !answer || !intervalValue || !nextReviewValue) {
    alert("Question, answer, interval, and next review date are required.");
    return;
  }

  try {
    const res = await fetchWithFallback(`/cards/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question,
        answer,
        interval_days: intervalValue,
        next_review: new Date(nextReviewValue).toISOString()
      })
    });

    if (!res.ok) {
      throw new Error(`Failed to save card (${res.status})`);
    }

    alert(`Card ${id} updated`);
    loadCardStatus();
  } catch (err) {
    console.error(err);

    if (isConnectionError(err)) {
      showApiDownMessage("Save card");
      return;
    }

    alert("Failed to save card");
  }
}

async function deleteCard(id) {
  if (!confirm(`Delete card ${id}?`)) {
    return;
  }

  try {
    const res = await fetchWithFallback(`/cards/${id}`, {
      method: "DELETE"
    });

    if (!res.ok) {
      throw new Error(`Failed to delete card (${res.status})`);
    }

    loadCardStatus();
  } catch (err) {
    console.error(err);

    if (isConnectionError(err)) {
      showApiDownMessage("Delete card");
      return;
    }

    alert("Failed to delete card");
  }
}
