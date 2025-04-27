package main

import (
	"bufio"
	"fmt"
	"os"
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
