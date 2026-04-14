CREATE DATABASE anki_clone;
USE anki_clone;

CREATE TABLE cards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    next_review TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    interval_days INT DEFAULT 1
);
