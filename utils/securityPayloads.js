const securityPayloads = {
  xss: "<script>alert('test')</script>",
  sql: "' OR '1'='1",
  specialCharString: 'test@#$%',
  pathTraversal: '../../etc/passwd'
};

module.exports = { securityPayloads };
