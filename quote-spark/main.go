package main

import (
	"bufio"
	"fmt"
	"os"
	"quote-spark/helper"
	quoteGenarator "quote-spark/quote"
)

func main() {

	fmt.Println("Welcome, Developer! Get inspired with a random quote.")
	sr := bufio.NewScanner(os.Stdin)

	for {
		if !helper.PromptUser(sr) {
			fmt.Println("Goodbye, keep coding!.")
			break
		}

		quote := quoteGenarator.GenerateRandomQuote()
		fmt.Printf("\n💡 %s\n\n", quote)
	}
}
