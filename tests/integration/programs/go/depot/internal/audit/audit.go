// Package audit logs what the depot does; importing it for its init is enough to switch logging on.
package audit

import "log"

var enabled bool

func init() {
	enabled = true
	log.SetFlags(0)
}

// Log writes a line when auditing is on.
func Log(message string) {
	if enabled {
		log.Println("audit:", message)
	}
}
