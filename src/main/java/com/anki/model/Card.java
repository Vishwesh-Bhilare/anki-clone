package com.anki.model;

public class Card {
    public int id;
    public String question;
    public String answer;
    public int interval_days;

    public Card(int id, String q, String a, int interval) {
        this.id = id;
        this.question = q;
        this.answer = a;
        this.interval_days = interval;
    }
}
