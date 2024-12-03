var express = require('express');
var router = express.Router();

let neo4jResult='';

(async () => {
  var neo4j = require('neo4j-driver')

  // URI examples: 'neo4j://localhost', 'neo4j+s://xxx.databases.neo4j.io'
  const URI = 'bolt://localhost:7687'
  const USER = 'neo4j'
  const PASSWORD = 'lxhneo4j'
  let driver

  try {
    driver = neo4j.driver(URI, neo4j.auth.basic(USER, PASSWORD))
    const serverInfo = await driver.getServerInfo()
    console.log('Connection established')
    console.log(serverInfo)  

    let { records, summary } = await driver.executeQuery(
      'CREATE (p:Person {name: $name})',
       { name: 'Alice' },
       { database: 'neo4j' }
    )
    console.log(
      `Created ${summary.counters.updates().nodesCreated} nodes ` +
      `in ${summary.resultAvailableAfter} ms.`
    )
  } catch(err) {
    console.log(`Connection error\n${err}\nCause: ${err.cause}`)
    await driver.close()
    return
  }



  // Use the driver to run queries

  await driver.close()
})();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

module.exports = router;
