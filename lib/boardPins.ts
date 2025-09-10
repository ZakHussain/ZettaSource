import { BoardPin } from "./types";

export const boardPins: Record<string, BoardPin[]> = {
  "uno": [
    // Digital pins
    { id: "D0", displayName: "D0", caps: ["DIGITAL", "UART_RX"], bus: "UART0" },
    { id: "D1", displayName: "D1", caps: ["DIGITAL", "UART_TX"], bus: "UART0" },
    { id: "D2", displayName: "D2", caps: ["DIGITAL"] },
    { id: "D3", displayName: "D3", caps: ["DIGITAL", "PWM"] },
    { id: "D4", displayName: "D4", caps: ["DIGITAL"] },
    { id: "D5", displayName: "D5", caps: ["DIGITAL", "PWM"] },
    { id: "D6", displayName: "D6", caps: ["DIGITAL", "PWM"] },
    { id: "D7", displayName: "D7", caps: ["DIGITAL"] },
    { id: "D8", displayName: "D8", caps: ["DIGITAL"] },
    { id: "D9", displayName: "D9", caps: ["DIGITAL", "PWM"] },
    { id: "D10", displayName: "D10", caps: ["DIGITAL", "PWM", "SPI_SS"] },
    { id: "D11", displayName: "D11", caps: ["DIGITAL", "PWM", "SPI_MOSI"], bus: "SPI0" },
    { id: "D12", displayName: "D12", caps: ["DIGITAL", "SPI_MISO"], bus: "SPI0" },
    { id: "D13", displayName: "D13", caps: ["DIGITAL", "SPI_SCK"], bus: "SPI0" },
    // Analog pins
    { id: "A0", displayName: "A0", caps: ["ANALOG", "DIGITAL"] },
    { id: "A1", displayName: "A1", caps: ["ANALOG", "DIGITAL"] },
    { id: "A2", displayName: "A2", caps: ["ANALOG", "DIGITAL"] },
    { id: "A3", displayName: "A3", caps: ["ANALOG", "DIGITAL"] },
    { id: "A4", displayName: "A4", caps: ["ANALOG", "DIGITAL", "I2C_SDA"], bus: "I2C0" },
    { id: "A5", displayName: "A5", caps: ["ANALOG", "DIGITAL", "I2C_SCL"], bus: "I2C0" },
  ],
  "nano": [
    // Similar to Uno
    { id: "D0", displayName: "D0", caps: ["DIGITAL", "UART_RX"], bus: "UART0" },
    { id: "D1", displayName: "D1", caps: ["DIGITAL", "UART_TX"], bus: "UART0" },
    { id: "D2", displayName: "D2", caps: ["DIGITAL"] },
    { id: "D3", displayName: "D3", caps: ["DIGITAL", "PWM"] },
    { id: "D4", displayName: "D4", caps: ["DIGITAL"] },
    { id: "D5", displayName: "D5", caps: ["DIGITAL", "PWM"] },
    { id: "D6", displayName: "D6", caps: ["DIGITAL", "PWM"] },
    { id: "D7", displayName: "D7", caps: ["DIGITAL"] },
    { id: "D8", displayName: "D8", caps: ["DIGITAL"] },
    { id: "D9", displayName: "D9", caps: ["DIGITAL", "PWM"] },
    { id: "D10", displayName: "D10", caps: ["DIGITAL", "PWM", "SPI_SS"] },
    { id: "D11", displayName: "D11", caps: ["DIGITAL", "PWM", "SPI_MOSI"], bus: "SPI0" },
    { id: "D12", displayName: "D12", caps: ["DIGITAL", "SPI_MISO"], bus: "SPI0" },
    { id: "D13", displayName: "D13", caps: ["DIGITAL", "SPI_SCK"], bus: "SPI0" },
    { id: "A0", displayName: "A0", caps: ["ANALOG", "DIGITAL"] },
    { id: "A1", displayName: "A1", caps: ["ANALOG", "DIGITAL"] },
    { id: "A2", displayName: "A2", caps: ["ANALOG", "DIGITAL"] },
    { id: "A3", displayName: "A3", caps: ["ANALOG", "DIGITAL"] },
    { id: "A4", displayName: "A4", caps: ["ANALOG", "DIGITAL", "I2C_SDA"], bus: "I2C0" },
    { id: "A5", displayName: "A5", caps: ["ANALOG", "DIGITAL", "I2C_SCL"], bus: "I2C0" },
  ],
  "esp32": [
    // ESP32 DevKit v1 usable pins
    { id: "GPIO1", displayName: "TX", caps: ["DIGITAL", "UART_TX"], bus: "UART0" },
    { id: "GPIO3", displayName: "RX", caps: ["DIGITAL", "UART_RX"], bus: "UART0" },
    { id: "GPIO2", displayName: "D2", caps: ["DIGITAL", "PWM", "ANALOG"] },
    { id: "GPIO4", displayName: "D4", caps: ["DIGITAL", "PWM", "ANALOG"] },
    { id: "GPIO5", displayName: "D5", caps: ["DIGITAL", "PWM"] },
    { id: "GPIO12", displayName: "D12", caps: ["DIGITAL", "PWM", "ANALOG"] },
    { id: "GPIO13", displayName: "D13", caps: ["DIGITAL", "PWM", "ANALOG"] },
    { id: "GPIO14", displayName: "D14", caps: ["DIGITAL", "PWM", "ANALOG"] },
    { id: "GPIO15", displayName: "D15", caps: ["DIGITAL", "PWM", "ANALOG"] },
    { id: "GPIO16", displayName: "D16", caps: ["DIGITAL", "PWM"] },
    { id: "GPIO17", displayName: "D17", caps: ["DIGITAL", "PWM"] },
    { id: "GPIO18", displayName: "D18", caps: ["DIGITAL", "PWM", "SPI_SCK"], bus: "SPI0" },
    { id: "GPIO19", displayName: "D19", caps: ["DIGITAL", "PWM", "SPI_MISO"], bus: "SPI0" },
    { id: "GPIO21", displayName: "D21", caps: ["DIGITAL", "PWM", "I2C_SDA"], bus: "I2C0" },
    { id: "GPIO22", displayName: "D22", caps: ["DIGITAL", "PWM", "I2C_SCL"], bus: "I2C0" },
    { id: "GPIO23", displayName: "D23", caps: ["DIGITAL", "PWM", "SPI_MOSI"], bus: "SPI0" },
    { id: "GPIO25", displayName: "D25", caps: ["DIGITAL", "PWM", "ANALOG"] },
    { id: "GPIO26", displayName: "D26", caps: ["DIGITAL", "PWM", "ANALOG"] },
    { id: "GPIO27", displayName: "D27", caps: ["DIGITAL", "PWM", "ANALOG"] },
    { id: "GPIO32", displayName: "D32", caps: ["DIGITAL", "PWM", "ANALOG"] },
    { id: "GPIO33", displayName: "D33", caps: ["DIGITAL", "PWM", "ANALOG"] },
  ]
};

export function getBoardPins(boardId: string): BoardPin[] {
  return boardPins[boardId] || [];
}