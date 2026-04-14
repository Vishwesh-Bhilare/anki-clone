const API = ""; // same origin

async function addCard() {
  await fetch(API + "/add", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      question: document.getElementById("q").value,
      answer: document.getElementById("a").value
    })
  });

  alert("Added");
}

async function loadReview() {
  let res = await fetch(API + "/review");
  let data = await res.json();

  let div = document.getElementById("review");
  div.innerHTML = "";

  data.forEach(c => {
    let el = document.createElement("div");

    el.innerHTML = `
      <b>${c.question}</b><br>
      <button onclick="showAnswer('${c.answer}', ${c.id}, ${c.interval_days})">Show</button>
    `;

    div.appendChild(el);
  });
}

function showAnswer(ans, id, interval) {
  let correct = confirm(ans + "\n\nDid you get it right?");

  fetch(API + "/answer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, correct, interval })
  });

  loadReview();
}

loadReview();
