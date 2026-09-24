/** A point or displacement in the pillow's frame, in millimetres. */
export type Vec3 = readonly [number, number, number]

export type NightyPart = {
  id: string
  number: string
  name: string
  role: string
  description: string
  /** How far the part travels from its assembled place when fully exploded. */
  offset: Vec3
}

/**
 * Nighty's components from the top of the stack to the bottom. The support
 * core stays put and everything else moves away from it: the soft layers lift,
 * the board and base drop, and the pod slides out of the rear.
 */
export const parts: readonly NightyPart[] = [
  {
    id: 'cover',
    number: '01',
    name: '3D knit cover',
    role: 'Contact surface',
    description: 'A removable spacer-knit cover that zips along the rear edge. The open knit lets air from the channels below escape at the surface, and it comes off for washing.',
    offset: [0, 470, 0],
  },
  {
    id: 'comfort',
    number: '02',
    name: 'Perforated comfort foam',
    role: 'Comfort',
    description: '20 mm of slow-recovery memory foam, perforated on a grid so warmth from the head does not pool in the cradle.',
    offset: [0, 350, 0],
  },
  {
    id: 'gel',
    number: '03',
    name: 'Phase-change cooling layer',
    role: 'Passive cooling',
    description: 'A 6 mm gel sheet that absorbs heat as it melts near skin temperature, taking the edge off the warm first hour after lying down.',
    offset: [0, 265, 0],
  },
  {
    id: 'heater',
    number: '04',
    name: 'Carbon heating film',
    role: 'Active warming',
    description: 'A thin carbon-fibre film under the head zone with four NTC probes. It only runs when the room is cold, and the probes cap its surface temperature.',
    offset: [0, 205, 0],
  },
  {
    id: 'sensor',
    number: '05',
    name: 'Sleep-sensing strip',
    role: 'Sleep tracking',
    description: 'A piezoelectric strip under the neck roll picks up breathing, heartbeat and movement through the foam. Those signals are what the app turns into light and deep sleep.',
    offset: [0, 155, 0],
  },
  {
    id: 'speakers',
    number: '06',
    name: 'Flat speakers ×2',
    role: 'White noise',
    description: 'Two 50 mm flat drivers, one in each shoulder end, so the sound reaches the ear on the pillow without filling the room.',
    offset: [0, 110, 0],
  },
  {
    id: 'core',
    number: '07',
    name: 'Contoured support core',
    role: 'Support',
    description: 'High-density memory foam shaped to the neck roll, head cradle and rear roll. Pockets hold the speakers and the electronics, and three grooves carry air from the fan to the head zone.',
    offset: [0, 0, 0],
  },
  {
    id: 'board',
    number: '08',
    name: 'Main board',
    role: 'Control',
    description: 'The microcontroller, the Bluetooth and Wi-Fi radio, and the heater and fan drivers. It reads every sensor and decides when to warm, cool or play.',
    offset: [0, -110, 170],
  },
  {
    id: 'pod',
    number: '09',
    name: 'Rear control pod',
    role: 'Room sensing, airflow',
    description: 'Sits in the rear panel, outside the foam, so its temperature and humidity sensor reads the room rather than the pillow. It also holds the quiet fan, the button, the status light and the USB-C port.',
    offset: [0, 70, -250],
  },
  {
    id: 'base',
    number: '10',
    name: 'Anti-slip base panel',
    role: 'Grip',
    description: 'A silicone-dotted panel under the core that keeps the pillow from sliding on the sheet and closes the board bay.',
    offset: [0, -190, 0],
  },
]
