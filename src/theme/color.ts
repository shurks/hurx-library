/**
 * A utility class for color conversions.
 */
export default class Color {
    /**
     * Converts a hexadecimal color value to RGB format.
     * @param hex The hexadecimal color value to convert.
     * @returns An object representing the RGB color values.
     */
    public static hexToRgb = (hex: string): { r: number, g: number, b: number } | null => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null
    }

    /**
     * Changes the RGB/HEX temporarily to a HSL-Value, modifies that value 
     * and changes it back to RGB/HEX.
     * @param rgb The RGB color value to modify.
     * @param degree The degree of hue change.
     * @returns The modified RGB color value.
     */
    public static changeHue = (rgb: string, degree: number): string => {
        const hsl = Color.rgbToHSL(rgb)
        hsl.h += degree
        if (hsl.h > 360) {
            hsl.h -= 360
        }
        else if (hsl.h < 0) {
            hsl.h += 360
        }
        return Color.hslToRGB(hsl)
    }

    /**
     * Converts an RGB color value to HSL format.
     * @param rgb The RGB color value to convert.
     * @returns An object representing the HSL color values.
     */
    public static rgbToHSL = (rgb: string): { h: number, s: number, l: number } => {
        // strip the leading # if it's there
        rgb = rgb.replace(/^\s*#|\s*$/g, '')

        // convert 3 char codes --> 6, e.g. `E0F` --> `EE00FF`
        if (rgb.length == 3) {
            rgb = rgb.replace(/(.)/g, '$1$1')
        }

        const r = parseInt(rgb.substr(0, 2), 16) / 255
        const g = parseInt(rgb.substr(2, 2), 16) / 255
        const b = parseInt(rgb.substr(4, 2), 16) / 255
        const cMax = Math.max(r, g, b)
        const cMin = Math.min(r, g, b)
        const delta = cMax - cMin
        const l = (cMax + cMin) / 2
        let h = 0
        let s = 0

        if (delta == 0) {
            h = 0
        }
        else if (cMax == r) {
            h = 60 * (((g - b) / delta) % 6)
        }
        else if (cMax == g) {
            h = 60 * (((b - r) / delta) + 2)
        }
        else {
            h = 60 * (((r - g) / delta) + 4)
        }

        if (delta == 0) {
            s = 0
        }
        else {
            s = (delta / (1 - Math.abs(2 * l - 1)))
        }

        return { h, s, l }
    }

    /**
     * Converts an HSL color value to RGB format.
     * @param hsl The HSL color value to convert.
     * @returns The RGB color value as a string.
     */
    public static hslToRGB = (hsl: { h: number, s: number, l: number }): string => {
        const { h, s, l } = hsl
        const c = (1 - Math.abs(2 * l - 1)) * s
        const x = c * (1 - Math.abs((h / 60) % 2 - 1))
        const m = l - c / 2
        let r, g, b

        if (h < 60) {
            r = c
            g = x
            b = 0
        }
        else if (h < 120) {
            r = x
            g = c
            b = 0
        }
        else if (h < 180) {
            r = 0
            g = c
            b = x
        }
        else if (h < 240) {
            r = 0
            g = x
            b = c
        }
        else if (h < 300) {
            r = x
            g = 0
            b = c
        }
        else {
            r = c
            g = 0
            b = x
        }

        r = Color.normalizeRgbValue(r, m)
        g = Color.normalizeRgbValue(g, m)
        b = Color.normalizeRgbValue(b, m)

        return Color.rgbToHex(r, g, b)
    }

    /**
     * Normalizes an RGB color value.
     * @param color The color value to normalize.
     * @param m The modifier value.
     * @returns The normalized color value.
     */
    public static normalizeRgbValue = (color: number, m: number): number => {
        color = Math.floor((color + m) * 255)
        if (color < 0) {
            color = 0
        }
        return color
    }

    /**
     * Converts an RGB color value to hexadecimal format.
     * @param r The red color value.
     * @param g The green color value.
     * @param b The blue color value.
     * @returns The hexadecimal color value as a string.
     */
    public static rgbToHex = (r: number, g: number, b: number): string => {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
    }
}