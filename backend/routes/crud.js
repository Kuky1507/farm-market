// Generic CRUD router. One factory builds the same five endpoints for every
// collection:
//   GET    /          list (supports ?q=text search, ?crop=, ?status=, ?district= etc.)
//   GET    /:id       read one
//   POST   /          create   (auto-generates an id like F006 when none is sent)
//   PUT    /:id       update   (full or partial; unknown fields are kept thanks to strict:false)
//   DELETE /:id       delete
const express = require('express');

async function nextId(Model, prefix) {
  const last = await Model.findOne({ _id: new RegExp(`^${prefix}\\d+$`) })
    .sort({ _id: -1 })
    .lean();
  const n = last ? parseInt(last._id.slice(prefix.length), 10) + 1 : 1;
  return `${prefix}${String(n).padStart(3, '0')}`;
}

function crudRouter(Model, { prefix, searchFields = [], filterFields = [], sort = { _id: 1 } }) {
  const router = express.Router();

  router.get('/', async (req, res, next) => {
    try {
      const filter = {};
      if (req.query.q && searchFields.length) {
        const rx = new RegExp(req.query.q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
        filter.$or = searchFields.map((f) => ({ [f]: rx }));
      }
      for (const f of filterFields) {
        if (req.query[f] !== undefined && req.query[f] !== '') filter[f] = req.query[f];
      }
      const docs = await Model.find(filter).sort(sort).lean();
      res.json(docs);
    } catch (e) {
      next(e);
    }
  });

  router.get('/:id', async (req, res, next) => {
    try {
      const doc = await Model.findById(req.params.id).lean();
      if (!doc) return res.status(404).json({ error: `${Model.modelName} ${req.params.id} not found` });
      res.json(doc);
    } catch (e) {
      next(e);
    }
  });

  router.post('/', async (req, res, next) => {
    try {
      const body = { ...req.body };
      if (!body._id) body._id = await nextId(Model, prefix);
      const doc = await Model.create(body);
      res.status(201).json(doc);
    } catch (e) {
      next(e);
    }
  });

  router.put('/:id', async (req, res, next) => {
    try {
      const body = { ...req.body };
      delete body._id;
      const doc = await Model.findById(req.params.id);
      if (!doc) return res.status(404).json({ error: `${Model.modelName} ${req.params.id} not found` });
      doc.set(body);
      await doc.save(); // runs validators and the order-total hook
      res.json(doc);
    } catch (e) {
      next(e);
    }
  });

  router.delete('/:id', async (req, res, next) => {
    try {
      const doc = await Model.findByIdAndDelete(req.params.id).lean();
      if (!doc) return res.status(404).json({ error: `${Model.modelName} ${req.params.id} not found` });
      res.json({ deleted: doc._id });
    } catch (e) {
      next(e);
    }
  });

  return router;
}

module.exports = { crudRouter, nextId };
