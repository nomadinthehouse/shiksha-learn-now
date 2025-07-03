export const validateInput = (input: string): boolean => {
  if (!input || typeof input !== 'string') return false;
  if (input.length > 1000) return false; // Limit message length
  if (input.trim().length === 0) return false;
  
  // Check for potentially malicious patterns
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /data:text\/html/i
  ];
  
  return !suspiciousPatterns.some(pattern => pattern.test(input));
};