package notification

import "time"

type Notification struct {
	ID   string    `json:"id"`
	Msg  string    `json:"msg"`
	Data time.Time `json:"data"`
	Usr  string    `json:"usr"`
}
