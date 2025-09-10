import { ComponentInstance } from "../types";

const POWER_ESTIMATES = {
  LED: 15, // mA
  Button: 0, // No power draw
  WS2812: 60, // mA per LED (worst case)
  Buzzer: 30, // mA when active
  HCSR04: 15, // mA
  MPU6050: 4, // mA
};

export function calculatePowerBudget(components: ComponentInstance[]): {
  totalMa: number;
  level: "OK" | "Caution" | "High";
  percentage: number;
} {
  const USB_POWER_MA = 500; // Typical USB power limit
  
  let totalMa = 0;
  
  components.forEach(component => {
    const basePower = POWER_ESTIMATES[component.kind] || 0;
    
    if (component.kind === "WS2812" && component.params?.count) {
      totalMa += basePower * component.params.count;
    } else {
      totalMa += basePower;
    }
  });
  
  const percentage = (totalMa / USB_POWER_MA) * 100;
  
  let level: "OK" | "Caution" | "High" = "OK";
  if (percentage > 80) level = "High";
  else if (percentage > 50) level = "Caution";
  
  return { totalMa, level, percentage };
}