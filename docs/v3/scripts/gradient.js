document.getElementById("perLine").addEventListener('change', update);
document.getElementById("fromColor").addEventListener('change', update);
document.getElementById("toColor").addEventListener('change', update);
document.getElementById("type").addEventListener('change', update);


update();
function update() {
    updateWithInput(document.getElementById("input").value);
}
function updateWithInput(input){
    const lines = input.split(/(?:\r\n|\r|\n)/g);

    let previewText = "";
    let outputText = "";

    const isRgb = document.getElementById("type").value === "rgb";
    const fromColorC = convertFromHex(isRgb, document.getElementById("fromColor").value );
    const toColorC = convertFromHex(isRgb, document.getElementById("toColor").value );

    const perLine = document.getElementById("perLine").checked;
    let maxLength = 0;

    if (!perLine) {
        for (const line of lines)
            if (line.length > maxLength)
                maxLength = line.length;
    }


    for (const line of lines) {
        let len = (perLine ? line.length : maxLength) -1;
        len = len < 0 ? 0 : len;

        let alpha = 0.0;
        for (let i = 0; i < line.length; i++) {
            let c = [];
            c[0] = toColorC[0] * alpha + (1 - alpha) * fromColorC[0];
            c[1] = toColorC[1] * alpha + (1 - alpha) * fromColorC[1];
            c[2] = toColorC[2] * alpha + (1 - alpha) * fromColorC[2];

            alpha += 1/len;

            const hex = convertToHex(isRgb, c);
            outputText += "&{" + hex + "}" + line[i];
            previewText += "<span style='color: #" + hex + "'>" + line[i] + "</span>"
        }
        outputText += "\n";
        previewText += "<br>";
    }


    document.getElementById("output").innerHTML = outputText;
    document.getElementById("preview").innerHTML = previewText;
}

function convertFromHex(isRgb, hex) {
    return isRgb ? convertToRGB(hex) : convertToHSL(hex);
}

function convertToRGB (hex) {
    var color = [];
    color[0] = parseInt (hex.substring (1, 3), 16);
    color[1] = parseInt (hex.substring (3, 5), 16);
    color[2] = parseInt (hex.substring (5, 7), 16);
    return color;
}

function convertToHSL (hex) {
    let r = parseInt (hex.substring (1, 3), 16) / 255.0,
        g = parseInt (hex.substring (3, 5), 16) / 255.0,
        b = parseInt (hex.substring (5, 7), 16) / 255.0,
        cmin = Math.min(r,g,b),
        cmax = Math.max(r,g,b),
        delta = cmax - cmin,
        l = (cmax + cmin) / 2,
        s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1)),
        h = 0;

    if (delta === 0) h = 0;
    else switch (cmax) {
        case 0: h = 0; break;
        case r: h = ((g-b)/delta) % 6; break;
        case g: h = ((b-r)/delta) + 2; break;
        case b: h = ((r-g)/delta) + 4; break;
    }
    h = Math.round(h * 60);
    if (h < 0) h += 360;

    return [h,s,l];
}

function convertToHex (isRgb, color) {
    return isRgb ? convertRGBToHex(color) : convertHSLToHex(color);
}

function convertRGBToHex (rgb) {
    return hex(rgb[0]) + hex(rgb[1]) + hex(rgb[2]);
}

function hex (c) {
    const s = "0123456789abcdef";
    let i = parseInt(c);
    if (i === 0 || isNaN (c))
        return "00";
    i = Math.round (Math.min (Math.max (0, i), 255));
    return s.charAt ((i - i % 16) / 16) + s.charAt (i % 16);
}
function convertHSLToHex (hsl) {
    let h = hsl[0],
        s = hsl[1],
        l = hsl[2],
        c = (1 - Math.abs(2 * l - 1)) * s,
        x = c * (1 - Math.abs((h / 60) % 2 - 1)),
        m = l - c/2,
        r = 0, g = 0, b = 0;

    if (  0 <= h && h <  60) { r = c; g = x; b = 0; }
    else if ( 60 <= h && h < 120) { r = x; g = c; b = 0; }
    else if (120 <= h && h < 180) { r = 0; g = c; b = x; }
    else if (180 <= h && h < 240) { r = 0; g = x; b = c; }
    else if (240 <= h && h < 300) { r = x; g = 0; b = c; }
    else if (300 <= h && h < 360) { r = c; g = 0; b = x; }
    r = Math.round((r+m) * 255);
    g = Math.round((g+m) * 255);
    b = Math.round((b+m) * 255);

    return hex(r) + hex(g) + hex(b);
}