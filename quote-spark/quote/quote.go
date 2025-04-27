package quote

import (
	"bufio"
	"fmt"
	"log"
	"math/rand/v2"
	"os"
)

const quotesFilePath = "./data/quotes.txt"

var inspirationalQuotes []string

func GenerateRandomQuote() string {
	if len(inspirationalQuotes) == 0 {
		quotes, err := loadQuotes()
		if err != nil {
			log.Fatalf("Could not load quotes: %v", err)
		}
		inspirationalQuotes = quotes
	}

	return getRandomQuote()
}

func loadQuotes() ([]string, error) {
	file, err := os.Open(quotesFilePath)
	if err != nil {
		return nil, fmt.Errorf("an error occurs when reading quotes file: %w", err)
	}

	defer file.Close()

	var quotes []string
	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		quotes = append(quotes, scanner.Text())
	}

	if err := scanner.Err(); err != nil {
		return nil, fmt.Errorf("an error occurs when reading quotes file: %w", err)
	}

	return quotes, nil
}

func getRandomQuote() string {
	return inspirationalQuotes[rand.IntN(len(inspirationalQuotes))]
}
