/**
 * Creates and loads an image element by URL.
 * @param  {string} url - The URL to the image.
 * @returns {Promise<HTMLImageElement>} A promise that resolves to an image element or rejects to an Error.
 */
function requestImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
        img.src = `${url}?random-no-cache=${Math.floor((1 + Math.random()) * 0x10000).toString(16)}`;
    });
}

/**
 * Pings a URL.
 * @param  {string} url - The URL to ping.
 * @param  {number} multiplier - Optional factor to adjust the ping by. 0.3 works well for HTTP servers.
 * @returns {Promise<number>} A promise that resolves to the ping in milliseconds.
 */
export const ping = (url: string, multiplier?: number): Promise<number> => {
    return new Promise((resolve, reject) => {
        const start = new Date().getTime();
        const response = () => {
            const delta = (new Date().getTime() - start) * (multiplier || 1);
            resolve(delta);
        };

        requestImage(url).then(response).catch(response);

        // Set a timeout for max-pings, 5s.
        setTimeout(() => reject(new Error('Timeout')), 5000);
    });
};