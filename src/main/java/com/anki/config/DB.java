package com.anki.config;

import java.io.InputStream;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;
import java.util.Properties;

public class DB {
    private static final String DEFAULT_URL = "jdbc:mysql://localhost:3306/anki_clone?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC";
    private static final String DEFAULT_USER = "root";
    private static final String DEFAULT_PASSWORD = "";
    private static final Properties APP_PROPERTIES = loadApplicationProperties();

    public static Connection connect() throws Exception {
        String url = getConfig("DB_URL", "spring.datasource.url", DEFAULT_URL);
        String user = getConfig("DB_USER", "spring.datasource.username", DEFAULT_USER);
        String password = getConfig("DB_PASSWORD", "spring.datasource.password", DEFAULT_PASSWORD);

        Connection connection = DriverManager.getConnection(url, user, password);
        ensureSchema(connection);
        return connection;
    }

    private static String getConfig(String envKey, String propertyKey, String fallback) {
        String value = System.getenv(envKey);
        if (value == null || value.isBlank()) {
            value = System.getenv(envKey.replace(".", "_").toUpperCase());
        }
        if (value == null || value.isBlank()) {
            value = System.getProperty(propertyKey);
        }
        if (value == null || value.isBlank()) {
            value = APP_PROPERTIES.getProperty(propertyKey);
        }
        return (value == null || value.isBlank()) ? fallback : value;
    }

    private static Properties loadApplicationProperties() {
        Properties properties = new Properties();

        try (InputStream in = DB.class.getClassLoader().getResourceAsStream("application.properties")) {
            if (in != null) {
                properties.load(in);
            }
        } catch (Exception ignored) {
            // Ignore and keep defaults/fallbacks.
        }

        return properties;
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
