package com.anki.controller;

import com.anki.dao.CardDAO;
import com.anki.model.Card;

import org.springframework.web.bind.annotation.*;

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

    @PostMapping("/answer")
    public void answer(@RequestBody AnswerRequest data) throws Exception {
        dao.updateCard(data.id(), data.correct(), data.interval());
    }

    public record AddCardRequest(String question, String answer) {}

    public record AnswerRequest(int id, boolean correct, int interval) {}
}
