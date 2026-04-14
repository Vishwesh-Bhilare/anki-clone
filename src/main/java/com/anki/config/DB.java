package com.anki.config;

import java.sql.Connection;
import java.sql.DriverManager;

public class DB {
    public static Connection connect() throws Exception {
        return DriverManager.getConnection(
            "jdbc:mysql://localhost:3306/anki_clone",
            "root",
            "password"
        );
    }
}
