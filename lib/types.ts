export type Board = {
  id: string;
  name: string;
  fqbn: string;
  voltage: "3.3V" | "5V";
  digitalPins: number;
  analogPins: number;
  imageSrc: string;
  tags: string[];
};

export type Project = {
  id: string;
  name: string;
  description?: string;
  boardId?: string;
  behaviorDsl?: string;
  createdAt: string; // ISO
  components?: ComponentInstance[];
  assignments?: Assignment[];
};

export type ComponentKind = "LED" | "Button" | "WS2812" | "Buzzer" | "HCSR04" | "MPU6050";

export type ComponentInstance = {
  id: string;
  kind: ComponentKind;
  label: string;
  params?: Record<string, any>;
};

export type PinCapability = "DIGITAL" | "ANALOG" | "PWM" | "I2C_SDA" | "I2C_SCL" | "SPI_MISO" | "SPI_MOSI" | "SPI_SCK" | "UART_TX" | "UART_RX";

export type BoardPin = {
  id: string;
  displayName: string;
  caps: PinCapability[];
  bus?: string;
};

export type Assignment = {
  id: string;
  projectId: string;
  componentId: string;
  pinId?: string;
  pins?: Record<string, string>;
};

export type Conflict = {
  level: "error" | "warn";
  message: string;
  componentIds?: string[];
  pinIds?: string[];
};