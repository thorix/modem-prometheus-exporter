package main

import (
  "log"
  "net/http"
)

func main() {
  fs := http.FileServer(http.Dir("static/SB6190"))
  http.Handle("/", fs)

  log.Println("Listening...")
  http.ListenAndServe(":4000", nil)
}
