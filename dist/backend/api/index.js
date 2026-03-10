"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// API index: connect routes
var express = require("express");
var sales_1 = require("./sales");
var mautic_1 = require("./mautic");
var app = express();
app.use(express.json());
app.use('/sales', sales_1.default);
app.use('/mautic', mautic_1.default);
exports.default = app;
