export const logRequest = (component, action, data = {}) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${component} - ${action}`, data);
};