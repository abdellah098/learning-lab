package main

import (
	"bufio"
	"fmt"
	"os"
	"strings"
)

func main() {

	fmt.Println("Welcome, Developer! Get inspired with a random quote.")
	sr := bufio.NewScanner(os.Stdin)

	for {
		if !promptUser(sr) {
			fmt.Println("Goodbye, keep coding!.")
			break
		}

		quote := generateRandomQuote()
		fmt.Printf("\n💡 %s\n\n", quote)
	}
}

func promptUser(sr *bufio.Scanner) bool {
	fmt.Println("Would you like an inspirational quote? (yes/no, or 'q' to quit)")
	fmt.Print("> ")

	if !sr.Scan() {
		fmt.Println("Error reading input:", sr.Err())
		return false
	}

	input := strings.ToLower(strings.TrimSpace(sr.Text()))
	if input == "q" || input == "no" || input == "n" {
		return false
	}

	if input == "yes" || input == "y" {
		return true
	}

	fmt.Println("Invalid input. Please enter 'yes', 'no', or 'q'.")
	return promptUser(sr) // Recursively retry on invalid input.
}
