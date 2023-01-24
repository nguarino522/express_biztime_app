const express = require('express');
const router = new express.Router();
const db = require("../db");
const ExpressError = require("../expressError")

router.get('/', async (req, res, next) => {
    try {
        const results = await db.query('SELECT * FROM companies');
        return res.json({ companies: results.rows })
    } catch (e) {
        return next(e)
    }
})

router.get('/:code', async (req, res, next) => {
    try {
        const { code } = req.params;
        const companyResults = await db.query('SELECT * FROM companies WHERE code=$1', [code]);
        const companyInvoicesResults = await db.query('SELECT id FROM invoices WHERE comp_code=$1', [code]);
        
        if (companyResults.rows.length === 0) {
            throw new ExpressError(`No company with code of ${code} found.`, 404)
        }
        
        const company = companyResults.rows[0];
        const invoices = companyInvoicesResults.rows;
        company.invoices = invoices.map(inv => inv.id);

        return res.json({ "company": company })
    } catch (e) {
        return next(e)
    }
})

router.post('/', async (req, res, next) => {
    try {
        const { code, name, description } = req.body;
        const results = await db.query('INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code,name,description', [code, name, description]);
        return res.status(201).json({ company: results.rows[0] })
    } catch (e) {
        return next(e)
    }
})

router.put('/:code', async (req, res, next) => {
    try {
        const { code } = req.params;
        let { name, description } = req.body;

        const curComp = await db.query('SELECT * FROM companies WHERE code=$1', [code]);
        if (!name) name = curComp.rows[0].name;
        if (!description) description = curComp.rows[0].description;

        const results = await db.query('UPDATE companies SET name=$1, description=$2 WHERE code=$3 RETURNING code,name,description', [name, description, code])

        if (results.rows.length === 0) {
            throw new ExpressError(`No company with code ${code} found.`, 404);
        }
        return res.json({ company: results.rows[0] });
    } catch (e) {
        return next(e)
    }
})

router.delete('/:code', async (req, res, next) => {
    try {
        const { code } = req.params;
        const results = await db.query('DELETE FROM companies WHERE code = $1 RETURNING code', [code]);
        if (results.rows.length === 0) {
            throw new ExpressError(`No company with code ${code} found.`, 404);
        }
        return res.send({ status: "deleted" })
    } catch (e) {
        return next(e)
    }
})

module.exports = router;