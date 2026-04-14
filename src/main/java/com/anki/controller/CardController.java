package com.anki.controller;

import com.anki.dao.CardDAO;
import com.anki.model.Card;

import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@CrossOrigin
public class CardController {

    CardDAO dao = new CardDAO();

    @PostMapping("/add")
    public void add(@RequestBody Map<String, String> data) throws Exception {
        dao.addCard(data.get("question"), data.get("answer"));
    }

    @GetMapping("/review")
    public List<Card> review() throws Exception {
        return dao.getDueCards();
    }

    @PostMapping("/answer")
    public void answer(@RequestBody Map<String, String> data) throws Exception {
        int id = Integer.parseInt(data.get("id"));
        boolean correct = Boolean.parseBoolean(data.get("correct"));
        int interval = Integer.parseInt(data.get("interval"));

        dao.updateCard(id, correct, interval);
    }
}