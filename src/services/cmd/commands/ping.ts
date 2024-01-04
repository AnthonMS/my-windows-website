/**
 * Simulatyes Pinging a URL.
 * @param  {string} url - The URL to ping.
 * @param  {number} timeout - Optional timeout in milliseconds. Defaults to 5000ms.
 * @returns {Promise<number>} A promise that resolves to the ping in milliseconds.
 */
export const pingSimulator = (url: string, timeout: number = 1000): Promise<{ status: string, ping: number }> => {
    return new Promise((resolve, reject) => {
        const ping = Math.floor(Math.random() * timeout)
        setTimeout(() => {
            if (Math.random() < 0.10) { // % chance to timeout
                setTimeout(() => {
                    resolve({ status: 'timeout', ping: timeout })
                }, timeout - ping)
            } else {
                resolve({ status: 'ok', ping })
            }
        }, ping)
    })
}