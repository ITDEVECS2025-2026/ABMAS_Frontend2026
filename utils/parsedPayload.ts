


export default function parsePayload(str: string) {
    const lines = str.split(/\r?\n/);
    const result: Record<string, any> = {};


    lines.forEach((line) => {
        if (!line.includes("=")) return;
        let [key, value] = line.split("=");
        key = key.trim();
        value = value.trim();

        if (value.toLowerCase() === "nan" || value === "") {
            result[key] = null;
        } else {
            const num = parseFloat(value);
            result[key] = isNaN(num) ? value : num;
        }

    })
    console.log('Parsed Payload:', result);
    return result;
}