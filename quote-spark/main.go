package main

import (
	"bufio"
	"fmt"
	"math/rand/v2"
	"os"
	"strings"
)

// inspirationalQuotes is a constant array of developer quotes.
var inspirationalQuotes = [...]string{
	"Code is like poetry; it’s the art of expressing logic beautifully.",
	"The best error message is the one that never shows up.",
	"Programming is not about typing, it’s about thinking.",
	"Good code is its own best documentation.",
	"The only way to learn a new programming language is by writing programs in it.",
	"Simplicity is the soul of efficiency.",
	"A great developer is not someone who knows every answer, but someone who knows where to find them.",
	"Code like nobody’s watching, but debug like everyone is.",
	"The function of a good software is to make the complex appear simple.",
	"Every great developer you know got there by solving problems they were unqualified to solve.",
	"Programming is the closest thing we have to magic.",
	"Write code that’s easy to delete, not easy to extend.",
	"The best way to predict the future is to code it.",
	"A bug is never just a mistake, it’s an opportunity to learn.",
	"Code is temporary; understanding is forever.",
	"You don’t have to be a genius to code, but you have to be relentless.",
	"The computer is incredibly fast, accurate, and stupid. Humans are slow, inaccurate, and brilliant.",
	"Great software is built by teams, not individuals.",
	"If it works, it’s not stupid.",
	"The art of debugging is figuring out what you really told your program to do.",
	"Code is a conversation between you and the future you.",
	"Don’t write better code, write code that’s better for others to understand.",
	"Every line of code you write is a decision you make.",
	"Programming is the art of doing one thing at a time, perfectly.",
	"The most dangerous phrase in tech is: ‘We’ve always done it this way.’",
	"To understand recursion, you must first understand recursion.",
	"The difference between a good developer and a great one is empathy for the user.",
	"Code is a tool, not a religion.",
	"The best programs are the ones written when the programmer is supposed to be working on something else.",
	"Don’t let perfect be the enemy of done.",
	"Writing code is like solving a puzzle that hasn’t been solved before.",
	"You’re not a coder, you’re a problem solver who uses code.",
	"The joy of coding is turning ideas into reality.",
	"Bad code works until it doesn’t; good code works even when it shouldn’t.",
	"A good developer writes code for humans first, computers second.",
	"The only constant in software development is change.",
	"Programming is not a job, it’s a mindset.",
	"Don’t code harder, code smarter.",
	"Every piece of code is a story waiting to be told.",
	"The best way to get better at coding is to code badly, then improve.",
	"Software is a great combination of artistry and engineering.",
	"When in doubt, refactor it out.",
	"Code is the bridge between human ideas and machine execution.",
	"The most important skill for a developer is the ability to learn.",
	"Great code doesn’t just solve problems, it prevents them.",
	"Programming is the art of telling a computer what to do, and debugging is the art of figuring out why it didn’t.",
	"Write code as if the next developer to read it is a serial killer who knows your address.",
	"The beauty of coding is that there’s always a better way to do it.",
	"A developer’s superpower is turning coffee into code.",
	"Keep coding, keep learning, keep building—because the world needs your ideas.",
}

func main() {

	fmt.Println("Welcome, Developer! Get inspired with a random quote.")
	sr := bufio.NewScanner(os.Stdin)

	for {
		if !promptUser(sr) {
			fmt.Println("Goodbye, keep coding!.")
			break
		}

		quote := getRandomQuote()
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

func getRandomQuote() string {
	return inspirationalQuotes[rand.IntN(len(inspirationalQuotes))]
}
