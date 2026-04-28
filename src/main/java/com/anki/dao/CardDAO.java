package com.anki.dao;

import com.anki.model.Card;
import com.anki.config.DB;

import java.sql.*;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;

public class CardDAO {

    public void addCard(String q, String a) throws Exception {
        String sql = "INSERT INTO cards(question, answer, next_review, interval_days) VALUES(?, ?, ?, ?)";

        try (Connection con = DB.connect(); PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, q);
            ps.setString(2, a);
            ps.setTimestamp(3, Timestamp.from(Instant.now()));
            ps.setInt(4, 1);
            ps.executeUpdate();
        }
    }

    public List<Card> getDueCards() throws Exception {
        List<Card> list = new ArrayList<>();
        String sql = "SELECT * FROM cards WHERE next_review <= ? ORDER BY next_review ASC";

        try (Connection con = DB.connect(); PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setTimestamp(1, Timestamp.from(Instant.now()));
            ResultSet rs = ps.executeQuery();

            while (rs.next()) {
                list.add(mapCard(rs));
            }
        }

        return list;
    }

    public List<Card> getAllCards() throws Exception {
        List<Card> list = new ArrayList<>();
        String sql = "SELECT * FROM cards ORDER BY next_review ASC, id ASC";

        try (Connection con = DB.connect(); PreparedStatement ps = con.prepareStatement(sql)) {
            ResultSet rs = ps.executeQuery();

            while (rs.next()) {
                list.add(mapCard(rs));
            }
        }

        return list;
    }

    public void updateCard(int id, boolean correct, int interval) throws Exception {
        int newInterval = correct ? interval * 2 : 1;
        Timestamp nextReview = Timestamp.from(Instant.now().plus(newInterval, ChronoUnit.DAYS));

        String sql = "UPDATE cards SET interval_days=?, next_review=? WHERE id=?";

        try (Connection con = DB.connect(); PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, newInterval);
            ps.setTimestamp(2, nextReview);
            ps.setInt(3, id);
            ps.executeUpdate();
        }
    }

    public void editCard(int id, String question, String answer, int intervalDays, Instant nextReview) throws Exception {
        String sql = "UPDATE cards SET question=?, answer=?, interval_days=?, next_review=? WHERE id=?";

        try (Connection con = DB.connect(); PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, question);
            ps.setString(2, answer);
            ps.setInt(3, intervalDays);
            ps.setTimestamp(4, Timestamp.from(nextReview));
            ps.setInt(5, id);
            ps.executeUpdate();
        }
    }

    public void deleteCard(int id) throws Exception {
        String sql = "DELETE FROM cards WHERE id=?";

        try (Connection con = DB.connect(); PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, id);
            ps.executeUpdate();
        }
    }

    private Card mapCard(ResultSet rs) throws SQLException {
        Timestamp nextReview = rs.getTimestamp("next_review");

        return new Card(
                rs.getInt("id"),
                rs.getString("question"),
                rs.getString("answer"),
                rs.getInt("interval_days"),
                nextReview == null ? null : nextReview.toInstant()
        );
    }
}
