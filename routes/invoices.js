const express = require('express');
const router = new express.Router();
const db = require("../db");
const ExpressError = require("../expressError")

router.get('/', async (req, res, next) => {
    try {
        const results = await db.query('SELECT id, comp_code FROM invoices');
        return res.json({ invoices: results.rows })
    } catch (e) {
        return next(e)
    }
})

router.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const results = await db.query(
            `SELECT i.id, i.comp_code, i.amt, i.paid, i.add_date, i.paid_date, c.name, c.description
             FROM invoices AS i
             INNER JOIN companies AS c ON (i.comp_code = c.code)  
             WHERE id = $1`,
            [id]);

        if (results.rows.length === 0) {
            throw new ExpressError(`No invoice with id of ${id} found.`, 404)
        }

        const data = results.rows[0];
        const invoice = {
            id: data.id,
            amt: data.amt,
            paid: data.paid,
            add_date: data.add_date,
            paid_date: data.paid_date,
            company: {
                code: data.comp_code,
                name: data.name,
                description: data.description,
            }
        };

        return res.json({ invoice: invoice });
    } catch (e) {
        return next(e)
    }
})

router.post('/', async (req, res, next) => {
    try {
        if (!req.body.comp_code) throw new ExpressError("Name is required.", 400);
        if (!req.body.amt) throw new ExpressError("Description is required.", 400);
        const { comp_code, amt } = req.body;
        const results = await db.query('INSERT INTO invoices (comp_code,amt) VALUES ($1,$2) RETURNING id, comp_code, amt, paid, add_date, paid_date', [comp_code, amt]);

        return res.status(201).json({ invoice: results.rows[0] })
    } catch (e) {
        return next(e)
    }
})

router.put('/:id', async (req, res, next) => {
    try {
        if (!req.body.amt) throw new ExpressError("amt is required.", 400);
        if (!req.body.paid) throw new ExpressError("paid is required.", 400);

        const { id } = req.params;
        const { amt, paid } = req.body;
        let paidDate = null;

        const currResult = await db.query("SELECT paid FROM invoices WHERE id = $1", [id]);

        if (currResult.rows.length === 0) {
            throw new ExpressError(`No such invoice: ${id}`, 404);
        }

        const currPaidDate = currResult.rows[0].paid_date;

        if (!currPaidDate && paid) {
            paidDate = new Date();
        } else if (!paid) {
            paidDate = null
        } else {
            paidDate = currPaidDate;
        }

        const results = await db.query(
            `UPDATE invoices SET amt=$1, paid=$2, paid_date=$3 
             WHERE id=$4 RETURNING id,comp_code,amt,paid,add_date,paid_date`, [amt, paid, paidDate, id]);

        return res.json({ invoice: results.rows[0] });
    } catch (e) {
        return next(e)
    }
})

router.delete('/:id', async (req, res, next) => {
    try {
        const { id } = req.params
        const results = await db.query('DELETE FROM invoices WHERE id=$1 RETURNING id', [id]);
        if (results.rows.length === 0) {
            throw new ExpressError(`No invoice with id ${id} found.`, 404);
        }
        return res.json({ status: "deleted" })
    } catch (e) {
        return next(e)
    }
})

module.exports = router;