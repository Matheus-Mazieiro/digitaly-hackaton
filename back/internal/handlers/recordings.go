package handlers

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"time"
)

const uploadsDir = "./uploads"

// POST /api/recordings?apptId=20&role=doctor
// multipart/form-data com campo "audio" (blob .webm)
func UploadRecording(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	apptID := r.URL.Query().Get("apptId")
	role := r.URL.Query().Get("role")
	if apptID == "" {
		http.Error(w, "apptId required", http.StatusBadRequest)
		return
	}

	if err := os.MkdirAll(uploadsDir, 0o755); err != nil {
		http.Error(w, "storage error", http.StatusInternalServerError)
		return
	}

	file, header, err := r.FormFile("audio")
	if err != nil {
		http.Error(w, "audio file required", http.StatusBadRequest)
		return
	}
	defer file.Close()

	// nome: appt-20-doctor-20260913-160000.webm
	ext := filepath.Ext(header.Filename)
	if ext == "" {
		ext = ".webm"
	}
	name := fmt.Sprintf(
		"appt-%s-%s-%s%s",
		apptID, role, time.Now().Format("20060102-150405"), ext,
	)
	dst := filepath.Join(uploadsDir, name)

	out, err := os.Create(dst)
	if err != nil {
		http.Error(w, "storage error", http.StatusInternalServerError)
		return
	}
	defer out.Close()
	if _, err := io.Copy(out, file); err != nil {
		http.Error(w, "write error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	fmt.Fprintf(w, `{"ok":true,"file":"%s"}`, name)
}