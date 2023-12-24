import type { ColorCodes } from './types.js'

export class IO {
  static readonly #colorCodes: ColorCodes = {
    0: '\x1b[30m', // Black
    1: '\x1b[31m', // Red
    2: '\x1b[32m', // Green
    3: '\x1b[33m', // Yellow/Orange
    4: '\x1b[34m', // Blue
    5: '\x1b[35m', // Magenta
    6: '\x1b[36m', // Cyan
    7: '\x1b[37m', // Light Gray
    8: '\x1b[90m', // Dark Gray
    9: '\x1b[91m', // Light Red
    reset: '\x1b[0m' // Reset
  }

  static readonly #backgroundColors: ColorCodes = {
    0: '\x1b[40m', // Black background
    1: '\x1b[41m', // Red background
    2: '\x1b[42m', // Green background
    3: '\x1b[43m', // Yellow/Orange background
    4: '\x1b[44m', // Blue background
    5: '\x1b[45m', // Magenta background
    6: '\x1b[46m', // Cyan background
    7: '\x1b[47m', // Light Gray background
    8: '\x1b[100m', // Dark Gray background
    9: '\x1b[101m', // Light Red background
    reset: '\x1b[0m' // Reset
  }

  /**
    * Parses a message with colors.
    * @param {string} message - The message to parse with colors.
    * @returns {string} The parsed message.
   */
  static parse (message: string): string {
    const colorsRegex = /([0-9]+)~(.*?)~/g
    return message.replace(colorsRegex, (_, color, text) => {
      if (color.length === 2) {
        return `${this.#colorCodes[color[0]]}${this.#backgroundColors[color[1]]}${text}${this.#colorCodes.reset}`
      } else {
        return `${this.#colorCodes[color]}${text}${this.#colorCodes.reset}`
      }
    })
  }

  /**
   * Prints a message to the console with colored text and background.
   * @param {string} message - The message to print with colors.
   * @description
   * Supported color combinations:
   * - The input format is `xy~text~`.
   * - `x` and `y` are digits from 0 to 9.
   * - `x` represents the text color, and `y` represents the background color.
   * - Examples:
   *    - `12~SOME TEXT~` displays "SOME TEXT" in red text on a green background.
   *    - `4~Different Text~` displays "Different Text" in blue text without a background.
   * @summary
   * | Text Color | Background Color | Description         |
   * |------------|------------------|---------------------|
   * | 0          | 0                | Black               |
   * | 1          | 1                | Red                 |
   * | 2          | 2                | Green               |
   * | 3          | 3                | Yellow/Orange       |
   * | 4          | 4                | Blue                |
   * | 5          | 5                | Magenta             |
   * | 6          | 6                | Cyan                |
   * | 7          | 7                | Light Gray          |
   * | 8          | 8                | Dark Gray           |
   * | 9          | 9                | Light Red           |
   * @example
   * ```typescript
   * const logger = new Logger();
   * logger.print('12~SOME TEXT~');
   * ```
   */
  static print (message: string): void {
    console.log(this.parse(message))
  }
}
