import { Board } from "./types";

export const boards: Board[] = [
  {
    id: "uno",
    name: "Arduino Uno R3",
    fqbn: "arduino:avr:uno",
    voltage: "5V",
    digitalPins: 14,
    analogPins: 6,
    imageSrc: "https://images.pexels.com/photos/163100/circuit-circuit-board-resistor-computer-163100.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
    tags: ["arduino", "avr", "uno"]
  },
  {
    id: "nano",
    name: "Arduino Nano",
    fqbn: "arduino:avr:nano",
    voltage: "5V",
    digitalPins: 14,
    analogPins: 8,
    imageSrc: "https://images.pexels.com/photos/442154/pexels-photo-442154.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
    tags: ["arduino", "avr", "nano"]
  },
  {
    id: "esp32",
    name: "ESP32 DevKit v1",
    fqbn: "esp32:esp32:esp32",
    voltage: "3.3V",
    digitalPins: 34,
    analogPins: 18,
    imageSrc: "https://images.pexels.com/photos/159275/macro-focus-cogwheel-gear-159275.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
    tags: ["esp32", "wifi", "ble"]
  }
];