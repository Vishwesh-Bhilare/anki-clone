package com.anki.dao;

import com.anki.model.Card;
import com.anki.config.DB;

import java.sql.*;
import java.util.*;

public class CardDAO {

    public void addCard(String q, String a) throws Exception {
        String sql = "INSERT INTO cards(question, answer) VALUES(?, ?)";

        try (Connection con = DB.connect(); PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, q);
            ps.setString(2, a);
            ps.executeUpdate();
        }
    }

    public List<Card> getDueCards() throws Exception {
        List<Card> list = new ArrayList<>();
        String sql = "SELECT * FROM cards WHERE next_review <= NOW()";

        try (Connection con = DB.connect(); PreparedStatement ps = con.prepareStatement(sql)) {
            ResultSet rs = ps.executeQuery();

            while (rs.next()) {
                list.add(new Card(
                        rs.getInt("id"),
                        rs.getString("question"),
                        rs.getString("answer"),
                        rs.getInt("interval_days")
                ));
            }
        }

        return list;
    }

    public void updateCard(int id, boolean correct, int interval) throws Exception {
        int newInterval = correct ? interval * 2 : 1;

        String sql = "UPDATE cards SET interval_days=?, next_review=DATE_ADD(NOW(), INTERVAL ? DAY) WHERE id=?";

        try (Connection con = DB.connect(); PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, newInterval);
            ps.setInt(2, newInterval);
            ps.setInt(3, id);
            ps.executeUpdate();
        }
    }
}