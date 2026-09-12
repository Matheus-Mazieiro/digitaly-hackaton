// Quando o backend Go estiver pronto, substitua os mocks daqui.
// Por ora, apenas reexporta os mocks e devolve Promises para simular latência.

import * as mock from './mock';

const LATENCY = 150;

const wait = (value) =>
  new Promise((res) => setTimeout(() => res(value), LATENCY));

export const api = {
  // auth
  login: (role) => wait({ role }),
  verifyCode: (code) => wait({ ok: true }),

  // doctors
  listDoctors: (specialty, date) =>
    wait(mock.DOCTORS.filter((d) => d.specialty === specialty && d.slots[date])),

  // appointments
  createAppointment: (payload) => wait({ id: Date.now(), ...payload }),
};