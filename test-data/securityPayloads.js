// @ts-check

// Security payloads mirrored from the API-side Cypress suite (instanceAdd.cy.js),
// reusable by any spec that needs injection/special-character inputs.
// These are intentionally fixed literal attack strings — randomizing them would
// defeat their purpose. Tests that create rows combine them with a random suffix
// (see test-data/instances.js) so titles stay unique per run.
export const securityPayloads = {
  xss: '<script>alert("xss")</script>',
  htmlInjection: '<img src=x onerror=alert(1)>',
  sqlInjection: "'; DROP TABLE site_instances; --",
  specialCharString: '!@#$%^&*()_+-=[]{}|;:\'",.<>?',
  pathTraversal: '../../../etc/passwd',
};
