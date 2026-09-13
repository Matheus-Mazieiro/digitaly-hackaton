package services

import (
	"context"

	"github.com/matheus-mazieiro/digitaly-hackaton/internal/model/appointment"
	"github.com/matheus-mazieiro/digitaly-hackaton/internal/model/doctor"
	"github.com/matheus-mazieiro/digitaly-hackaton/internal/model/notification"
	"github.com/matheus-mazieiro/digitaly-hackaton/internal/model/patient"
	"github.com/matheus-mazieiro/digitaly-hackaton/internal/repositories"
)

func GetPatients(ctx context.Context, f patient.PatientFilter) ([]patient.Patient, error) {
	return repositories.ListPatients(ctx, f)
}

func GetDoctors(ctx context.Context, f doctor.DoctorFilter) ([]doctor.Doctor, error) {
	return repositories.ListDoctors(ctx, f)
}

func GetAppointments(ctx context.Context, f appointment.AppointmentFilter) ([]appointment.Appointment, error) {
	return repositories.ListAppointments(ctx, f)
}

func GetNotifications(ctx context.Context, f notification.NotificationFilter) ([]notification.Notification, error) {
	return repositories.ListNotifications(ctx, f)
}
