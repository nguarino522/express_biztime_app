// make sure to import in test data into postgreSQL test db first with import file data_test.sql

process.env.NODE_ENV = "test";
const request = require("supertest");
const app = require("../app");
const db = require("../db");
const { createTestData } = require('../testDbDataSeed');

beforeAll(createTestData);

afterAll(async function () {
    // close db connection
    await db.end();
});

describe("GET /invoices", () => {
    test("Get all invoices", async () => {
        const resp = await request(app).get("/invoices");
        expect(resp.statusCode).toBe(200);
        expect(resp.body).toEqual({
            invoices: [
                { id: 1, comp_code: "apple" },
                { id: 2, comp_code: "apple" },
                { id: 3, comp_code: "apple" },
                { id: 4, comp_code: "ibm" }
            ]
        });
    });
});

describe("GET /invoices/:id", () => {
    test("Get invoice by id:", async () => {
        const resp = await request(app).get("/invoices/1");
        expect(resp.statusCode).toBe(200);
        expect(resp.body).toEqual({
            invoice: {
                id: 1,
                amt: 100,
                paid: false,
                add_date: "2023-01-25T05:00:00.000Z",
                paid_date: null,
                company: {
                    code: "apple",
                    name: "Apple Computer",
                    description: "Maker of OSX."
                }
            }

        });
    })
    test('Return 404 for no invoice with that id found', async () => {
        const resp = await request(app).get('/invoices/999');
        expect(resp.status).toEqual(404);
    })
})

describe("POST /invoices", () => {
    test("Creating an invoice:", async () => {
        const resp = await request(app).post("/invoices").send({ comp_code: "ibm", amt: 5.22 });
        expect(resp.statusCode).toBe(201);
        expect(resp.body).toEqual({
            invoice: {
                id: 5,
                comp_code: "ibm",
                amt: 5.22,
                paid: false,
                add_date: expect.any(String),
                paid_date: null
            }
        });
    })
    test("Responds with 400 if comp_code or amt is missing", async () => {
        const resp = await request(app).post("/invoices").send({ amt: 5.2 });
        const resp1 = await request(app).post("/invoices").send({ comp_code: "ibm" });
        expect(resp.statusCode).toBe(400);
        expect(resp1.statusCode).toBe(400);
    })
})

describe("PUT /invoices/:id", () => {
    test("Updating an invoice:", async () => {
        let resp = await request(app).put("/invoices/1").send({ amt: 5435, paid: true });
        expect(resp.statusCode).toBe(200);
        expect(resp.body).toEqual({
            invoice: {
                id: 1,
                comp_code: "apple",
                amt: 5435,
                paid: true,
                add_date: "2023-01-25T05:00:00.000Z",
                paid_date: expect.any(String)
            }
        });
    })
    test("Responds with 404 for invalid company code", async () => {
        let resp = await request(app).put("/companies/asdfasd").send({ name: "test" });
        expect(resp.statusCode).toBe(404);
    })
    test("Responds with 400 for missing parameter in body", async () => {
        let resp = await request(app).put("/invoices/1").send({});
        let resp1 = await request(app).put("/invoices/1").send({ amd: 543543 });
        let resp2 = await request(app).put("/invoices/1").send({ paid: true});
        expect(resp.statusCode).toBe(400);
        expect(resp1.statusCode).toBe(400);
        expect(resp2.statusCode).toBe(400);
    })
})

describe("/DELETE /invoices/:id", () => {
    test("Deleting an invoice:", async () => {
        let resp = await request(app).delete("/invoices/1");
        expect(resp.statusCode).toBe(200);
        expect(resp.body).toEqual({ status: "deleted" })
    })
    test("Responds with 404 for deleting invalid invoice", async () => {
        const resp = await request(app).delete("/invoices/543312");
        expect(resp.statusCode).toBe(404);
    })
})