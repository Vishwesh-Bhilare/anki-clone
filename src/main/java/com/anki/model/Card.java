package com.anki.model;

import java.time.Instant;

public class Card {
    public int id;
    public String question;
    public String answer;
    public int interval_days;
    public Instant next_review;

    public Card(int id, String q, String a, int interval, Instant nextReview) {
        this.id = id;
        this.question = q;
        this.answer = a;
        this.interval_days = interval;
        this.next_review = nextReview;
    }
}
