process.env.NODE_ENV = "test";
const db = require("./db");

async function createTestData() {
    await db.query("DELETE FROM invoices");
    await db.query("DELETE FROM companies");
    await db.query("SELECT setval('invoices_id_seq', 1, false)");

    await db.query(`INSERT INTO companies (code, name, description)
                      VALUES ('apple', 'Apple Computer', 'Maker of OSX.'),
                             ('ibm', 'IBM', 'Big blue.')`);

    await db.query(
        `INSERT INTO invoices (comp_Code, amt, paid, paid_date)
          VALUES ('apple', 100, false, null),
                 ('apple', 200, false, null),
                 ('apple', 300, true, '2018-01-01'),
                 ('ibm', 400, false, null);`);
}

module.exports = { createTestData };