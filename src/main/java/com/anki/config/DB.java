package com.anki.config;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;

public class DB {
    private static final String DEFAULT_URL = "jdbc:h2:file:./data/anki_clone;MODE=MySQL;DATABASE_TO_LOWER=TRUE;AUTO_SERVER=TRUE";
    private static final String DEFAULT_USER = "sa";
    private static final String DEFAULT_PASSWORD = "";

    public static Connection connect() throws Exception {
        String url = getEnvOrDefault("DB_URL", DEFAULT_URL);
        String user = getEnvOrDefault("DB_USER", DEFAULT_USER);
        String password = getEnvOrDefault("DB_PASSWORD", DEFAULT_PASSWORD);

        Connection connection = DriverManager.getConnection(url, user, password);
        ensureSchema(connection);
        return connection;
    }

    private static String getEnvOrDefault(String key, String fallback) {
        String value = System.getenv(key);
        return (value == null || value.isBlank()) ? fallback : value;
    }

    private static void ensureSchema(Connection connection) throws Exception {
        String sql = """
            CREATE TABLE IF NOT EXISTS cards (
                id INT AUTO_INCREMENT PRIMARY KEY,
                question TEXT NOT NULL,
                answer TEXT NOT NULL,
                next_review TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                interval_days INT DEFAULT 1
            )
            """;

        try (Statement statement = connection.createStatement()) {
            statement.execute(sql);
        }
    }
}
