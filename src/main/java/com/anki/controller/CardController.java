package com.anki.controller;

import com.anki.dao.CardDAO;
import com.anki.model.Card;

import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;

@RestController
@CrossOrigin
public class CardController {

    private final CardDAO dao = new CardDAO();

    @PostMapping("/add")
    public void add(@RequestBody AddCardRequest data) throws Exception {
        dao.addCard(data.question(), data.answer());
    }

    @GetMapping("/review")
    public List<Card> review() throws Exception {
        return dao.getDueCards();
    }

    @GetMapping("/cards")
    public List<Card> cards() throws Exception {
        return dao.getAllCards();
    }

    @PostMapping("/answer")
    public void answer(@RequestBody AnswerRequest data) throws Exception {
        dao.updateCard(data.id(), data.correct(), data.interval());
    }

    @PutMapping("/cards/{id}")
    public void editCard(@PathVariable int id, @RequestBody EditCardRequest data) throws Exception {
        dao.editCard(id, data.question(), data.answer(), data.interval_days(), data.next_review());
    }

    @DeleteMapping("/cards/{id}")
    public void deleteCard(@PathVariable int id) throws Exception {
        dao.deleteCard(id);
    }

    public record AddCardRequest(String question, String answer) {}

    public record AnswerRequest(int id, boolean correct, int interval) {}

    public record EditCardRequest(String question, String answer, int interval_days, Instant next_review) {}
}
