package main

import (
	"bufio"
	"fmt"
	"strings"
)

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
	return promptUser(sr)
}
