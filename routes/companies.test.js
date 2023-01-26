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

describe("GET /companies", () => {
    test("Get all companies", async () => {
        const resp = await request(app).get("/companies");
        expect(resp.statusCode).toBe(200);
        expect(resp.body).toEqual({
            companies: [
                { code: "apple", description: "Maker of OSX.", name: "Apple Computer" },
                { code: "ibm", description: "Big blue.", name: "IBM" }
            ]
        });
    });
});

describe("GET /companies/:code", () => {
    test("Get company by code:", async () => {
        const resp = await request(app).get("/companies/ibm");
        expect(resp.statusCode).toBe(200);
        expect(resp.body).toEqual({
            company: {
                code: "ibm", description: "Big blue.", name: "IBM", invoices: [4]
            }
        });
    })
    test("Responds with 404 for invalid company code", async () => {
        let resp = await request(app).put("/companies/asdfasd").send({ name: "test" });
        expect(resp.statusCode).toBe(404);
    })
})

describe("POST /companies", () => {
    test("Creating a new company:", async () => {
        const resp = await request(app).post("/companies").send({ name: "Datto", description: "One Stop for MSPs" });
        expect(resp.statusCode).toBe(201);
        expect(resp.body).toEqual({
            company: { code: "datto", description: "One Stop for MSPs", name: "Datto" }
        });
    })
    test("Responds with 400 if 1 or more parameters is missing", async () => {
        const resp = await request(app).post("/companies").send({});
        const resp1 = await request(app).post("/companies").send({ name: "test"});
        const resp2 = await request(app).post("/companies").send({ description: "test"});
        expect(resp.statusCode).toBe(400);
        expect(resp1.statusCode).toBe(400);
        expect(resp2.statusCode).toBe(400);

    })
})

describe("PUT /companies/:code", () => {
    test("Updating a company:", async () => {
        let resp = await request(app).put("/companies/datto").send({ name: "datto1" });
        expect(resp.statusCode).toBe(200);
        expect(resp.body).toEqual({
            company: { code: "datto", description: "One Stop for MSPs", name: "datto1" }
        });
    })
    test("Responds with 404 for invalid company code", async () => {
        let resp = await request(app).put("/companies/asdfasd").send({ name: "test" });
        expect(resp.statusCode).toBe(404);
    })
})

describe("/DELETE /companies/:code", () => {
    test("Deleting a company:", async () => {
        let resp = await request(app).delete("/companies/datto");
        expect(resp.statusCode).toBe(200);
        expect(resp.body).toEqual({ status: "deleted" })
    })
    test("Responds with 404 for deleting invalid company", async () => {
        const resp = await request(app).delete("/companies/test");
        expect(resp.statusCode).toBe(404);
    })
})